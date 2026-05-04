import type { OutputMode } from "@inumaki/shared";

import { config } from "../config";
import { systemPromptForMode } from "./prompts";

interface RewriteInput {
  mode: OutputMode;
  tonePreference: string;
  transcript: string;
}

export async function rewriteTranscript(input: RewriteInput): Promise<string> {
  if (input.mode === "raw-transcript") {
    return normalizeWhitespace(input.transcript);
  }

  if (!config.groqApiKey) {
    return localRewriteFallback(input);
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.groqModel,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: systemPromptForMode(input.mode, input.tonePreference),
          },
          { role: "user", content: input.transcript },
        ],
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq rewrite failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq rewrite response did not include content.");
  }

  return content;
}

function localRewriteFallback(input: RewriteInput): string {
  const cleaned = normalizeWhitespace(input.transcript)
    .replace(/\b(um|uh|like|you know)\b,?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

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

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
