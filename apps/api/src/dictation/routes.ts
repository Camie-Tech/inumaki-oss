import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { performance } from "node:perf_hooks";

import type {
  DictationResponse,
  DictationTimings,
  OutputMode,
} from "@inumaki/shared";
import { defaultSettings, isOutputMode } from "@inumaki/shared";
import { Router } from "express";
import { eq } from "drizzle-orm";
import multer from "multer";

import { config } from "../config";
import { db } from "../db/client";
import { preferences, usageEvents } from "../db/schema";
import { rewriteTranscript } from "../rewrite/rewriter";
import { transcribeAudio } from "./transcription";

fs.mkdirSync(config.uploadsDir, { recursive: true });

const upload = multer({ dest: config.uploadsDir });

export const dictationRouter = Router();

dictationRouter.post("/", upload.single("audio"), async (req, res, next) => {
  const startedAt = performance.now();
  const timings: DictationTimings = {};
  const usageId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const mode = parseMode(req.body.mode);
  const audioSeconds = Number(req.body.audioSeconds ?? 0);

  try {
    if (!req.file) {
      res.status(400).json({ error: "Missing audio file." });
      return;
    }

    const [tonePreference, serverPreferenceMs] = measureSync(
      () => getPreference("tonePreference") ?? defaultSettings.tonePreference,
    );
    timings.serverPreferenceMs = roundMs(serverPreferenceMs);

    const transcription = await transcribeAudio(req.file.path);
    Object.assign(timings, transcription.timings);

    const groqApiKey =
      typeof req.body.groqApiKey === "string" ? req.body.groqApiKey : "";
    const offlineMode = req.body.offlineMode === "true";

    const [rewrite, serverRewriteMs] = await measureMs(() =>
      rewriteTranscript({
        apiKey: groqApiKey,
        mode,
        offlineMode,
        tonePreference,
        transcript: transcription.text,
      }),
    );
    timings.serverRewriteMs = roundMs(serverRewriteMs);
    timings.rewriteSkippedReason = rewrite.skippedReason;

    const [, serverDbMs] = measureSync(() => {
      db.insert(usageEvents)
        .values({
          id: usageId,
          kind: "dictation",
          mode,
          audioSeconds,
          createdAt,
          ok: true,
        })
        .run();

      if (rewrite.didRewrite) {
        db.insert(usageEvents)
          .values({
            id: crypto.randomUUID(),
            kind: "rewrite",
            mode,
            audioSeconds: 0,
            createdAt,
            ok: true,
          })
          .run();
      }
    });
    timings.serverDbMs = roundMs(serverDbMs);
    timings.serverTotalMs = roundMs(performance.now() - startedAt);

    const response: DictationResponse = {
      finalText: rewrite.text,
      mode,
      timings,
      transcript: transcription.text,
      usageId,
    };
    res.setHeader("Server-Timing", serverTimingHeader(timings));
    logSlowDictation({ audioSeconds, mode, timings, usageId });
    res.json(response);
  } catch (error) {
    db.insert(usageEvents)
      .values({
        id: usageId,
        kind: "dictation",
        mode,
        audioSeconds,
        createdAt,
        ok: false,
      })
      .run();
    next(error);
  } finally {
    if (req.file?.path) {
      const cleanupStartedAt = performance.now();
      await fsPromises.unlink(req.file.path).catch(() => undefined);
      timings.serverCleanupMs = roundMs(performance.now() - cleanupStartedAt);
    }
  }
});

function parseMode(value: unknown): OutputMode {
  return typeof value === "string" && isOutputMode(value)
    ? value
    : defaultSettings.defaultMode;
}

function getPreference(key: string): string | null {
  const row = db
    .select()
    .from(preferences)
    .where(eq(preferences.key, key))
    .get();
  return row?.value ?? null;
}

async function measureMs<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const startedAt = performance.now();
  const result = await fn();
  return [result, performance.now() - startedAt];
}

function measureSync<T>(fn: () => T): [T, number] {
  const startedAt = performance.now();
  const result = fn();
  return [result, performance.now() - startedAt];
}

function roundMs(value: number): number {
  return Math.round(value);
}

function serverTimingHeader(timings: DictationTimings): string {
  const entries: Array<[keyof DictationTimings, string]> = [
    ["serverPreferenceMs", "preference"],
    ["serverAudioConversionMs", "audio-conversion"],
    ["serverWhisperMs", "whisper"],
    ["serverTranscriptionMs", "transcription"],
    ["serverRewriteMs", "rewrite"],
    ["serverDbMs", "db"],
    ["serverTotalMs", "total"],
  ];

  return entries
    .flatMap(([key, name]) => {
      const value = timings[key];
      return typeof value === "number" ? [`${name};dur=${value}`] : [];
    })
    .join(", ");
}

function logSlowDictation(input: {
  audioSeconds: number;
  mode: OutputMode;
  timings: DictationTimings;
  usageId: string;
}): void {
  if (
    typeof input.timings.serverTotalMs !== "number" ||
    input.timings.serverTotalMs < config.slowDictationThresholdMs
  ) {
    return;
  }

  console.warn(
    JSON.stringify({
      audioSeconds: input.audioSeconds,
      mode: input.mode,
      msg: "Slow dictation request",
      thresholdMs: config.slowDictationThresholdMs,
      timings: input.timings,
      usageId: input.usageId,
      whisperModel: config.whisperModelName,
      whisperThreads: config.whisperThreads,
    }),
  );
}
