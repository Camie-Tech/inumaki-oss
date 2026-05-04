import { defaultSettings, type UserSettings } from "@inumaki/shared";
import { Router } from "express";
import { z } from "zod";

import { db } from "../db/client";
import { preferences } from "../db/schema";

const settingsSchema = z.object({
  autoPaste: z.boolean(),
  defaultMode: z.enum([
    "raw-transcript",
    "clean-text",
    "polished-message",
    "coding-prompt",
  ]),
  hotkey: z.string().min(1),
  microphoneId: z.string().nullable(),
  previewBeforePaste: z.boolean(),
  tonePreference: z.string().min(1),
});

export const settingsRouter = Router();

settingsRouter.get("/", (_req, res) => {
  res.json(readSettings());
});

settingsRouter.put("/", (req, res) => {
  const settings = settingsSchema.parse(req.body);
  const updatedAt = new Date().toISOString();

  for (const [key, value] of Object.entries(settings)) {
    db.insert(preferences)
      .values({ key, value: JSON.stringify(value), updatedAt })
      .onConflictDoUpdate({
        target: preferences.key,
        set: { value: JSON.stringify(value), updatedAt },
      })
      .run();
  }

  res.json(readSettings());
});

export function readSettings(): UserSettings {
  const rows = db.select().from(preferences).all();
  const values = new Map(rows.map((row) => [row.key, row.value]));

  return {
    autoPaste: readBoolean(values, "autoPaste", defaultSettings.autoPaste),
    defaultMode: readString(
      values,
      "defaultMode",
      defaultSettings.defaultMode,
    ) as UserSettings["defaultMode"],
    hotkey: readString(values, "hotkey", defaultSettings.hotkey),
    microphoneId: readNullableString(
      values,
      "microphoneId",
      defaultSettings.microphoneId,
    ),
    previewBeforePaste: readBoolean(
      values,
      "previewBeforePaste",
      defaultSettings.previewBeforePaste,
    ),
    tonePreference: readString(
      values,
      "tonePreference",
      defaultSettings.tonePreference,
    ),
  };
}

function readString(
  values: Map<string, string>,
  key: string,
  fallback: string,
): string {
  const raw = values.get(key);
  return raw ? JSON.parse(raw) : fallback;
}

function readNullableString(
  values: Map<string, string>,
  key: string,
  fallback: string | null,
): string | null {
  const raw = values.get(key);
  return raw ? JSON.parse(raw) : fallback;
}

function readBoolean(
  values: Map<string, string>,
  key: string,
  fallback: boolean,
): boolean {
  const raw = values.get(key);
  return raw ? JSON.parse(raw) : fallback;
}
