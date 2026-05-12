import "dotenv/config";

import {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  screen,
  Tray,
} from "electron";
import path from "node:path";
import { execFile, execFileSync } from "node:child_process";
import fs from "node:fs";

import {
  defaultSettings,
  outputModes,
  type OutputMode,
  type UserSettings,
} from "@inumaki/shared";

interface CaptureOverlayState {
  phase: "recording" | "processing" | "result" | "error";
  modeLabel: string;
  detail?: string;
  level?: number;
  text?: string;
  error?: string;
}

interface CaptureOverlayBounds {
  width: number;
  height: number;
}

let mainWindow: BrowserWindow | null = null;
let captureOverlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let currentSettings = readSettings();
let isQuitting = false;
let pasteTargetWindowHandle: string | null = null;
let captureOverlayState: CaptureOverlayState | null = null;

const apiPort = process.env.INUMAKI_API_PORT ?? "4141";
const apiBaseUrl =
  process.env.INUMAKI_API_BASE_URL ?? `http://127.0.0.1:${apiPort}`;
const isBackgroundLaunch =
  process.argv.includes("--background") || process.argv.includes("--hidden");
const settingsPath = () => path.join(app.getPath("userData"), "settings.json");

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 920,
    height: 680,
    minWidth: 720,
    minHeight: 560,
    title: "Inumaki AI",
    show: false,
    backgroundColor: "#f8fafc",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
    },
  });

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    if (!isBackgroundLaunch) {
      mainWindow?.show();
    }
  });
}

function createCaptureOverlayWindow(): BrowserWindow {
  if (captureOverlayWindow && !captureOverlayWindow.isDestroyed()) {
    return captureOverlayWindow;
  }

  captureOverlayWindow = new BrowserWindow({
    width: 320,
    height: 88,
    minWidth: 280,
    minHeight: 72,
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    title: "Inumaki Capture",
    transparent: true,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
    },
  });

  captureOverlayWindow.setAlwaysOnTop(true, "screen-saver");
  captureOverlayWindow.on("closed", () => {
    captureOverlayWindow = null;
  });
  captureOverlayWindow.webContents.on("did-finish-load", () => {
    if (captureOverlayState) {
      captureOverlayWindow?.webContents.send(
        "capture-overlay:state",
        captureOverlayState,
      );
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void captureOverlayWindow.loadURL(
      `${process.env.ELECTRON_RENDERER_URL}#/capture-overlay`,
    );
  } else {
    void captureOverlayWindow.loadFile(
      path.join(__dirname, "../renderer/index.html"),
      { hash: "capture-overlay" },
    );
  }

  return captureOverlayWindow;
}

function positionCaptureOverlay({ width, height }: CaptureOverlayBounds): void {
  if (!captureOverlayWindow || captureOverlayWindow.isDestroyed()) {
    return;
  }

  const { workArea } = screen.getPrimaryDisplay();
  const x = Math.round(workArea.x + (workArea.width - width) / 2);
  const y = Math.round(workArea.y + workArea.height - height - 28);
  captureOverlayWindow.setBounds({ x, y, width, height });
}

function getCaptureOverlayBounds(
  state: CaptureOverlayState,
): CaptureOverlayBounds {
  if (state.phase === "result" || state.phase === "error") {
    return { width: 440, height: 240 };
  }

  return { width: 320, height: 88 };
}

function createTray(): void {
  const icon = nativeImage.createFromDataURL(
    "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0f172a"/><path d="M16 7a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0v-5a4 4 0 0 0-4-4Z" fill="#f8fafc"/><path d="M9 15a7 7 0 0 0 14 0M16 23v3" stroke="#f8fafc" stroke-width="2" stroke-linecap="round"/></svg>`,
      ),
  );

  tray = new Tray(icon);
  tray.setToolTip("Inumaki AI");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show Inumaki AI", click: () => mainWindow?.show() },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]),
  );
}

function registerHotkey(settings: UserSettings): void {
  globalShortcut.unregisterAll();
  const registeredAccelerators = new Set<string>();

  registerCaptureShortcut(
    settings.hotkey,
    "default capture",
    registeredAccelerators,
  );

  for (const mode of outputModes) {
    registerCaptureShortcut(
      settings.captureHotkeys[mode],
      `${mode} capture`,
      registeredAccelerators,
      mode,
    );
  }
}

function readSettings(): UserSettings {
  try {
    if (!app.isReady()) {
      return defaultSettings;
    }
    const raw = fs.readFileSync(settingsPath(), "utf8");
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return defaultSettings;
  }
}

function normalizeSettings(settings: Partial<UserSettings>): UserSettings {
  return {
    ...defaultSettings,
    ...settings,
    captureHotkeys: {
      ...defaultSettings.captureHotkeys,
      ...settings.captureHotkeys,
    },
  };
}

function registerCaptureShortcut(
  accelerator: string,
  label: string,
  registeredAccelerators: Set<string>,
  mode: OutputMode | null = null,
): void {
  const normalizedAccelerator = accelerator.trim();
  if (
    !normalizedAccelerator ||
    registeredAccelerators.has(normalizedAccelerator)
  ) {
    return;
  }

  const registered = globalShortcut.register(normalizedAccelerator, () => {
    rememberPasteTargetWindow();
    mainWindow?.webContents.send("hotkey:pressed", mode);
  });

  if (registered) {
    registeredAccelerators.add(normalizedAccelerator);
  } else {
    console.warn(
      `Unable to register ${label} shortcut: ${normalizedAccelerator}`,
    );
  }
}

function writeSettings(settings: UserSettings): UserSettings {
  const normalizedSettings = normalizeSettings(settings);
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(normalizedSettings, null, 2));
  currentSettings = normalizedSettings;
  registerHotkey(normalizedSettings);
  syncLoginItemSettings(normalizedSettings);
  return normalizedSettings;
}

function syncLoginItemSettings(settings: UserSettings): void {
  if (!app.isPackaged) {
    return;
  }

  app.setLoginItemSettings({
    args: settings.launchAtLogin ? ["--background"] : [],
    openAtLogin: settings.launchAtLogin,
    openAsHidden: true,
  });
}

async function pasteIntoActiveWindow(): Promise<boolean> {
  if (process.platform !== "win32") {
    return false;
  }

  if (!pasteTargetWindowHandle) {
    return false;
  }

  const pasteScript = [
    "Add-Type -AssemblyName System.Windows.Forms;",
    restorePasteTargetScript(),
    "[System.Windows.Forms.SendKeys]::SendWait('^v')",
  ].join(" ");

  return await new Promise<boolean>((resolve) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-Command", pasteScript],
      {
        windowsHide: true,
      },
      (error) => {
        resolve(!error);
      },
    );
  });
}

function rememberPasteTargetWindow(): void {
  if (process.platform !== "win32") {
    return;
  }

  try {
    const output = execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        [
          "Add-Type -Namespace Inumaki -Name NativeMethods -MemberDefinition '[DllImport(\"user32.dll\")] public static extern System.IntPtr GetForegroundWindow();';",
          "[Inumaki.NativeMethods]::GetForegroundWindow().ToInt64()",
        ].join(" "),
      ],
      { encoding: "utf8", windowsHide: true },
    ).trim();

    pasteTargetWindowHandle =
      /^\d+$/.test(output) && output !== "0" ? output : null;
  } catch {
    pasteTargetWindowHandle = null;
  }
}

function restorePasteTargetScript(): string {
  if (!pasteTargetWindowHandle) {
    return "";
  }

  return [
    '$signature = \'[DllImport("user32.dll")] public static extern bool SetForegroundWindow(System.IntPtr hWnd); [DllImport("user32.dll")] public static extern bool ShowWindow(System.IntPtr hWnd, int nCmdShow);\';',
    "Add-Type -Namespace Inumaki -Name NativeMethods -MemberDefinition $signature;",
    `$hwnd = [System.IntPtr]::new(${pasteTargetWindowHandle});`,
    "if ($hwnd -ne [System.IntPtr]::Zero) { [Inumaki.NativeMethods]::ShowWindow($hwnd, 9) | Out-Null; [Inumaki.NativeMethods]::SetForegroundWindow($hwnd) | Out-Null; Start-Sleep -Milliseconds 120; }",
  ].join(" ");
}

ipcMain.handle("app:get-api-base-url", () => apiBaseUrl);
ipcMain.handle("settings:get", () => currentSettings);
ipcMain.handle("settings:set", (_event, settings: UserSettings) =>
  writeSettings(settings),
);
ipcMain.handle("clipboard:write-text", (_event, text: string) => {
  clipboard.writeText(text);
});
ipcMain.handle("paste:active-window", () => pasteIntoActiveWindow());
ipcMain.handle("capture-overlay:show", (_event, state: CaptureOverlayState) => {
  captureOverlayState = state;
  const overlay = createCaptureOverlayWindow();
  const bounds = getCaptureOverlayBounds(state);
  overlay.setSize(bounds.width, bounds.height);
  positionCaptureOverlay(bounds);
  overlay.webContents.send("capture-overlay:state", state);
  overlay.showInactive();
});
ipcMain.handle(
  "capture-overlay:update",
  (_event, state: CaptureOverlayState) => {
    captureOverlayState = state;
    const overlay = createCaptureOverlayWindow();
    const bounds = getCaptureOverlayBounds(state);
    overlay.setSize(bounds.width, bounds.height);
    positionCaptureOverlay(bounds);
    overlay.webContents.send("capture-overlay:state", state);
    if (!overlay.isVisible()) {
      overlay.showInactive();
    }
  },
);
ipcMain.handle("capture-overlay:hide", () => {
  captureOverlayState = null;
  captureOverlayWindow?.hide();
});
ipcMain.handle("capture-overlay:cancel", () => {
  mainWindow?.webContents.send("capture-overlay:cancel");
});
ipcMain.handle("capture-overlay:mark", () => {
  mainWindow?.webContents.send("capture-overlay:mark");
});

app.whenReady().then(() => {
  currentSettings = readSettings();
  Menu.setApplicationMenu(null);
  createWindow();
  createTray();
  registerHotkey(currentSettings);
  syncLoginItemSettings(currentSettings);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on("will-quit", () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
});
