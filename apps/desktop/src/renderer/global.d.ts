import type { UserSettings } from "@inumaki/shared";

declare global {
  interface Window {
    inumaki: {
      getApiBaseUrl: () => Promise<string>;
      getSettings: () => Promise<UserSettings>;
      setSettings: (settings: UserSettings) => Promise<UserSettings>;
      writeClipboard: (text: string) => Promise<void>;
      pasteIntoActiveApp: () => Promise<void>;
      onHotkeyPressed: (callback: () => void) => () => void;
    };
  }
}

export {};
