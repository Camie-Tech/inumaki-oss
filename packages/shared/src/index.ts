export const outputModes = [
  "raw-transcript",
  "clean-text",
  "polished-message",
  "coding-prompt",
] as const;

export type OutputMode = (typeof outputModes)[number];

export const outputModeLabels: Record<OutputMode, string> = {
  "raw-transcript": "Raw Transcript",
  "clean-text": "Clean Text",
  "polished-message": "Polished Message",
  "coding-prompt": "Coding Prompt",
};

export const outputModeDescriptions: Record<OutputMode, string> = {
  "raw-transcript": "Light cleanup while preserving the spoken text.",
  "clean-text":
    "Remove filler words, add punctuation, and normalize formatting.",
  "polished-message":
    "Turn rough speech into concise professional communication.",
  "coding-prompt":
    "Structure the request so it is clear for a coding model or coding agent.",
};

export type DictationStatus =
  | "idle"
  | "recording"
  | "processing"
  | "success"
  | "error";

export interface UserSettings {
  autoPaste: boolean;
  defaultMode: OutputMode;
  hotkey: string;
  microphoneId: string | null;
  previewBeforePaste: boolean;
  tonePreference: string;
}

export const defaultSettings: UserSettings = {
  autoPaste: true,
  defaultMode: "clean-text",
  hotkey: "CommandOrControl+Shift+Space",
  microphoneId: null,
  previewBeforePaste: false,
  tonePreference: "clear and concise",
};

export interface DictationResponse {
  finalText: string;
  mode: OutputMode;
  transcript: string;
  usageId: string;
}

export interface UsageSummary {
  dictations: number;
  rewrites: number;
  totalAudioSeconds: number;
}

export interface AdminUser {
  createdAt: string;
  disabledAt: string | null;
  email: string;
  id: string;
  status: "active" | "disabled";
}

export function isOutputMode(value: string): value is OutputMode {
  return outputModes.includes(value as OutputMode);
}
