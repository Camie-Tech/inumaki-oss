import { contextBridge, ipcRenderer } from "electron";

import type { UserSettings } from "@inumaki/shared";

contextBridge.exposeInMainWorld("inumaki", {
  getApiBaseUrl: () =>
    ipcRenderer.invoke("app:get-api-base-url") as Promise<string>,
  getSettings: () =>
    ipcRenderer.invoke("settings:get") as Promise<UserSettings>,
  setSettings: (settings: UserSettings) =>
    ipcRenderer.invoke("settings:set", settings) as Promise<UserSettings>,
  writeClipboard: (text: string) =>
    ipcRenderer.invoke("clipboard:write-text", text) as Promise<void>,
  pasteIntoActiveApp: () =>
    ipcRenderer.invoke("paste:active-window") as Promise<void>,
  onHotkeyPressed: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("hotkey:pressed", listener);
    return () => ipcRenderer.removeListener("hotkey:pressed", listener);
  },
});
