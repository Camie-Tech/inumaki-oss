import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertCircle,
  Check,
  Clipboard,
  Copy,
  Mic,
  Pause,
  Play,
  RefreshCw,
  Settings,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  defaultSettings,
  type AdminUser,
  type DictationResponse,
  type DictationStatus,
  type OutputMode,
  outputModeDescriptions,
  outputModeLabels,
  outputModes,
  type UsageSummary,
  type UserSettings,
} from "@inumaki/shared";

import {
  createDictation,
  disableUser,
  getUsage,
  inviteUser,
  listUsers,
  saveServerSettings,
} from "./lib/api";
import { cn } from "./lib/cn";

type View = "panel" | "settings" | "admin";

interface DeviceOption {
  deviceId: string;
  label: string;
}

export function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://127.0.0.1:4141");
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [draftSettings, setDraftSettings] =
    useState<UserSettings>(defaultSettings);
  const [view, setView] = useState<View>("panel");
  const [status, setStatus] = useState<DictationStatus>("idle");
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<DictationResponse | null>(null);
  const [previewText, setPreviewText] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [devices, setDevices] = useState<DeviceOption[]>([]);
  const [activeMode, setActiveMode] = useState<OutputMode>(
    defaultSettings.defaultMode,
  );
  const [usage, setUsage] = useState<UsageSummary>({
    dictations: 0,
    rewrites: 0,
    totalAudioSeconds: 0,
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    void Promise.all([
      window.inumaki.getApiBaseUrl(),
      window.inumaki.getSettings(),
    ]).then(([baseUrl, storedSettings]) => {
      setApiBaseUrl(baseUrl);
      setSettings(storedSettings);
      setDraftSettings(storedSettings);
      setActiveMode(storedSettings.defaultMode);
    });
  }, []);

  useEffect(() => {
    void navigator.mediaDevices?.enumerateDevices?.().then((items) => {
      const microphones = items
        .filter((device) => device.kind === "audioinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${index + 1}`,
        }));
      setDevices(microphones);
    });
  }, [status]);

  useEffect(() => {
    return window.inumaki.onHotkeyPressed(() => {
      if (status === "recording") {
        void stopRecording();
      } else if (status !== "processing") {
        void startRecording();
      }
    });
  }, [status]);

  useEffect(() => {
    if (view !== "admin") {
      return;
    }

    void refreshAdmin();
  }, [apiBaseUrl, view]);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "idle":
        return "Idle";
      case "recording":
        return "Recording";
      case "processing":
        return "Processing";
      case "success":
        return "Ready";
      case "error":
        return "Needs attention";
    }
  }, [status]);

  async function startRecording() {
    setError("");
    setStatus("recording");
    chunksRef.current = [];
    startedAtRef.current = performance.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: settings.microphoneId
          ? { deviceId: { exact: settings.microphoneId } }
          : true,
      });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.start();
    } catch (recordingError) {
      setStatus("error");
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "Microphone access failed.",
      );
    }
  }

  async function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }

    const audio = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop());
        resolve(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      recorder.stop();
    });

    const audioSeconds = Math.max(
      0,
      (performance.now() - startedAtRef.current) / 1000,
    );
    setStatus("processing");

    try {
      const result = await createDictation({
        apiBaseUrl,
        audio,
        audioSeconds,
        mode: activeMode,
      });
      setLastResult(result);
      setPreviewText(result.finalText);

      if (settings.previewBeforePaste) {
        setIsPreviewOpen(true);
      } else {
        await commitText(result.finalText);
      }

      setStatus("success");
    } catch (dictationError) {
      setStatus("error");
      setError(
        dictationError instanceof Error
          ? dictationError.message
          : "Dictation failed.",
      );
    }
  }

  async function commitText(text: string) {
    await window.inumaki.writeClipboard(text);
    if (settings.autoPaste) {
      await window.inumaki.pasteIntoActiveApp();
    }
  }

  async function saveSettings() {
    setError("");
    try {
      const saved = await window.inumaki.setSettings(draftSettings);
      setSettings(saved);
      setActiveMode(saved.defaultMode);
      await saveServerSettings(apiBaseUrl, saved);
      setView("panel");
    } catch (settingsError) {
      setError(
        settingsError instanceof Error
          ? settingsError.message
          : "Unable to save settings.",
      );
    }
  }

  async function refreshAdmin() {
    setError("");
    try {
      const [usageSummary, adminUsers] = await Promise.all([
        getUsage(apiBaseUrl),
        listUsers(apiBaseUrl),
      ]);
      setUsage(usageSummary);
      setUsers(adminUsers);
    } catch (adminError) {
      setError(
        adminError instanceof Error
          ? adminError.message
          : "Unable to load admin data.",
      );
    }
  }

  async function submitInvite() {
    if (!inviteEmail.trim()) {
      return;
    }

    setError("");
    try {
      await inviteUser(apiBaseUrl, inviteEmail.trim());
      setInviteEmail("");
      await refreshAdmin();
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Unable to invite user.",
      );
    }
  }

  async function submitDisable(userId: string) {
    setError("");
    try {
      await disableUser(apiBaseUrl, userId);
      await refreshAdmin();
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : "Unable to disable user.",
      );
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-balance text-xl font-semibold">Inumaki AI</h1>
            <p className="text-pretty text-sm text-slate-600">
              Internal developer tool
            </p>
          </div>
          <nav className="flex items-center gap-2" aria-label="Primary">
            <button
              className={navButton(view === "panel")}
              onClick={() => setView("panel")}
            >
              <Mic className="size-4" />
              Dictation
            </button>
            <button
              className={navButton(view === "settings")}
              onClick={() => setView("settings")}
            >
              <Settings className="size-4" />
              Settings
            </button>
            <button
              className={navButton(view === "admin")}
              onClick={() => setView("admin")}
            >
              <SlidersHorizontal className="size-4" />
              Admin
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 pb-[env(safe-area-inset-bottom)]">
        {view === "panel" && (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-balance text-lg font-semibold">
                    Main panel
                  </h2>
                  <p className="text-pretty text-sm text-slate-600">
                    {settings.hotkey}
                  </p>
                </div>
                <StatusBadge status={status} label={statusLabel} />
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Output mode
                  <select
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    value={activeMode}
                    onChange={(event) =>
                      setActiveMode(event.target.value as OutputMode)
                    }
                  >
                    {outputModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {outputModeLabels[mode]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {outputModeDescriptions[activeMode]}
                </div>

                <button
                  className={cn(
                    "flex h-24 items-center justify-center gap-3 rounded-lg border text-base font-semibold outline-none focus:ring-2 focus:ring-blue-100",
                    status === "recording"
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-blue-700 bg-blue-700 text-white hover:bg-blue-800",
                    status === "processing" &&
                      "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500",
                  )}
                  disabled={status === "processing"}
                  onClick={() =>
                    status === "recording"
                      ? void stopRecording()
                      : void startRecording()
                  }
                >
                  {status === "recording" ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="size-5" />
                  )}
                  {status === "recording"
                    ? "Stop recording"
                    : "Start dictation"}
                </button>

                {error && (
                  <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span className="text-pretty">{error}</span>
                  </div>
                )}
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-balance text-base font-semibold">
                Recent output
              </h2>
              <div className="mt-4 min-h-48 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {lastResult ? (
                  <p className="text-pretty whitespace-pre-wrap">
                    {lastResult.finalText}
                  </p>
                ) : (
                  <p className="text-pretty text-slate-500">
                    No dictation yet.
                  </p>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={!lastResult}
                  onClick={() =>
                    lastResult &&
                    void window.inumaki.writeClipboard(lastResult.finalText)
                  }
                >
                  <Copy className="size-4" />
                  Copy
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={!lastResult}
                  onClick={() => lastResult && setIsPreviewOpen(true)}
                >
                  <RefreshCw className="size-4" />
                  Retry
                </button>
              </div>
            </aside>
          </section>
        )}

        {view === "settings" && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-balance text-lg font-semibold">Settings</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Microphone
                <select
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={draftSettings.microphoneId ?? ""}
                  onChange={(event) =>
                    setDraftSettings({
                      ...draftSettings,
                      microphoneId: event.target.value || null,
                    })
                  }
                >
                  <option value="">System default</option>
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Hotkey
                <input
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={draftSettings.hotkey}
                  onChange={(event) =>
                    setDraftSettings({
                      ...draftSettings,
                      hotkey: event.target.value,
                    })
                  }
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Default mode
                <select
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={draftSettings.defaultMode}
                  onChange={(event) =>
                    setDraftSettings({
                      ...draftSettings,
                      defaultMode: event.target.value as OutputMode,
                    })
                  }
                >
                  {outputModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {outputModeLabels[mode]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Tone preference
                <input
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={draftSettings.tonePreference}
                  onChange={(event) =>
                    setDraftSettings({
                      ...draftSettings,
                      tonePreference: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="mt-5 grid gap-3">
              <Toggle
                checked={draftSettings.autoPaste}
                label="Auto-paste into focused app"
                onChange={(checked) =>
                  setDraftSettings({ ...draftSettings, autoPaste: checked })
                }
              />
              <Toggle
                checked={draftSettings.previewBeforePaste}
                label="Preview before paste"
                onChange={(checked) =>
                  setDraftSettings({
                    ...draftSettings,
                    previewBeforePaste: checked,
                  })
                }
              />
            </div>

            {error && view === "settings" && (
              <div className="mt-4 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span className="text-pretty">{error}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium"
                onClick={() => setDraftSettings(settings)}
              >
                Reset
              </button>
              <button
                className="h-10 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
                onClick={() => void saveSettings()}
              >
                Save settings
              </button>
            </div>
          </section>
        )}

        {view === "admin" && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-balance text-lg font-semibold">Admin</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Metric label="Dictations" value={usage.dictations} />
              <Metric label="Rewrites" value={usage.rewrites} />
              <Metric
                label="Audio seconds"
                value={Math.round(usage.totalAudioSeconds)}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <input
                className="h-10 min-w-72 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="developer@company.test"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
              />
              <button
                className="h-10 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
                onClick={() => void submitInvite()}
              >
                Invite user
              </button>
            </div>

            {error && view === "admin" && (
              <div className="mt-4 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span className="text-pretty">{error}</span>
              </div>
            )}

            <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Created</th>
                    <th className="px-3 py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        className="px-3 py-8 text-center text-slate-500"
                        colSpan={4}
                      >
                        No users.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {user.email}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {user.status}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                            disabled={user.status === "disabled"}
                            onClick={() => void submitDisable(user.id)}
                          >
                            Disable
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-balance text-lg font-semibold">
                  Preview output
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-pretty text-sm text-slate-600">
                  {outputModeLabels[activeMode]}
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close preview"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Transcript
                <div className="max-h-28 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-normal text-slate-600">
                  {lastResult?.transcript ?? "No transcript available."}
                </div>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Final output
                <textarea
                  className="min-h-40 rounded-md border border-slate-300 bg-white p-3 text-sm font-normal text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={previewText}
                  onChange={(event) => setPreviewText(event.target.value)}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Dialog.Close className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700">
                Cancel
              </Dialog.Close>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700"
                onClick={() => void window.inumaki.writeClipboard(previewText)}
              >
                <Clipboard className="size-4" />
                Copy
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
                onClick={() => {
                  void commitText(previewText);
                  setIsPreviewOpen(false);
                }}
              >
                <Check className="size-4" />
                Paste
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: DictationStatus;
  label: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium tabular-nums",
        status === "recording" && "border-red-200 bg-red-50 text-red-700",
        status === "processing" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        status === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "error" && "border-red-200 bg-red-50 text-red-700",
        status === "idle" && "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      {label}
    </div>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-3 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        className="size-5 accent-blue-700"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">
        {value}
      </div>
    </div>
  );
}

function navButton(active: boolean) {
  return cn(
    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium",
    active
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  );
}
