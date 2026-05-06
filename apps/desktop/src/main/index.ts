import "dotenv/config";

import {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  Tray,
} from "electron";
import path from "node:path";
import { execFile } from "node:child_process";
import fs from "node:fs";

import { defaultSettings, type UserSettings } from "@inumaki/shared";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let currentSettings = readSettings();
let isQuitting = false;

const apiPort = process.env.INUMAKI_API_PORT ?? "4141";
const apiBaseUrl =
  process.env.INUMAKI_API_BASE_URL ?? `http://127.0.0.1:${apiPort}`;
const settingsPath = () => path.join(app.getPath("userData"), "settings.json");
const windowBounds = {
  height: 800,
  minHeight: 760,
  minWidth: 1280,
  width: 1360,
};

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    minWidth: windowBounds.minWidth,
    minHeight: windowBounds.minHeight,
    title: "Inumaki AI",
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#f4f4f5",
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

  mainWindow.setMenuBarVisibility(false);

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
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
  const registered = globalShortcut.register(settings.hotkey, () => {
    mainWindow?.webContents.send("hotkey:pressed");
  });

  if (!registered) {
    console.warn(`Unable to register global shortcut: ${settings.hotkey}`);
  }
}

function readSettings(): UserSettings {
  try {
    if (!app.isReady()) {
      return defaultSettings;
    }
    const raw = fs.readFileSync(settingsPath(), "utf8");
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

function writeSettings(settings: UserSettings): UserSettings {
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2));
  currentSettings = settings;
  registerHotkey(settings);
  return settings;
}

async function pasteIntoActiveWindow(): Promise<void> {
  if (process.platform !== "win32") {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    execFile(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')",
      ],
      (error) => (error ? reject(error) : resolve()),
    );
  });
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

app.whenReady().then(() => {
  currentSettings = readSettings();
  Menu.setApplicationMenu(null);
  createWindow();
  createTray();
  registerHotkey(currentSettings);

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
