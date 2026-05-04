import type { OutputMode } from "@inumaki/shared";

export function systemPromptForMode(
  mode: OutputMode,
  tonePreference: string,
): string {
  const tone = tonePreference.trim() || "clear and concise";

  switch (mode) {
    case "raw-transcript":
      return `Return a lightly cleaned transcript. Preserve wording and meaning. Tone: ${tone}.`;
    case "clean-text":
      return `Clean dictated speech into readable text. Remove filler words, add punctuation, and keep meaning intact. Tone: ${tone}.`;
    case "polished-message":
      return `Rewrite dictated speech as a concise polished message for an internal developer workflow. Preserve intent. Tone: ${tone}.`;
    case "coding-prompt":
      return `Convert dictated speech into a structured prompt for a coding model. Include goal, context, requirements, and acceptance criteria when inferable. Tone: ${tone}.`;
  }
}
