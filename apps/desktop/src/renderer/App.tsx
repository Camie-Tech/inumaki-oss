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
  checkApiHealth,
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

type CaptureOverlayPhase = "recording" | "processing" | "result" | "error";

interface CaptureOverlayState {
  phase: CaptureOverlayPhase;
  modeLabel: string;
  detail?: string;
  level?: number;
  text?: string;
  error?: string;
}

const viewMeta: Record<View, { title: string; eyebrow: string }> = {
  dictation: { title: "Dictation", eyebrow: "Capture" },
  settings: { title: "Settings", eyebrow: "Preferences" },
  admin: { title: "Admin", eyebrow: "Operations" },
};

export function App() {
  const route = window.location.hash.replace(/^#\/?/, "");

  if (route === "capture-overlay") {
    return <CaptureOverlayApp />;
  }

  return <MainApp />;
}

function MainApp() {
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
  const [apiHealth, setApiHealth] = useState<{
    ok: boolean;
    error?: string;
    checked: boolean;
  }>({ ok: true, checked: false });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const captureModeRef = useRef<OutputMode>(defaultSettings.defaultMode);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const waveFrameRef = useRef<number | null>(null);

  useEffect(() => {
    void Promise.all([
      window.inumaki.getApiBaseUrl(),
      window.inumaki.getSettings(),
    ]).then(([baseUrl, storedSettings]) => {
      setApiBaseUrl(baseUrl);
      setSettings(storedSettings);
      setDraftSettings(storedSettings);
      setActiveMode(storedSettings.defaultMode);
      captureModeRef.current = storedSettings.defaultMode;
    });
  }, []);

  useEffect(() => {
    captureModeRef.current = activeMode;
  }, [activeMode]);

  useEffect(() => {
    let cancelled = false;
    async function probe() {
      const result = await checkApiHealth(apiBaseUrl);
      let combinedError = result.error;
      if (!result.ok) {
        try {
          const status = await window.inumaki.getApiStatus?.();
          if (status?.bootstrapError) {
            combinedError = status.bootstrapError;
          }
        } catch {
          /* preload may be older; ignore */
        }
      }
      if (!cancelled) {
        setApiHealth({
          ok: result.ok,
          error: combinedError,
          checked: true,
        });
      }
    }
    void probe();
    const interval = window.setInterval(probe, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [apiBaseUrl]);

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
    return window.inumaki.onHotkeyPressed((mode) => {
      if (status === "recording") {
        void stopRecording();
      } else if (status !== "processing") {
        void startRecording(mode ?? activeMode);
      }
    });
  }, [activeMode, status]);

  useEffect(() => {
    return window.inumaki.onCaptureOverlayCancel(() => {
      if (status === "recording") {
        cancelRecording();
      }
    });
  }, [status]);

  useEffect(() => {
    return window.inumaki.onCaptureOverlayMark(() => {
      if (status === "recording") {
        void stopRecording();
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

  async function startRecording(mode: OutputMode = activeMode) {
    setError("");
    setActiveMode(mode);
    setStatus("recording");
    captureModeRef.current = mode;
    chunksRef.current = [];
    startedAtRef.current = performance.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: settings.microphoneId
          ? { deviceId: { exact: settings.microphoneId } }
          : true,
      });
      await window.inumaki.showCaptureOverlay({
        phase: "recording",
        modeLabel: outputModeLabels[mode],
        detail: "Listening",
        level: 0,
      });
      startWaveMonitor(stream);
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.start();
    } catch (recordingError) {
      const message =
        recordingError instanceof Error
          ? recordingError.message
          : "Microphone access failed.";
      setStatus("error");
      setError(message);
      await window.inumaki.updateCaptureOverlay({
        phase: "error",
        modeLabel: outputModeLabels[mode],
        error: message,
      });
    }
  }

  async function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }

    stopWaveMonitor();
    await window.inumaki.updateCaptureOverlay({
      phase: "processing",
      modeLabel: outputModeLabels[captureModeRef.current],
      detail: "Preparing audio",
      level: 0,
    });

    const audioBlobStartedAt = performance.now();
    const audio = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop());
        resolve(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      recorder.stop();
    });
    const clientAudioBlobMs = Math.round(
      performance.now() - audioBlobStartedAt,
    );

    const audioSeconds = Math.max(
      0,
      (performance.now() - startedAtRef.current) / 1000,
    );
    setStatus("processing");

    try {
      await window.inumaki.updateCaptureOverlay({
        phase: "processing",
        modeLabel: outputModeLabels[captureModeRef.current],
        detail: "Transcribing",
        level: 0,
      });
      const result = await createDictation({
        apiBaseUrl,
        audio,
        audioSeconds,
        clientAudioBlobMs,
        groqApiKey: settings.groqApiKey,
        mode: captureModeRef.current,
        offlineMode: settings.offlineMode,
      });
      if (result.timings) {
        console.info("Dictation timings", result.timings);
      }
      setLastResult(result);
      setPreviewText(result.finalText);

      if (settings.previewBeforePaste) {
        setIsPreviewOpen(true);
        await showOverlayResult(result.finalText);
      } else {
        if (settings.autoPaste) {
          await window.inumaki.updateCaptureOverlay({
            phase: "processing",
            modeLabel: outputModeLabels[captureModeRef.current],
            detail: "Pasting",
            level: 0,
          });
        }
        const didPaste = await finishText(result.finalText);
        if (didPaste) {
          await window.inumaki.hideCaptureOverlay();
        } else {
          await showOverlayResult(result.finalText);
        }
      }

      setStatus("success");
    } catch (dictationError) {
      const message =
        dictationError instanceof Error
          ? dictationError.message
          : "Dictation failed.";
      setStatus("error");
      setError(message);
      await window.inumaki.updateCaptureOverlay({
        phase: "error",
        modeLabel: outputModeLabels[captureModeRef.current],
        error: message,
      });
    }
  }

  function cancelRecording() {
    const recorder = recorderRef.current;
    chunksRef.current = [];
    stopWaveMonitor();

    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop());
      };
      recorder.stop();
    } else {
      recorder?.stream.getTracks().forEach((track) => track.stop());
    }

    recorderRef.current = null;
    setStatus("idle");
    setError("");
    void window.inumaki.hideCaptureOverlay();
  }

  function startWaveMonitor(stream: MediaStream) {
    stopWaveMonitor();
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 128;
    context.createMediaStreamSource(stream).connect(analyser);
    audioContextRef.current = context;
    analyserRef.current = analyser;

    const samples = new Uint8Array(analyser.fftSize);
    const readLevel = () => {
      if (!analyserRef.current) {
        return;
      }

      analyserRef.current.getByteTimeDomainData(samples);
      const energy =
        samples.reduce((total, sample) => {
          const centered = (sample - 128) / 128;
          return total + centered * centered;
        }, 0) / samples.length;
      const level = Math.min(1, Math.sqrt(energy) * 4);
      void window.inumaki.updateCaptureOverlay({
        phase: "recording",
        modeLabel: outputModeLabels[captureModeRef.current],
        detail: "Listening",
        level,
      });
      waveFrameRef.current = window.requestAnimationFrame(readLevel);
    };

    readLevel();
  }

  function stopWaveMonitor() {
    if (waveFrameRef.current !== null) {
      window.cancelAnimationFrame(waveFrameRef.current);
      waveFrameRef.current = null;
    }

    analyserRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
  }

  async function copyText(text: string) {
    await window.inumaki.writeClipboard(text);
  }

  async function pasteText(text: string): Promise<boolean> {
    await window.inumaki.writeClipboard(text);
    return await window.inumaki.pasteIntoActiveApp();
  }

  async function finishText(text: string): Promise<boolean> {
    await copyText(text);
    if (settings.autoPaste) {
      return await window.inumaki.pasteIntoActiveApp();
    }
    return false;
  }

  async function showOverlayResult(text: string) {
    await window.inumaki.updateCaptureOverlay({
      phase: "result",
      modeLabel: outputModeLabels[captureModeRef.current],
      text,
    });
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
    <div className="min-h-dvh bg-platinum text-navy">
      <div className="grid min-h-dvh grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-mist bg-navy text-white lg:border-b-0 lg:border-r lg:border-slate-800">
          <div className="flex h-full flex-col p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-violet text-white shadow-violet">
                <Mic className="size-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold">Inumaki AI</h1>
                <p className="truncate text-sm text-slate-400">Internal build</p>
              </div>
            </div>

            <nav className="mt-6 grid gap-1" aria-label="Primary">
              <NavButton
                active={view === "dictation"}
                icon={Mic}
                label="Dictation"
                onClick={() => setView("dictation")}
              />
              <NavButton
                active={view === "settings"}
                icon={Settings}
                label="Settings"
                onClick={() => setView("settings")}
              />
              <NavButton
                active={view === "admin"}
                icon={SlidersHorizontal}
                label="Admin"
                onClick={() => setView("admin")}
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
          {apiHealth.checked && !apiHealth.ok && (
            <ApiOfflineBanner
              apiBaseUrl={apiBaseUrl}
              error={apiHealth.error}
            />
          )}

          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {activeView.eyebrow}
              </p>
              <h2 className="text-balance text-2xl font-semibold">
                {activeView.title}
              </h2>
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
                      "mt-5 flex h-40 w-full flex-col items-center justify-center gap-3 rounded-lg border text-base font-semibold outline-none focus:ring-2 focus:ring-violet/20 disabled:cursor-not-allowed",
                      status === "recording"
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-violet bg-violet text-white hover:bg-violet-hover",
                      status === "processing" &&
                        "border-slate-300 bg-slate-200 text-slate-500",
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
                  <div className="mt-4 min-h-72 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    {lastResult ? (
                      <p className="whitespace-pre-wrap text-pretty text-sm leading-6 text-slate-700">
                        {lastResult.finalText}
                      </p>
                    ) : (
                      <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
                        <div className="flex size-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                          <Clipboard className="size-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">
                          No output yet.
                        </p>
                        <button
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-4 text-sm font-medium text-white hover:bg-violet-hover"
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
                  <div className="mt-4 max-h-44 overflow-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                    {lastResult?.transcript ?? (
                      <span className="text-slate-500">
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

                  <Toggle
                    checked={draftSettings.launchAtLogin}
                    label="Launch at login"
                    onChange={(checked) =>
                      setDraftSettings({
                        ...draftSettings,
                        launchAtLogin: checked,
                      })
                    }
                  />

                  <div className="border-t border-slate-200 pt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        Mode commands
                      </p>
                      <span className="text-xs text-slate-500">
                        Start directly
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {outputModes.map((mode) => (
                        <Field key={mode} label={outputModeLabels[mode]}>
                          <input
                            className={fieldClassName}
                            value={draftSettings.captureHotkeys[mode]}
                            onChange={(event) =>
                              setDraftSettings({
                                ...draftSettings,
                                captureHotkeys: {
                                  ...draftSettings.captureHotkeys,
                                  [mode]: event.target.value,
                                },
                              })
                            }
                          />
                        </Field>
                      ))}
                    </div>
                  </div>
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

                  <Field label="Groq API key (optional)">
                    <input
                      className={fieldClassName}
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="gsk_..."
                      value={draftSettings.groqApiKey}
                      onChange={(event) =>
                        setDraftSettings({
                          ...draftSettings,
                          groqApiKey: event.target.value,
                        })
                      }
                    />
                    <p className="text-xs font-normal text-slate-500">
                      Stored locally. Without a key, dictations use the built-in
                      local cleanup instead of Groq.
                    </p>
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
                  <Toggle
                    checked={draftSettings.offlineMode}
                    label="Offline mode"
                    onChange={(checked) =>
                      setDraftSettings({
                        ...draftSettings,
                        offlineMode: checked,
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
                    className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setDraftSettings(settings)}
                  >
                    Reset
                  </button>
                  <button
                    className="h-10 rounded-md bg-violet px-4 text-sm font-medium text-white hover:bg-violet-hover"
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
                    className="h-10 min-w-72 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                    placeholder="developer@company.test"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                  />
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-4 text-sm font-medium text-white hover:bg-violet-hover"
                    onClick={() => void submitInvite()}
                  >
                    <UserPlus className="size-4" />
                    Invite
                  </button>
                </div>

                {error && view === "admin" && <InlineError message={error} />}

                <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-medium">Email</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Created</th>
                        <th className="px-3 py-2 text-right font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.length === 0 ? (
                        <tr>
                          <td
                            className="px-3 py-10 text-center text-slate-500"
                            colSpan={4}
                          >
                            No users.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-3 py-2 font-medium text-slate-800">
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
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-balance text-lg font-semibold">
                  Preview
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
              <Field label="Transcript">
                <div className="max-h-28 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-normal text-slate-600">
                  {lastResult?.transcript ?? "No transcript available."}
                </div>
              </Field>
              <Field label="Final output">
                <textarea
                  className="min-h-44 rounded-md border border-slate-300 bg-white p-3 text-sm font-normal text-slate-900 outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  value={previewText}
                  onChange={(event) => setPreviewText(event.target.value)}
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Dialog.Close className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </Dialog.Close>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => void copyText(previewText)}
              >
                <Copy className="size-4" />
                Copy
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-4 text-sm font-medium text-white hover:bg-violet-hover"
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
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
            <AlertDialog.Title className="text-balance text-lg font-semibold">
              Disable user
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-pretty text-sm text-slate-600">
              {pendingDisableUser?.email}
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </AlertDialog.Cancel>
              <AlertDialog.Action
                className="h-10 rounded-md bg-red-700 px-4 text-sm font-medium text-white hover:bg-red-800"
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

function CaptureOverlayApp() {
  const [state, setState] = useState<CaptureOverlayState>({
    phase: "recording",
    modeLabel: "Clean Text",
    level: 0,
  });

  useEffect(() => window.inumaki.onCaptureOverlayState(setState), []);
  useEffect(() => {
    const previousBodyBackground = document.body.style.background;
    const previousDocumentBackground =
      document.documentElement.style.background;
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";

    return () => {
      document.body.style.background = previousBodyBackground;
      document.documentElement.style.background = previousDocumentBackground;
    };
  }, []);

  const isRecording = state.phase === "recording";
  const isProcessing = state.phase === "processing";
  const isResult = state.phase === "result";
  const isError = state.phase === "error";
  const level = Math.max(0, Math.min(state.level ?? 0, 1));

  if (isResult || isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-transparent p-2 text-white">
        <section className="w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-slate-900/40">
          <div className="flex h-12 items-center justify-between gap-3 border-b border-slate-700 px-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {isError ? "Needs attention" : "Output ready"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {state.modeLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isResult && (
                <button
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-slate-900 hover:bg-slate-200"
                  aria-label="Copy transcribed text"
                  onClick={() =>
                    state.text && void window.inumaki.writeClipboard(state.text)
                  }
                >
                  <Copy className="size-3.5" />
                  Copy
                </button>
              )}
              <button
                className="flex size-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
                aria-label="Close dictation overlay"
                title="Close"
                onClick={() => void window.inumaki.hideCaptureOverlay()}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="p-3">
            {isResult ? (
              <textarea
                className="h-32 w-full resize-none rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm leading-5 text-slate-100 outline-none focus:border-violet focus:ring-2 focus:ring-violet/30"
                readOnly
                value={state.text ?? ""}
                aria-label="Transcribed text"
              />
            ) : (
              <div className="flex h-32 gap-2 rounded-lg border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-100">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p className="overflow-auto text-pretty">
                  {state.error ?? "Dictation failed."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-transparent text-white">
      <section
        className="grid h-[76px] w-[304px] grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-3 rounded-[26px] border border-slate-700/90 bg-slate-900/95 px-3 py-2 shadow-2xl shadow-slate-900/50 ring-1 ring-white/10"
        aria-label={isProcessing ? "Dictation processing" : "Dictation active"}
      >
        <button
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isProcessing}
          aria-label="Cancel dictation"
          title="Cancel dictation"
          onClick={() => void window.inumaki.requestCaptureOverlayCancel()}
        >
          <X className="size-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {state.detail ?? (isProcessing ? "Processing" : "Recording")}
            </p>
            <p className="truncate text-xs font-medium text-slate-200">
              {state.modeLabel}
            </p>
          </div>
          <VoiceWave
            active={isRecording}
            level={level}
            processing={isProcessing}
          />
        </div>

        <button
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          disabled={!isRecording}
          aria-label="Mark end of dictation"
          title="Mark end of dictation"
          onClick={() => void window.inumaki.requestCaptureOverlayMark()}
        >
          <Check className="size-4" />
        </button>
      </section>
    </div>
  );
}

function VoiceWave({
  active,
  level,
  processing,
}: {
  active: boolean;
  level: number;
  processing: boolean;
}) {
  const bars = [
    0.22, 0.34, 0.48, 0.62, 0.78, 0.92, 0.7, 0.5, 0.82, 1, 0.82, 0.5, 0.7, 0.92,
    0.78, 0.62, 0.48, 0.34, 0.22,
  ];

  return (
    <div
      className="relative mt-1 flex h-9 w-full items-center justify-center gap-1 overflow-hidden"
      aria-hidden="true"
    >
      <span className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      {bars.map((weight, index) => {
        const movement = active ? Math.max(level, 0.08) : 0.05;
        const processingLift = processing ? 0.32 + (index % 5) * 0.08 : 0;
        const height = 8 + (movement + processingLift) * weight * 26;
        const opacity = processing
          ? 0.4 + (index % 4) * 0.12
          : active
            ? 0.42 + movement * weight * 0.8
            : 0.35;

        return (
          <span
            key={index}
            className={cn(
              "relative block w-1 rounded-full bg-slate-100 transition-[height,opacity] duration-75 motion-reduce:transition-none",
              processing &&
                "animate-pulse bg-sky-200 motion-reduce:animate-none",
              active && level > 0.28 && index % 4 === 0 && "bg-emerald-200",
            )}
            style={{
              opacity: Math.min(opacity, 1),
              height: `${Math.min(height, 34)}px`,
              animationDelay: `${index * 48}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

const fieldClassName =
  "h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet focus:ring-2 focus:ring-violet/20";

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
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
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
      <span className="max-w-56 truncate rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
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
            "h-10 rounded-md border px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet/20",
            activeMode === mode
              ? "border-violet bg-violet text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
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
          ? "bg-white text-slate-900"
          : "text-slate-300 hover:bg-slate-800 hover:text-white",
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
    <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 rounded-lg border border-slate-700 p-3">
      <Icon className="mt-0.5 size-4 text-slate-400" />
      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="truncate text-sm text-slate-100">{value}</div>
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
        status === "recording" && "border-red-200 bg-red-50 text-red-700",
        status === "processing" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        status === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "error" && "border-red-200 bg-red-50 text-red-700",
        status === "idle" && "border-slate-200 bg-white text-slate-600",
      )}
    >
      {label}
    </div>
  );
}

function ApiOfflineBanner({
  apiBaseUrl,
  error,
}: {
  apiBaseUrl: string;
  error?: string;
}) {
  return (
    <div
      className="mb-4 mt-2 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
      role="alert"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold">Inumaki API is not reachable.</p>
        <p className="mt-1 text-pretty text-amber-800">
          Dictation, settings sync, and admin features require the local API at{" "}
          <span className="font-mono">{formatApiHost(apiBaseUrl)}</span>. Start
          it with <span className="font-mono">pnpm dev:api</span> in
          development, or ensure the bundled API service is running for the
          packaged build.
        </p>
        {error && (
          <p className="mt-1 truncate text-xs text-amber-700">{error}</p>
        )}
      </div>
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="mt-4 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span className="text-pretty">{message}</span>
    </div>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="truncate font-medium text-slate-700">{value}</span>
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
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 truncate text-sm font-medium text-slate-800">
        {value}
      </div>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
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
    <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        className="size-5 accent-violet"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
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
