import type { OutputMode } from "@inumaki/shared";

import { config } from "../config";
import { systemPromptForMode } from "./prompts";

interface RewriteInput {
  apiKey?: string;
  mode: OutputMode;
  offlineMode?: boolean;
  tonePreference: string;
  transcript: string;
}

interface RewriteResult {
  didRewrite: boolean;
  engine: "groq" | "local" | "none";
  fallbackReason?: string;
  skippedReason?: string;
  text: string;
}

export async function rewriteTranscript(
  input: RewriteInput,
): Promise<RewriteResult> {
  const normalizedTranscript = normalizeWhitespace(input.transcript);

  if (input.mode === "raw-transcript") {
    return {
      didRewrite: false,
      engine: "none",
      skippedReason: "raw-transcript",
      text: normalizedTranscript,
    };
  }

  const skippedReason = rewriteSkippedReason(normalizedTranscript);
  if (skippedReason) {
    return {
      didRewrite: false,
      engine: "none",
      skippedReason,
      text: cleanTranscript(normalizedTranscript),
    };
  }

  const groqApiKey = (input.apiKey || config.groqApiKey || "").trim();

  if (input.offlineMode) {
    return {
      didRewrite: true,
      engine: "local",
      skippedReason: "offline-mode",
      text: localRewriteFallback({
        ...input,
        transcript: normalizedTranscript,
      }),
    };
  }

  if (!groqApiKey) {
    return {
      didRewrite: true,
      engine: "local",
      text: localRewriteFallback({
        ...input,
        transcript: normalizedTranscript,
      }),
    };
  }

  try {
    const response = await fetchWithTimeout(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.groqFastModel || config.groqModel,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: systemPromptForMode(input.mode, input.tonePreference),
            },
            { role: "user", content: normalizedTranscript },
          ],
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Groq ${response.status}: ${body.slice(0, 200)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Groq response did not include content.");
    }

    return {
      didRewrite: true,
      engine: "groq",
      text: content,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`Groq rewrite failed; using local fallback: ${reason}`);
    return {
      didRewrite: true,
      engine: "local",
      fallbackReason: reason,
      text: localRewriteFallback({
        ...input,
        transcript: normalizedTranscript,
      }),
    };
  }
}

function localRewriteFallback(input: RewriteInput): string {
  const cleaned = cleanTranscript(input.transcript);

  if (input.mode === "coding-prompt") {
    return [
      "Goal:",
      cleaned,
      "",
      "Requirements:",
      "- Preserve the intended behavior.",
      "- Keep the implementation scoped and testable.",
      "",
      "Acceptance criteria:",
      "- The requested change works in the target workflow.",
      "- Relevant validation passes.",
    ].join("\n");
  }

  return cleaned;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.groqTimeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Groq rewrite timed out after ${config.groqTimeoutMs}ms.`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function rewriteSkippedReason(transcript: string): string | null {
  if (!transcript) {
    return "empty-transcript";
  }

  const meaningfulText = cleanTranscript(transcript)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

  if (!meaningfulText) {
    return "filler-only-transcript";
  }

  const words = meaningfulText.split(/\s+/);
  if (words.length <= 2 && meaningfulText.length <= 16) {
    return "short-transcript";
  }

  return null;
}

function cleanTranscript(value: string): string {
  return normalizeWhitespace(value)
    .replace(/\b(um|uh|hmm|mm|like|you know)\b,?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
