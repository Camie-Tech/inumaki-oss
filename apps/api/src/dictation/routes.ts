import fs from "node:fs";
import fsPromises from "node:fs/promises";

import type { DictationResponse, OutputMode } from "@inumaki/shared";
import { defaultSettings, isOutputMode } from "@inumaki/shared";
import { Router } from "express";
import { eq } from "drizzle-orm";
import multer from "multer";

import { db } from "../db/client";
import { preferences, usageEvents } from "../db/schema";
import { rewriteTranscript } from "../rewrite/rewriter";
import { transcribeAudio } from "./transcription";

fs.mkdirSync("data/uploads", { recursive: true });

const upload = multer({ dest: "data/uploads" });

export const dictationRouter = Router();

dictationRouter.post("/", upload.single("audio"), async (req, res, next) => {
  const usageId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const mode = parseMode(req.body.mode);
  const audioSeconds = Number(req.body.audioSeconds ?? 0);

  try {
    if (!req.file) {
      res.status(400).json({ error: "Missing audio file." });
      return;
    }

    const tonePreference =
      getPreference("tonePreference") ?? defaultSettings.tonePreference;
    const transcript = await transcribeAudio(req.file.path);
    const finalText = await rewriteTranscript({
      mode,
      tonePreference,
      transcript,
    });

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

    if (mode !== "raw-transcript") {
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

    const response: DictationResponse = {
      finalText,
      mode,
      transcript,
      usageId,
    };
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
      await fsPromises.unlink(req.file.path).catch(() => undefined);
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
