import { contextBridge, ipcRenderer } from "electron";

import type { OutputMode, UserSettings } from "@inumaki/shared";

export interface CaptureOverlayState {
  phase: "recording" | "processing" | "result" | "error";
  modeLabel: string;
  level?: number;
  text?: string;
  error?: string;
}

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
    ipcRenderer.invoke("paste:active-window") as Promise<boolean>,
  showCaptureOverlay: (state: CaptureOverlayState) =>
    ipcRenderer.invoke("capture-overlay:show", state) as Promise<void>,
  updateCaptureOverlay: (state: CaptureOverlayState) =>
    ipcRenderer.invoke("capture-overlay:update", state) as Promise<void>,
  hideCaptureOverlay: () =>
    ipcRenderer.invoke("capture-overlay:hide") as Promise<void>,
  requestCaptureOverlayCancel: () =>
    ipcRenderer.invoke("capture-overlay:cancel") as Promise<void>,
  requestCaptureOverlayMark: () =>
    ipcRenderer.invoke("capture-overlay:mark") as Promise<void>,
  onCaptureOverlayState: (callback: (state: CaptureOverlayState) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      state: CaptureOverlayState,
    ) => callback(state);
    ipcRenderer.on("capture-overlay:state", listener);
    return () => ipcRenderer.removeListener("capture-overlay:state", listener);
  },
  onCaptureOverlayCancel: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("capture-overlay:cancel", listener);
    return () => ipcRenderer.removeListener("capture-overlay:cancel", listener);
  },
  onCaptureOverlayMark: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("capture-overlay:mark", listener);
    return () => ipcRenderer.removeListener("capture-overlay:mark", listener);
  },
  onHotkeyPressed: (callback: (mode: OutputMode | null) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      mode: OutputMode | null,
    ) => callback(mode);
    ipcRenderer.on("hotkey:pressed", listener);
    return () => ipcRenderer.removeListener("hotkey:pressed", listener);
  },
});
