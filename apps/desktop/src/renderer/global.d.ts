import type { OutputMode, UserSettings } from "@inumaki/shared";

interface CaptureOverlayState {
  phase: "recording" | "processing" | "result" | "error";
  modeLabel: string;
  detail?: string;
  level?: number;
  text?: string;
  error?: string;
}

declare global {
  interface Window {
    inumaki: {
      getApiBaseUrl: () => Promise<string>;
      getSettings: () => Promise<UserSettings>;
      setSettings: (settings: UserSettings) => Promise<UserSettings>;
      writeClipboard: (text: string) => Promise<void>;
      pasteIntoActiveApp: () => Promise<boolean>;
      showCaptureOverlay: (state: CaptureOverlayState) => Promise<void>;
      updateCaptureOverlay: (state: CaptureOverlayState) => Promise<void>;
      hideCaptureOverlay: () => Promise<void>;
      requestCaptureOverlayCancel: () => Promise<void>;
      requestCaptureOverlayMark: () => Promise<void>;
      onCaptureOverlayState: (
        callback: (state: CaptureOverlayState) => void,
      ) => () => void;
      onCaptureOverlayCancel: (callback: () => void) => () => void;
      onCaptureOverlayMark: (callback: () => void) => () => void;
      onHotkeyPressed: (
        callback: (mode: OutputMode | null) => void,
      ) => () => void;
    };
  }
}

export {};
