import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Activity,
  AlertCircle,
  Check,
  Clipboard,
  Copy,
  Keyboard,
  Menu as MenuIcon,
  Mic,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Shield,
  SlidersHorizontal,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  defaultSettings,
  type AdminUser,
  type DictationResponse,
  type DictationStatus,
  type OutputMode,
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

type View = "dictation" | "settings" | "admin";

interface DeviceOption {
  deviceId: string;
  label: string;
}

const viewMeta: Record<View, { title: string; eyebrow: string }> = {
  dictation: { title: "Dictation", eyebrow: "Capture" },
  settings: { title: "Settings", eyebrow: "Preferences" },
  admin: { title: "Admin", eyebrow: "Operations" },
};

export function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://127.0.0.1:4141");
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [draftSettings, setDraftSettings] =
    useState<UserSettings>(defaultSettings);
  const [view, setView] = useState<View>("dictation");
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
  const [pendingDisableUser, setPendingDisableUser] =
    useState<AdminUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const selectedMicrophone =
    devices.find((device) => device.deviceId === settings.microphoneId)
      ?.label ?? "System default";
  const activeView = viewMeta[view];
  const hasResult = Boolean(lastResult);

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
        await finishText(result.finalText);
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

  async function copyText(text: string) {
    await window.inumaki.writeClipboard(text);
  }

  async function pasteText(text: string) {
    await window.inumaki.writeClipboard(text);
    await window.inumaki.pasteIntoActiveApp();
  }

  async function finishText(text: string) {
    await copyText(text);
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
      setView("dictation");
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
      setPendingDisableUser(null);
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
    <div className="min-h-dvh min-w-[1280px] bg-zinc-100 text-zinc-950">
      {isSidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-zinc-950/40 lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="grid min-h-dvh lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          className={cn(
            "w-[260px] border-r border-zinc-800 bg-zinc-950 text-white",
            "hidden lg:block",
            isSidebarOpen && "fixed inset-y-0 left-0 z-50 block",
          )}
        >
          <div className="flex h-full flex-col p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white text-zinc-950">
                <Mic className="size-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold">Inumaki AI</h1>
                <p className="truncate text-sm text-zinc-400">Internal build</p>
              </div>
            </div>

            <nav className="mt-6 grid gap-1" aria-label="Primary">
              <NavButton
                active={view === "dictation"}
                icon={Mic}
                label="Dictation"
                onClick={() => {
                  setView("dictation");
                  setIsSidebarOpen(false);
                }}
              />
              <NavButton
                active={view === "settings"}
                icon={Settings}
                label="Settings"
                onClick={() => {
                  setView("settings");
                  setIsSidebarOpen(false);
                }}
              />
              <NavButton
                active={view === "admin"}
                icon={SlidersHorizontal}
                label="Admin"
                onClick={() => {
                  setView("admin");
                  setIsSidebarOpen(false);
                }}
              />
            </nav>

            <div className="mt-auto grid gap-3 pt-6">
              <SidebarFact
                icon={Keyboard}
                label="Hotkey"
                value={settings.hotkey}
              />
              <SidebarFact
                icon={Activity}
                label="Mode"
                value={outputModeLabels[activeMode]}
              />
              <SidebarFact
                icon={Shield}
                label="API"
                value={formatApiHost(apiBaseUrl)}
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4">
            <div className="flex items-start gap-3">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <MenuIcon className="size-4" />
                Menu
              </button>
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  {activeView.eyebrow}
                </p>
                <h2 className="text-balance text-2xl font-semibold">
                  {activeView.title}
                </h2>
              </div>
            </div>
            <StatusBadge status={status} label={statusLabel} />
          </header>

          {view === "dictation" && (
            <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                <Panel className="lg:row-span-2">
                  <PanelHeader title="Capture" meta={selectedMicrophone} />
                  <ModePicker
                    activeMode={activeMode}
                    onChange={setActiveMode}
                  />
                  <button
                    className={cn(
                      "mt-5 flex h-40 w-full flex-col items-center justify-center gap-3 rounded-lg border text-base font-semibold outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed",
                      status === "recording"
                        ? "border-blue-700 bg-white text-blue-700"
                        : "border-blue-700 bg-blue-700 text-white hover:bg-blue-800",
                      status === "processing" &&
                        "border-zinc-300 bg-zinc-200 text-zinc-500",
                    )}
                    disabled={status === "processing"}
                    onClick={() =>
                      status === "recording"
                        ? void stopRecording()
                        : void startRecording()
                    }
                  >
                    {status === "recording" ? (
                      <Pause className="size-8" />
                    ) : (
                      <Play className="size-8" />
                    )}
                    <span>
                      {status === "recording" ? "Stop recording" : "Start"}
                    </span>
                  </button>

                  {error && <InlineError message={error} />}

                  <div className="mt-5 grid gap-2">
                    <StateRow label="Clipboard" value="Enabled" />
                    <StateRow
                      label="Auto-paste"
                      value={settings.autoPaste ? "On" : "Off"}
                    />
                    <StateRow
                      label="Preview"
                      value={settings.previewBeforePaste ? "On" : "Off"}
                    />
                  </div>
                </Panel>

                <Panel>
                  <PanelHeader
                    title="Output"
                    meta={
                      lastResult ? outputModeLabels[lastResult.mode] : "Pending"
                    }
                  />
                  <div className="mt-4 min-h-72 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    {lastResult ? (
                      <p className="whitespace-pre-wrap text-pretty text-sm leading-6 text-zinc-800">
                        {lastResult.finalText}
                      </p>
                    ) : (
                      <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
                        <div className="flex size-12 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500">
                          <Clipboard className="size-5" />
                        </div>
                        <p className="text-sm font-medium text-zinc-600">
                          No output yet.
                        </p>
                        <button
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
                          onClick={() => void startRecording()}
                        >
                          <Mic className="size-4" />
                          Start
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <ActionButton
                      disabled={!hasResult}
                      icon={Copy}
                      label="Copy"
                      onClick={() =>
                        lastResult && void copyText(lastResult.finalText)
                      }
                    />
                    <ActionButton
                      disabled={!hasResult}
                      icon={Clipboard}
                      label="Paste"
                      onClick={() =>
                        lastResult && void pasteText(lastResult.finalText)
                      }
                    />
                    <ActionButton
                      disabled={!hasResult}
                      icon={RefreshCw}
                      label="Preview"
                      onClick={() => {
                        if (!lastResult) {
                          return;
                        }
                        setPreviewText(lastResult.finalText);
                        setIsPreviewOpen(true);
                      }}
                    />
                  </div>
                </Panel>

                <Panel>
                  <PanelHeader title="Transcript" meta="Source" />
                  <div className="mt-4 max-h-44 overflow-auto rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-700">
                    {lastResult?.transcript ?? (
                      <span className="text-zinc-500">
                        Transcript will appear after processing.
                      </span>
                    )}
                  </div>
                </Panel>
              </div>

              <Panel>
                <PanelHeader title="Session" meta={apiBaseUrl} />
                <div className="mt-4 grid gap-3">
                  <SessionMetric label="Status" value={statusLabel} />
                  <SessionMetric
                    label="Default mode"
                    value={outputModeLabels[settings.defaultMode]}
                  />
                  <SessionMetric
                    label="Microphone"
                    value={selectedMicrophone}
                  />
                  <SessionMetric label="Tone" value={settings.tonePreference} />
                </div>
              </Panel>
            </section>
          )}

          {view === "settings" && (
            <section className="mt-5 grid gap-4 xl:grid-cols-2">
              <Panel>
                <PanelHeader title="Input" meta="Device and shortcut" />
                <div className="mt-5 grid gap-4">
                  <Field label="Microphone">
                    <select
                      className={fieldClassName}
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
                  </Field>

                  <Field label="Hotkey">
                    <input
                      className={fieldClassName}
                      value={draftSettings.hotkey}
                      onChange={(event) =>
                        setDraftSettings({
                          ...draftSettings,
                          hotkey: event.target.value,
                        })
                      }
                    />
                  </Field>
                </div>
              </Panel>

              <Panel>
                <PanelHeader title="Output" meta="Mode and delivery" />
                <div className="mt-5 grid gap-4">
                  <Field label="Default mode">
                    <select
                      className={fieldClassName}
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
                  </Field>

                  <Field label="Tone preference">
                    <input
                      className={fieldClassName}
                      value={draftSettings.tonePreference}
                      onChange={(event) =>
                        setDraftSettings({
                          ...draftSettings,
                          tonePreference: event.target.value,
                        })
                      }
                    />
                  </Field>

                  <Toggle
                    checked={draftSettings.autoPaste}
                    label="Auto-paste"
                    onChange={(checked) =>
                      setDraftSettings({
                        ...draftSettings,
                        autoPaste: checked,
                      })
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
              </Panel>

              <div className="xl:col-span-2">
                {error && view === "settings" && (
                  <InlineError message={error} />
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
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
              </div>
            </section>
          )}

          {view === "admin" && (
            <section className="mt-5 grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Metric label="Dictations" value={usage.dictations} />
                <Metric label="Rewrites" value={usage.rewrites} />
                <Metric
                  label="Audio seconds"
                  value={Math.round(usage.totalAudioSeconds)}
                />
              </div>

              <Panel>
                <PanelHeader title="Users" meta={`${users.length} total`} />
                <div className="mt-5 flex flex-wrap gap-2">
                  <input
                    className="h-10 min-w-72 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="developer@company.test"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                  />
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
                    onClick={() => void submitInvite()}
                  >
                    <UserPlus className="size-4" />
                    Invite
                  </button>
                </div>

                {error && view === "admin" && <InlineError message={error} />}

                <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-zinc-500">
                      <tr>
                        <th className="px-3 py-2 font-medium">Email</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Created</th>
                        <th className="px-3 py-2 text-right font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {users.length === 0 ? (
                        <tr>
                          <td
                            className="px-3 py-10 text-center text-zinc-500"
                            colSpan={4}
                          >
                            No users.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-3 py-2 font-medium text-zinc-900">
                              {user.email}
                            </td>
                            <td className="px-3 py-2 text-zinc-600">
                              {user.status}
                            </td>
                            <td className="px-3 py-2 text-zinc-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                                disabled={user.status === "disabled"}
                                onClick={() => setPendingDisableUser(user)}
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
              </Panel>
            </section>
          )}
        </main>
      </div>

      <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-zinc-950/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-balance text-lg font-semibold">
                  Preview
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-pretty text-sm text-zinc-600">
                  {outputModeLabels[activeMode]}
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100"
                aria-label="Close preview"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <div className="mt-4 grid gap-3">
              <Field label="Transcript">
                <div className="max-h-28 overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm font-normal text-zinc-600">
                  {lastResult?.transcript ?? "No transcript available."}
                </div>
              </Field>
              <Field label="Final output">
                <textarea
                  className="min-h-44 rounded-md border border-zinc-300 bg-white p-3 text-sm font-normal text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={previewText}
                  onChange={(event) => setPreviewText(event.target.value)}
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Dialog.Close className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                Cancel
              </Dialog.Close>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                onClick={() => void copyText(previewText)}
              >
                <Copy className="size-4" />
                Copy
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
                onClick={() => {
                  void pasteText(previewText);
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

      <AlertDialog.Root
        open={Boolean(pendingDisableUser)}
        onOpenChange={(open) => !open && setPendingDisableUser(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-zinc-950/40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white p-5 shadow-lg">
            <AlertDialog.Title className="text-balance text-lg font-semibold">
              Disable user
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-pretty text-sm text-zinc-600">
              {pendingDisableUser?.email}
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                Cancel
              </AlertDialog.Cancel>
              <AlertDialog.Action
                className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
                onClick={() =>
                  pendingDisableUser &&
                  void submitDisable(pendingDisableUser.id)
                }
              >
                Disable
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}

const fieldClassName =
  "h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-zinc-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}

function PanelHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-balance text-base font-semibold">{title}</h3>
      <span className="max-w-56 truncate rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
        {meta}
      </span>
    </div>
  );
}

function ModePicker({
  activeMode,
  onChange,
}: {
  activeMode: OutputMode;
  onChange: (mode: OutputMode) => void;
}) {
  return (
    <div
      className="mt-4 grid grid-cols-2 gap-2"
      role="group"
      aria-label="Output mode"
    >
      {outputModes.map((mode) => (
        <button
          key={mode}
          className={cn(
            "h-10 rounded-md border px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100",
            activeMode === mode
              ? "border-blue-700 bg-blue-700 text-white"
              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
          )}
          aria-pressed={activeMode === mode}
          title={outputModeLabels[mode]}
          onClick={() => onChange(mode)}
        >
          <span className="block truncate">{outputModeLabels[mode]}</span>
        </button>
      ))}
    </div>
  );
}

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-white/30",
        active
          ? "bg-white text-zinc-950"
          : "text-zinc-300 hover:bg-zinc-900 hover:text-white",
      )}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function SidebarFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 rounded-lg border border-zinc-800 p-3">
      <Icon className="mt-0.5 size-4 text-zinc-400" />
      <div className="min-w-0">
        <div className="text-xs font-medium text-zinc-500">{label}</div>
        <div className="truncate text-sm text-zinc-100">{value}</div>
      </div>
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
        "inline-flex h-9 items-center rounded-full border px-3 text-sm font-medium tabular-nums",
        status === "recording" && "border-blue-700 bg-blue-700 text-white",
        status === "processing" && "border-blue-200 bg-blue-50 text-blue-700",
        status === "success" && "border-zinc-950 bg-zinc-950 text-white",
        status === "error" && "border-blue-300 bg-white text-blue-700",
        status === "idle" && "border-zinc-200 bg-white text-zinc-600",
      )}
    >
      {label}
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="mt-4 flex gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span className="text-pretty">{message}</span>
    </div>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-2 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="truncate font-medium text-zinc-800">{value}</span>
    </div>
  );
}

function ActionButton({
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function SessionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className="mt-1 truncate text-sm font-medium text-zinc-900">
        {value}
      </div>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      {children}
    </label>
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
    <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-3 text-sm font-medium text-zinc-700">
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
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-zinc-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums text-zinc-950">
        {value}
      </div>
    </div>
  );
}

function formatApiHost(value: string): string {
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}
