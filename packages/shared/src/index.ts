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
  captureHotkeys: Record<OutputMode, string>;
  defaultMode: OutputMode;
  groqApiKey: string;
  hotkey: string;
  launchAtLogin: boolean;
  microphoneId: string | null;
  previewBeforePaste: boolean;
  tonePreference: string;
}

export const defaultSettings: UserSettings = {
  autoPaste: true,
  captureHotkeys: {
    "raw-transcript": "CommandOrControl+Alt+1",
    "clean-text": "CommandOrControl+Alt+2",
    "polished-message": "CommandOrControl+Alt+3",
    "coding-prompt": "CommandOrControl+Alt+4",
  },
  defaultMode: "clean-text",
  groqApiKey: "",
  hotkey: "CommandOrControl+Shift+Space",
  launchAtLogin: true,
  microphoneId: null,
  previewBeforePaste: false,
  tonePreference: "clear and concise",
};

export interface DictationResponse {
  finalText: string;
  mode: OutputMode;
  timings?: DictationTimings;
  transcript: string;
  usageId: string;
}

export interface DictationTimings {
  clientAudioBlobMs?: number;
  clientUploadMs?: number;
  serverAudioConversionMs?: number;
  serverCleanupMs?: number;
  serverDbMs?: number;
  serverPreferenceMs?: number;
  serverRewriteMs?: number;
  serverTotalMs?: number;
  serverTranscriptionMs?: number;
  serverWhisperMs?: number;
  rewriteSkippedReason?: string;
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
