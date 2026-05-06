# File Tree And Contents

Generated from `/home/clawdbot/inumaki-oss`. Excludes generated/dependency directories and generated database/build-info files.

## File Tree

```text
.
├── .camie
│   └── project-memory.md
├── .editorconfig
├── .env.example
├── .github
│   ├── ISSUE_TEMPLATE
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── pull_request_template.md
│   └── workflows
│       ├── ci.yml
│       ├── preview.yml
│       └── release.yml
├── .gitignore
├── apps
│   ├── api
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── admin
│   │   │   │   └── routes.ts
│   │   │   ├── config.ts
│   │   │   ├── db
│   │   │   │   ├── client.ts
│   │   │   │   └── schema.ts
│   │   │   ├── dictation
│   │   │   │   ├── routes.ts
│   │   │   │   └── transcription.ts
│   │   │   ├── index.ts
│   │   │   ├── rewrite
│   │   │   │   ├── prompts.ts
│   │   │   │   └── rewriter.ts
│   │   │   ├── server.ts
│   │   │   └── settings
│   │   │       └── routes.ts
│   │   └── tsconfig.json
│   └── desktop
│       ├── electron.vite.config.ts
│       ├── package.json
│       ├── postcss.config.cjs
│       ├── src
│       │   ├── main
│       │   │   └── index.ts
│       │   ├── preload
│       │   │   └── index.ts
│       │   └── renderer
│       │       ├── App.tsx
│       │       ├── global.d.ts
│       │       ├── index.html
│       │       ├── lib
│       │       │   ├── api.ts
│       │       │   └── cn.ts
│       │       ├── main.tsx
│       │       └── styles.css
│       ├── tailwind.config.ts
│       └── tsconfig.json
├── docs
│   ├── architecture.md
│   └── branching.md
├── eslint.config.mjs
├── package.json
├── packages
│   └── shared
│       ├── package.json
│       ├── src
│       │   ├── index.test.ts
│       │   └── index.ts
│       └── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
└── tsconfig.base.json
```

## File Contents
### .camie/project-memory.md

```
# inumaki-oss Project Memory

This file is the durable working memory for Camie Dev Console sessions in this repository.
It was auto-generated from a first-pass repository scan and should be refined as the project evolves.

## Product Overview

- Inumaki AI is a Windows-first internal voice productivity tool for developers.
- MVP flow: press/toggle hotkey, record microphone audio, transcribe locally with Whisper, rewrite with Groq/fallback logic, then copy or paste polished text into the focused app.

## Architecture

- pnpm monorepo with `apps/desktop`, `apps/api`, and `packages/shared`.
- Desktop app: Electron + React + TypeScript + electron-vite. Main process owns tray, global shortcut registration, clipboard, and Windows paste IPC; renderer owns MediaRecorder capture, output mode selection, settings, preview, and admin UI.
- API app: Express + TypeScript. Routes cover `/dictations`, `/settings`, `/admin/users`, `/admin/usage`, and `/health`.
- Shared package exports output modes, labels, default settings, and API contract types.
- SQLite is the MVP persistence layer via `better-sqlite3` and Drizzle schema definitions. API creates tables on startup.
- Transcription uses local whisper.cpp with a ggml model; run `pnpm setup:whisper` or set `WHISPER_CPP_BINARY` and `WHISPER_MODEL_PATH`.
- Rewrite uses Groq when `GROQ_API_KEY` is configured; otherwise the API uses deterministic local cleanup fallback.

## Commands

- `pnpm install`
- `pnpm dev` runs API and desktop in parallel.
- `pnpm dev:api` runs only the Express API.
- `pnpm dev:desktop` runs only the Electron desktop app.
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm --filter @inumaki/desktop dist:win` builds the Windows distributable.
- API port is configured with `INUMAKI_API_PORT` and defaults to `4141`; desktop defaults to `INUMAKI_API_BASE_URL` or that same port.

## Conventions

- TypeScript is strict across the workspace.
- Use shared output/settings contracts from `packages/shared` rather than duplicating mode strings.
- Desktop UI uses Tailwind defaults, `cn` from `clsx` + `tailwind-merge`, lucide icons, and Radix Dialog for modal behavior.
- The API should not retain raw audio; uploaded audio is temporary and deleted after dictation processing.
- No authentication is implemented for the MVP; admin controls are intentionally lightweight.

## Important Files

- `README.md`
- `docs/architecture.md`
- `docs/branching.md`
- `packages/shared/src/index.ts`
- `apps/api/src/server.ts`
- `apps/api/src/dictation/routes.ts`
- `apps/api/src/dictation/transcription.ts`
- `apps/api/src/rewrite/rewriter.ts`
- `apps/api/src/db/client.ts`
- `apps/desktop/src/main/index.ts`
- `apps/desktop/src/renderer/App.tsx`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`

## Known Risks

- Electron `globalShortcut` is currently toggle-style; true press-and-hold keyup capture will need a Windows global keyboard hook library or native module.
- Windows auto-paste is implemented with clipboard plus PowerShell SendKeys and is only active on `win32`.
- Whisper integration expects a whisper.cpp-compatible CLI and model path; no model binaries are committed.
- Groq model is configurable via `GROQ_MODEL`; verify model choice before production use.
- `better-sqlite3`, Electron, and esbuild require pnpm approved build scripts; root `package.json` records these under `pnpm.onlyBuiltDependencies`.

## Recent Decisions

- Repository was initialized with Git on branch `main`.
- Branch workflow is documented as `main` for releases and `dev` for integration; CI triggers on both.
- SQLite was chosen for the MVP despite the initial task mentioning Postgres in setup tasks, because the product spec recommends SQLite for the first internal version.
- Project memory is stored in `.camie/project-memory.md` and is injected into every Camie session start.
- Update this file whenever you learn durable facts that should reduce future re-discovery cost.

## Artifact Workflow

- User-facing generated files such as CSV, PDF, TXT, Markdown, JSON, images, zips, and spreadsheets should be written inside the repository, preferably under `exports/`, `artifacts/`, or `reports/`.
- Do not use `/mnt/data`, `/tmp`, Google Drive, or external upload services for artifacts unless the user explicitly asks for that destination.
- Mention the repo-relative artifact path in the final answer so the UI can surface it clearly.
- Camie detects changed downloadable files and shows them as Artifacts with direct download buttons.

## Memory Maintenance Rules

- Keep this file concise, factual, and repo-specific.
- Prefer stable facts over temporary task notes.
- Update this file when you learn something future sessions should know immediately.
```

### .editorconfig

```
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true
```

### .env.example

```
# API
INUMAKI_API_PORT=4141
DATABASE_URL=file:./data/inumaki.sqlite
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

# Local Whisper adapter. Point this to a whisper.cpp-compatible binary.
WHISPER_CPP_BINARY=
WHISPER_MODEL_PATH=
WHISPER_CPP_HOME=.local/whisper.cpp
WHISPER_CPP_MODEL=base.en
WHISPER_CPP_THREADS=4

# Desktop
INUMAKI_API_BASE_URL=http://127.0.0.1:4141
```

### .github/ISSUE_TEMPLATE/bug_report.md

```
---
name: Bug report
about: Report a product or engineering bug
title: "[Bug]: "
labels: bug
---

## What happened?

## Expected behavior

## Steps to reproduce

## Environment

- OS:
- App version:
- Microphone:
```

### .github/ISSUE_TEMPLATE/feature_request.md

```
---
name: Feature request
about: Propose an MVP feature or improvement
title: "[Feature]: "
labels: enhancement
---

## Problem

## Proposed solution

## MVP impact
```

### .github/pull_request_template.md

```
## Summary

## Validation

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`

## Manual Test Notes
```

### .github/workflows/ci.yml

```
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.33.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

### .github/workflows/preview.yml

```
name: Preview

on:
  pull_request:
    paths:
      - "apps/desktop/**"
      - "packages/shared/**"
      - ".github/workflows/preview.yml"

jobs:
  renderer-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.33.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @inumaki/desktop build:renderer
```

### .github/workflows/release.yml

```
name: Release

on:
  workflow_dispatch:
  push:
    tags:
      - "v*.*.*"

jobs:
  windows:
    runs-on: windows-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.33.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @inumaki/desktop dist:win
      - uses: softprops/action-gh-release@v2
        with:
          files: apps/desktop/release/**
```

### .gitignore

```
node_modules/
dist/
out/
release/
coverage/
*.log
*.tsbuildinfo
*.db
.env
.env.local
.DS_Store
data/*.sqlite
data/*.sqlite-*
```

### apps/api/package.json

```
{
  "name": "@inumaki/api",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "pnpm --filter @inumaki/shared build && tsx watch src/index.ts",
    "start": "node dist/index.js",
    "test": "node --test --experimental-strip-types src/**/*.test.ts",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@inumaki/shared": "workspace:*",
    "better-sqlite3": "^12.4.1",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "drizzle-orm": "^0.44.7",
    "express": "^5.1.0",
    "multer": "^2.0.2",
    "pino": "^10.1.0",
    "pino-http": "^11.0.0",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.13",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.5",
    "@types/multer": "^2.0.0",
    "@types/node": "^22.18.10",
    "tsx": "^4.20.6",
    "typescript": "^5.9.3"
  }
}
```

### apps/api/src/admin/routes.ts

```
import type { UsageSummary } from "@inumaki/shared";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { db, sqlite } from "../db/client";
import { users } from "../db/schema";

const inviteSchema = z.object({
  email: z.string().email(),
});

export const adminRouter = Router();

adminRouter.get("/users", (_req, res) => {
  res.json(db.select().from(users).all());
});

adminRouter.post("/users", (req, res) => {
  const input = inviteSchema.parse(req.body);
  const now = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    email: input.email,
    status: "active" as const,
    createdAt: now,
    disabledAt: null,
  };

  db.insert(users)
    .values(user)
    .onConflictDoUpdate({
      target: users.email,
      set: { status: "active", disabledAt: null },
    })
    .run();

  res.status(201).json(user);
});

adminRouter.post("/users/:id/disable", (req, res) => {
  const disabledAt = new Date().toISOString();
  db.update(users)
    .set({ status: "disabled", disabledAt })
    .where(eq(users.id, req.params.id))
    .run();
  res.status(204).send();
});

adminRouter.get("/usage", (_req, res) => {
  const row = sqlite
    .prepare(
      `
    SELECT
      SUM(CASE WHEN kind = 'dictation' THEN 1 ELSE 0 END) AS dictations,
      SUM(CASE WHEN kind = 'rewrite' THEN 1 ELSE 0 END) AS rewrites,
      SUM(audio_seconds) AS totalAudioSeconds
    FROM usage_events
    WHERE ok = 1
  `,
    )
    .get() as Partial<UsageSummary> | undefined;

  res.json({
    dictations: Number(row?.dictations ?? 0),
    rewrites: Number(row?.rewrites ?? 0),
    totalAudioSeconds: Number(row?.totalAudioSeconds ?? 0),
  } satisfies UsageSummary);
});
```

### apps/api/src/config.ts

```
import "dotenv/config";

import path from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/inumaki.sqlite";

export const config = {
  databasePath: databaseUrl.startsWith("file:")
    ? path.resolve(process.cwd(), databaseUrl.slice("file:".length))
    : path.resolve(process.cwd(), databaseUrl),
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.INUMAKI_API_PORT ?? 4141),
  whisperBinary: process.env.WHISPER_CPP_BINARY ?? "",
  whisperCppHome: process.env.WHISPER_CPP_HOME ?? ".local/whisper.cpp",
  whisperModelName: process.env.WHISPER_CPP_MODEL ?? "base.en",
  whisperModelPath: process.env.WHISPER_MODEL_PATH ?? "",
  whisperThreads: Number(process.env.WHISPER_CPP_THREADS ?? 4),
};
```

### apps/api/src/db/client.ts

```
import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { config } from "../config";
import * as schema from "./schema";

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const sqlite = new Database(config.databasePath);
export const db = drizzle(sqlite, { schema });

export function initializeDatabase(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      disabled_at TEXT
    );

    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usage_events (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      mode TEXT,
      audio_seconds REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      ok INTEGER NOT NULL DEFAULT 1
    );
  `);
}
```

### apps/api/src/db/schema.ts

```
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status", { enum: ["active", "disabled"] })
    .notNull()
    .default("active"),
  createdAt: text("created_at").notNull(),
  disabledAt: text("disabled_at"),
});

export const preferences = sqliteTable("preferences", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const usageEvents = sqliteTable("usage_events", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["dictation", "rewrite"] }).notNull(),
  mode: text("mode"),
  audioSeconds: real("audio_seconds").notNull().default(0),
  createdAt: text("created_at").notNull(),
  ok: integer("ok", { mode: "boolean" }).notNull().default(true),
});
```

### apps/api/src/dictation/routes.ts

```
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
```

### apps/api/src/dictation/transcription.ts

```
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { config } from "../config";

const execFileAsync = promisify(execFile);

export async function transcribeAudio(audioPath: string): Promise<string> {
  if (!config.whisperBinary || !config.whisperModelPath) {
    throw new Error(
      "Local transcription is not configured. Run `pnpm setup:whisper`, or set WHISPER_CPP_BINARY and WHISPER_MODEL_PATH.",
    );
  }

  const outputBase = audioPath.replace(path.extname(audioPath), "");
  await execFileAsync(config.whisperBinary, [
    "-m",
    config.whisperModelPath,
    "-f",
    audioPath,
    "-otxt",
    "-of",
    outputBase,
  ]);

  const text = await fs.readFile(`${outputBase}.txt`, "utf8");
  return text.trim();
}
```

### apps/api/src/index.ts

```
import { config } from "./config";
import { createServer } from "./server";

const app = createServer();

app.listen(config.port, config.host, () => {
  console.log(`Inumaki API listening on http://${config.host}:${config.port}`);
});
```

### apps/api/src/rewrite/prompts.ts

```
import type { OutputMode } from "@inumaki/shared";

export function systemPromptForMode(
  mode: OutputMode,
  tonePreference: string,
): string {
  const tone = tonePreference.trim() || "clear and concise";

  switch (mode) {
    case "raw-transcript":
      return `Return a lightly cleaned transcript. Preserve wording and meaning. Tone: ${tone}.`;
    case "clean-text":
      return `Clean dictated speech into readable text. Remove filler words, add punctuation, and keep meaning intact. Tone: ${tone}.`;
    case "polished-message":
      return `Rewrite dictated speech as a concise polished message for an internal developer workflow. Preserve intent. Tone: ${tone}.`;
    case "coding-prompt":
      return `Convert dictated speech into a structured prompt for a coding model. Include goal, context, requirements, and acceptance criteria when inferable. Tone: ${tone}.`;
  }
}
```

### apps/api/src/rewrite/rewriter.ts

```
import type { OutputMode } from "@inumaki/shared";

import { config } from "../config";
import { systemPromptForMode } from "./prompts";

interface RewriteInput {
  mode: OutputMode;
  tonePreference: string;
  transcript: string;
}

export async function rewriteTranscript(input: RewriteInput): Promise<string> {
  if (input.mode === "raw-transcript") {
    return normalizeWhitespace(input.transcript);
  }

  if (!config.groqApiKey) {
    return localRewriteFallback(input);
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.groqModel,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: systemPromptForMode(input.mode, input.tonePreference),
          },
          { role: "user", content: input.transcript },
        ],
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq rewrite failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq rewrite response did not include content.");
  }

  return content;
}

function localRewriteFallback(input: RewriteInput): string {
  const cleaned = normalizeWhitespace(input.transcript)
    .replace(/\b(um|uh|like|you know)\b,?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (input.mode === "coding-prompt") {
    return [
      "Goal:",
      cleaned,
      "",
      "Requirements:",
      "- Preserve the intended behavior.",
      "- Keep the implementation scoped and testable.",
      "",
      "Acceptance criteria:",
      "- The requested change works in the target workflow.",
      "- Relevant validation passes.",
    ].join("\n");
  }

  return cleaned;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
```

### apps/api/src/server.ts

```
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import pinoHttp from "pino-http";

import { adminRouter } from "./admin/routes";
import { dictationRouter } from "./dictation/routes";
import { initializeDatabase } from "./db/client";
import { settingsRouter } from "./settings/routes";

export function createServer() {
  initializeDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/dictations", dictationRouter);
  app.use("/settings", settingsRouter);
  app.use("/admin", adminRouter);
  app.use(errorHandler);

  return app;
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message =
    error instanceof Error ? error.message : "Unexpected server error.";
  res.status(500).json({ error: message });
};
```

### apps/api/src/settings/routes.ts

```
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
```

### apps/api/tsconfig.json

```
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": false,
    "module": "CommonJS",
    "moduleResolution": "Node",
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}
```

### apps/desktop/electron.vite.config.ts

```
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [react()],
  },
});
```

### apps/desktop/package.json

```
{
  "name": "@inumaki/desktop",
  "version": "0.1.0",
  "private": true,
  "description": "Inumaki AI Windows desktop client.",
  "main": "out/main/index.js",
  "scripts": {
    "build": "pnpm --filter @inumaki/shared build && electron-vite build",
    "build:renderer": "pnpm --filter @inumaki/shared build && electron-vite build --renderer-only",
    "dev": "pnpm --filter @inumaki/shared build && electron-vite dev",
    "dist:win": "pnpm build && electron-builder --win nsis --x64",
    "test": "node --test --experimental-strip-types src/**/*.test.ts",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@inumaki/shared": "workspace:*",
    "@radix-ui/react-dialog": "^1.1.15",
    "clsx": "^2.1.1",
    "dotenv": "^17.2.3",
    "lucide-react": "^0.552.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^22.18.10",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@vitejs/plugin-react": "^5.1.0",
    "autoprefixer": "^10.4.21",
    "electron": "^39.0.0",
    "electron-builder": "^26.0.12",
    "electron-vite": "^4.0.1",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.18",
    "typescript": "^5.9.3",
    "vite": "^7.1.12"
  },
  "build": {
    "appId": "ai.inumaki.desktop",
    "productName": "Inumaki AI",
    "directories": {
      "output": "release"
    },
    "files": [
      "out/**",
      "package.json"
    ],
    "win": {
      "target": "nsis"
    },
    "nsis": {
      "oneClick": false,
      "perMachine": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

### apps/desktop/postcss.config.cjs

```
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### apps/desktop/src/main/index.ts

```
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
```

### apps/desktop/src/preload/index.ts

```
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
```

### apps/desktop/src/renderer/App.tsx

```
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
```

### apps/desktop/src/renderer/global.d.ts

```
import type { UserSettings } from "@inumaki/shared";

declare global {
  interface Window {
    inumaki: {
      getApiBaseUrl: () => Promise<string>;
      getSettings: () => Promise<UserSettings>;
      setSettings: (settings: UserSettings) => Promise<UserSettings>;
      writeClipboard: (text: string) => Promise<void>;
      pasteIntoActiveApp: () => Promise<void>;
      onHotkeyPressed: (callback: () => void) => () => void;
    };
  }
}

export {};
```

### apps/desktop/src/renderer/index.html

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Inumaki AI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

### apps/desktop/src/renderer/lib/api.ts

```
import type {
  AdminUser,
  DictationResponse,
  OutputMode,
  UsageSummary,
  UserSettings,
} from "@inumaki/shared";

export async function saveServerSettings(
  apiBaseUrl: string,
  settings: UserSettings,
): Promise<UserSettings> {
  const response = await fetch(`${apiBaseUrl}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<UserSettings>;
}

export async function createDictation(input: {
  apiBaseUrl: string;
  audio: Blob;
  audioSeconds: number;
  mode: OutputMode;
}): Promise<DictationResponse> {
  const formData = new FormData();
  formData.append("audio", input.audio, "dictation.webm");
  formData.append("mode", input.mode);
  formData.append("audioSeconds", String(input.audioSeconds));

  const response = await fetch(`${input.apiBaseUrl}/dictations`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<DictationResponse>;
}

export async function getUsage(apiBaseUrl: string): Promise<UsageSummary> {
  const response = await fetch(`${apiBaseUrl}/admin/usage`);

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<UsageSummary>;
}

export async function listUsers(apiBaseUrl: string): Promise<AdminUser[]> {
  const response = await fetch(`${apiBaseUrl}/admin/users`);

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<AdminUser[]>;
}

export async function inviteUser(
  apiBaseUrl: string,
  email: string,
): Promise<AdminUser> {
  const response = await fetch(`${apiBaseUrl}/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<AdminUser>;
}

export async function disableUser(
  apiBaseUrl: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/admin/users/${id}/disable`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }
}

async function readError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? `Request failed with ${response.status}`;
}
```

### apps/desktop/src/renderer/lib/cn.ts

```
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### apps/desktop/src/renderer/main.tsx

```
import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### apps/desktop/src/renderer/styles.css

```
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background: #f8fafc;
}
```

### apps/desktop/tailwind.config.ts

```
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/renderer/**/*.{ts,tsx,html}", "./src/renderer/index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

### apps/desktop/tsconfig.json

```
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "types": ["node", "vite/client"]
  },
  "include": ["electron.vite.config.ts", "src"]
}
```

### docs/architecture.md

```
# Architecture

Inumaki AI is split into a Windows-first desktop client and a backend API.

## Desktop Client

The Electron app owns:

- tray lifecycle and window visibility
- global shortcut registration
- microphone capture through browser `MediaRecorder`
- output mode, settings, and preview UI
- clipboard writes and Windows auto-paste

The renderer records audio and posts a `multipart/form-data` payload to the API. The main process exposes a small IPC bridge for settings, app metadata, clipboard, paste, and hotkey events.

## API

The Express API owns:

- dictation upload handling
- local Whisper transcription orchestration
- Groq rewrite orchestration
- settings persistence
- basic admin user controls
- usage metadata logging

Raw audio is stored only in a temporary upload directory and deleted after processing. The API stores usage metadata, not transcript history.

## Data

SQLite is the default MVP database. Tables cover users, preferences, and usage events. This keeps the internal MVP simple while leaving a clear path to a hosted relational database later.

## AI Boundaries

Transcription is adapter-based and expects a whisper.cpp-compatible local binary for MVP offline inference. Rewrite uses Groq when `GROQ_API_KEY` is configured and otherwise falls back to deterministic local formatting so the product loop can be tested.
```

### docs/branching.md

````
# Branching And Releases

## Branches

- `main`: protected release branch.
- `dev`: integration branch for internal testing.
- `feature/*`: short-lived implementation branches.

Pull requests should target `dev` during active MVP development. Release candidates are promoted from `dev` to `main`.

## Required Checks

Pull requests should pass:

- install
- lint
- typecheck
- tests
- build

## Release Flow

Create a version tag from `main`:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The release workflow builds the Windows desktop distributable and attaches it to a GitHub Release.
````

### eslint.config.mjs

```
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/out/**",
      "**/release/**",
      "**/coverage/**",
      "**/node_modules/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
```

### package.json

```
{
  "name": "inumaki-oss",
  "version": "0.1.0",
  "private": true,
  "description": "Windows-first internal voice productivity tool for developers.",
  "license": "MIT",
  "packageManager": "pnpm@10.33.0",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=10.0.0"
  },
  "scripts": {
    "dev": "pnpm --parallel --filter @inumaki/api --filter @inumaki/desktop dev",
    "dev:api": "pnpm --filter @inumaki/api dev",
    "dev:desktop": "pnpm --filter @inumaki/desktop dev",
    "build": "pnpm -r build",
    "lint": "eslint .",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "format": "prettier --check ."
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "eslint": "^9.39.1",
    "globals": "^16.5.0",
    "prettier": "^3.6.2",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.46.4"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "better-sqlite3",
      "electron",
      "electron-winstaller",
      "esbuild"
    ]
  }
}
```

### packages/shared/package.json

```
{
  "name": "@inumaki/shared",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "tsx --test src/*.test.ts",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@types/node": "^22.18.10",
    "tsx": "^4.20.6",
    "typescript": "^5.9.3"
  }
}
```

### packages/shared/src/index.test.ts

```
import assert from "node:assert/strict";
import test from "node:test";

import { defaultSettings, isOutputMode, outputModes } from "./index";

test("default settings use a supported output mode", () => {
  assert.equal(isOutputMode(defaultSettings.defaultMode), true);
});

test("supported mode list includes MVP modes", () => {
  assert.deepEqual(outputModes, [
    "raw-transcript",
    "clean-text",
    "polished-message",
    "coding-prompt",
  ]);
});
```

### packages/shared/src/index.ts

```
export const outputModes = [
  "raw-transcript",
  "clean-text",
  "polished-message",
  "coding-prompt",
] as const;

export type OutputMode = (typeof outputModes)[number];

export const outputModeLabels: Record<OutputMode, string> = {
  "raw-transcript": "Raw Transcript",
  "clean-text": "Clean Text",
  "polished-message": "Polished Message",
  "coding-prompt": "Coding Prompt",
};

export const outputModeDescriptions: Record<OutputMode, string> = {
  "raw-transcript": "Light cleanup while preserving the spoken text.",
  "clean-text":
    "Remove filler words, add punctuation, and normalize formatting.",
  "polished-message":
    "Turn rough speech into concise professional communication.",
  "coding-prompt":
    "Structure the request so it is clear for a coding model or coding agent.",
};

export type DictationStatus =
  | "idle"
  | "recording"
  | "processing"
  | "success"
  | "error";

export interface UserSettings {
  autoPaste: boolean;
  defaultMode: OutputMode;
  hotkey: string;
  microphoneId: string | null;
  previewBeforePaste: boolean;
  tonePreference: string;
}

export const defaultSettings: UserSettings = {
  autoPaste: true,
  defaultMode: "clean-text",
  hotkey: "CommandOrControl+Shift+Space",
  microphoneId: null,
  previewBeforePaste: false,
  tonePreference: "clear and concise",
};

export interface DictationResponse {
  finalText: string;
  mode: OutputMode;
  transcript: string;
  usageId: string;
}

export interface UsageSummary {
  dictations: number;
  rewrites: number;
  totalAudioSeconds: number;
}

export interface AdminUser {
  createdAt: string;
  disabledAt: string | null;
  email: string;
  id: string;
  status: "active" | "disabled";
}

export function isOutputMode(value: string): value is OutputMode {
  return outputModes.includes(value as OutputMode);
}
```

### packages/shared/tsconfig.json

```
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "module": "ES2022",
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}
```

### pnpm-lock.yaml

```
lockfileVersion: "9.0"

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:
  .:
    devDependencies:
      "@eslint/js":
        specifier: ^9.39.1
        version: 9.39.4
      eslint:
        specifier: ^9.39.1
        version: 9.39.4(jiti@2.6.1)
      globals:
        specifier: ^16.5.0
        version: 16.5.0
      prettier:
        specifier: ^3.6.2
        version: 3.8.3
      typescript:
        specifier: ^5.9.3
        version: 5.9.3
      typescript-eslint:
        specifier: ^8.46.4
        version: 8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)

  apps/api:
    dependencies:
      "@inumaki/shared":
        specifier: workspace:*
        version: link:../../packages/shared
      better-sqlite3:
        specifier: ^12.4.1
        version: 12.9.0
      cors:
        specifier: ^2.8.5
        version: 2.8.6
      dotenv:
        specifier: ^17.2.3
        version: 17.4.2
      drizzle-orm:
        specifier: ^0.44.7
        version: 0.44.7(@types/better-sqlite3@7.6.13)(better-sqlite3@12.9.0)
      express:
        specifier: ^5.1.0
        version: 5.2.1
      multer:
        specifier: ^2.0.2
        version: 2.1.1
      pino:
        specifier: ^10.1.0
        version: 10.3.1
      pino-http:
        specifier: ^11.0.0
        version: 11.0.0
      zod:
        specifier: ^4.1.12
        version: 4.4.3
    devDependencies:
      "@types/better-sqlite3":
        specifier: ^7.6.13
        version: 7.6.13
      "@types/cors":
        specifier: ^2.8.19
        version: 2.8.19
      "@types/express":
        specifier: ^5.0.5
        version: 5.0.6
      "@types/multer":
        specifier: ^2.0.0
        version: 2.1.0
      "@types/node":
        specifier: ^22.18.10
        version: 22.19.17
      tsx:
        specifier: ^4.20.6
        version: 4.21.0
      typescript:
        specifier: ^5.9.3
        version: 5.9.3

  apps/desktop:
    dependencies:
      "@inumaki/shared":
        specifier: workspace:*
        version: link:../../packages/shared
      "@radix-ui/react-dialog":
        specifier: ^1.1.15
        version: 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)
      clsx:
        specifier: ^2.1.1
        version: 2.1.1
      dotenv:
        specifier: ^17.2.3
        version: 17.4.2
      lucide-react:
        specifier: ^0.552.0
        version: 0.552.0(react@19.2.5)
      react:
        specifier: ^19.2.0
        version: 19.2.5
      react-dom:
        specifier: ^19.2.0
        version: 19.2.5(react@19.2.5)
      tailwind-merge:
        specifier: ^3.4.0
        version: 3.5.0
    devDependencies:
      "@types/node":
        specifier: ^22.18.10
        version: 22.19.17
      "@types/react":
        specifier: ^19.2.2
        version: 19.2.14
      "@types/react-dom":
        specifier: ^19.2.2
        version: 19.2.3(@types/react@19.2.14)
      "@vitejs/plugin-react":
        specifier: ^5.1.0
        version: 5.2.0(vite@7.3.2(@types/node@22.19.17)(jiti@1.21.7)(tsx@4.21.0))
      autoprefixer:
        specifier: ^10.4.21
        version: 10.5.0(postcss@8.5.13)
      electron:
        specifier: ^39.0.0
        version: 39.8.9
      electron-builder:
        specifier: ^26.0.12
        version: 26.8.1(electron-builder-squirrel-windows@26.8.1)
      electron-vite:
        specifier: ^4.0.1
        version: 4.0.1(vite@7.3.2(@types/node@22.19.17)(jiti@1.21.7)(tsx@4.21.0))
      postcss:
        specifier: ^8.5.6
        version: 8.5.13
      tailwindcss:
        specifier: ^3.4.18
        version: 3.4.19(tsx@4.21.0)
      typescript:
        specifier: ^5.9.3
        version: 5.9.3
      vite:
        specifier: ^7.1.12
        version: 7.3.2(@types/node@22.19.17)(jiti@1.21.7)(tsx@4.21.0)

  packages/shared:
    devDependencies:
      "@types/node":
        specifier: ^22.18.10
        version: 22.19.17
      tsx:
        specifier: ^4.20.6
        version: 4.21.0
      typescript:
        specifier: ^5.9.3
        version: 5.9.3

packages:
  7zip-bin@5.2.0:
    resolution:
      {
        integrity: sha512-ukTPVhqG4jNzMro2qA9HSCSSVJN3aN7tlb+hfqYCt3ER0yWroeA2VR38MNrOHLQ/cVj+DaIMad0kFCtWWowh/A==,
      }

  "@alloc/quick-lru@5.2.0":
    resolution:
      {
        integrity: sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==,
      }
    engines: { node: ">=10" }

  "@babel/code-frame@7.29.0":
    resolution:
      {
        integrity: sha512-9NhCeYjq9+3uxgdtp20LSiJXJvN0FeCtNGpJxuMFZ1Kv3cWUNb6DOhJwUvcVCzKGR66cw4njwM6hrJLqgOwbcw==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/compat-data@7.29.3":
    resolution:
      {
        integrity: sha512-LIVqM46zQWZhj17qA8wb4nW/ixr2y1Nw+r1etiAWgRM6U1IqP+LNhL1yg440jYZR72jCWcWbLWzIosH+uP1fqg==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/core@7.29.0":
    resolution:
      {
        integrity: sha512-CGOfOJqWjg2qW/Mb6zNsDm+u5vFQ8DxXfbM09z69p5Z6+mE1ikP2jUXw+j42Pf1XTYED2Rni5f95npYeuwMDQA==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/generator@7.29.1":
    resolution:
      {
        integrity: sha512-qsaF+9Qcm2Qv8SRIMMscAvG4O3lJ0F1GuMo5HR/Bp02LopNgnZBC/EkbevHFeGs4ls/oPz9v+Bsmzbkbe+0dUw==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/helper-compilation-targets@7.28.6":
    resolution:
      {
        integrity: sha512-JYtls3hqi15fcx5GaSNL7SCTJ2MNmjrkHXg4FSpOA/grxK8KwyZ5bubHsCq8FXCkua6xhuaaBit+3b7+VZRfcA==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/helper-globals@7.28.0":
    resolution:
      {
        integrity: sha512-+W6cISkXFa1jXsDEdYA8HeevQT/FULhxzR99pxphltZcVaugps53THCeiWA8SguxxpSp3gKPiuYfSWopkLQ4hw==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/helper-module-imports@7.28.6":
    resolution:
      {
        integrity: sha512-l5XkZK7r7wa9LucGw9LwZyyCUscb4x37JWTPz7swwFE/0FMQAGpiWUZn8u9DzkSBWEcK25jmvubfpw2dnAMdbw==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/helper-module-transforms@7.28.6":
    resolution:
      {
        integrity: sha512-67oXFAYr2cDLDVGLXTEABjdBJZ6drElUSI7WKp70NrpyISso3plG9SAGEF6y7zbha/wOzUByWWTJvEDVNIUGcA==,
      }
    engines: { node: ">=6.9.0" }
    peerDependencies:
      "@babel/core": ^7.0.0

  "@babel/helper-plugin-utils@7.28.6":
    resolution:
      {
        integrity: sha512-S9gzZ/bz83GRysI7gAD4wPT/AI3uCnY+9xn+Mx/KPs2JwHJIz1W8PZkg2cqyt3RNOBM8ejcXhV6y8Og7ly/Dug==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/helper-string-parser@7.27.1":
    resolution:
      {
        integrity: sha512-qMlSxKbpRlAridDExk92nSobyDdpPijUq2DW6oDnUqd0iOGxmQjyqhMIihI9+zv4LPyZdRje2cavWPbCbWm3eA==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/helper-validator-identifier@7.28.5":
    resolution:
      {
        integrity: sha512-qSs4ifwzKJSV39ucNjsvc6WVHs6b7S03sOh2OcHF9UHfVPqWWALUsNUVzhSBiItjRZoLHx7nIarVjqKVusUZ1Q==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/helper-validator-option@7.27.1":
    resolution:
      {
        integrity: sha512-YvjJow9FxbhFFKDSuFnVCe2WxXk1zWc22fFePVNEaWJEu8IrZVlda6N0uHwzZrUM1il7NC9Mlp4MaJYbYd9JSg==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/helpers@7.29.2":
    resolution:
      {
        integrity: sha512-HoGuUs4sCZNezVEKdVcwqmZN8GoHirLUcLaYVNBK2J0DadGtdcqgr3BCbvH8+XUo4NGjNl3VOtSjEKNzqfFgKw==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/parser@7.29.3":
    resolution:
      {
        integrity: sha512-b3ctpQwp+PROvU/cttc4OYl4MzfJUWy6FZg+PMXfzmt/+39iHVF0sDfqay8TQM3JA2EUOyKcFZt75jWriQijsA==,
      }
    engines: { node: ">=6.0.0" }
    hasBin: true

  "@babel/plugin-transform-arrow-functions@7.27.1":
    resolution:
      {
        integrity: sha512-8Z4TGic6xW70FKThA5HYEKKyBpOOsucTOD1DjU3fZxDg+K3zBJcXMFnt/4yQiZnf5+MiOMSXQ9PaEK/Ilh1DeA==,
      }
    engines: { node: ">=6.9.0" }
    peerDependencies:
      "@babel/core": ^7.0.0-0

  "@babel/plugin-transform-react-jsx-self@7.27.1":
    resolution:
      {
        integrity: sha512-6UzkCs+ejGdZ5mFFC/OCUrv028ab2fp1znZmCZjAOBKiBK2jXD1O+BPSfX8X2qjJ75fZBMSnQn3Rq2mrBJK2mw==,
      }
    engines: { node: ">=6.9.0" }
    peerDependencies:
      "@babel/core": ^7.0.0-0

  "@babel/plugin-transform-react-jsx-source@7.27.1":
    resolution:
      {
        integrity: sha512-zbwoTsBruTeKB9hSq73ha66iFeJHuaFkUbwvqElnygoNbj/jHRsSeokowZFN3CZ64IvEqcmmkVe89OPXc7ldAw==,
      }
    engines: { node: ">=6.9.0" }
    peerDependencies:
      "@babel/core": ^7.0.0-0

  "@babel/template@7.28.6":
    resolution:
      {
        integrity: sha512-YA6Ma2KsCdGb+WC6UpBVFJGXL58MDA6oyONbjyF/+5sBgxY/dwkhLogbMT2GXXyU84/IhRw/2D1Os1B/giz+BQ==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/traverse@7.29.0":
    resolution:
      {
        integrity: sha512-4HPiQr0X7+waHfyXPZpWPfWL/J7dcN1mx9gL6WdQVMbPnF3+ZhSMs8tCxN7oHddJE9fhNE7+lxdnlyemKfJRuA==,
      }
    engines: { node: ">=6.9.0" }

  "@babel/types@7.29.0":
    resolution:
      {
        integrity: sha512-LwdZHpScM4Qz8Xw2iKSzS+cfglZzJGvofQICy7W7v4caru4EaAmyUuO6BGrbyQ2mYV11W0U8j5mBhd14dd3B0A==,
      }
    engines: { node: ">=6.9.0" }

  "@develar/schema-utils@2.6.5":
    resolution:
      {
        integrity: sha512-0cp4PsWQ/9avqTVMCtZ+GirikIA36ikvjtHweU4/j8yLtgObI0+JUPhYFScgwlteveGB1rt3Cm8UhN04XayDig==,
      }
    engines: { node: ">= 8.9.0" }

  "@electron/asar@3.4.1":
    resolution:
      {
        integrity: sha512-i4/rNPRS84t0vSRa2HorerGRXWyF4vThfHesw0dmcWHp+cspK743UanA0suA5Q5y8kzY2y6YKrvbIUn69BCAiA==,
      }
    engines: { node: ">=10.12.0" }
    hasBin: true

  "@electron/fuses@1.8.0":
    resolution:
      {
        integrity: sha512-zx0EIq78WlY/lBb1uXlziZmDZI4ubcCXIMJ4uGjXzZW0nS19TjSPeXPAjzzTmKQlJUZm0SbmZhPKP7tuQ1SsEw==,
      }
    hasBin: true

  "@electron/get@2.0.3":
    resolution:
      {
        integrity: sha512-Qkzpg2s9GnVV2I2BjRksUi43U5e6+zaQMcjoJy0C+C5oxaKl+fmckGDQFtRpZpZV0NQekuZZ+tGz7EA9TVnQtQ==,
      }
    engines: { node: ">=12" }

  "@electron/get@3.1.0":
    resolution:
      {
        integrity: sha512-F+nKc0xW+kVbBRhFzaMgPy3KwmuNTYX1fx6+FxxoSnNgwYX6LD7AKBTWkU0MQ6IBoe7dz069CNkR673sPAgkCQ==,
      }
    engines: { node: ">=14" }

  "@electron/notarize@2.5.0":
    resolution:
      {
        integrity: sha512-jNT8nwH1f9X5GEITXaQ8IF/KdskvIkOFfB2CvwumsveVidzpSc+mvhhTMdAGSYF3O+Nq49lJ7y+ssODRXu06+A==,
      }
    engines: { node: ">= 10.0.0" }

  "@electron/osx-sign@1.3.3":
    resolution:
      {
        integrity: sha512-KZ8mhXvWv2rIEgMbWZ4y33bDHyUKMXnx4M0sTyPNK/vcB81ImdeY9Ggdqy0SWbMDgmbqyQ+phgejh6V3R2QuSg==,
      }
    engines: { node: ">=12.0.0" }
    hasBin: true

  "@electron/rebuild@4.0.4":
    resolution:
      {
        integrity: sha512-Rzc39XPdk/+/wBG8MfwAHohXflep0ITUfulb6Rgz3R0NeSB1noE+E9/M/cb8ftCAiyDD9PPhLuuWgE1GaInbKg==,
      }
    engines: { node: ">=22.12.0" }
    hasBin: true

  "@electron/universal@2.0.3":
    resolution:
      {
        integrity: sha512-Wn9sPYIVFRFl5HmwMJkARCCf7rqK/EurkfQ/rJZ14mHP3iYTjZSIOSVonEAnhWeAXwtw7zOekGRlc6yTtZ0t+g==,
      }
    engines: { node: ">=16.4" }

  "@electron/windows-sign@1.2.2":
    resolution:
      {
        integrity: sha512-dfZeox66AvdPtb2lD8OsIIQh12Tp0GNCRUDfBHIKGpbmopZto2/A8nSpYYLoedPIHpqkeblZ/k8OV0Gy7PYuyQ==,
      }
    engines: { node: ">=14.14" }
    hasBin: true

  "@esbuild/aix-ppc64@0.25.12":
    resolution:
      {
        integrity: sha512-Hhmwd6CInZ3dwpuGTF8fJG6yoWmsToE+vYgD4nytZVxcu1ulHpUQRAB1UJ8+N1Am3Mz4+xOByoQoSZf4D+CpkA==,
      }
    engines: { node: ">=18" }
    cpu: [ppc64]
    os: [aix]

  "@esbuild/aix-ppc64@0.27.7":
    resolution:
      {
        integrity: sha512-EKX3Qwmhz1eMdEJokhALr0YiD0lhQNwDqkPYyPhiSwKrh7/4KRjQc04sZ8db+5DVVnZ1LmbNDI1uAMPEUBnQPg==,
      }
    engines: { node: ">=18" }
    cpu: [ppc64]
    os: [aix]

  "@esbuild/android-arm64@0.25.12":
    resolution:
      {
        integrity: sha512-6AAmLG7zwD1Z159jCKPvAxZd4y/VTO0VkprYy+3N2FtJ8+BQWFXU+OxARIwA46c5tdD9SsKGZ/1ocqBS/gAKHg==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [android]

  "@esbuild/android-arm64@0.27.7":
    resolution:
      {
        integrity: sha512-62dPZHpIXzvChfvfLJow3q5dDtiNMkwiRzPylSCfriLvZeq0a1bWChrGx/BbUbPwOrsWKMn8idSllklzBy+dgQ==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [android]

  "@esbuild/android-arm@0.25.12":
    resolution:
      {
        integrity: sha512-VJ+sKvNA/GE7Ccacc9Cha7bpS8nyzVv0jdVgwNDaR4gDMC/2TTRc33Ip8qrNYUcpkOHUT5OZ0bUcNNVZQ9RLlg==,
      }
    engines: { node: ">=18" }
    cpu: [arm]
    os: [android]

  "@esbuild/android-arm@0.27.7":
    resolution:
      {
        integrity: sha512-jbPXvB4Yj2yBV7HUfE2KHe4GJX51QplCN1pGbYjvsyCZbQmies29EoJbkEc+vYuU5o45AfQn37vZlyXy4YJ8RQ==,
      }
    engines: { node: ">=18" }
    cpu: [arm]
    os: [android]

  "@esbuild/android-x64@0.25.12":
    resolution:
      {
        integrity: sha512-5jbb+2hhDHx5phYR2By8GTWEzn6I9UqR11Kwf22iKbNpYrsmRB18aX/9ivc5cabcUiAT/wM+YIZ6SG9QO6a8kg==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [android]

  "@esbuild/android-x64@0.27.7":
    resolution:
      {
        integrity: sha512-x5VpMODneVDb70PYV2VQOmIUUiBtY3D3mPBG8NxVk5CogneYhkR7MmM3yR/uMdITLrC1ml/NV1rj4bMJuy9MCg==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [android]

  "@esbuild/darwin-arm64@0.25.12":
    resolution:
      {
        integrity: sha512-N3zl+lxHCifgIlcMUP5016ESkeQjLj/959RxxNYIthIg+CQHInujFuXeWbWMgnTo4cp5XVHqFPmpyu9J65C1Yg==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [darwin]

  "@esbuild/darwin-arm64@0.27.7":
    resolution:
      {
        integrity: sha512-5lckdqeuBPlKUwvoCXIgI2D9/ABmPq3Rdp7IfL70393YgaASt7tbju3Ac+ePVi3KDH6N2RqePfHnXkaDtY9fkw==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [darwin]

  "@esbuild/darwin-x64@0.25.12":
    resolution:
      {
        integrity: sha512-HQ9ka4Kx21qHXwtlTUVbKJOAnmG1ipXhdWTmNXiPzPfWKpXqASVcWdnf2bnL73wgjNrFXAa3yYvBSd9pzfEIpA==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [darwin]

  "@esbuild/darwin-x64@0.27.7":
    resolution:
      {
        integrity: sha512-rYnXrKcXuT7Z+WL5K980jVFdvVKhCHhUwid+dDYQpH+qu+TefcomiMAJpIiC2EM3Rjtq0sO3StMV/+3w3MyyqQ==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [darwin]

  "@esbuild/freebsd-arm64@0.25.12":
    resolution:
      {
        integrity: sha512-gA0Bx759+7Jve03K1S0vkOu5Lg/85dou3EseOGUes8flVOGxbhDDh/iZaoek11Y8mtyKPGF3vP8XhnkDEAmzeg==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [freebsd]

  "@esbuild/freebsd-arm64@0.27.7":
    resolution:
      {
        integrity: sha512-B48PqeCsEgOtzME2GbNM2roU29AMTuOIN91dsMO30t+Ydis3z/3Ngoj5hhnsOSSwNzS+6JppqWsuhTp6E82l2w==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [freebsd]

  "@esbuild/freebsd-x64@0.25.12":
    resolution:
      {
        integrity: sha512-TGbO26Yw2xsHzxtbVFGEXBFH0FRAP7gtcPE7P5yP7wGy7cXK2oO7RyOhL5NLiqTlBh47XhmIUXuGciXEqYFfBQ==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [freebsd]

  "@esbuild/freebsd-x64@0.27.7":
    resolution:
      {
        integrity: sha512-jOBDK5XEjA4m5IJK3bpAQF9/Lelu/Z9ZcdhTRLf4cajlB+8VEhFFRjWgfy3M1O4rO2GQ/b2dLwCUGpiF/eATNQ==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [freebsd]

  "@esbuild/linux-arm64@0.25.12":
    resolution:
      {
        integrity: sha512-8bwX7a8FghIgrupcxb4aUmYDLp8pX06rGh5HqDT7bB+8Rdells6mHvrFHHW2JAOPZUbnjUpKTLg6ECyzvas2AQ==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [linux]

  "@esbuild/linux-arm64@0.27.7":
    resolution:
      {
        integrity: sha512-RZPHBoxXuNnPQO9rvjh5jdkRmVizktkT7TCDkDmQ0W2SwHInKCAV95GRuvdSvA7w4VMwfCjUiPwDi0ZO6Nfe9A==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [linux]

  "@esbuild/linux-arm@0.25.12":
    resolution:
      {
        integrity: sha512-lPDGyC1JPDou8kGcywY0YILzWlhhnRjdof3UlcoqYmS9El818LLfJJc3PXXgZHrHCAKs/Z2SeZtDJr5MrkxtOw==,
      }
    engines: { node: ">=18" }
    cpu: [arm]
    os: [linux]

  "@esbuild/linux-arm@0.27.7":
    resolution:
      {
        integrity: sha512-RkT/YXYBTSULo3+af8Ib0ykH8u2MBh57o7q/DAs3lTJlyVQkgQvlrPTnjIzzRPQyavxtPtfg0EopvDyIt0j1rA==,
      }
    engines: { node: ">=18" }
    cpu: [arm]
    os: [linux]

  "@esbuild/linux-ia32@0.25.12":
    resolution:
      {
        integrity: sha512-0y9KrdVnbMM2/vG8KfU0byhUN+EFCny9+8g202gYqSSVMonbsCfLjUO+rCci7pM0WBEtz+oK/PIwHkzxkyharA==,
      }
    engines: { node: ">=18" }
    cpu: [ia32]
    os: [linux]

  "@esbuild/linux-ia32@0.27.7":
    resolution:
      {
        integrity: sha512-GA48aKNkyQDbd3KtkplYWT102C5sn/EZTY4XROkxONgruHPU72l+gW+FfF8tf2cFjeHaRbWpOYa/uRBz/Xq1Pg==,
      }
    engines: { node: ">=18" }
    cpu: [ia32]
    os: [linux]

  "@esbuild/linux-loong64@0.25.12":
    resolution:
      {
        integrity: sha512-h///Lr5a9rib/v1GGqXVGzjL4TMvVTv+s1DPoxQdz7l/AYv6LDSxdIwzxkrPW438oUXiDtwM10o9PmwS/6Z0Ng==,
      }
    engines: { node: ">=18" }
    cpu: [loong64]
    os: [linux]

  "@esbuild/linux-loong64@0.27.7":
    resolution:
      {
        integrity: sha512-a4POruNM2oWsD4WKvBSEKGIiWQF8fZOAsycHOt6JBpZ+JN2n2JH9WAv56SOyu9X5IqAjqSIPTaJkqN8F7XOQ5Q==,
      }
    engines: { node: ">=18" }
    cpu: [loong64]
    os: [linux]

  "@esbuild/linux-mips64el@0.25.12":
    resolution:
      {
        integrity: sha512-iyRrM1Pzy9GFMDLsXn1iHUm18nhKnNMWscjmp4+hpafcZjrr2WbT//d20xaGljXDBYHqRcl8HnxbX6uaA/eGVw==,
      }
    engines: { node: ">=18" }
    cpu: [mips64el]
    os: [linux]

  "@esbuild/linux-mips64el@0.27.7":
    resolution:
      {
        integrity: sha512-KabT5I6StirGfIz0FMgl1I+R1H73Gp0ofL9A3nG3i/cYFJzKHhouBV5VWK1CSgKvVaG4q1RNpCTR2LuTVB3fIw==,
      }
    engines: { node: ">=18" }
    cpu: [mips64el]
    os: [linux]

  "@esbuild/linux-ppc64@0.25.12":
    resolution:
      {
        integrity: sha512-9meM/lRXxMi5PSUqEXRCtVjEZBGwB7P/D4yT8UG/mwIdze2aV4Vo6U5gD3+RsoHXKkHCfSxZKzmDssVlRj1QQA==,
      }
    engines: { node: ">=18" }
    cpu: [ppc64]
    os: [linux]

  "@esbuild/linux-ppc64@0.27.7":
    resolution:
      {
        integrity: sha512-gRsL4x6wsGHGRqhtI+ifpN/vpOFTQtnbsupUF5R5YTAg+y/lKelYR1hXbnBdzDjGbMYjVJLJTd2OFmMewAgwlQ==,
      }
    engines: { node: ">=18" }
    cpu: [ppc64]
    os: [linux]

  "@esbuild/linux-riscv64@0.25.12":
    resolution:
      {
        integrity: sha512-Zr7KR4hgKUpWAwb1f3o5ygT04MzqVrGEGXGLnj15YQDJErYu/BGg+wmFlIDOdJp0PmB0lLvxFIOXZgFRrdjR0w==,
      }
    engines: { node: ">=18" }
    cpu: [riscv64]
    os: [linux]

  "@esbuild/linux-riscv64@0.27.7":
    resolution:
      {
        integrity: sha512-hL25LbxO1QOngGzu2U5xeXtxXcW+/GvMN3ejANqXkxZ/opySAZMrc+9LY/WyjAan41unrR3YrmtTsUpwT66InQ==,
      }
    engines: { node: ">=18" }
    cpu: [riscv64]
    os: [linux]

  "@esbuild/linux-s390x@0.25.12":
    resolution:
      {
        integrity: sha512-MsKncOcgTNvdtiISc/jZs/Zf8d0cl/t3gYWX8J9ubBnVOwlk65UIEEvgBORTiljloIWnBzLs4qhzPkJcitIzIg==,
      }
    engines: { node: ">=18" }
    cpu: [s390x]
    os: [linux]

  "@esbuild/linux-s390x@0.27.7":
    resolution:
      {
        integrity: sha512-2k8go8Ycu1Kb46vEelhu1vqEP+UeRVj2zY1pSuPdgvbd5ykAw82Lrro28vXUrRmzEsUV0NzCf54yARIK8r0fdw==,
      }
    engines: { node: ">=18" }
    cpu: [s390x]
    os: [linux]

  "@esbuild/linux-x64@0.25.12":
    resolution:
      {
        integrity: sha512-uqZMTLr/zR/ed4jIGnwSLkaHmPjOjJvnm6TVVitAa08SLS9Z0VM8wIRx7gWbJB5/J54YuIMInDquWyYvQLZkgw==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [linux]

  "@esbuild/linux-x64@0.27.7":
    resolution:
      {
        integrity: sha512-hzznmADPt+OmsYzw1EE33ccA+HPdIqiCRq7cQeL1Jlq2gb1+OyWBkMCrYGBJ+sxVzve2ZJEVeePbLM2iEIZSxA==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [linux]

  "@esbuild/netbsd-arm64@0.25.12":
    resolution:
      {
        integrity: sha512-xXwcTq4GhRM7J9A8Gv5boanHhRa/Q9KLVmcyXHCTaM4wKfIpWkdXiMog/KsnxzJ0A1+nD+zoecuzqPmCRyBGjg==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [netbsd]

  "@esbuild/netbsd-arm64@0.27.7":
    resolution:
      {
        integrity: sha512-b6pqtrQdigZBwZxAn1UpazEisvwaIDvdbMbmrly7cDTMFnw/+3lVxxCTGOrkPVnsYIosJJXAsILG9XcQS+Yu6w==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [netbsd]

  "@esbuild/netbsd-x64@0.25.12":
    resolution:
      {
        integrity: sha512-Ld5pTlzPy3YwGec4OuHh1aCVCRvOXdH8DgRjfDy/oumVovmuSzWfnSJg+VtakB9Cm0gxNO9BzWkj6mtO1FMXkQ==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [netbsd]

  "@esbuild/netbsd-x64@0.27.7":
    resolution:
      {
        integrity: sha512-OfatkLojr6U+WN5EDYuoQhtM+1xco+/6FSzJJnuWiUw5eVcicbyK3dq5EeV/QHT1uy6GoDhGbFpprUiHUYggrw==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [netbsd]

  "@esbuild/openbsd-arm64@0.25.12":
    resolution:
      {
        integrity: sha512-fF96T6KsBo/pkQI950FARU9apGNTSlZGsv1jZBAlcLL1MLjLNIWPBkj5NlSz8aAzYKg+eNqknrUJ24QBybeR5A==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [openbsd]

  "@esbuild/openbsd-arm64@0.27.7":
    resolution:
      {
        integrity: sha512-AFuojMQTxAz75Fo8idVcqoQWEHIXFRbOc1TrVcFSgCZtQfSdc1RXgB3tjOn/krRHENUB4j00bfGjyl2mJrU37A==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [openbsd]

  "@esbuild/openbsd-x64@0.25.12":
    resolution:
      {
        integrity: sha512-MZyXUkZHjQxUvzK7rN8DJ3SRmrVrke8ZyRusHlP+kuwqTcfWLyqMOE3sScPPyeIXN/mDJIfGXvcMqCgYKekoQw==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [openbsd]

  "@esbuild/openbsd-x64@0.27.7":
    resolution:
      {
        integrity: sha512-+A1NJmfM8WNDv5CLVQYJ5PshuRm/4cI6WMZRg1by1GwPIQPCTs1GLEUHwiiQGT5zDdyLiRM/l1G0Pv54gvtKIg==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [openbsd]

  "@esbuild/openharmony-arm64@0.25.12":
    resolution:
      {
        integrity: sha512-rm0YWsqUSRrjncSXGA7Zv78Nbnw4XL6/dzr20cyrQf7ZmRcsovpcRBdhD43Nuk3y7XIoW2OxMVvwuRvk9XdASg==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [openharmony]

  "@esbuild/openharmony-arm64@0.27.7":
    resolution:
      {
        integrity: sha512-+KrvYb/C8zA9CU/g0sR6w2RBw7IGc5J2BPnc3dYc5VJxHCSF1yNMxTV5LQ7GuKteQXZtspjFbiuW5/dOj7H4Yw==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [openharmony]

  "@esbuild/sunos-x64@0.25.12":
    resolution:
      {
        integrity: sha512-3wGSCDyuTHQUzt0nV7bocDy72r2lI33QL3gkDNGkod22EsYl04sMf0qLb8luNKTOmgF/eDEDP5BFNwoBKH441w==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [sunos]

  "@esbuild/sunos-x64@0.27.7":
    resolution:
      {
        integrity: sha512-ikktIhFBzQNt/QDyOL580ti9+5mL/YZeUPKU2ivGtGjdTYoqz6jObj6nOMfhASpS4GU4Q/Clh1QtxWAvcYKamA==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [sunos]

  "@esbuild/win32-arm64@0.25.12":
    resolution:
      {
        integrity: sha512-rMmLrur64A7+DKlnSuwqUdRKyd3UE7oPJZmnljqEptesKM8wx9J8gx5u0+9Pq0fQQW8vqeKebwNXdfOyP+8Bsg==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [win32]

  "@esbuild/win32-arm64@0.27.7":
    resolution:
      {
        integrity: sha512-7yRhbHvPqSpRUV7Q20VuDwbjW5kIMwTHpptuUzV+AA46kiPze5Z7qgt6CLCK3pWFrHeNfDd1VKgyP4O+ng17CA==,
      }
    engines: { node: ">=18" }
    cpu: [arm64]
    os: [win32]

  "@esbuild/win32-ia32@0.25.12":
    resolution:
      {
        integrity: sha512-HkqnmmBoCbCwxUKKNPBixiWDGCpQGVsrQfJoVGYLPT41XWF8lHuE5N6WhVia2n4o5QK5M4tYr21827fNhi4byQ==,
      }
    engines: { node: ">=18" }
    cpu: [ia32]
    os: [win32]

  "@esbuild/win32-ia32@0.27.7":
    resolution:
      {
        integrity: sha512-SmwKXe6VHIyZYbBLJrhOoCJRB/Z1tckzmgTLfFYOfpMAx63BJEaL9ExI8x7v0oAO3Zh6D/Oi1gVxEYr5oUCFhw==,
      }
    engines: { node: ">=18" }
    cpu: [ia32]
    os: [win32]

  "@esbuild/win32-x64@0.25.12":
    resolution:
      {
        integrity: sha512-alJC0uCZpTFrSL0CCDjcgleBXPnCrEAhTBILpeAp7M/OFgoqtAetfBzX0xM00MUsVVPpVjlPuMbREqnZCXaTnA==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [win32]

  "@esbuild/win32-x64@0.27.7":
    resolution:
      {
        integrity: sha512-56hiAJPhwQ1R4i+21FVF7V8kSD5zZTdHcVuRFMW0hn753vVfQN8xlx4uOPT4xoGH0Z/oVATuR82AiqSTDIpaHg==,
      }
    engines: { node: ">=18" }
    cpu: [x64]
    os: [win32]

  "@eslint-community/eslint-utils@4.9.1":
    resolution:
      {
        integrity: sha512-phrYmNiYppR7znFEdqgfWHXR6NCkZEK7hwWDHZUjit/2/U0r6XvkDl0SYnoM51Hq7FhCGdLDT6zxCCOY1hexsQ==,
      }
    engines: { node: ^12.22.0 || ^14.17.0 || >=16.0.0 }
    peerDependencies:
      eslint: ^6.0.0 || ^7.0.0 || >=8.0.0

  "@eslint-community/regexpp@4.12.2":
    resolution:
      {
        integrity: sha512-EriSTlt5OC9/7SXkRSCAhfSxxoSUgBm33OH+IkwbdpgoqsSsUg7y3uh+IICI/Qg4BBWr3U2i39RpmycbxMq4ew==,
      }
    engines: { node: ^12.0.0 || ^14.0.0 || >=16.0.0 }

  "@eslint/config-array@0.21.2":
    resolution:
      {
        integrity: sha512-nJl2KGTlrf9GjLimgIru+V/mzgSK0ABCDQRvxw5BjURL7WfH5uoWmizbH7QB6MmnMBd8cIC9uceWnezL1VZWWw==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@eslint/config-helpers@0.4.2":
    resolution:
      {
        integrity: sha512-gBrxN88gOIf3R7ja5K9slwNayVcZgK6SOUORm2uBzTeIEfeVaIhOpCtTox3P6R7o2jLFwLFTLnC7kU/RGcYEgw==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@eslint/core@0.17.0":
    resolution:
      {
        integrity: sha512-yL/sLrpmtDaFEiUj1osRP4TI2MDz1AddJL+jZ7KSqvBuliN4xqYY54IfdN8qD8Toa6g1iloph1fxQNkjOxrrpQ==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@eslint/eslintrc@3.3.5":
    resolution:
      {
        integrity: sha512-4IlJx0X0qftVsN5E+/vGujTRIFtwuLbNsVUe7TO6zYPDR1O6nFwvwhIKEKSrl6dZchmYBITazxKoUYOjdtjlRg==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@eslint/js@9.39.4":
    resolution:
      {
        integrity: sha512-nE7DEIchvtiFTwBw4Lfbu59PG+kCofhjsKaCWzxTpt4lfRjRMqG6uMBzKXuEcyXhOHoUp9riAm7/aWYGhXZ9cw==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@eslint/object-schema@2.1.7":
    resolution:
      {
        integrity: sha512-VtAOaymWVfZcmZbp6E2mympDIHvyjXs/12LqWYjVw6qjrfF+VK+fyG33kChz3nnK+SU5/NeHOqrTEHS8sXO3OA==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@eslint/plugin-kit@0.4.1":
    resolution:
      {
        integrity: sha512-43/qtrDUokr7LJqoF2c3+RInu/t4zfrpYdoSDfYyhg52rwLV6TnOvdG4fXm7IkSB3wErkcmJS9iEhjVtOSEjjA==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@humanfs/core@0.19.2":
    resolution:
      {
        integrity: sha512-UhXNm+CFMWcbChXywFwkmhqjs3PRCmcSa/hfBgLIb7oQ5HNb1wS0icWsGtSAUNgefHeI+eBrA8I1fxmbHsGdvA==,
      }
    engines: { node: ">=18.18.0" }

  "@humanfs/node@0.16.8":
    resolution:
      {
        integrity: sha512-gE1eQNZ3R++kTzFUpdGlpmy8kDZD/MLyHqDwqjkVQI0JMdI1D51sy1H958PNXYkM2rAac7e5/CnIKZrHtPh3BQ==,
      }
    engines: { node: ">=18.18.0" }

  "@humanfs/types@0.15.0":
    resolution:
      {
        integrity: sha512-ZZ1w0aoQkwuUuC7Yf+7sdeaNfqQiiLcSRbfI08oAxqLtpXQr9AIVX7Ay7HLDuiLYAaFPu8oBYNq/QIi9URHJ3Q==,
      }
    engines: { node: ">=18.18.0" }

  "@humanwhocodes/module-importer@1.0.1":
    resolution:
      {
        integrity: sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==,
      }
    engines: { node: ">=12.22" }

  "@humanwhocodes/retry@0.4.3":
    resolution:
      {
        integrity: sha512-bV0Tgo9K4hfPCek+aMAn81RppFKv2ySDQeMoSZuvTASywNTnVJCArCZE2FWqpvIatKu7VMRLWlR1EazvVhDyhQ==,
      }
    engines: { node: ">=18.18" }

  "@isaacs/fs-minipass@4.0.1":
    resolution:
      {
        integrity: sha512-wgm9Ehl2jpeqP3zw/7mo3kRHFp5MEDhqAdwy1fTGkHAwnkGOVsgpvQhL8B5n1qlb01jV3n/bI0ZfZp5lWA1k4w==,
      }
    engines: { node: ">=18.0.0" }

  "@jridgewell/gen-mapping@0.3.13":
    resolution:
      {
        integrity: sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==,
      }

  "@jridgewell/remapping@2.3.5":
    resolution:
      {
        integrity: sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==,
      }

  "@jridgewell/resolve-uri@3.1.2":
    resolution:
      {
        integrity: sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==,
      }
    engines: { node: ">=6.0.0" }

  "@jridgewell/sourcemap-codec@1.5.5":
    resolution:
      {
        integrity: sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==,
      }

  "@jridgewell/trace-mapping@0.3.31":
    resolution:
      {
        integrity: sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==,
      }

  "@malept/cross-spawn-promise@2.0.0":
    resolution:
      {
        integrity: sha512-1DpKU0Z5ThltBwjNySMC14g0CkbyhCaz9FkhxqNsZI6uAPJXFS8cMXlBKo26FJ8ZuW6S9GCMcR9IO5k2X5/9Fg==,
      }
    engines: { node: ">= 12.13.0" }

  "@malept/flatpak-bundler@0.4.0":
    resolution:
      {
        integrity: sha512-9QOtNffcOF/c1seMCDnjckb3R9WHcG34tky+FHpNKKCW0wc/scYLwMtO+ptyGUfMW0/b/n4qRiALlaFHc9Oj7Q==,
      }
    engines: { node: ">= 10.0.0" }

  "@nodelib/fs.scandir@2.1.5":
    resolution:
      {
        integrity: sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==,
      }
    engines: { node: ">= 8" }

  "@nodelib/fs.stat@2.0.5":
    resolution:
      {
        integrity: sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==,
      }
    engines: { node: ">= 8" }

  "@nodelib/fs.walk@1.2.8":
    resolution:
      {
        integrity: sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==,
      }
    engines: { node: ">= 8" }

  "@pinojs/redact@0.4.0":
    resolution:
      {
        integrity: sha512-k2ENnmBugE/rzQfEcdWHcCY+/FM3VLzH9cYEsbdsoqrvzAKRhUZeRNhAZvB8OitQJ1TBed3yqWtdjzS6wJKBwg==,
      }

  "@radix-ui/primitive@1.1.3":
    resolution:
      {
        integrity: sha512-JTF99U/6XIjCBo0wqkU5sK10glYe27MRRsfwoiq5zzOEZLHU3A3KCMa5X/azekYRCJ0HlwI0crAXS/5dEHTzDg==,
      }

  "@radix-ui/react-compose-refs@1.1.2":
    resolution:
      {
        integrity: sha512-z4eqJvfiNnFMHIIvXP3CY57y2WJs5g2v3X0zm9mEJkrkNv4rDxu+sg9Jh8EkXyeqBkB7SOcboo9dMVqhyrACIg==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@radix-ui/react-context@1.1.2":
    resolution:
      {
        integrity: sha512-jCi/QKUM2r1Ju5a3J64TH2A5SpKAgh0LpknyqdQ4m6DCV0xJ2HG1xARRwNGPQfi1SLdLWZ1OJz6F4OMBBNiGJA==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@radix-ui/react-dialog@1.1.15":
    resolution:
      {
        integrity: sha512-TCglVRtzlffRNxRMEyR36DGBLJpeusFcgMVD9PZEzAKnUs1lKCgX5u9BmC2Yg+LL9MgZDugFFs1Vl+Jp4t/PGw==,
      }
    peerDependencies:
      "@types/react": "*"
      "@types/react-dom": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true
      "@types/react-dom":
        optional: true

  "@radix-ui/react-dismissable-layer@1.1.11":
    resolution:
      {
        integrity: sha512-Nqcp+t5cTB8BinFkZgXiMJniQH0PsUt2k51FUhbdfeKvc4ACcG2uQniY/8+h1Yv6Kza4Q7lD7PQV0z0oicE0Mg==,
      }
    peerDependencies:
      "@types/react": "*"
      "@types/react-dom": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true
      "@types/react-dom":
        optional: true

  "@radix-ui/react-focus-guards@1.1.3":
    resolution:
      {
        integrity: sha512-0rFg/Rj2Q62NCm62jZw0QX7a3sz6QCQU0LpZdNrJX8byRGaGVTqbrW9jAoIAHyMQqsNpeZ81YgSizOt5WXq0Pw==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@radix-ui/react-focus-scope@1.1.7":
    resolution:
      {
        integrity: sha512-t2ODlkXBQyn7jkl6TNaw/MtVEVvIGelJDCG41Okq/KwUsJBwQ4XVZsHAVUkK4mBv3ewiAS3PGuUWuY2BoK4ZUw==,
      }
    peerDependencies:
      "@types/react": "*"
      "@types/react-dom": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true
      "@types/react-dom":
        optional: true

  "@radix-ui/react-id@1.1.1":
    resolution:
      {
        integrity: sha512-kGkGegYIdQsOb4XjsfM97rXsiHaBwco+hFI66oO4s9LU+PLAC5oJ7khdOVFxkhsmlbpUqDAvXw11CluXP+jkHg==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@radix-ui/react-portal@1.1.9":
    resolution:
      {
        integrity: sha512-bpIxvq03if6UNwXZ+HTK71JLh4APvnXntDc6XOX8UVq4XQOVl7lwok0AvIl+b8zgCw3fSaVTZMpAPPagXbKmHQ==,
      }
    peerDependencies:
      "@types/react": "*"
      "@types/react-dom": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true
      "@types/react-dom":
        optional: true

  "@radix-ui/react-presence@1.1.5":
    resolution:
      {
        integrity: sha512-/jfEwNDdQVBCNvjkGit4h6pMOzq8bHkopq458dPt2lMjx+eBQUohZNG9A7DtO/O5ukSbxuaNGXMjHicgwy6rQQ==,
      }
    peerDependencies:
      "@types/react": "*"
      "@types/react-dom": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true
      "@types/react-dom":
        optional: true

  "@radix-ui/react-primitive@2.1.3":
    resolution:
      {
        integrity: sha512-m9gTwRkhy2lvCPe6QJp4d3G1TYEUHn/FzJUtq9MjH46an1wJU+GdoGC5VLof8RX8Ft/DlpshApkhswDLZzHIcQ==,
      }
    peerDependencies:
      "@types/react": "*"
      "@types/react-dom": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true
      "@types/react-dom":
        optional: true

  "@radix-ui/react-slot@1.2.3":
    resolution:
      {
        integrity: sha512-aeNmHnBxbi2St0au6VBVC7JXFlhLlOnvIIlePNniyUNAClzmtAUEY8/pBiK3iHjufOlwA+c20/8jngo7xcrg8A==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@radix-ui/react-use-callback-ref@1.1.1":
    resolution:
      {
        integrity: sha512-FkBMwD+qbGQeMu1cOHnuGB6x4yzPjho8ap5WtbEJ26umhgqVXbhekKUQO+hZEL1vU92a3wHwdp0HAcqAUF5iDg==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@radix-ui/react-use-controllable-state@1.2.2":
    resolution:
      {
        integrity: sha512-BjasUjixPFdS+NKkypcyyN5Pmg83Olst0+c6vGov0diwTEo6mgdqVR6hxcEgFuh4QrAs7Rc+9KuGJ9TVCj0Zzg==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@radix-ui/react-use-effect-event@0.0.2":
    resolution:
      {
        integrity: sha512-Qp8WbZOBe+blgpuUT+lw2xheLP8q0oatc9UpmiemEICxGvFLYmHm9QowVZGHtJlGbS6A6yJ3iViad/2cVjnOiA==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@radix-ui/react-use-escape-keydown@1.1.1":
    resolution:
      {
        integrity: sha512-Il0+boE7w/XebUHyBjroE+DbByORGR9KKmITzbR7MyQ4akpORYP/ZmbhAr0DG7RmmBqoOnZdy2QlvajJ2QA59g==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@radix-ui/react-use-layout-effect@1.1.1":
    resolution:
      {
        integrity: sha512-RbJRS4UWQFkzHTTwVymMTUv8EqYhOp8dOOviLj2ugtTiXRaRQS7GLGxZTLL1jWhMeoSCf5zmcZkqTl9IiYfXcQ==,
      }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  "@rolldown/pluginutils@1.0.0-rc.3":
    resolution:
      {
        integrity: sha512-eybk3TjzzzV97Dlj5c+XrBFW57eTNhzod66y9HrBlzJ6NsCrWCp/2kaPS3K9wJmurBC0Tdw4yPjXKZqlznim3Q==,
      }

  "@rollup/rollup-android-arm-eabi@4.60.2":
    resolution:
      {
        integrity: sha512-dnlp69efPPg6Uaw2dVqzWRfAWRnYVb1XJ8CyyhIbZeaq4CA5/mLeZ1IEt9QqQxmbdvagjLIm2ZL8BxXv5lH4Yw==,
      }
    cpu: [arm]
    os: [android]

  "@rollup/rollup-android-arm64@4.60.2":
    resolution:
      {
        integrity: sha512-OqZTwDRDchGRHHm/hwLOL7uVPB9aUvI0am/eQuWMNyFHf5PSEQmyEeYYheA0EPPKUO/l0uigCp+iaTjoLjVoHg==,
      }
    cpu: [arm64]
    os: [android]

  "@rollup/rollup-darwin-arm64@4.60.2":
    resolution:
      {
        integrity: sha512-UwRE7CGpvSVEQS8gUMBe1uADWjNnVgP3Iusyda1nSRwNDCsRjnGc7w6El6WLQsXmZTbLZx9cecegumcitNfpmA==,
      }
    cpu: [arm64]
    os: [darwin]

  "@rollup/rollup-darwin-x64@4.60.2":
    resolution:
      {
        integrity: sha512-gjEtURKLCC5VXm1I+2i1u9OhxFsKAQJKTVB8WvDAHF+oZlq0GTVFOlTlO1q3AlCTE/DF32c16ESvfgqR7343/g==,
      }
    cpu: [x64]
    os: [darwin]

  "@rollup/rollup-freebsd-arm64@4.60.2":
    resolution:
      {
        integrity: sha512-Bcl6CYDeAgE70cqZaMojOi/eK63h5Me97ZqAQoh77VPjMysA/4ORQBRGo3rRy45x4MzVlU9uZxs8Uwy7ZaKnBw==,
      }
    cpu: [arm64]
    os: [freebsd]

  "@rollup/rollup-freebsd-x64@4.60.2":
    resolution:
      {
        integrity: sha512-LU+TPda3mAE2QB0/Hp5VyeKJivpC6+tlOXd1VMoXV/YFMvk/MNk5iXeBfB4MQGRWyOYVJ01625vjkr0Az98OJQ==,
      }
    cpu: [x64]
    os: [freebsd]

  "@rollup/rollup-linux-arm-gnueabihf@4.60.2":
    resolution:
      {
        integrity: sha512-2QxQrM+KQ7DAW4o22j+XZ6RKdxjLD7BOWTP0Bv0tmjdyhXSsr2Ul1oJDQqh9Zf5qOwTuTc7Ek83mOFaKnodPjg==,
      }
    cpu: [arm]
    os: [linux]
    libc: [glibc]

  "@rollup/rollup-linux-arm-musleabihf@4.60.2":
    resolution:
      {
        integrity: sha512-TbziEu2DVsTEOPif2mKWkMeDMLoYjx95oESa9fkQQK7r/Orta0gnkcDpzwufEcAO2BLBsD7mZkXGFqEdMRRwfw==,
      }
    cpu: [arm]
    os: [linux]
    libc: [musl]

  "@rollup/rollup-linux-arm64-gnu@4.60.2":
    resolution:
      {
        integrity: sha512-bO/rVDiDUuM2YfuCUwZ1t1cP+/yqjqz+Xf2VtkdppefuOFS2OSeAfgafaHNkFn0t02hEyXngZkxtGqXcXwO8Rg==,
      }
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  "@rollup/rollup-linux-arm64-musl@4.60.2":
    resolution:
      {
        integrity: sha512-hr26p7e93Rl0Za+JwW7EAnwAvKkehh12BU1Llm9Ykiibg4uIr2rbpxG9WCf56GuvidlTG9KiiQT/TXT1yAWxTA==,
      }
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  "@rollup/rollup-linux-loong64-gnu@4.60.2":
    resolution:
      {
        integrity: sha512-pOjB/uSIyDt+ow3k/RcLvUAOGpysT2phDn7TTUB3n75SlIgZzM6NKAqlErPhoFU+npgY3/n+2HYIQVbF70P9/A==,
      }
    cpu: [loong64]
    os: [linux]
    libc: [glibc]

  "@rollup/rollup-linux-loong64-musl@4.60.2":
    resolution:
      {
        integrity: sha512-2/w+q8jszv9Ww1c+6uJT3OwqhdmGP2/4T17cu8WuwyUuuaCDDJ2ojdyYwZzCxx0GcsZBhzi3HmH+J5pZNXnd+Q==,
      }
    cpu: [loong64]
    os: [linux]
    libc: [musl]

  "@rollup/rollup-linux-ppc64-gnu@4.60.2":
    resolution:
      {
        integrity: sha512-11+aL5vKheYgczxtPVVRhdptAM2H7fcDR5Gw4/bTcteuZBlH4oP9f5s9zYO9aGZvoGeBpqXI/9TZZihZ609wKw==,
      }
    cpu: [ppc64]
    os: [linux]
    libc: [glibc]

  "@rollup/rollup-linux-ppc64-musl@4.60.2":
    resolution:
      {
        integrity: sha512-i16fokAGK46IVZuV8LIIwMdtqhin9hfYkCh8pf8iC3QU3LpwL+1FSFGej+O7l3E/AoknL6Dclh2oTdnRMpTzFQ==,
      }
    cpu: [ppc64]
    os: [linux]
    libc: [musl]

  "@rollup/rollup-linux-riscv64-gnu@4.60.2":
    resolution:
      {
        integrity: sha512-49FkKS6RGQoriDSK/6E2GkAsAuU5kETFCh7pG4yD/ylj9rKhTmO3elsnmBvRD4PgJPds5W2PkhC82aVwmUcJ7A==,
      }
    cpu: [riscv64]
    os: [linux]
    libc: [glibc]

  "@rollup/rollup-linux-riscv64-musl@4.60.2":
    resolution:
      {
        integrity: sha512-mjYNkHPfGpUR00DuM1ZZIgs64Hpf4bWcz9Z41+4Q+pgDx73UwWdAYyf6EG/lRFldmdHHzgrYyge5akFUW0D3mQ==,
      }
    cpu: [riscv64]
    os: [linux]
    libc: [musl]

  "@rollup/rollup-linux-s390x-gnu@4.60.2":
    resolution:
      {
        integrity: sha512-ALyvJz965BQk8E9Al/JDKKDLH2kfKFLTGMlgkAbbYtZuJt9LU8DW3ZoDMCtQpXAltZxwBHevXz5u+gf0yA0YoA==,
      }
    cpu: [s390x]
    os: [linux]
    libc: [glibc]

  "@rollup/rollup-linux-x64-gnu@4.60.2":
    resolution:
      {
        integrity: sha512-UQjrkIdWrKI626Du8lCQ6MJp/6V1LAo2bOK9OTu4mSn8GGXIkPXk/Vsp4bLHCd9Z9Iz2OTEaokUE90VweJgIYQ==,
      }
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  "@rollup/rollup-linux-x64-musl@4.60.2":
    resolution:
      {
        integrity: sha512-bTsRGj6VlSdn/XD4CGyzMnzaBs9bsRxy79eTqTCBsA8TMIEky7qg48aPkvJvFe1HyzQ5oMZdg7AnVlWQSKLTnw==,
      }
    cpu: [x64]
    os: [linux]
    libc: [musl]

  "@rollup/rollup-openbsd-x64@4.60.2":
    resolution:
      {
        integrity: sha512-6d4Z3534xitaA1FcMWP7mQPq5zGwBmGbhphh2DwaA1aNIXUu3KTOfwrWpbwI4/Gr0uANo7NTtaykFyO2hPuFLg==,
      }
    cpu: [x64]
    os: [openbsd]

  "@rollup/rollup-openharmony-arm64@4.60.2":
    resolution:
      {
        integrity: sha512-NetAg5iO2uN7eB8zE5qrZ3CSil+7IJt4WDFLcC75Ymywq1VZVD6qJ6EvNLjZ3rEm6gB7XW5JdT60c6MN35Z85Q==,
      }
    cpu: [arm64]
    os: [openharmony]

  "@rollup/rollup-win32-arm64-msvc@4.60.2":
    resolution:
      {
        integrity: sha512-NCYhOotpgWZ5kdxCZsv6Iudx0wX8980Q/oW4pNFNihpBKsDbEA1zpkfxJGC0yugsUuyDZ7gL37dbzwhR0VI7pQ==,
      }
    cpu: [arm64]
    os: [win32]

  "@rollup/rollup-win32-ia32-msvc@4.60.2":
    resolution:
      {
        integrity: sha512-RXsaOqXxfoUBQoOgvmmijVxJnW2IGB0eoMO7F8FAjaj0UTywUO/luSqimWBJn04WNgUkeNhh7fs7pESXajWmkg==,
      }
    cpu: [ia32]
    os: [win32]

  "@rollup/rollup-win32-x64-gnu@4.60.2":
    resolution:
      {
        integrity: sha512-qdAzEULD+/hzObedtmV6iBpdL5TIbKVztGiK7O3/KYSf+HIzU257+MX1EXJcyIiDbMAqmbwaufcYPvyRryeZtA==,
      }
    cpu: [x64]
    os: [win32]

  "@rollup/rollup-win32-x64-msvc@4.60.2":
    resolution:
      {
        integrity: sha512-Nd/SgG27WoA9e+/TdK74KnHz852TLa94ovOYySo/yMPuTmpckK/jIF2jSwS3g7ELSKXK13/cVdmg1Z/DaCWKxA==,
      }
    cpu: [x64]
    os: [win32]

  "@sindresorhus/is@4.6.0":
    resolution:
      {
        integrity: sha512-t09vSN3MdfsyCHoFcTRCH/iUtG7OJ0CsjzB8cjAmKc/va/kIgeDI/TxsigdncE/4be734m0cvIYwNaV4i2XqAw==,
      }
    engines: { node: ">=10" }

  "@szmarczak/http-timer@4.0.6":
    resolution:
      {
        integrity: sha512-4BAffykYOgO+5nzBWYwE3W90sBgLJoUPRWWcL8wlyiM8IB8ipJz3UMJ9KXQd1RKQXpKp8Tutn80HZtWsu2u76w==,
      }
    engines: { node: ">=10" }

  "@types/babel__core@7.20.5":
    resolution:
      {
        integrity: sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==,
      }

  "@types/babel__generator@7.27.0":
    resolution:
      {
        integrity: sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==,
      }

  "@types/babel__template@7.4.4":
    resolution:
      {
        integrity: sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==,
      }

  "@types/babel__traverse@7.28.0":
    resolution:
      {
        integrity: sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==,
      }

  "@types/better-sqlite3@7.6.13":
    resolution:
      {
        integrity: sha512-NMv9ASNARoKksWtsq/SHakpYAYnhBrQgGD8zkLYk/jaK8jUGn08CfEdTRgYhMypUQAfzSP8W6gNLe0q19/t4VA==,
      }

  "@types/body-parser@1.19.6":
    resolution:
      {
        integrity: sha512-HLFeCYgz89uk22N5Qg3dvGvsv46B8GLvKKo1zKG4NybA8U2DiEO3w9lqGg29t/tfLRJpJ6iQxnVw4OnB7MoM9g==,
      }

  "@types/cacheable-request@6.0.3":
    resolution:
      {
        integrity: sha512-IQ3EbTzGxIigb1I3qPZc1rWJnH0BmSKv5QYTalEwweFvyBDLSAe24zP0le/hyi7ecGfZVlIVAg4BZqb8WBwKqw==,
      }

  "@types/connect@3.4.38":
    resolution:
      {
        integrity: sha512-K6uROf1LD88uDQqJCktA4yzL1YYAK6NgfsI0v/mTgyPKWsX1CnJ0XPSDhViejru1GcRkLWb8RlzFYJRqGUbaug==,
      }

  "@types/cors@2.8.19":
    resolution:
      {
        integrity: sha512-mFNylyeyqN93lfe/9CSxOGREz8cpzAhH+E93xJ4xWQf62V8sQ/24reV2nyzUWM6H6Xji+GGHpkbLe7pVoUEskg==,
      }

  "@types/debug@4.1.13":
    resolution:
      {
        integrity: sha512-KSVgmQmzMwPlmtljOomayoR89W4FynCAi3E8PPs7vmDVPe84hT+vGPKkJfThkmXs0x0jAaa9U8uW8bbfyS2fWw==,
      }

  "@types/estree@1.0.8":
    resolution:
      {
        integrity: sha512-dWHzHa2WqEXI/O1E9OjrocMTKJl2mSrEolh1Iomrv6U+JuNwaHXsXx9bLu5gG7BUWFIN0skIQJQ/L1rIex4X6w==,
      }

  "@types/express-serve-static-core@5.1.1":
    resolution:
      {
        integrity: sha512-v4zIMr/cX7/d2BpAEX3KNKL/JrT1s43s96lLvvdTmza1oEvDudCqK9aF/djc/SWgy8Yh0h30TZx5VpzqFCxk5A==,
      }

  "@types/express@5.0.6":
    resolution:
      {
        integrity: sha512-sKYVuV7Sv9fbPIt/442koC7+IIwK5olP1KWeD88e/idgoJqDm3JV/YUiPwkoKK92ylff2MGxSz1CSjsXelx0YA==,
      }

  "@types/fs-extra@9.0.13":
    resolution:
      {
        integrity: sha512-nEnwB++1u5lVDM2UI4c1+5R+FYaKfaAzS4OococimjVm3nQw3TuzH5UNsocrcTBbhnerblyHj4A49qXbIiZdpA==,
      }

  "@types/http-cache-semantics@4.2.0":
    resolution:
      {
        integrity: sha512-L3LgimLHXtGkWikKnsPg0/VFx9OGZaC+eN1u4r+OB1XRqH3meBIAVC2zr1WdMH+RHmnRkqliQAOHNJ/E0j/e0Q==,
      }

  "@types/http-errors@2.0.5":
    resolution:
      {
        integrity: sha512-r8Tayk8HJnX0FztbZN7oVqGccWgw98T/0neJphO91KkmOzug1KkofZURD4UaD5uH8AqcFLfdPErnBod0u71/qg==,
      }

  "@types/json-schema@7.0.15":
    resolution:
      {
        integrity: sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==,
      }

  "@types/keyv@3.1.4":
    resolution:
      {
        integrity: sha512-BQ5aZNSCpj7D6K2ksrRCTmKRLEpnPvWDiLPfoGyhZ++8YtiK9d/3DBKPJgry359X/P1PfruyYwvnvwFjuEiEIg==,
      }

  "@types/ms@2.1.0":
    resolution:
      {
        integrity: sha512-GsCCIZDE/p3i96vtEqx+7dBUGXrc7zeSK3wwPHIaRThS+9OhWIXRqzs4d6k1SVU8g91DrNRWxWUGhp5KXQb2VA==,
      }

  "@types/multer@2.1.0":
    resolution:
      {
        integrity: sha512-zYZb0+nJhOHtPpGDb3vqPjwpdeGlGC157VpkqNQL+UU2qwoacoQ7MpsAmUptI/0Oa127X32JzWDqQVEXp2RcIA==,
      }

  "@types/node@22.19.17":
    resolution:
      {
        integrity: sha512-wGdMcf+vPYM6jikpS/qhg6WiqSV/OhG+jeeHT/KlVqxYfD40iYJf9/AE1uQxVWFvU7MipKRkRv8NSHiCGgPr8Q==,
      }

  "@types/plist@3.0.5":
    resolution:
      {
        integrity: sha512-E6OCaRmAe4WDmWNsL/9RMqdkkzDCY1etutkflWk4c+AcjDU07Pcz1fQwTX0TQz+Pxqn9i4L1TU3UFpjnrcDgxA==,
      }

  "@types/qs@6.15.0":
    resolution:
      {
        integrity: sha512-JawvT8iBVWpzTrz3EGw9BTQFg3BQNmwERdKE22vlTxawwtbyUSlMppvZYKLZzB5zgACXdXxbD3m1bXaMqP/9ow==,
      }

  "@types/range-parser@1.2.7":
    resolution:
      {
        integrity: sha512-hKormJbkJqzQGhziax5PItDUTMAM9uE2XXQmM37dyd4hVM+5aVl7oVxMVUiVQn2oCQFN/LKCZdvSM0pFRqbSmQ==,
      }

  "@types/react-dom@19.2.3":
    resolution:
      {
        integrity: sha512-jp2L/eY6fn+KgVVQAOqYItbF0VY/YApe5Mz2F0aykSO8gx31bYCZyvSeYxCHKvzHG5eZjc+zyaS5BrBWya2+kQ==,
      }
    peerDependencies:
      "@types/react": ^19.2.0

  "@types/react@19.2.14":
    resolution:
      {
        integrity: sha512-ilcTH/UniCkMdtexkoCN0bI7pMcJDvmQFPvuPvmEaYA/NSfFTAgdUSLAoVjaRJm7+6PvcM+q1zYOwS4wTYMF9w==,
      }

  "@types/responselike@1.0.3":
    resolution:
      {
        integrity: sha512-H/+L+UkTV33uf49PH5pCAUBVPNj2nDBXTN+qS1dOwyyg24l3CcicicCA7ca+HMvJBZcFgl5r8e+RR6elsb4Lyw==,
      }

  "@types/send@1.2.1":
    resolution:
      {
        integrity: sha512-arsCikDvlU99zl1g69TcAB3mzZPpxgw0UQnaHeC1Nwb015xp8bknZv5rIfri9xTOcMuaVgvabfIRA7PSZVuZIQ==,
      }

  "@types/serve-static@2.2.0":
    resolution:
      {
        integrity: sha512-8mam4H1NHLtu7nmtalF7eyBH14QyOASmcxHhSfEoRyr0nP/YdoesEtU+uSRvMe96TW/HPTtkoKqQLl53N7UXMQ==,
      }

  "@types/verror@1.10.11":
    resolution:
      {
        integrity: sha512-RlDm9K7+o5stv0Co8i8ZRGxDbrTxhJtgjqjFyVh/tXQyl/rYtTKlnTvZ88oSTeYREWurwx20Js4kTuKCsFkUtg==,
      }

  "@types/yauzl@2.10.3":
    resolution:
      {
        integrity: sha512-oJoftv0LSuaDZE3Le4DbKX+KS9G36NzOeSap90UIK0yMA/NhKJhqlSGtNDORNRaIbQfzjXDrQa0ytJ6mNRGz/Q==,
      }

  "@typescript-eslint/eslint-plugin@8.59.1":
    resolution:
      {
        integrity: sha512-BOziFIfE+6osHO9FoJG4zjoHUcvI7fTNBSpdAwrNH0/TLvzjsk2oo8XSSOT2HhqUyhZPfHv4UOffoJ9oEEQ7Ag==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }
    peerDependencies:
      "@typescript-eslint/parser": ^8.59.1
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: ">=4.8.4 <6.1.0"

  "@typescript-eslint/parser@8.59.1":
    resolution:
      {
        integrity: sha512-HDQH9O/47Dxi1ceDhBXdaldtf/WV9yRYMjbjCuNk3qnaTD564qwv61Y7+gTxwxRKzSrgO5uhtw584igXVuuZkA==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }
    peerDependencies:
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: ">=4.8.4 <6.1.0"

  "@typescript-eslint/project-service@8.59.1":
    resolution:
      {
        integrity: sha512-+MuHQlHiEr00Of/IQbE/MmEoi44znZHbR/Pz7Opq4HryUOlRi+/44dro9Ycy8Fyo+/024IWtw8m4JUMCGTYxDg==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }
    peerDependencies:
      typescript: ">=4.8.4 <6.1.0"

  "@typescript-eslint/scope-manager@8.59.1":
    resolution:
      {
        integrity: sha512-LwuHQI4pDOYVKvmH2dkaJo6YZCSgouVgnS/z7yBPKBMvgtBvyLqiLy9Z6b7+m/TRcX1NFYUqZetI5Y+aT4GEfg==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@typescript-eslint/tsconfig-utils@8.59.1":
    resolution:
      {
        integrity: sha512-/0nEyPbX7gRsk0Uwfe4ALwwgxuA66d/l2mhRDNlAvaj4U3juhUtJNq0DsY8M2AYwwb9rEq2hrC3IcIcEt++iJA==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }
    peerDependencies:
      typescript: ">=4.8.4 <6.1.0"

  "@typescript-eslint/type-utils@8.59.1":
    resolution:
      {
        integrity: sha512-klWPBR2ciQHS3f++ug/mVnWKPjBUo7icEL3FAO1lhAR1Z1i5NQYZ1EannMSRYcq5qCv5wNALlXr6fksRHyYl7w==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }
    peerDependencies:
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: ">=4.8.4 <6.1.0"

  "@typescript-eslint/types@8.59.1":
    resolution:
      {
        integrity: sha512-ZDCjgccSdYPw5Bxh+my4Z0lJU96ZDN7jbBzvmEn0FZx3RtU1C7VWl6NbDx94bwY3V5YsgwRzJPOgeY2Q/nLG8A==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@typescript-eslint/typescript-estree@8.59.1":
    resolution:
      {
        integrity: sha512-OUd+vJS05sSkOip+BkZ/2NS8RMxrAAJemsC6vU3kmfLyeaJT0TftHkV9mcx2107MmsBVXXexhVu4F0TZXyMl4g==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }
    peerDependencies:
      typescript: ">=4.8.4 <6.1.0"

  "@typescript-eslint/utils@8.59.1":
    resolution:
      {
        integrity: sha512-3pIeoXhCeYH9FSCBI8P3iNwJlGuzPlYKkTlen2O9T1DSeeg8UG8jstq6BLk+Mda0qup7mgk4z4XL4OzRaxZ8LA==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }
    peerDependencies:
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: ">=4.8.4 <6.1.0"

  "@typescript-eslint/visitor-keys@8.59.1":
    resolution:
      {
        integrity: sha512-LdDNl6C5iJExcM0Yh0PwAIBb9PrSiCsWamF/JyEZawm3kFDnRoaq3LGE4bpyRao/fWeGKKyw7icx0YxrLFC5Cg==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  "@vitejs/plugin-react@5.2.0":
    resolution:
      {
        integrity: sha512-YmKkfhOAi3wsB1PhJq5Scj3GXMn3WvtQ/JC0xoopuHoXSdmtdStOpFrYaT1kie2YgFBcIe64ROzMYRjCrYOdYw==,
      }
    engines: { node: ^20.19.0 || >=22.12.0 }
    peerDependencies:
      vite: ^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0

  "@xmldom/xmldom@0.8.13":
    resolution:
      {
        integrity: sha512-KRYzxepc14G/CEpEGc3Yn+JKaAeT63smlDr+vjB8jRfgTBBI9wRj/nkQEO+ucV8p8I9bfKLWp37uHgFrbntPvw==,
      }
    engines: { node: ">=10.0.0" }

  "@xmldom/xmldom@0.9.10":
    resolution:
      {
        integrity: sha512-A9gOqLdi6cV4ibazAjcQufGj0B1y/vDqYrcuP6d/6x8P27gRS8643Dj9o1dEKtB6O7fwxb2FgBmJS2mX7gpvdw==,
      }
    engines: { node: ">=14.6" }

  abbrev@4.0.0:
    resolution:
      {
        integrity: sha512-a1wflyaL0tHtJSmLSOVybYhy22vRih4eduhhrkcjgrWGnRfrZtovJ2FRjxuTtkkj47O/baf0R86QU5OuYpz8fA==,
      }
    engines: { node: ^20.17.0 || >=22.9.0 }

  accepts@2.0.0:
    resolution:
      {
        integrity: sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==,
      }
    engines: { node: ">= 0.6" }

  acorn-jsx@5.3.2:
    resolution:
      {
        integrity: sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==,
      }
    peerDependencies:
      acorn: ^6.0.0 || ^7.0.0 || ^8.0.0

  acorn@8.16.0:
    resolution:
      {
        integrity: sha512-UVJyE9MttOsBQIDKw1skb9nAwQuR5wuGD3+82K6JgJlm/Y+KI92oNsMNGZCYdDsVtRHSak0pcV5Dno5+4jh9sw==,
      }
    engines: { node: ">=0.4.0" }
    hasBin: true

  agent-base@7.1.4:
    resolution:
      {
        integrity: sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==,
      }
    engines: { node: ">= 14" }

  ajv-keywords@3.5.2:
    resolution:
      {
        integrity: sha512-5p6WTN0DdTGVQk6VjcEju19IgaHudalcfabD7yhDGeA6bcQnmL+CpveLJq/3hvfwd1aof6L386Ougkx6RfyMIQ==,
      }
    peerDependencies:
      ajv: ^6.9.1

  ajv@6.15.0:
    resolution:
      {
        integrity: sha512-fgFx7Hfoq60ytK2c7DhnF8jIvzYgOMxfugjLOSMHjLIPgenqa7S7oaagATUq99mV6IYvN2tRmC0wnTYX6iPbMw==,
      }

  ansi-regex@5.0.1:
    resolution:
      {
        integrity: sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==,
      }
    engines: { node: ">=8" }

  ansi-styles@4.3.0:
    resolution:
      {
        integrity: sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==,
      }
    engines: { node: ">=8" }

  any-promise@1.3.0:
    resolution:
      {
        integrity: sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==,
      }

  anymatch@3.1.3:
    resolution:
      {
        integrity: sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==,
      }
    engines: { node: ">= 8" }

  app-builder-bin@5.0.0-alpha.12:
    resolution:
      {
        integrity: sha512-j87o0j6LqPL3QRr8yid6c+Tt5gC7xNfYo6uQIQkorAC6MpeayVMZrEDzKmJJ/Hlv7EnOQpaRm53k6ktDYZyB6w==,
      }

  app-builder-lib@26.8.1:
    resolution:
      {
        integrity: sha512-p0Im/Dx5C4tmz8QEE1Yn4MkuPC8PrnlRneMhWJj7BBXQfNTJUshM/bp3lusdEsDbvvfJZpXWnYesgSLvwtM2Zw==,
      }
    engines: { node: ">=14.0.0" }
    peerDependencies:
      dmg-builder: 26.8.1
      electron-builder-squirrel-windows: 26.8.1

  append-field@1.0.0:
    resolution:
      {
        integrity: sha512-klpgFSWLW1ZEs8svjfb7g4qWY0YS5imI82dTg+QahUvJ8YqAY0P10Uk8tTyh9ZGuYEZEMaeJYCF5BFuX552hsw==,
      }

  arg@5.0.2:
    resolution:
      {
        integrity: sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==,
      }

  argparse@2.0.1:
    resolution:
      {
        integrity: sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==,
      }

  aria-hidden@1.2.6:
    resolution:
      {
        integrity: sha512-ik3ZgC9dY/lYVVM++OISsaYDeg1tb0VtP5uL3ouh1koGOaUMDPpbFIei4JkFimWUFPn90sbMNMXQAIVOlnYKJA==,
      }
    engines: { node: ">=10" }

  assert-plus@1.0.0:
    resolution:
      {
        integrity: sha512-NfJ4UzBCcQGLDlQq7nHxH+tv3kyZ0hHQqF5BO6J7tNJeP5do1llPr8dZ8zHonfhAu0PHAdMkSo+8o0wxg9lZWw==,
      }
    engines: { node: ">=0.8" }

  astral-regex@2.0.0:
    resolution:
      {
        integrity: sha512-Z7tMw1ytTXt5jqMcOP+OQteU1VuNK9Y02uuJtKQ1Sv69jXQKKg5cibLwGJow8yzZP+eAc18EmLGPal0bp36rvQ==,
      }
    engines: { node: ">=8" }

  async-exit-hook@2.0.1:
    resolution:
      {
        integrity: sha512-NW2cX8m1Q7KPA7a5M2ULQeZ2wR5qI5PAbw5L0UOMxdioVk9PMZ0h1TmyZEkPYrCvYjDlFICusOu1dlEKAAeXBw==,
      }
    engines: { node: ">=0.12.0" }

  async@3.2.6:
    resolution:
      {
        integrity: sha512-htCUDlxyyCLMgaM3xXg0C0LW2xqfuQ6p05pCEIsXuyQ+a1koYKTuBMzRNwmybfLgvJDMd0r1LTn4+E0Ti6C2AA==,
      }

  asynckit@0.4.0:
    resolution:
      {
        integrity: sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==,
      }

  at-least-node@1.0.0:
    resolution:
      {
        integrity: sha512-+q/t7Ekv1EDY2l6Gda6LLiX14rU9TV20Wa3ofeQmwPFZbOMo9DXrLbOjFaaclkXKWidIaopwAObQDqwWtGUjqg==,
      }
    engines: { node: ">= 4.0.0" }

  atomic-sleep@1.0.0:
    resolution:
      {
        integrity: sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==,
      }
    engines: { node: ">=8.0.0" }

  autoprefixer@10.5.0:
    resolution:
      {
        integrity: sha512-FMhOoZV4+qR6aTUALKX2rEqGG+oyATvwBt9IIzVR5rMa2HRWPkxf+P+PAJLD1I/H5/II+HuZcBJYEFBpq39ong==,
      }
    engines: { node: ^10 || ^12 || >=14 }
    hasBin: true
    peerDependencies:
      postcss: ^8.1.0

  balanced-match@1.0.2:
    resolution:
      {
        integrity: sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==,
      }

  balanced-match@4.0.4:
    resolution:
      {
        integrity: sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==,
      }
    engines: { node: 18 || 20 || >=22 }

  base64-js@1.5.1:
    resolution:
      {
        integrity: sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==,
      }

  baseline-browser-mapping@2.10.27:
    resolution:
      {
        integrity: sha512-zEs/ufmZoUd7WftKpKyXaT6RFxpQ5Qm9xytKRHvJfxFV9DFJkZph9RvJ1LcOUi0Z1ZVijMte65JbILeV+8QQEA==,
      }
    engines: { node: ">=6.0.0" }
    hasBin: true

  better-sqlite3@12.9.0:
    resolution:
      {
        integrity: sha512-wqUv4Gm3toFpHDQmaKD4QhZm3g1DjUBI0yzS4UBl6lElUmXFYdTQmmEDpAFa5o8FiFiymURypEnfVHzILKaxqQ==,
      }
    engines: { node: 20.x || 22.x || 23.x || 24.x || 25.x }

  binary-extensions@2.3.0:
    resolution:
      {
        integrity: sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==,
      }
    engines: { node: ">=8" }

  bindings@1.5.0:
    resolution:
      {
        integrity: sha512-p2q/t/mhvuOj/UeLlV6566GD/guowlr0hHxClI0W9m7MWYkL1F0hLo+0Aexs9HSPCtR1SXQ0TD3MMKrXZajbiQ==,
      }

  bl@4.1.0:
    resolution:
      {
        integrity: sha512-1W07cM9gS6DcLperZfFSj+bWLtaPGSOHWhPiGzXmvVJbRLdG82sH/Kn8EtW1VqWVA54AKf2h5k5BbnIbwF3h6w==,
      }

  body-parser@2.2.2:
    resolution:
      {
        integrity: sha512-oP5VkATKlNwcgvxi0vM0p/D3n2C3EReYVX+DNYs5TjZFn/oQt2j+4sVJtSMr18pdRr8wjTcBl6LoV+FUwzPmNA==,
      }
    engines: { node: ">=18" }

  boolean@3.2.0:
    resolution:
      {
        integrity: sha512-d0II/GO9uf9lfUHH2BQsjxzRJZBdsjgsBiW4BvhWk/3qoKwQFjIDVN19PfX8F2D/r9PCMTtLWjYVCFrpeYUzsw==,
      }
    deprecated: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.

  brace-expansion@1.1.14:
    resolution:
      {
        integrity: sha512-MWPGfDxnyzKU7rNOW9SP/c50vi3xrmrua/+6hfPbCS2ABNWfx24vPidzvC7krjU/RTo235sV776ymlsMtGKj8g==,
      }

  brace-expansion@2.1.0:
    resolution:
      {
        integrity: sha512-TN1kCZAgdgweJhWWpgKYrQaMNHcDULHkWwQIspdtjV4Y5aurRdZpjAqn6yX3FPqTA9ngHCc4hJxMAMgGfve85w==,
      }

  brace-expansion@5.0.5:
    resolution:
      {
        integrity: sha512-VZznLgtwhn+Mact9tfiwx64fA9erHH/MCXEUfB/0bX/6Fz6ny5EGTXYltMocqg4xFAQZtnO3DHWWXi8RiuN7cQ==,
      }
    engines: { node: 18 || 20 || >=22 }

  braces@3.0.3:
    resolution:
      {
        integrity: sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==,
      }
    engines: { node: ">=8" }

  browserslist@4.28.2:
    resolution:
      {
        integrity: sha512-48xSriZYYg+8qXna9kwqjIVzuQxi+KYWp2+5nCYnYKPTr0LvD89Jqk2Or5ogxz0NUMfIjhh2lIUX/LyX9B4oIg==,
      }
    engines: { node: ^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7 }
    hasBin: true

  buffer-crc32@0.2.13:
    resolution:
      {
        integrity: sha512-VO9Ht/+p3SN7SKWqcrgEzjGbRSJYTx+Q1pTQC0wrWqHx0vpJraQ6GtHx8tvcg1rlK1byhU5gccxgOgj7B0TDkQ==,
      }

  buffer-from@1.1.2:
    resolution:
      {
        integrity: sha512-E+XQCRwSbaaiChtv6k6Dwgc+bx+Bs6vuKJHHl5kox/BaKbhiXzqQOwK4cO22yElGp2OCmjwVhT3HmxgyPGnJfQ==,
      }

  buffer@5.7.1:
    resolution:
      {
        integrity: sha512-EHcyIPBQ4BSGlvjB16k5KgAJ27CIsHY/2JBmCRReo48y9rQ3MaUzWX3KVlBa4U7MyX02HdVj0K7C3WaB3ju7FQ==,
      }

  builder-util-runtime@9.5.1:
    resolution:
      {
        integrity: sha512-qt41tMfgHTllhResqM5DcnHyDIWNgzHvuY2jDcYP9iaGpkWxTUzV6GQjDeLnlR1/DtdlcsWQbA7sByMpmJFTLQ==,
      }
    engines: { node: ">=12.0.0" }

  builder-util@26.8.1:
    resolution:
      {
        integrity: sha512-pm1lTYbGyc90DHgCDO7eo8Rl4EqKLciayNbZqGziqnH9jrlKe8ZANGdityLZU+pJh16dfzjAx2xQq9McuIPEtw==,
      }

  busboy@1.6.0:
    resolution:
      {
        integrity: sha512-8SFQbg/0hQ9xy3UNTB0YEnsNBbWfhf7RtnzpL7TkBiTBRfrQ9Fxcnz7VJsleJpyp6rVLvXiuORqjlHi5q+PYuA==,
      }
    engines: { node: ">=10.16.0" }

  bytes@3.1.2:
    resolution:
      {
        integrity: sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==,
      }
    engines: { node: ">= 0.8" }

  cac@6.7.14:
    resolution:
      {
        integrity: sha512-b6Ilus+c3RrdDk+JhLKUAQfzzgLEPy6wcXqS7f/xe1EETvsDP6GORG7SFuOs6cID5YkqchW/LXZbX5bc8j7ZcQ==,
      }
    engines: { node: ">=8" }

  cacheable-lookup@5.0.4:
    resolution:
      {
        integrity: sha512-2/kNscPhpcxrOigMZzbiWF7dz8ilhb/nIHU3EyZiXWXpeq/au8qJ8VhdftMkty3n7Gj6HIGalQG8oiBNB3AJgA==,
      }
    engines: { node: ">=10.6.0" }

  cacheable-request@7.0.4:
    resolution:
      {
        integrity: sha512-v+p6ongsrp0yTGbJXjgxPow2+DL93DASP4kXCDKb8/bwRtt9OEF3whggkkDkGNzgcWy2XaF4a8nZglC7uElscg==,
      }
    engines: { node: ">=8" }

  call-bind-apply-helpers@1.0.2:
    resolution:
      {
        integrity: sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==,
      }
    engines: { node: ">= 0.4" }

  call-bound@1.0.4:
    resolution:
      {
        integrity: sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==,
      }
    engines: { node: ">= 0.4" }

  callsites@3.1.0:
    resolution:
      {
        integrity: sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==,
      }
    engines: { node: ">=6" }

  camelcase-css@2.0.1:
    resolution:
      {
        integrity: sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==,
      }
    engines: { node: ">= 6" }

  caniuse-lite@1.0.30001791:
    resolution:
      {
        integrity: sha512-yk0l/YSrOnFZk3UROpDLQD9+kC1l4meK/wed583AXrzoarMGJcbRi2Q4RaUYbKxYAsZ8sWmaSa/DsLmdBeI1vQ==,
      }

  chalk@4.1.2:
    resolution:
      {
        integrity: sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==,
      }
    engines: { node: ">=10" }

  chokidar@3.6.0:
    resolution:
      {
        integrity: sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==,
      }
    engines: { node: ">= 8.10.0" }

  chownr@1.1.4:
    resolution:
      {
        integrity: sha512-jJ0bqzaylmJtVnNgzTeSOs8DPavpbYgEr/b0YL8/2GO3xJEhInFmhKMUnEJQjZumK7KXGFhUy89PrsJWlakBVg==,
      }

  chownr@3.0.0:
    resolution:
      {
        integrity: sha512-+IxzY9BZOQd/XuYPRmrvEVjF/nqj5kgT4kEq7VofrDoM1MxoRjEWkrCC3EtLi59TVawxTAn+orJwFQcrqEN1+g==,
      }
    engines: { node: ">=18" }

  chromium-pickle-js@0.2.0:
    resolution:
      {
        integrity: sha512-1R5Fho+jBq0DDydt+/vHWj5KJNJCKdARKOCwZUen84I5BreWoLqRLANH1U87eJy1tiASPtMnGqJJq0ZsLoRPOw==,
      }

  ci-info@4.3.1:
    resolution:
      {
        integrity: sha512-Wdy2Igu8OcBpI2pZePZ5oWjPC38tmDVx5WKUXKwlLYkA0ozo85sLsLvkBbBn/sZaSCMFOGZJ14fvW9t5/d7kdA==,
      }
    engines: { node: ">=8" }

  ci-info@4.4.0:
    resolution:
      {
        integrity: sha512-77PSwercCZU2Fc4sX94eF8k8Pxte6JAwL4/ICZLFjJLqegs7kCuAsqqj/70NQF6TvDpgFjkubQB2FW2ZZddvQg==,
      }
    engines: { node: ">=8" }

  cli-truncate@2.1.0:
    resolution:
      {
        integrity: sha512-n8fOixwDD6b/ObinzTrp1ZKFzbgvKZvuz/TvejnLn1aQfC6r52XEx85FmuC+3HI+JM7coBRXUvNqEU2PHVrHpg==,
      }
    engines: { node: ">=8" }

  cliui@8.0.1:
    resolution:
      {
        integrity: sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==,
      }
    engines: { node: ">=12" }

  clone-response@1.0.3:
    resolution:
      {
        integrity: sha512-ROoL94jJH2dUVML2Y/5PEDNaSHgeOdSDicUyS7izcF63G6sTc/FTjLub4b8Il9S8S0beOfYt0TaA5qvFK+w0wA==,
      }

  clsx@2.1.1:
    resolution:
      {
        integrity: sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==,
      }
    engines: { node: ">=6" }

  color-convert@2.0.1:
    resolution:
      {
        integrity: sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==,
      }
    engines: { node: ">=7.0.0" }

  color-name@1.1.4:
    resolution:
      {
        integrity: sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==,
      }

  combined-stream@1.0.8:
    resolution:
      {
        integrity: sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==,
      }
    engines: { node: ">= 0.8" }

  commander@4.1.1:
    resolution:
      {
        integrity: sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==,
      }
    engines: { node: ">= 6" }

  commander@5.1.0:
    resolution:
      {
        integrity: sha512-P0CysNDQ7rtVw4QIQtm+MRxV66vKFSvlsQvGYXZWR3qFU0jlMKHZZZgw8e+8DSah4UDKMqnknRDQz+xuQXQ/Zg==,
      }
    engines: { node: ">= 6" }

  commander@9.5.0:
    resolution:
      {
        integrity: sha512-KRs7WVDKg86PWiuAqhDrAQnTXZKraVcCc6vFdL14qrZ/DcWwuRo7VoiYXalXO7S5GKpqYiVEwCbgFDfxNHKJBQ==,
      }
    engines: { node: ^12.20.0 || >=14 }

  compare-version@0.1.2:
    resolution:
      {
        integrity: sha512-pJDh5/4wrEnXX/VWRZvruAGHkzKdr46z11OlTPN+VrATlWWhSKewNCJ1futCO5C7eJB3nPMFZA1LeYtcFboZ2A==,
      }
    engines: { node: ">=0.10.0" }

  concat-map@0.0.1:
    resolution:
      {
        integrity: sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==,
      }

  concat-stream@2.0.0:
    resolution:
      {
        integrity: sha512-MWufYdFw53ccGjCA+Ol7XJYpAlW6/prSMzuPOTRnJGcGzuhLn4Scrz7qf6o8bROZ514ltazcIFJZevcfbo0x7A==,
      }
    engines: { "0": node >= 6.0 }

  content-disposition@1.1.0:
    resolution:
      {
        integrity: sha512-5jRCH9Z/+DRP7rkvY83B+yGIGX96OYdJmzngqnw2SBSxqCFPd0w2km3s5iawpGX8krnwSGmF0FW5Nhr0Hfai3g==,
      }
    engines: { node: ">=18" }

  content-type@1.0.5:
    resolution:
      {
        integrity: sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==,
      }
    engines: { node: ">= 0.6" }

  convert-source-map@2.0.0:
    resolution:
      {
        integrity: sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==,
      }

  cookie-signature@1.2.2:
    resolution:
      {
        integrity: sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==,
      }
    engines: { node: ">=6.6.0" }

  cookie@0.7.2:
    resolution:
      {
        integrity: sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==,
      }
    engines: { node: ">= 0.6" }

  core-util-is@1.0.2:
    resolution:
      {
        integrity: sha512-3lqz5YjWTYnW6dlDa5TLaTCcShfar1e40rmcJVwCBJC6mWlFuj0eCHIElmG1g5kyuJ/GD+8Wn4FFCcz4gJPfaQ==,
      }

  cors@2.8.6:
    resolution:
      {
        integrity: sha512-tJtZBBHA6vjIAaF6EnIaq6laBBP9aq/Y3ouVJjEfoHbRBcHBAHYcMh/w8LDrk2PvIMMq8gmopa5D4V8RmbrxGw==,
      }
    engines: { node: ">= 0.10" }

  crc@3.8.0:
    resolution:
      {
        integrity: sha512-iX3mfgcTMIq3ZKLIsVFAbv7+Mc10kxabAGQb8HvjA1o3T1PIYprbakQ65d3I+2HGHt6nSKkM9PYjgoJO2KcFBQ==,
      }

  cross-dirname@0.1.0:
    resolution:
      {
        integrity: sha512-+R08/oI0nl3vfPcqftZRpytksBXDzOUveBq/NBVx0sUp1axwzPQrKinNx5yd5sxPu8j1wIy8AfnVQ+5eFdha6Q==,
      }

  cross-spawn@7.0.6:
    resolution:
      {
        integrity: sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==,
      }
    engines: { node: ">= 8" }

  cssesc@3.0.0:
    resolution:
      {
        integrity: sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==,
      }
    engines: { node: ">=4" }
    hasBin: true

  csstype@3.2.3:
    resolution:
      {
        integrity: sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==,
      }

  debug@4.4.3:
    resolution:
      {
        integrity: sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==,
      }
    engines: { node: ">=6.0" }
    peerDependencies:
      supports-color: "*"
    peerDependenciesMeta:
      supports-color:
        optional: true

  decompress-response@6.0.0:
    resolution:
      {
        integrity: sha512-aW35yZM6Bb/4oJlZncMH2LCoZtJXTRxES17vE3hoRiowU2kWHaJKFkSBDnDR+cm9J+9QhXmREyIfv0pji9ejCQ==,
      }
    engines: { node: ">=10" }

  deep-extend@0.6.0:
    resolution:
      {
        integrity: sha512-LOHxIOaPYdHlJRtCQfDIVZtfw/ufM8+rVj649RIHzcm/vGwQRXFt6OPqIFWsm2XEMrNIEtWR64sY1LEKD2vAOA==,
      }
    engines: { node: ">=4.0.0" }

  deep-is@0.1.4:
    resolution:
      {
        integrity: sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==,
      }

  defer-to-connect@2.0.1:
    resolution:
      {
        integrity: sha512-4tvttepXG1VaYGrRibk5EwJd1t4udunSOVMdLSAL6mId1ix438oPwPZMALY41FCijukO1L0twNcGsdzS7dHgDg==,
      }
    engines: { node: ">=10" }

  define-data-property@1.1.4:
    resolution:
      {
        integrity: sha512-rBMvIzlpA8v6E+SJZoo++HAYqsLrkg7MSfIinMPFhmkorw7X+dOXVJQs+QT69zGkzMyfDnIMN2Wid1+NbL3T+A==,
      }
    engines: { node: ">= 0.4" }

  define-properties@1.2.1:
    resolution:
      {
        integrity: sha512-8QmQKqEASLd5nx0U1B1okLElbUuuttJ/AnYmRXbbbGDWh6uS208EjD4Xqq/I9wK7u0v6O08XhTWnt5XtEbR6Dg==,
      }
    engines: { node: ">= 0.4" }

  delayed-stream@1.0.0:
    resolution:
      {
        integrity: sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==,
      }
    engines: { node: ">=0.4.0" }

  depd@2.0.0:
    resolution:
      {
        integrity: sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==,
      }
    engines: { node: ">= 0.8" }

  detect-libc@2.1.2:
    resolution:
      {
        integrity: sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==,
      }
    engines: { node: ">=8" }

  detect-node-es@1.1.0:
    resolution:
      {
        integrity: sha512-ypdmJU/TbBby2Dxibuv7ZLW3Bs1QEmM7nHjEANfohJLvE0XVujisn1qPJcZxg+qDucsr+bP6fLD1rPS3AhJ7EQ==,
      }

  detect-node@2.1.0:
    resolution:
      {
        integrity: sha512-T0NIuQpnTvFDATNuHN5roPwSBG83rFsuO+MXXH9/3N1eFbn4wcPjttvjMLEPWJ0RGUYgQE7cGgS3tNxbqCGM7g==,
      }

  didyoumean@1.2.2:
    resolution:
      {
        integrity: sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==,
      }

  dir-compare@4.2.0:
    resolution:
      {
        integrity: sha512-2xMCmOoMrdQIPHdsTawECdNPwlVFB9zGcz3kuhmBO6U3oU+UQjsue0i8ayLKpgBcm+hcXPMVSGUN9d+pvJ6+VQ==,
      }

  dlv@1.1.3:
    resolution:
      {
        integrity: sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==,
      }

  dmg-builder@26.8.1:
    resolution:
      {
        integrity: sha512-glMJgnTreo8CFINujtAhCgN96QAqApDMZ8Vl1r8f0QT8QprvC1UCltV4CcWj20YoIyLZx6IUskaJZ0NV8fokcg==,
      }

  dmg-license@1.0.11:
    resolution:
      {
        integrity: sha512-ZdzmqwKmECOWJpqefloC5OJy1+WZBBse5+MR88z9g9Zn4VY+WYUkAyojmhzJckH5YbbZGcYIuGAkY5/Ys5OM2Q==,
      }
    engines: { node: ">=8" }
    os: [darwin]
    hasBin: true

  dotenv-expand@11.0.7:
    resolution:
      {
        integrity: sha512-zIHwmZPRshsCdpMDyVsqGmgyP0yT8GAgXUnkdAoJisxvf33k7yO6OuoKmcTGuXPWSsm8Oh88nZicRLA9Y0rUeA==,
      }
    engines: { node: ">=12" }

  dotenv@16.6.1:
    resolution:
      {
        integrity: sha512-uBq4egWHTcTt33a72vpSG0z3HnPuIl6NqYcTrKEg2azoEyl2hpW0zqlxysq2pK9HlDIHyHyakeYaYnSAwd8bow==,
      }
    engines: { node: ">=12" }

  dotenv@17.4.2:
    resolution:
      {
        integrity: sha512-nI4U3TottKAcAD9LLud4Cb7b2QztQMUEfHbvhTH09bqXTxnSie8WnjPALV/WMCrJZ6UV/qHJ6L03OqO3LcdYZw==,
      }
    engines: { node: ">=12" }

  drizzle-orm@0.44.7:
    resolution:
      {
        integrity: sha512-quIpnYznjU9lHshEOAYLoZ9s3jweleHlZIAWR/jX9gAWNg/JhQ1wj0KGRf7/Zm+obRrYd9GjPVJg790QY9N5AQ==,
      }
    peerDependencies:
      "@aws-sdk/client-rds-data": ">=3"
      "@cloudflare/workers-types": ">=4"
      "@electric-sql/pglite": ">=0.2.0"
      "@libsql/client": ">=0.10.0"
      "@libsql/client-wasm": ">=0.10.0"
      "@neondatabase/serverless": ">=0.10.0"
      "@op-engineering/op-sqlite": ">=2"
      "@opentelemetry/api": ^1.4.1
      "@planetscale/database": ">=1.13"
      "@prisma/client": "*"
      "@tidbcloud/serverless": "*"
      "@types/better-sqlite3": "*"
      "@types/pg": "*"
      "@types/sql.js": "*"
      "@upstash/redis": ">=1.34.7"
      "@vercel/postgres": ">=0.8.0"
      "@xata.io/client": "*"
      better-sqlite3: ">=7"
      bun-types: "*"
      expo-sqlite: ">=14.0.0"
      gel: ">=2"
      knex: "*"
      kysely: "*"
      mysql2: ">=2"
      pg: ">=8"
      postgres: ">=3"
      prisma: "*"
      sql.js: ">=1"
      sqlite3: ">=5"
    peerDependenciesMeta:
      "@aws-sdk/client-rds-data":
        optional: true
      "@cloudflare/workers-types":
        optional: true
      "@electric-sql/pglite":
        optional: true
      "@libsql/client":
        optional: true
      "@libsql/client-wasm":
        optional: true
      "@neondatabase/serverless":
        optional: true
      "@op-engineering/op-sqlite":
        optional: true
      "@opentelemetry/api":
        optional: true
      "@planetscale/database":
        optional: true
      "@prisma/client":
        optional: true
      "@tidbcloud/serverless":
        optional: true
      "@types/better-sqlite3":
        optional: true
      "@types/pg":
        optional: true
      "@types/sql.js":
        optional: true
      "@upstash/redis":
        optional: true
      "@vercel/postgres":
        optional: true
      "@xata.io/client":
        optional: true
      better-sqlite3:
        optional: true
      bun-types:
        optional: true
      expo-sqlite:
        optional: true
      gel:
        optional: true
      knex:
        optional: true
      kysely:
        optional: true
      mysql2:
        optional: true
      pg:
        optional: true
      postgres:
        optional: true
      prisma:
        optional: true
      sql.js:
        optional: true
      sqlite3:
        optional: true

  dunder-proto@1.0.1:
    resolution:
      {
        integrity: sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==,
      }
    engines: { node: ">= 0.4" }

  ee-first@1.1.1:
    resolution:
      {
        integrity: sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==,
      }

  ejs@3.1.10:
    resolution:
      {
        integrity: sha512-UeJmFfOrAQS8OJWPZ4qtgHyWExa088/MtK5UEyoJGFH67cDEXkZSviOiKRCZ4Xij0zxI3JECgYs3oKx+AizQBA==,
      }
    engines: { node: ">=0.10.0" }
    hasBin: true

  electron-builder-squirrel-windows@26.8.1:
    resolution:
      {
        integrity: sha512-o288fIdgPLHA76eDrFADHPoo7VyGkDCYbLV1GzndaMSAVBoZrGvM9m2IehdcVMzdAZJ2eV9bgyissQXHv5tGzA==,
      }

  electron-builder@26.8.1:
    resolution:
      {
        integrity: sha512-uWhx1r74NGpCagG0ULs/P9Nqv2nsoo+7eo4fLUOB8L8MdWltq9odW/uuLXMFCDGnPafknYLZgjNX0ZIFRzOQAw==,
      }
    engines: { node: ">=14.0.0" }
    hasBin: true

  electron-publish@26.8.1:
    resolution:
      {
        integrity: sha512-q+jrSTIh/Cv4eGZa7oVR+grEJo/FoLMYBAnSL5GCtqwUpr1T+VgKB/dn1pnzxIxqD8S/jP1yilT9VrwCqINR4w==,
      }

  electron-to-chromium@1.5.349:
    resolution:
      {
        integrity: sha512-QsWVGyRuY07Aqb234QytTfwd5d9AJlfNIQ5wIOl1L+PZDzI9d9+Fn0FRale/QYlFxt/bUnB0/nLd1jFPGxGK1A==,
      }

  electron-vite@4.0.1:
    resolution:
      {
        integrity: sha512-QqacJbA8f1pmwUTqki1qLL5vIBaOQmeq13CZZefZ3r3vKVaIoC7cpoTgE+KPKxJDFTax+iFZV0VYvLVWPiQ8Aw==,
      }
    engines: { node: ^20.19.0 || >=22.12.0 }
    hasBin: true
    peerDependencies:
      "@swc/core": ^1.0.0
      vite: ^5.0.0 || ^6.0.0 || ^7.0.0
    peerDependenciesMeta:
      "@swc/core":
        optional: true

  electron-winstaller@5.4.0:
    resolution:
      {
        integrity: sha512-bO3y10YikuUwUuDUQRM4KfwNkKhnpVO7IPdbsrejwN9/AABJzzTQ4GeHwyzNSrVO+tEH3/Np255a3sVZpZDjvg==,
      }
    engines: { node: ">=8.0.0" }

  electron@39.8.9:
    resolution:
      {
        integrity: sha512-0zgNu0MmWR/kzFm+B+LlvpLOX8l3wt1z+BJIYv2Uxc2bEqWBT3jNsX1IhPVP5OJijjZO5ewCOIy0n/bsfJfjdw==,
      }
    engines: { node: ">= 12.20.55" }
    hasBin: true

  emoji-regex@8.0.0:
    resolution:
      {
        integrity: sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==,
      }

  encodeurl@2.0.0:
    resolution:
      {
        integrity: sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==,
      }
    engines: { node: ">= 0.8" }

  end-of-stream@1.4.5:
    resolution:
      {
        integrity: sha512-ooEGc6HP26xXq/N+GCGOT0JKCLDGrq2bQUZrQ7gyrJiZANJ/8YDTxTpQBXGMn+WbIQXNVpyWymm7KYVICQnyOg==,
      }

  env-paths@2.2.1:
    resolution:
      {
        integrity: sha512-+h1lkLKhZMTYjog1VEpJNG7NZJWcuc2DDk/qsqSTRRCOXiLjeQ1d1/udrUGhqMxUgAlwKNZ0cf2uqan5GLuS2A==,
      }
    engines: { node: ">=6" }

  err-code@2.0.3:
    resolution:
      {
        integrity: sha512-2bmlRpNKBxT/CRmPOlyISQpNj+qSeYvcym/uT0Jx2bMOlKLtSy1ZmLuVxSEKKyor/N5yhvp/ZiG1oE3DEYMSFA==,
      }

  es-define-property@1.0.1:
    resolution:
      {
        integrity: sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==,
      }
    engines: { node: ">= 0.4" }

  es-errors@1.3.0:
    resolution:
      {
        integrity: sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==,
      }
    engines: { node: ">= 0.4" }

  es-object-atoms@1.1.1:
    resolution:
      {
        integrity: sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==,
      }
    engines: { node: ">= 0.4" }

  es-set-tostringtag@2.1.0:
    resolution:
      {
        integrity: sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==,
      }
    engines: { node: ">= 0.4" }

  es6-error@4.1.1:
    resolution:
      {
        integrity: sha512-Um/+FxMr9CISWh0bi5Zv0iOD+4cFh5qLeks1qhAopKVAJw3drgKbKySikp7wGhDL0HPeaja0P5ULZrxLkniUVg==,
      }

  esbuild@0.25.12:
    resolution:
      {
        integrity: sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==,
      }
    engines: { node: ">=18" }
    hasBin: true

  esbuild@0.27.7:
    resolution:
      {
        integrity: sha512-IxpibTjyVnmrIQo5aqNpCgoACA/dTKLTlhMHihVHhdkxKyPO1uBBthumT0rdHmcsk9uMonIWS0m4FljWzILh3w==,
      }
    engines: { node: ">=18" }
    hasBin: true

  escalade@3.2.0:
    resolution:
      {
        integrity: sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==,
      }
    engines: { node: ">=6" }

  escape-html@1.0.3:
    resolution:
      {
        integrity: sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==,
      }

  escape-string-regexp@4.0.0:
    resolution:
      {
        integrity: sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==,
      }
    engines: { node: ">=10" }

  eslint-scope@8.4.0:
    resolution:
      {
        integrity: sha512-sNXOfKCn74rt8RICKMvJS7XKV/Xk9kA7DyJr8mJik3S7Cwgy3qlkkmyS2uQB3jiJg6VNdZd/pDBJu0nvG2NlTg==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  eslint-visitor-keys@3.4.3:
    resolution:
      {
        integrity: sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==,
      }
    engines: { node: ^12.22.0 || ^14.17.0 || >=16.0.0 }

  eslint-visitor-keys@4.2.1:
    resolution:
      {
        integrity: sha512-Uhdk5sfqcee/9H/rCOJikYz67o0a2Tw2hGRPOG2Y1R2dg7brRe1uG0yaNQDHu+TO/uQPF/5eCapvYSmHUjt7JQ==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  eslint-visitor-keys@5.0.1:
    resolution:
      {
        integrity: sha512-tD40eHxA35h0PEIZNeIjkHoDR4YjjJp34biM0mDvplBe//mB+IHCqHDGV7pxF+7MklTvighcCPPZC7ynWyjdTA==,
      }
    engines: { node: ^20.19.0 || ^22.13.0 || >=24 }

  eslint@9.39.4:
    resolution:
      {
        integrity: sha512-XoMjdBOwe/esVgEvLmNsD3IRHkm7fbKIUGvrleloJXUZgDHig2IPWNniv+GwjyJXzuNqVjlr5+4yVUZjycJwfQ==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }
    hasBin: true
    peerDependencies:
      jiti: "*"
    peerDependenciesMeta:
      jiti:
        optional: true

  espree@10.4.0:
    resolution:
      {
        integrity: sha512-j6PAQ2uUr79PZhBjP5C5fhl8e39FmRnOjsD5lGnWrFU8i2G776tBK7+nP8KuQUTTyAZUwfQqXAgrVH5MbH9CYQ==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }

  esquery@1.7.0:
    resolution:
      {
        integrity: sha512-Ap6G0WQwcU/LHsvLwON1fAQX9Zp0A2Y6Y/cJBl9r/JbW90Zyg4/zbG6zzKa2OTALELarYHmKu0GhpM5EO+7T0g==,
      }
    engines: { node: ">=0.10" }

  esrecurse@4.3.0:
    resolution:
      {
        integrity: sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==,
      }
    engines: { node: ">=4.0" }

  estraverse@5.3.0:
    resolution:
      {
        integrity: sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==,
      }
    engines: { node: ">=4.0" }

  esutils@2.0.3:
    resolution:
      {
        integrity: sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==,
      }
    engines: { node: ">=0.10.0" }

  etag@1.8.1:
    resolution:
      {
        integrity: sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==,
      }
    engines: { node: ">= 0.6" }

  expand-template@2.0.3:
    resolution:
      {
        integrity: sha512-XYfuKMvj4O35f/pOXLObndIRvyQ+/+6AhODh+OKWj9S9498pHHn/IMszH+gt0fBCRWMNfk1ZSp5x3AifmnI2vg==,
      }
    engines: { node: ">=6" }

  exponential-backoff@3.1.3:
    resolution:
      {
        integrity: sha512-ZgEeZXj30q+I0EN+CbSSpIyPaJ5HVQD18Z1m+u1FXbAeT94mr1zw50q4q6jiiC447Nl/YTcIYSAftiGqetwXCA==,
      }

  express@5.2.1:
    resolution:
      {
        integrity: sha512-hIS4idWWai69NezIdRt2xFVofaF4j+6INOpJlVOLDO8zXGpUVEVzIYk12UUi2JzjEzWL3IOAxcTubgz9Po0yXw==,
      }
    engines: { node: ">= 18" }

  extract-zip@2.0.1:
    resolution:
      {
        integrity: sha512-GDhU9ntwuKyGXdZBUgTIe+vXnWj0fppUEtMDL0+idd5Sta8TGpHssn/eusA9mrPr9qNDym6SxAYZjNvCn/9RBg==,
      }
    engines: { node: ">= 10.17.0" }
    hasBin: true

  extsprintf@1.4.1:
    resolution:
      {
        integrity: sha512-Wrk35e8ydCKDj/ArClo1VrPVmN8zph5V4AtHwIuHhvMXsKf73UT3BOD+azBIW+3wOJ4FhEH7zyaJCFvChjYvMA==,
      }
    engines: { "0": node >=0.6.0 }

  fast-deep-equal@3.1.3:
    resolution:
      {
        integrity: sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==,
      }

  fast-glob@3.3.3:
    resolution:
      {
        integrity: sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==,
      }
    engines: { node: ">=8.6.0" }

  fast-json-stable-stringify@2.1.0:
    resolution:
      {
        integrity: sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==,
      }

  fast-levenshtein@2.0.6:
    resolution:
      {
        integrity: sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==,
      }

  fastq@1.20.1:
    resolution:
      {
        integrity: sha512-GGToxJ/w1x32s/D2EKND7kTil4n8OVk/9mycTc4VDza13lOvpUZTGX3mFSCtV9ksdGBVzvsyAVLM6mHFThxXxw==,
      }

  fd-slicer@1.1.0:
    resolution:
      {
        integrity: sha512-cE1qsB/VwyQozZ+q1dGxR8LBYNZeofhEdUNGSMbQD3Gw2lAzX9Zb3uIU6Ebc/Fmyjo9AWWfnn0AUCHqtevs/8g==,
      }

  fdir@6.5.0:
    resolution:
      {
        integrity: sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==,
      }
    engines: { node: ">=12.0.0" }
    peerDependencies:
      picomatch: ^3 || ^4
    peerDependenciesMeta:
      picomatch:
        optional: true

  file-entry-cache@8.0.0:
    resolution:
      {
        integrity: sha512-XXTUwCvisa5oacNGRP9SfNtYBNAMi+RPwBFmblZEF7N7swHYQS6/Zfk7SRwx4D5j3CH211YNRco1DEMNVfZCnQ==,
      }
    engines: { node: ">=16.0.0" }

  file-uri-to-path@1.0.0:
    resolution:
      {
        integrity: sha512-0Zt+s3L7Vf1biwWZ29aARiVYLx7iMGnEUl9x33fbB/j3jR81u/O2LbqK+Bm1CDSNDKVtJ/YjwY7TUd5SkeLQLw==,
      }

  filelist@1.0.6:
    resolution:
      {
        integrity: sha512-5giy2PkLYY1cP39p17Ech+2xlpTRL9HLspOfEgm0L6CwBXBTgsK5ou0JtzYuepxkaQ/tvhCFIJ5uXo0OrM2DxA==,
      }

  fill-range@7.1.1:
    resolution:
      {
        integrity: sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==,
      }
    engines: { node: ">=8" }

  finalhandler@2.1.1:
    resolution:
      {
        integrity: sha512-S8KoZgRZN+a5rNwqTxlZZePjT/4cnm0ROV70LedRHZ0p8u9fRID0hJUZQpkKLzro8LfmC8sx23bY6tVNxv8pQA==,
      }
    engines: { node: ">= 18.0.0" }

  find-up@5.0.0:
    resolution:
      {
        integrity: sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==,
      }
    engines: { node: ">=10" }

  flat-cache@4.0.1:
    resolution:
      {
        integrity: sha512-f7ccFPK3SXFHpx15UIGyRJ/FJQctuKZ0zVuN3frBo4HnK3cay9VEW0R6yPYFHC0AgqhukPzKjq22t5DmAyqGyw==,
      }
    engines: { node: ">=16" }

  flatted@3.4.2:
    resolution:
      {
        integrity: sha512-PjDse7RzhcPkIJwy5t7KPWQSZ9cAbzQXcafsetQoD7sOJRQlGikNbx7yZp2OotDnJyrDcbyRq3Ttb18iYOqkxA==,
      }

  form-data@4.0.5:
    resolution:
      {
        integrity: sha512-8RipRLol37bNs2bhoV67fiTEvdTrbMUYcFTiy3+wuuOnUog2QBHCZWXDRijWQfAkhBj2Uf5UnVaiWwA5vdd82w==,
      }
    engines: { node: ">= 6" }

  forwarded@0.2.0:
    resolution:
      {
        integrity: sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==,
      }
    engines: { node: ">= 0.6" }

  fraction.js@5.3.4:
    resolution:
      {
        integrity: sha512-1X1NTtiJphryn/uLQz3whtY6jK3fTqoE3ohKs0tT+Ujr1W59oopxmoEh7Lu5p6vBaPbgoM0bzveAW4Qi5RyWDQ==,
      }

  fresh@2.0.0:
    resolution:
      {
        integrity: sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==,
      }
    engines: { node: ">= 0.8" }

  fs-constants@1.0.0:
    resolution:
      {
        integrity: sha512-y6OAwoSIf7FyjMIv94u+b5rdheZEjzR63GTyZJm5qh4Bi+2YgwLCcI/fPFZkL5PSixOt6ZNKm+w+Hfp/Bciwow==,
      }

  fs-extra@10.1.0:
    resolution:
      {
        integrity: sha512-oRXApq54ETRj4eMiFzGnHWGy+zo5raudjuxN0b8H7s/RU2oW0Wvsx9O0ACRN/kRq9E8Vu/ReskGB5o3ji+FzHQ==,
      }
    engines: { node: ">=12" }

  fs-extra@11.3.4:
    resolution:
      {
        integrity: sha512-CTXd6rk/M3/ULNQj8FBqBWHYBVYybQ3VPBw0xGKFe3tuH7ytT6ACnvzpIQ3UZtB8yvUKC2cXn1a+x+5EVQLovA==,
      }
    engines: { node: ">=14.14" }

  fs-extra@7.0.1:
    resolution:
      {
        integrity: sha512-YJDaCJZEnBmcbw13fvdAM9AwNOJwOzrE4pqMqBq5nFiEqXUqHwlK4B+3pUw6JNvfSPtX05xFHtYy/1ni01eGCw==,
      }
    engines: { node: ">=6 <7 || >=8" }

  fs-extra@8.1.0:
    resolution:
      {
        integrity: sha512-yhlQgA6mnOJUKOsRUFsgJdQCvkKhcz8tlZG5HBQfReYZy46OwLcY+Zia0mtdHsOo9y/hP+CxMN0TU9QxoOtG4g==,
      }
    engines: { node: ">=6 <7 || >=8" }

  fs-extra@9.1.0:
    resolution:
      {
        integrity: sha512-hcg3ZmepS30/7BSFqRvoo3DOMQu7IjqxO5nCDt+zM9XWjb33Wg7ziNT+Qvqbuc3+gWpzO02JubVyk2G4Zvo1OQ==,
      }
    engines: { node: ">=10" }

  fs.realpath@1.0.0:
    resolution:
      {
        integrity: sha512-OO0pH2lK6a0hZnAdau5ItzHPI6pUlvI7jMVnxUQRtw4owF2wk8lOSabtGDCTP4Ggrg2MbGnWO9X8K1t4+fGMDw==,
      }

  fsevents@2.3.3:
    resolution:
      {
        integrity: sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==,
      }
    engines: { node: ^8.16.0 || ^10.6.0 || >=11.0.0 }
    os: [darwin]

  function-bind@1.1.2:
    resolution:
      {
        integrity: sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==,
      }

  gensync@1.0.0-beta.2:
    resolution:
      {
        integrity: sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==,
      }
    engines: { node: ">=6.9.0" }

  get-caller-file@2.0.5:
    resolution:
      {
        integrity: sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==,
      }
    engines: { node: 6.* || 8.* || >= 10.* }

  get-intrinsic@1.3.0:
    resolution:
      {
        integrity: sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==,
      }
    engines: { node: ">= 0.4" }

  get-nonce@1.0.1:
    resolution:
      {
        integrity: sha512-FJhYRoDaiatfEkUK8HKlicmu/3SGFD51q3itKDGoSTysQJBnfOcxU5GxnhE1E6soB76MbT0MBtnKJuXyAx+96Q==,
      }
    engines: { node: ">=6" }

  get-proto@1.0.1:
    resolution:
      {
        integrity: sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==,
      }
    engines: { node: ">= 0.4" }

  get-stream@5.2.0:
    resolution:
      {
        integrity: sha512-nBF+F1rAZVCu/p7rjzgA+Yb4lfYXrpl7a6VmJrU8wF9I1CKvP/QwPNZHnOlwbTkY6dvtFIzFMSyQXbLoTQPRpA==,
      }
    engines: { node: ">=8" }

  get-tsconfig@4.14.0:
    resolution:
      {
        integrity: sha512-yTb+8DXzDREzgvYmh6s9vHsSVCHeC0G3PI5bEXNBHtmshPnO+S5O7qgLEOn0I5QvMy6kpZN8K1NKGyilLb93wA==,
      }

  github-from-package@0.0.0:
    resolution:
      {
        integrity: sha512-SyHy3T1v2NUXn29OsWdxmK6RwHD+vkj3v8en8AOBZ1wBQ/hCAQ5bAQTD02kW4W9tUp/3Qh6J8r9EvntiyCmOOw==,
      }

  glob-parent@5.1.2:
    resolution:
      {
        integrity: sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==,
      }
    engines: { node: ">= 6" }

  glob-parent@6.0.2:
    resolution:
      {
        integrity: sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==,
      }
    engines: { node: ">=10.13.0" }

  glob@7.2.3:
    resolution:
      {
        integrity: sha512-nFR0zLpU2YCaRxwoCJvL6UvCH2JFyFVIvwTLsIf21AuHlMskA1hhTdk+LlYJtOlYt9v6dvszD2BGRqBL+iQK9Q==,
      }
    deprecated: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

  global-agent@3.0.0:
    resolution:
      {
        integrity: sha512-PT6XReJ+D07JvGoxQMkT6qji/jVNfX/h364XHZOWeRzy64sSFr+xJ5OX7LI3b4MPQzdL4H8Y8M0xzPpsVMwA8Q==,
      }
    engines: { node: ">=10.0" }

  globals@14.0.0:
    resolution:
      {
        integrity: sha512-oahGvuMGQlPw/ivIYBjVSrWAfWLBeku5tpPE2fOPLi+WHffIWbuh2tCjhyQhTBPMf5E9jDEH4FOmTYgYwbKwtQ==,
      }
    engines: { node: ">=18" }

  globals@16.5.0:
    resolution:
      {
        integrity: sha512-c/c15i26VrJ4IRt5Z89DnIzCGDn9EcebibhAOjw5ibqEHsE1wLUgkPn9RDmNcUKyU87GeaL633nyJ+pplFR2ZQ==,
      }
    engines: { node: ">=18" }

  globalthis@1.0.4:
    resolution:
      {
        integrity: sha512-DpLKbNU4WylpxJykQujfCcwYWiV/Jhm50Goo0wrVILAv5jOr9d+H+UR3PhSCD2rCCEIg0uc+G+muBTwD54JhDQ==,
      }
    engines: { node: ">= 0.4" }

  gopd@1.2.0:
    resolution:
      {
        integrity: sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==,
      }
    engines: { node: ">= 0.4" }

  got@11.8.6:
    resolution:
      {
        integrity: sha512-6tfZ91bOr7bOXnK7PRDCGBLa1H4U080YHNaAQ2KsMGlLEzRbk44nsZF2E1IeRc3vtJHPVbKCYgdFbaGO2ljd8g==,
      }
    engines: { node: ">=10.19.0" }

  graceful-fs@4.2.11:
    resolution:
      {
        integrity: sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==,
      }

  has-flag@4.0.0:
    resolution:
      {
        integrity: sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==,
      }
    engines: { node: ">=8" }

  has-property-descriptors@1.0.2:
    resolution:
      {
        integrity: sha512-55JNKuIW+vq4Ke1BjOTjM2YctQIvCT7GFzHwmfZPGo5wnrgkid0YQtnAleFSqumZm4az3n2BS+erby5ipJdgrg==,
      }

  has-symbols@1.1.0:
    resolution:
      {
        integrity: sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==,
      }
    engines: { node: ">= 0.4" }

  has-tostringtag@1.0.2:
    resolution:
      {
        integrity: sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==,
      }
    engines: { node: ">= 0.4" }

  hasown@2.0.3:
    resolution:
      {
        integrity: sha512-ej4AhfhfL2Q2zpMmLo7U1Uv9+PyhIZpgQLGT1F9miIGmiCJIoCgSmczFdrc97mWT4kVY72KA+WnnhJ5pghSvSg==,
      }
    engines: { node: ">= 0.4" }

  hosted-git-info@4.1.0:
    resolution:
      {
        integrity: sha512-kyCuEOWjJqZuDbRHzL8V93NzQhwIB71oFWSyzVo+KPZI+pnQPPxucdkrOZvkLRnrf5URsQM+IJ09Dw29cRALIA==,
      }
    engines: { node: ">=10" }

  http-cache-semantics@4.2.0:
    resolution:
      {
        integrity: sha512-dTxcvPXqPvXBQpq5dUr6mEMJX4oIEFv6bwom3FDwKRDsuIjjJGANqhBuoAn9c1RQJIdAKav33ED65E2ys+87QQ==,
      }

  http-errors@2.0.1:
    resolution:
      {
        integrity: sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==,
      }
    engines: { node: ">= 0.8" }

  http-proxy-agent@7.0.2:
    resolution:
      {
        integrity: sha512-T1gkAiYYDWYx3V5Bmyu7HcfcvL7mUrTWiM6yOfa3PIphViJ/gFPbvidQ+veqSOHci/PxBcDabeUNCzpOODJZig==,
      }
    engines: { node: ">= 14" }

  http2-wrapper@1.0.3:
    resolution:
      {
        integrity: sha512-V+23sDMr12Wnz7iTcDeJr3O6AIxlnvT/bmaAAAP/Xda35C90p9599p0F1eHR/N1KILWSoWVAiOMFjBBXaXSMxg==,
      }
    engines: { node: ">=10.19.0" }

  https-proxy-agent@7.0.6:
    resolution:
      {
        integrity: sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==,
      }
    engines: { node: ">= 14" }

  iconv-corefoundation@1.1.7:
    resolution:
      {
        integrity: sha512-T10qvkw0zz4wnm560lOEg0PovVqUXuOFhhHAkixw8/sycy7TJt7v/RrkEKEQnAw2viPSJu6iAkErxnzR0g8PpQ==,
      }
    engines: { node: ^8.11.2 || >=10 }
    os: [darwin]

  iconv-lite@0.6.3:
    resolution:
      {
        integrity: sha512-4fCk79wshMdzMp2rH06qWrJE4iolqLhCUH+OiuIgU++RB0+94NlDL81atO7GX55uUKueo0txHNtvEyI6D7WdMw==,
      }
    engines: { node: ">=0.10.0" }

  iconv-lite@0.7.2:
    resolution:
      {
        integrity: sha512-im9DjEDQ55s9fL4EYzOAv0yMqmMBSZp6G0VvFyTMPKWxiSBHUj9NW/qqLmXUwXrrM7AvqSlTCfvqRb0cM8yYqw==,
      }
    engines: { node: ">=0.10.0" }

  ieee754@1.2.1:
    resolution:
      {
        integrity: sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==,
      }

  ignore@5.3.2:
    resolution:
      {
        integrity: sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==,
      }
    engines: { node: ">= 4" }

  ignore@7.0.5:
    resolution:
      {
        integrity: sha512-Hs59xBNfUIunMFgWAbGX5cq6893IbWg4KnrjbYwX3tx0ztorVgTDA6B2sxf8ejHJ4wz8BqGUMYlnzNBer5NvGg==,
      }
    engines: { node: ">= 4" }

  import-fresh@3.3.1:
    resolution:
      {
        integrity: sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==,
      }
    engines: { node: ">=6" }

  imurmurhash@0.1.4:
    resolution:
      {
        integrity: sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==,
      }
    engines: { node: ">=0.8.19" }

  inflight@1.0.6:
    resolution:
      {
        integrity: sha512-k92I/b08q4wvFscXCLvqfsHCrjrF7yiXsQuIVvVE7N82W3+aqpzuUdBbfhWcy/FZR3/4IgflMgKLOsvPDrGCJA==,
      }
    deprecated: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.

  inherits@2.0.4:
    resolution:
      {
        integrity: sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==,
      }

  ini@1.3.8:
    resolution:
      {
        integrity: sha512-JV/yugV2uzW5iMRSiZAyDtQd+nxtUnjeLt0acNdw98kKLrvuRVyB80tsREOE7yvGVgalhZ6RNXCmEHkUKBKxew==,
      }

  ipaddr.js@1.9.1:
    resolution:
      {
        integrity: sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==,
      }
    engines: { node: ">= 0.10" }

  is-binary-path@2.1.0:
    resolution:
      {
        integrity: sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==,
      }
    engines: { node: ">=8" }

  is-core-module@2.16.1:
    resolution:
      {
        integrity: sha512-UfoeMA6fIJ8wTYFEUjelnaGI67v6+N7qXJEvQuIGa99l4xsCruSYOVSQ0uPANn4dAzm8lkYPaKLrrijLq7x23w==,
      }
    engines: { node: ">= 0.4" }

  is-extglob@2.1.1:
    resolution:
      {
        integrity: sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==,
      }
    engines: { node: ">=0.10.0" }

  is-fullwidth-code-point@3.0.0:
    resolution:
      {
        integrity: sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==,
      }
    engines: { node: ">=8" }

  is-glob@4.0.3:
    resolution:
      {
        integrity: sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==,
      }
    engines: { node: ">=0.10.0" }

  is-number@7.0.0:
    resolution:
      {
        integrity: sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==,
      }
    engines: { node: ">=0.12.0" }

  is-promise@4.0.0:
    resolution:
      {
        integrity: sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==,
      }

  isbinaryfile@4.0.10:
    resolution:
      {
        integrity: sha512-iHrqe5shvBUcFbmZq9zOQHBoeOhZJu6RQGrDpBgenUm/Am+F3JM2MgQj+rK3Z601fzrL5gLZWtAPH2OBaSVcyw==,
      }
    engines: { node: ">= 8.0.0" }

  isbinaryfile@5.0.7:
    resolution:
      {
        integrity: sha512-gnWD14Jh3FzS3CPhF0AxNOJ8CxqeblPTADzI38r0wt8ZyQl5edpy75myt08EG2oKvpyiqSqsx+Wkz9vtkbTqYQ==,
      }
    engines: { node: ">= 18.0.0" }

  isexe@2.0.0:
    resolution:
      {
        integrity: sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==,
      }

  isexe@3.1.5:
    resolution:
      {
        integrity: sha512-6B3tLtFqtQS4ekarvLVMZ+X+VlvQekbe4taUkf/rhVO3d/h0M2rfARm/pXLcPEsjjMsFgrFgSrhQIxcSVrBz8w==,
      }
    engines: { node: ">=18" }

  isexe@4.0.0:
    resolution:
      {
        integrity: sha512-FFUtZMpoZ8RqHS3XeXEmHWLA4thH+ZxCv2lOiPIn1Xc7CxrqhWzNSDzD+/chS/zbYezmiwWLdQC09JdQKmthOw==,
      }
    engines: { node: ">=20" }

  jake@10.9.4:
    resolution:
      {
        integrity: sha512-wpHYzhxiVQL+IV05BLE2Xn34zW1S223hvjtqk0+gsPrwd/8JNLXJgZZM/iPFsYc1xyphF+6M6EvdE5E9MBGkDA==,
      }
    engines: { node: ">=10" }
    hasBin: true

  jiti@1.21.7:
    resolution:
      {
        integrity: sha512-/imKNG4EbWNrVjoNC/1H5/9GFy+tqjGBHCaSsN+P2RnPqjsLmv6UD3Ej+Kj8nBWaRAwyk7kK5ZUc+OEatnTR3A==,
      }
    hasBin: true

  jiti@2.6.1:
    resolution:
      {
        integrity: sha512-ekilCSN1jwRvIbgeg/57YFh8qQDNbwDb9xT/qu2DAHbFFZUicIl4ygVaAvzveMhMVr3LnpSKTNnwt8PoOfmKhQ==,
      }
    hasBin: true

  js-tokens@4.0.0:
    resolution:
      {
        integrity: sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==,
      }

  js-yaml@4.1.1:
    resolution:
      {
        integrity: sha512-qQKT4zQxXl8lLwBtHMWwaTcGfFOZviOJet3Oy/xmGk2gZH677CJM9EvtfdSkgWcATZhj/55JZ0rmy3myCT5lsA==,
      }
    hasBin: true

  jsesc@3.1.0:
    resolution:
      {
        integrity: sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==,
      }
    engines: { node: ">=6" }
    hasBin: true

  json-buffer@3.0.1:
    resolution:
      {
        integrity: sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==,
      }

  json-schema-traverse@0.4.1:
    resolution:
      {
        integrity: sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==,
      }

  json-stable-stringify-without-jsonify@1.0.1:
    resolution:
      {
        integrity: sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==,
      }

  json-stringify-safe@5.0.1:
    resolution:
      {
        integrity: sha512-ZClg6AaYvamvYEE82d3Iyd3vSSIjQ+odgjaTzRuO3s7toCdFKczob2i0zCh7JE8kWn17yvAWhUVxvqGwUalsRA==,
      }

  json5@2.2.3:
    resolution:
      {
        integrity: sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==,
      }
    engines: { node: ">=6" }
    hasBin: true

  jsonfile@4.0.0:
    resolution:
      {
        integrity: sha512-m6F1R3z8jjlf2imQHS2Qez5sjKWQzbuuhuJ/FKYFRZvPE3PuHcSMVZzfsLhGVOkfd20obL5SWEBew5ShlquNxg==,
      }

  jsonfile@6.2.1:
    resolution:
      {
        integrity: sha512-zwOTdL3rFQ/lRdBnntKVOX6k5cKJwEc1HdilT71BWEu7J41gXIB2MRp+vxduPSwZJPWBxEzv4yH1wYLJGUHX4Q==,
      }

  keyv@4.5.4:
    resolution:
      {
        integrity: sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==,
      }

  lazy-val@1.0.5:
    resolution:
      {
        integrity: sha512-0/BnGCCfyUMkBpeDgWihanIAF9JmZhHBgUhEqzvf+adhNGLoP6TaiI5oF8oyb3I45P+PcnrqihSf01M0l0G5+Q==,
      }

  levn@0.4.1:
    resolution:
      {
        integrity: sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==,
      }
    engines: { node: ">= 0.8.0" }

  lilconfig@3.1.3:
    resolution:
      {
        integrity: sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==,
      }
    engines: { node: ">=14" }

  lines-and-columns@1.2.4:
    resolution:
      {
        integrity: sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==,
      }

  locate-path@6.0.0:
    resolution:
      {
        integrity: sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==,
      }
    engines: { node: ">=10" }

  lodash.merge@4.6.2:
    resolution:
      {
        integrity: sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==,
      }

  lodash@4.18.1:
    resolution:
      {
        integrity: sha512-dMInicTPVE8d1e5otfwmmjlxkZoUpiVLwyeTdUsi/Caj/gfzzblBcCE5sRHV/AsjuCmxWrte2TNGSYuCeCq+0Q==,
      }

  lowercase-keys@2.0.0:
    resolution:
      {
        integrity: sha512-tqNXrS78oMOE73NMxK4EMLQsQowWf8jKooH9g7xPavRT706R6bkQJ6DY2Te7QukaZsulxa30wQ7bk0pm4XiHmA==,
      }
    engines: { node: ">=8" }

  lru-cache@5.1.1:
    resolution:
      {
        integrity: sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==,
      }

  lru-cache@6.0.0:
    resolution:
      {
        integrity: sha512-Jo6dJ04CmSjuznwJSS3pUeWmd/H0ffTlkXXgwZi+eq1UCmqQwCh+eLsYOYCwY991i2Fah4h1BEMCx4qThGbsiA==,
      }
    engines: { node: ">=10" }

  lucide-react@0.552.0:
    resolution:
      {
        integrity: sha512-g9WCjmfwqbexSnZE+2cl21PCfXOcqnGeWeMTNAOGEfpPbm/ZF4YIq77Z8qWrxbu660EKuLB4nSLggoKnCb+isw==,
      }
    peerDependencies:
      react: ^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0

  magic-string@0.30.21:
    resolution:
      {
        integrity: sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==,
      }

  matcher@3.0.0:
    resolution:
      {
        integrity: sha512-OkeDaAZ/bQCxeFAozM55PKcKU0yJMPGifLwV4Qgjitu+5MoAfSQN4lsLJeXZ1b8w0x+/Emda6MZgXS1jvsapng==,
      }
    engines: { node: ">=10" }

  math-intrinsics@1.1.0:
    resolution:
      {
        integrity: sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==,
      }
    engines: { node: ">= 0.4" }

  media-typer@0.3.0:
    resolution:
      {
        integrity: sha512-dq+qelQ9akHpcOl/gUVRTxVIOkAJ1wR3QAvb4RsVjS8oVoFjDGTc679wJYmUmknUF5HwMLOgb5O+a3KxfWapPQ==,
      }
    engines: { node: ">= 0.6" }

  media-typer@1.1.0:
    resolution:
      {
        integrity: sha512-aisnrDP4GNe06UcKFnV5bfMNPBUw4jsLGaWwWfnH3v02GnBuXX2MCVn5RbrWo0j3pczUilYblq7fQ7Nw2t5XKw==,
      }
    engines: { node: ">= 0.8" }

  merge-descriptors@2.0.0:
    resolution:
      {
        integrity: sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==,
      }
    engines: { node: ">=18" }

  merge2@1.4.1:
    resolution:
      {
        integrity: sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==,
      }
    engines: { node: ">= 8" }

  micromatch@4.0.8:
    resolution:
      {
        integrity: sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==,
      }
    engines: { node: ">=8.6" }

  mime-db@1.52.0:
    resolution:
      {
        integrity: sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==,
      }
    engines: { node: ">= 0.6" }

  mime-db@1.54.0:
    resolution:
      {
        integrity: sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==,
      }
    engines: { node: ">= 0.6" }

  mime-types@2.1.35:
    resolution:
      {
        integrity: sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==,
      }
    engines: { node: ">= 0.6" }

  mime-types@3.0.2:
    resolution:
      {
        integrity: sha512-Lbgzdk0h4juoQ9fCKXW4by0UJqj+nOOrI9MJ1sSj4nI8aI2eo1qmvQEie4VD1glsS250n15LsWsYtCugiStS5A==,
      }
    engines: { node: ">=18" }

  mime@2.6.0:
    resolution:
      {
        integrity: sha512-USPkMeET31rOMiarsBNIHZKLGgvKc/LrjofAnBlOttf5ajRvqiRA8QsenbcooctK6d6Ts6aqZXBA+XbkKthiQg==,
      }
    engines: { node: ">=4.0.0" }
    hasBin: true

  mimic-response@1.0.1:
    resolution:
      {
        integrity: sha512-j5EctnkH7amfV/q5Hgmoal1g2QHFJRraOtmx0JpIqkxhBhI/lJSl1nMpQ45hVarwNETOoWEimndZ4QK0RHxuxQ==,
      }
    engines: { node: ">=4" }

  mimic-response@3.1.0:
    resolution:
      {
        integrity: sha512-z0yWI+4FDrrweS8Zmt4Ej5HdJmky15+L2e6Wgn3+iK5fWzb6T3fhNFq2+MeTRb064c6Wr4N/wv0DzQTjNzHNGQ==,
      }
    engines: { node: ">=10" }

  minimatch@10.2.5:
    resolution:
      {
        integrity: sha512-MULkVLfKGYDFYejP07QOurDLLQpcjk7Fw+7jXS2R2czRQzR56yHRveU5NDJEOviH+hETZKSkIk5c+T23GjFUMg==,
      }
    engines: { node: 18 || 20 || >=22 }

  minimatch@3.1.5:
    resolution:
      {
        integrity: sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==,
      }

  minimatch@5.1.9:
    resolution:
      {
        integrity: sha512-7o1wEA2RyMP7Iu7GNba9vc0RWWGACJOCZBJX2GJWip0ikV+wcOsgVuY9uE8CPiyQhkGFSlhuSkZPavN7u1c2Fw==,
      }
    engines: { node: ">=10" }

  minimatch@9.0.9:
    resolution:
      {
        integrity: sha512-OBwBN9AL4dqmETlpS2zasx+vTeWclWzkblfZk7KTA5j3jeOONz/tRCnZomUyvNg83wL5Zv9Ss6HMJXAgL8R2Yg==,
      }
    engines: { node: ">=16 || 14 >=14.17" }

  minimist@1.2.8:
    resolution:
      {
        integrity: sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==,
      }

  minipass@7.1.3:
    resolution:
      {
        integrity: sha512-tEBHqDnIoM/1rXME1zgka9g6Q2lcoCkxHLuc7ODJ5BxbP5d4c2Z5cGgtXAku59200Cx7diuHTOYfSBD8n6mm8A==,
      }
    engines: { node: ">=16 || 14 >=14.17" }

  minizlib@3.1.0:
    resolution:
      {
        integrity: sha512-KZxYo1BUkWD2TVFLr0MQoM8vUUigWD3LlD83a/75BqC+4qE0Hb1Vo5v1FgcfaNXvfXzr+5EhQ6ing/CaBijTlw==,
      }
    engines: { node: ">= 18" }

  mkdirp-classic@0.5.3:
    resolution:
      {
        integrity: sha512-gKLcREMhtuZRwRAfqP3RFW+TK4JqApVBtOIftVgjuABpAtpxhPGaDcfvbhNvD0B8iD1oUr/txX35NjcaY6Ns/A==,
      }

  mkdirp@0.5.6:
    resolution:
      {
        integrity: sha512-FP+p8RB8OWpF3YZBCrP5gtADmtXApB5AMLn+vdyA+PyxCjrCs00mjyUozssO33cwDeT3wNGdLxJ5M//YqtHAJw==,
      }
    hasBin: true

  ms@2.1.3:
    resolution:
      {
        integrity: sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==,
      }

  multer@2.1.1:
    resolution:
      {
        integrity: sha512-mo+QTzKlx8R7E5ylSXxWzGoXoZbOsRMpyitcht8By2KHvMbf3tjwosZ/Mu/XYU6UuJ3VZnODIrak5ZrPiPyB6A==,
      }
    engines: { node: ">= 10.16.0" }

  mz@2.7.0:
    resolution:
      {
        integrity: sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==,
      }

  nanoid@3.3.12:
    resolution:
      {
        integrity: sha512-ZB9RH/39qpq5Vu6Y+NmUaFhQR6pp+M2Xt76XBnEwDaGcVAqhlvxrl3B2bKS5D3NH3QR76v3aSrKaF/Kiy7lEtQ==,
      }
    engines: { node: ^10 || ^12 || ^13.7 || ^14 || >=15.0.1 }
    hasBin: true

  napi-build-utils@2.0.0:
    resolution:
      {
        integrity: sha512-GEbrYkbfF7MoNaoh2iGG84Mnf/WZfB0GdGEsM8wz7Expx/LlWf5U8t9nvJKXSp3qr5IsEbK04cBGhol/KwOsWA==,
      }

  natural-compare@1.4.0:
    resolution:
      {
        integrity: sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==,
      }

  negotiator@1.0.0:
    resolution:
      {
        integrity: sha512-8Ofs/AUQh8MaEcrlq5xOX0CQ9ypTF5dl78mjlMNfOK08fzpgTHQRQPBxcPlEtIw0yRpws+Zo/3r+5WRby7u3Gg==,
      }
    engines: { node: ">= 0.6" }

  node-abi@3.90.0:
    resolution:
      {
        integrity: sha512-pZNQT7UnYlMwMBy5N1lV5X/YLTbZM5ncytN3xL7CHEzhDN8uVe0u55yaPUJICIJjaCW8NrM5BFdqr7HLweStNA==,
      }
    engines: { node: ">=10" }

  node-abi@4.29.0:
    resolution:
      {
        integrity: sha512-bGc7hHz6lrdpMqH3XqfiHc5PKzEhjgUj6OLpTXynkLi9JZKyMByI/tdpm4Liu6O2BjtE1lakBWXjOQS1EnSQLQ==,
      }
    engines: { node: ">=22.12.0" }

  node-addon-api@1.7.2:
    resolution:
      {
        integrity: sha512-ibPK3iA+vaY1eEjESkQkM0BbCqFOaZMiXRTtdB0u7b4djtY6JnsjvPdUHVMg6xQt3B8fpTTWHI9A+ADjM9frzg==,
      }

  node-api-version@0.2.1:
    resolution:
      {
        integrity: sha512-2xP/IGGMmmSQpI1+O/k72jF/ykvZ89JeuKX3TLJAYPDVLUalrshrLHkeVcCCZqG/eEa635cr8IBYzgnDvM2O8Q==,
      }

  node-gyp@12.3.0:
    resolution:
      {
        integrity: sha512-QNcUWM+HgJplcPzBvFBZ9VXacyGZ4+VTOb80PwWR+TlVzoHbRKULNEzpRsnaoxG3Wzr7Qh7BYxGDU3CbKib2Yg==,
      }
    engines: { node: ^20.17.0 || >=22.9.0 }
    hasBin: true

  node-releases@2.0.38:
    resolution:
      {
        integrity: sha512-3qT/88Y3FbH/Kx4szpQQ4HzUbVrHPKTLVpVocKiLfoYvw9XSGOX2FmD2d6DrXbVYyAQTF2HeF6My8jmzx7/CRw==,
      }

  nopt@9.0.0:
    resolution:
      {
        integrity: sha512-Zhq3a+yFKrYwSBluL4H9XP3m3y5uvQkB/09CwDruCiRmR/UJYnn9W4R48ry0uGC70aeTPKLynBtscP9efFFcPw==,
      }
    engines: { node: ^20.17.0 || >=22.9.0 }
    hasBin: true

  normalize-path@3.0.0:
    resolution:
      {
        integrity: sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==,
      }
    engines: { node: ">=0.10.0" }

  normalize-url@6.1.0:
    resolution:
      {
        integrity: sha512-DlL+XwOy3NxAQ8xuC0okPgK46iuVNAK01YN7RueYBqqFeGsBjV9XmCAzAdgt+667bCl5kPh9EqKKDwnaPG1I7A==,
      }
    engines: { node: ">=10" }

  object-assign@4.1.1:
    resolution:
      {
        integrity: sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==,
      }
    engines: { node: ">=0.10.0" }

  object-hash@3.0.0:
    resolution:
      {
        integrity: sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==,
      }
    engines: { node: ">= 6" }

  object-inspect@1.13.4:
    resolution:
      {
        integrity: sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==,
      }
    engines: { node: ">= 0.4" }

  object-keys@1.1.1:
    resolution:
      {
        integrity: sha512-NuAESUOUMrlIXOfHKzD6bpPu3tYt3xvjNdRIQ+FeT0lNb4K8WR70CaDxhuNguS2XG+GjkyMwOzsN5ZktImfhLA==,
      }
    engines: { node: ">= 0.4" }

  on-exit-leak-free@2.1.2:
    resolution:
      {
        integrity: sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA==,
      }
    engines: { node: ">=14.0.0" }

  on-finished@2.4.1:
    resolution:
      {
        integrity: sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==,
      }
    engines: { node: ">= 0.8" }

  once@1.4.0:
    resolution:
      {
        integrity: sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==,
      }

  optionator@0.9.4:
    resolution:
      {
        integrity: sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==,
      }
    engines: { node: ">= 0.8.0" }

  p-cancelable@2.1.1:
    resolution:
      {
        integrity: sha512-BZOr3nRQHOntUjTrH8+Lh54smKHoHyur8We1V8DSMVrl5A2malOOwuJRnKRDjSnkoeBh4at6BwEnb5I7Jl31wg==,
      }
    engines: { node: ">=8" }

  p-limit@3.1.0:
    resolution:
      {
        integrity: sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==,
      }
    engines: { node: ">=10" }

  p-locate@5.0.0:
    resolution:
      {
        integrity: sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==,
      }
    engines: { node: ">=10" }

  parent-module@1.0.1:
    resolution:
      {
        integrity: sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==,
      }
    engines: { node: ">=6" }

  parseurl@1.3.3:
    resolution:
      {
        integrity: sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==,
      }
    engines: { node: ">= 0.8" }

  path-exists@4.0.0:
    resolution:
      {
        integrity: sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==,
      }
    engines: { node: ">=8" }

  path-is-absolute@1.0.1:
    resolution:
      {
        integrity: sha512-AVbw3UJ2e9bq64vSaS9Am0fje1Pa8pbGqTTsmXfaIiMpnr5DlDhfJOuLj9Sf95ZPVDAUerDfEk88MPmPe7UCQg==,
      }
    engines: { node: ">=0.10.0" }

  path-key@3.1.1:
    resolution:
      {
        integrity: sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==,
      }
    engines: { node: ">=8" }

  path-parse@1.0.7:
    resolution:
      {
        integrity: sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==,
      }

  path-to-regexp@8.4.2:
    resolution:
      {
        integrity: sha512-qRcuIdP69NPm4qbACK+aDogI5CBDMi1jKe0ry5rSQJz8JVLsC7jV8XpiJjGRLLol3N+R5ihGYcrPLTno6pAdBA==,
      }

  pe-library@0.4.1:
    resolution:
      {
        integrity: sha512-eRWB5LBz7PpDu4PUlwT0PhnQfTQJlDDdPa35urV4Osrm0t0AqQFGn+UIkU3klZvwJ8KPO3VbBFsXquA6p6kqZw==,
      }
    engines: { node: ">=12", npm: ">=6" }

  pend@1.2.0:
    resolution:
      {
        integrity: sha512-F3asv42UuXchdzt+xXqfW1OGlVBe+mxa2mqI0pg5yAHZPvFmY3Y6drSf/GQ1A86WgWEN9Kzh/WrgKa6iGcHXLg==,
      }

  picocolors@1.1.1:
    resolution:
      {
        integrity: sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==,
      }

  picomatch@2.3.2:
    resolution:
      {
        integrity: sha512-V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==,
      }
    engines: { node: ">=8.6" }

  picomatch@4.0.4:
    resolution:
      {
        integrity: sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A==,
      }
    engines: { node: ">=12" }

  pify@2.3.0:
    resolution:
      {
        integrity: sha512-udgsAY+fTnvv7kI7aaxbqwWNb0AHiB0qBO89PZKPkoTmGOgdbrHDKD+0B2X4uTfJ/FT1R09r9gTsjUjNJotuog==,
      }
    engines: { node: ">=0.10.0" }

  pino-abstract-transport@3.0.0:
    resolution:
      {
        integrity: sha512-wlfUczU+n7Hy/Ha5j9a/gZNy7We5+cXp8YL+X+PG8S0KXxw7n/JXA3c46Y0zQznIJ83URJiwy7Lh56WLokNuxg==,
      }

  pino-http@11.0.0:
    resolution:
      {
        integrity: sha512-wqg5XIAGRRIWtTk8qPGxkbrfiwEWz1lgedVLvhLALudKXvg1/L2lTFgTGPJ4Z2e3qcRmxoFxDuSdMdMGNM6I1g==,
      }

  pino-std-serializers@7.1.0:
    resolution:
      {
        integrity: sha512-BndPH67/JxGExRgiX1dX0w1FvZck5Wa4aal9198SrRhZjH3GxKQUKIBnYJTdj2HDN3UQAS06HlfcSbQj2OHmaw==,
      }

  pino@10.3.1:
    resolution:
      {
        integrity: sha512-r34yH/GlQpKZbU1BvFFqOjhISRo1MNx1tWYsYvmj6KIRHSPMT2+yHOEb1SG6NMvRoHRF0a07kCOox/9yakl1vg==,
      }
    hasBin: true

  pirates@4.0.7:
    resolution:
      {
        integrity: sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==,
      }
    engines: { node: ">= 6" }

  plist@3.1.0:
    resolution:
      {
        integrity: sha512-uysumyrvkUX0rX/dEVqt8gC3sTBzd4zoWfLeS29nb53imdaXVvLINYXTI2GNqzaMuvacNx4uJQ8+b3zXR0pkgQ==,
      }
    engines: { node: ">=10.4.0" }

  plist@3.1.1:
    resolution:
      {
        integrity: sha512-ZIfcLJC+7E7FBFnDxm9MPmt7D+DidyQ26lewieO75AdhA2ayMtsJSES0iWzqJQbcVRSrTufQoy0DR94xHue0oA==,
      }
    engines: { node: ">=10.4.0" }

  postcss-import@15.1.0:
    resolution:
      {
        integrity: sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==,
      }
    engines: { node: ">=14.0.0" }
    peerDependencies:
      postcss: ^8.0.0

  postcss-js@4.1.0:
    resolution:
      {
        integrity: sha512-oIAOTqgIo7q2EOwbhb8UalYePMvYoIeRY2YKntdpFQXNosSu3vLrniGgmH9OKs/qAkfoj5oB3le/7mINW1LCfw==,
      }
    engines: { node: ^12 || ^14 || >= 16 }
    peerDependencies:
      postcss: ^8.4.21

  postcss-load-config@6.0.1:
    resolution:
      {
        integrity: sha512-oPtTM4oerL+UXmx+93ytZVN82RrlY/wPUV8IeDxFrzIjXOLF1pN+EmKPLbubvKHT2HC20xXsCAH2Z+CKV6Oz/g==,
      }
    engines: { node: ">= 18" }
    peerDependencies:
      jiti: ">=1.21.0"
      postcss: ">=8.0.9"
      tsx: ^4.8.1
      yaml: ^2.4.2
    peerDependenciesMeta:
      jiti:
        optional: true
      postcss:
        optional: true
      tsx:
        optional: true
      yaml:
        optional: true

  postcss-nested@6.2.0:
    resolution:
      {
        integrity: sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==,
      }
    engines: { node: ">=12.0" }
    peerDependencies:
      postcss: ^8.2.14

  postcss-selector-parser@6.1.2:
    resolution:
      {
        integrity: sha512-Q8qQfPiZ+THO/3ZrOrO0cJJKfpYCagtMUkXbnEfmgUjwXg6z/WBeOyS9APBBPCTSiDV+s4SwQGu8yFsiMRIudg==,
      }
    engines: { node: ">=4" }

  postcss-value-parser@4.2.0:
    resolution:
      {
        integrity: sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==,
      }

  postcss@8.5.13:
    resolution:
      {
        integrity: sha512-qif0+jGGZoLWdHey3UFHHWP0H7Gbmsk8T5VEqyYFbWqPr1XqvLGBbk/sl8V5exGmcYJklJOhOQq1pV9IcsiFag==,
      }
    engines: { node: ^10 || ^12 || >=14 }

  postject@1.0.0-alpha.6:
    resolution:
      {
        integrity: sha512-b9Eb8h2eVqNE8edvKdwqkrY6O7kAwmI8kcnBv1NScolYJbo59XUF0noFq+lxbC1yN20bmC0WBEbDC5H/7ASb0A==,
      }
    engines: { node: ">=14.0.0" }
    hasBin: true

  prebuild-install@7.1.3:
    resolution:
      {
        integrity: sha512-8Mf2cbV7x1cXPUILADGI3wuhfqWvtiLA1iclTDbFRZkgRQS0NqsPZphna9V+HyTEadheuPmjaJMsbzKQFOzLug==,
      }
    engines: { node: ">=10" }
    deprecated: No longer maintained. Please contact the author of the relevant native addon; alternatives are available.
    hasBin: true

  prelude-ls@1.2.1:
    resolution:
      {
        integrity: sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==,
      }
    engines: { node: ">= 0.8.0" }

  prettier@3.8.3:
    resolution:
      {
        integrity: sha512-7igPTM53cGHMW8xWuVTydi2KO233VFiTNyF5hLJqpilHfmn8C8gPf+PS7dUT64YcXFbiMGZxS9pCSxL/Dxm/Jw==,
      }
    engines: { node: ">=14" }
    hasBin: true

  proc-log@6.1.0:
    resolution:
      {
        integrity: sha512-iG+GYldRf2BQ0UDUAd6JQ/RwzaQy6mXmsk/IzlYyal4A4SNFw54MeH4/tLkF4I5WoWG9SQwuqWzS99jaFQHBuQ==,
      }
    engines: { node: ^20.17.0 || >=22.9.0 }

  process-warning@5.0.0:
    resolution:
      {
        integrity: sha512-a39t9ApHNx2L4+HBnQKqxxHNs1r7KF+Intd8Q/g1bUh6q0WIp9voPXJ/x0j+ZL45KF1pJd9+q2jLIRMfvEshkA==,
      }

  progress@2.0.3:
    resolution:
      {
        integrity: sha512-7PiHtLll5LdnKIMw100I+8xJXR5gW2QwWYkT6iJva0bXitZKa/XMrSbdmg3r2Xnaidz9Qumd0VPaMrZlF9V9sA==,
      }
    engines: { node: ">=0.4.0" }

  promise-retry@2.0.1:
    resolution:
      {
        integrity: sha512-y+WKFlBR8BGXnsNlIHFGPZmyDf3DFMoLhaflAnyZgV6rG6xu+JwesTo2Q9R6XwYmtmwAFCkAk3e35jEdoeh/3g==,
      }
    engines: { node: ">=10" }

  proper-lockfile@4.1.2:
    resolution:
      {
        integrity: sha512-TjNPblN4BwAWMXU8s9AEz4JmQxnD1NNL7bNOY/AKUzyamc379FWASUhc/K1pL2noVb+XmZKLL68cjzLsiOAMaA==,
      }

  proxy-addr@2.0.7:
    resolution:
      {
        integrity: sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==,
      }
    engines: { node: ">= 0.10" }

  pump@3.0.4:
    resolution:
      {
        integrity: sha512-VS7sjc6KR7e1ukRFhQSY5LM2uBWAUPiOPa/A3mkKmiMwSmRFUITt0xuj+/lesgnCv+dPIEYlkzrcyXgquIHMcA==,
      }

  punycode@2.3.1:
    resolution:
      {
        integrity: sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==,
      }
    engines: { node: ">=6" }

  qs@6.15.1:
    resolution:
      {
        integrity: sha512-6YHEFRL9mfgcAvql/XhwTvf5jKcOiiupt2FiJxHkiX1z4j7WL8J/jRHYLluORvc1XxB5rV20KoeK00gVJamspg==,
      }
    engines: { node: ">=0.6" }

  queue-microtask@1.2.3:
    resolution:
      {
        integrity: sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==,
      }

  quick-format-unescaped@4.0.4:
    resolution:
      {
        integrity: sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==,
      }

  quick-lru@5.1.1:
    resolution:
      {
        integrity: sha512-WuyALRjWPDGtt/wzJiadO5AXY+8hZ80hVpe6MyivgraREW751X3SbhRvG3eLKOYN+8VEvqLcf3wdnt44Z4S4SA==,
      }
    engines: { node: ">=10" }

  range-parser@1.2.1:
    resolution:
      {
        integrity: sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==,
      }
    engines: { node: ">= 0.6" }

  raw-body@3.0.2:
    resolution:
      {
        integrity: sha512-K5zQjDllxWkf7Z5xJdV0/B0WTNqx6vxG70zJE4N0kBs4LovmEYWJzQGxC9bS9RAKu3bgM40lrd5zoLJ12MQ5BA==,
      }
    engines: { node: ">= 0.10" }

  rc@1.2.8:
    resolution:
      {
        integrity: sha512-y3bGgqKj3QBdxLbLkomlohkvsA8gdAiUQlSBJnBhfn+BPxg4bc62d8TcBW15wavDfgexCgccckhcZvywyQYPOw==,
      }
    hasBin: true

  react-dom@19.2.5:
    resolution:
      {
        integrity: sha512-J5bAZz+DXMMwW/wV3xzKke59Af6CHY7G4uYLN1OvBcKEsWOs4pQExj86BBKamxl/Ik5bx9whOrvBlSDfWzgSag==,
      }
    peerDependencies:
      react: ^19.2.5

  react-refresh@0.18.0:
    resolution:
      {
        integrity: sha512-QgT5//D3jfjJb6Gsjxv0Slpj23ip+HtOpnNgnb2S5zU3CB26G/IDPGoy4RJB42wzFE46DRsstbW6tKHoKbhAxw==,
      }
    engines: { node: ">=0.10.0" }

  react-remove-scroll-bar@2.3.8:
    resolution:
      {
        integrity: sha512-9r+yi9+mgU33AKcj6IbT9oRCO78WriSj6t/cF8DWBZJ9aOGPOTEDvdUDz1FwKim7QXWwmHqtdHnRJfhAxEG46Q==,
      }
    engines: { node: ">=10" }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
    peerDependenciesMeta:
      "@types/react":
        optional: true

  react-remove-scroll@2.7.2:
    resolution:
      {
        integrity: sha512-Iqb9NjCCTt6Hf+vOdNIZGdTiH1QSqr27H/Ek9sv/a97gfueI/5h1s3yRi1nngzMUaOOToin5dI1dXKdXiF+u0Q==,
      }
    engines: { node: ">=10" }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  react-style-singleton@2.2.3:
    resolution:
      {
        integrity: sha512-b6jSvxvVnyptAiLjbkWLE/lOnR4lfTtDAl+eUC7RZy+QQWc6wRzIV2CE6xBuMmDxc2qIihtDCZD5NPOFl7fRBQ==,
      }
    engines: { node: ">=10" }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  react@19.2.5:
    resolution:
      {
        integrity: sha512-llUJLzz1zTUBrskt2pwZgLq59AemifIftw4aB7JxOqf1HY2FDaGDxgwpAPVzHU1kdWabH7FauP4i1oEeer2WCA==,
      }
    engines: { node: ">=0.10.0" }

  read-binary-file-arch@1.0.6:
    resolution:
      {
        integrity: sha512-BNg9EN3DD3GsDXX7Aa8O4p92sryjkmzYYgmgTAc6CA4uGLEDzFfxOxugu21akOxpcXHiEgsYkC6nPsQvLLLmEg==,
      }
    hasBin: true

  read-cache@1.0.0:
    resolution:
      {
        integrity: sha512-Owdv/Ft7IjOgm/i0xvNDZ1LrRANRfew4b2prF3OWMQLxLfu3bS8FVhCsrSCMK4lR56Y9ya+AThoTpDCTxCmpRA==,
      }

  readable-stream@3.6.2:
    resolution:
      {
        integrity: sha512-9u/sniCrY3D5WdsERHzHE4G2YCXqoG5FTHUiCC4SIbr6XcLZBY05ya9EKjYek9O5xOAwjGq+1JdGBAS7Q9ScoA==,
      }
    engines: { node: ">= 6" }

  readdirp@3.6.0:
    resolution:
      {
        integrity: sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==,
      }
    engines: { node: ">=8.10.0" }

  real-require@0.2.0:
    resolution:
      {
        integrity: sha512-57frrGM/OCTLqLOAh0mhVA9VBMHd+9U7Zb2THMGdBUoZVOtGbJzjxsYGDJ3A9AYYCP4hn6y1TVbaOfzWtm5GFg==,
      }
    engines: { node: ">= 12.13.0" }

  require-directory@2.1.1:
    resolution:
      {
        integrity: sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==,
      }
    engines: { node: ">=0.10.0" }

  resedit@1.7.2:
    resolution:
      {
        integrity: sha512-vHjcY2MlAITJhC0eRD/Vv8Vlgmu9Sd3LX9zZvtGzU5ZImdTN3+d6e/4mnTyV8vEbyf1sgNIrWxhWlrys52OkEA==,
      }
    engines: { node: ">=12", npm: ">=6" }

  resolve-alpn@1.2.1:
    resolution:
      {
        integrity: sha512-0a1F4l73/ZFZOakJnQ3FvkJ2+gSTQWz/r2KE5OdDY0TxPm5h4GkqkWWfM47T7HsbnOtcJVEF4epCVy6u7Q3K+g==,
      }

  resolve-from@4.0.0:
    resolution:
      {
        integrity: sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==,
      }
    engines: { node: ">=4" }

  resolve-pkg-maps@1.0.0:
    resolution:
      {
        integrity: sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==,
      }

  resolve@1.22.12:
    resolution:
      {
        integrity: sha512-TyeJ1zif53BPfHootBGwPRYT1RUt6oGWsaQr8UyZW/eAm9bKoijtvruSDEmZHm92CwS9nj7/fWttqPCgzep8CA==,
      }
    engines: { node: ">= 0.4" }
    hasBin: true

  responselike@2.0.1:
    resolution:
      {
        integrity: sha512-4gl03wn3hj1HP3yzgdI7d3lCkF95F21Pz4BPGvKHinyQzALR5CapwC8yIi0Rh58DEMQ/SguC03wFj2k0M/mHhw==,
      }

  retry@0.12.0:
    resolution:
      {
        integrity: sha512-9LkiTwjUh6rT555DtE9rTX+BKByPfrMzEAtnlEtdEwr3Nkffwiihqe2bWADg+OQRjt9gl6ICdmB/ZFDCGAtSow==,
      }
    engines: { node: ">= 4" }

  reusify@1.1.0:
    resolution:
      {
        integrity: sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==,
      }
    engines: { iojs: ">=1.0.0", node: ">=0.10.0" }

  rimraf@2.6.3:
    resolution:
      {
        integrity: sha512-mwqeW5XsA2qAejG46gYdENaxXjx9onRNCfn7L0duuP4hCuTIi/QO7PDK07KJfp1d+izWPrzEJDcSqBa0OZQriA==,
      }
    deprecated: Rimraf versions prior to v4 are no longer supported
    hasBin: true

  roarr@2.15.4:
    resolution:
      {
        integrity: sha512-CHhPh+UNHD2GTXNYhPWLnU8ONHdI+5DI+4EYIAOaiD63rHeYlZvyh8P+in5999TTSFgUYuKUAjzRI4mdh/p+2A==,
      }
    engines: { node: ">=8.0" }

  rollup@4.60.2:
    resolution:
      {
        integrity: sha512-J9qZyW++QK/09NyN/zeO0dG/1GdGfyp9lV8ajHnRVLfo/uFsbji5mHnDgn/qYdUHyCkM2N+8VyspgZclfAh0eQ==,
      }
    engines: { node: ">=18.0.0", npm: ">=8.0.0" }
    hasBin: true

  router@2.2.0:
    resolution:
      {
        integrity: sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==,
      }
    engines: { node: ">= 18" }

  run-parallel@1.2.0:
    resolution:
      {
        integrity: sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==,
      }

  safe-buffer@5.2.1:
    resolution:
      {
        integrity: sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==,
      }

  safe-stable-stringify@2.5.0:
    resolution:
      {
        integrity: sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA==,
      }
    engines: { node: ">=10" }

  safer-buffer@2.1.2:
    resolution:
      {
        integrity: sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==,
      }

  sanitize-filename@1.6.4:
    resolution:
      {
        integrity: sha512-9ZyI08PsvdQl2r/bBIGubpVdR3RR9sY6RDiWFPreA21C/EFlQhmgo20UZlNjZMMZNubusLhAQozkA0Od5J21Eg==,
      }

  sax@1.6.0:
    resolution:
      {
        integrity: sha512-6R3J5M4AcbtLUdZmRv2SygeVaM7IhrLXu9BmnOGmmACak8fiUtOsYNWUS4uK7upbmHIBbLBeFeI//477BKLBzA==,
      }
    engines: { node: ">=11.0.0" }

  scheduler@0.27.0:
    resolution:
      {
        integrity: sha512-eNv+WrVbKu1f3vbYJT/xtiF5syA5HPIMtf9IgY/nKg0sWqzAUEvqY/xm7OcZc/qafLx/iO9FgOmeSAp4v5ti/Q==,
      }

  semver-compare@1.0.0:
    resolution:
      {
        integrity: sha512-YM3/ITh2MJ5MtzaM429anh+x2jiLVjqILF4m4oyQB18W7Ggea7BfqdH/wGMK7dDiMghv/6WG7znWMwUDzJiXow==,
      }

  semver@5.7.2:
    resolution:
      {
        integrity: sha512-cBznnQ9KjJqU67B52RMC65CMarK2600WFnbkcaiwWq3xy/5haFJlshgnpjovMVJ+Hff49d8GEn0b87C5pDQ10g==,
      }
    hasBin: true

  semver@6.3.1:
    resolution:
      {
        integrity: sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==,
      }
    hasBin: true

  semver@7.7.4:
    resolution:
      {
        integrity: sha512-vFKC2IEtQnVhpT78h1Yp8wzwrf8CM+MzKMHGJZfBtzhZNycRFnXsHk6E5TxIkkMsgNS7mdX3AGB7x2QM2di4lA==,
      }
    engines: { node: ">=10" }
    hasBin: true

  send@1.2.1:
    resolution:
      {
        integrity: sha512-1gnZf7DFcoIcajTjTwjwuDjzuz4PPcY2StKPlsGAQ1+YH20IRVrBaXSWmdjowTJ6u8Rc01PoYOGHXfP1mYcZNQ==,
      }
    engines: { node: ">= 18" }

  serialize-error@7.0.1:
    resolution:
      {
        integrity: sha512-8I8TjW5KMOKsZQTvoxjuSIa7foAwPWGOts+6o7sgjz41/qMD9VQHEDxi6PBvK2l0MXUmqZyNpUK+T2tQaaElvw==,
      }
    engines: { node: ">=10" }

  serve-static@2.2.1:
    resolution:
      {
        integrity: sha512-xRXBn0pPqQTVQiC8wyQrKs2MOlX24zQ0POGaj0kultvoOCstBQM5yvOhAVSUwOMjQtTvsPWoNCHfPGwaaQJhTw==,
      }
    engines: { node: ">= 18" }

  setprototypeof@1.2.0:
    resolution:
      {
        integrity: sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==,
      }

  shebang-command@2.0.0:
    resolution:
      {
        integrity: sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==,
      }
    engines: { node: ">=8" }

  shebang-regex@3.0.0:
    resolution:
      {
        integrity: sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==,
      }
    engines: { node: ">=8" }

  side-channel-list@1.0.1:
    resolution:
      {
        integrity: sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==,
      }
    engines: { node: ">= 0.4" }

  side-channel-map@1.0.1:
    resolution:
      {
        integrity: sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==,
      }
    engines: { node: ">= 0.4" }

  side-channel-weakmap@1.0.2:
    resolution:
      {
        integrity: sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==,
      }
    engines: { node: ">= 0.4" }

  side-channel@1.1.0:
    resolution:
      {
        integrity: sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==,
      }
    engines: { node: ">= 0.4" }

  signal-exit@3.0.7:
    resolution:
      {
        integrity: sha512-wnD2ZE+l+SPC/uoS0vXeE9L1+0wuaMqKlfz9AMUo38JsyLSBWSFcHR1Rri62LZc12vLr1gb3jl7iwQhgwpAbGQ==,
      }

  simple-concat@1.0.1:
    resolution:
      {
        integrity: sha512-cSFtAPtRhljv69IK0hTVZQ+OfE9nePi/rtJmw5UjHeVyVroEqJXP1sFztKUy1qU+xvz3u/sfYJLa947b7nAN2Q==,
      }

  simple-get@4.0.1:
    resolution:
      {
        integrity: sha512-brv7p5WgH0jmQJr1ZDDfKDOSeWWg+OVypG99A/5vYGPqJ6pxiaHLy8nxtFjBA7oMa01ebA9gfh1uMCFqOuXxvA==,
      }

  simple-update-notifier@2.0.0:
    resolution:
      {
        integrity: sha512-a2B9Y0KlNXl9u/vsW6sTIu9vGEpfKu2wRV6l1H3XEas/0gUIzGzBoP/IouTcUQbm9JWZLH3COxyn03TYlFax6w==,
      }
    engines: { node: ">=10" }

  slice-ansi@3.0.0:
    resolution:
      {
        integrity: sha512-pSyv7bSTC7ig9Dcgbw9AuRNUb5k5V6oDudjZoMBSr13qpLBG7tB+zgCkARjq7xIUgdz5P1Qe8u+rSGdouOOIyQ==,
      }
    engines: { node: ">=8" }

  smart-buffer@4.2.0:
    resolution:
      {
        integrity: sha512-94hK0Hh8rPqQl2xXc3HsaBoOXKV20MToPkcXvwbISWLEs+64sBq5kFgn2kJDHb1Pry9yrP0dxrCI9RRci7RXKg==,
      }
    engines: { node: ">= 6.0.0", npm: ">= 3.0.0" }

  sonic-boom@4.2.1:
    resolution:
      {
        integrity: sha512-w6AxtubXa2wTXAUsZMMWERrsIRAdrK0Sc+FUytWvYAhBJLyuI4llrMIC1DtlNSdI99EI86KZum2MMq3EAZlF9Q==,
      }

  source-map-js@1.2.1:
    resolution:
      {
        integrity: sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==,
      }
    engines: { node: ">=0.10.0" }

  source-map-support@0.5.21:
    resolution:
      {
        integrity: sha512-uBHU3L3czsIyYXKX88fdrGovxdSCoTGDRZ6SYXtSRxLZUzHg5P/66Ht6uoUlHu9EZod+inXhKo3qQgwXUT/y1w==,
      }

  source-map@0.6.1:
    resolution:
      {
        integrity: sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==,
      }
    engines: { node: ">=0.10.0" }

  split2@4.2.0:
    resolution:
      {
        integrity: sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==,
      }
    engines: { node: ">= 10.x" }

  sprintf-js@1.1.3:
    resolution:
      {
        integrity: sha512-Oo+0REFV59/rz3gfJNKQiBlwfHaSESl1pcGyABQsnnIfWOFt6JNj5gCog2U6MLZ//IGYD+nA8nI+mTShREReaA==,
      }

  stat-mode@1.0.0:
    resolution:
      {
        integrity: sha512-jH9EhtKIjuXZ2cWxmXS8ZP80XyC3iasQxMDV8jzhNJpfDb7VbQLVW4Wvsxz9QZvzV+G4YoSfBUVKDOyxLzi/sg==,
      }
    engines: { node: ">= 6" }

  statuses@2.0.2:
    resolution:
      {
        integrity: sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==,
      }
    engines: { node: ">= 0.8" }

  streamsearch@1.1.0:
    resolution:
      {
        integrity: sha512-Mcc5wHehp9aXz1ax6bZUyY5afg9u2rv5cqQI3mRrYkGC8rW2hM02jWuwjtL++LS5qinSyhj2QfLyNsuc+VsExg==,
      }
    engines: { node: ">=10.0.0" }

  string-width@4.2.3:
    resolution:
      {
        integrity: sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==,
      }
    engines: { node: ">=8" }

  string_decoder@1.3.0:
    resolution:
      {
        integrity: sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==,
      }

  strip-ansi@6.0.1:
    resolution:
      {
        integrity: sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==,
      }
    engines: { node: ">=8" }

  strip-json-comments@2.0.1:
    resolution:
      {
        integrity: sha512-4gB8na07fecVVkOI6Rs4e7T6NOTki5EmL7TUduTs6bu3EdnSycntVJ4re8kgZA+wx9IueI2Y11bfbgwtzuE0KQ==,
      }
    engines: { node: ">=0.10.0" }

  strip-json-comments@3.1.1:
    resolution:
      {
        integrity: sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==,
      }
    engines: { node: ">=8" }

  sucrase@3.35.1:
    resolution:
      {
        integrity: sha512-DhuTmvZWux4H1UOnWMB3sk0sbaCVOoQZjv8u1rDoTV0HTdGem9hkAZtl4JZy8P2z4Bg0nT+YMeOFyVr4zcG5Tw==,
      }
    engines: { node: ">=16 || 14 >=14.17" }
    hasBin: true

  sumchecker@3.0.1:
    resolution:
      {
        integrity: sha512-MvjXzkz/BOfyVDkG0oFOtBxHX2u3gKbMHIF/dXblZsgD3BWOFLmHovIpZY7BykJdAjcqRCBi1WYBNdEC9yI7vg==,
      }
    engines: { node: ">= 8.0" }

  supports-color@7.2.0:
    resolution:
      {
        integrity: sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==,
      }
    engines: { node: ">=8" }

  supports-preserve-symlinks-flag@1.0.0:
    resolution:
      {
        integrity: sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==,
      }
    engines: { node: ">= 0.4" }

  tailwind-merge@3.5.0:
    resolution:
      {
        integrity: sha512-I8K9wewnVDkL1NTGoqWmVEIlUcB9gFriAEkXkfCjX5ib8ezGxtR3xD7iZIxrfArjEsH7F1CHD4RFUtxefdqV/A==,
      }

  tailwindcss@3.4.19:
    resolution:
      {
        integrity: sha512-3ofp+LL8E+pK/JuPLPggVAIaEuhvIz4qNcf3nA1Xn2o/7fb7s/TYpHhwGDv1ZU3PkBluUVaF8PyCHcm48cKLWQ==,
      }
    engines: { node: ">=14.0.0" }
    hasBin: true

  tar-fs@2.1.4:
    resolution:
      {
        integrity: sha512-mDAjwmZdh7LTT6pNleZ05Yt65HC3E+NiQzl672vQG38jIrehtJk/J3mNwIg+vShQPcLF/LV7CMnDW6vjj6sfYQ==,
      }

  tar-stream@2.2.0:
    resolution:
      {
        integrity: sha512-ujeqbceABgwMZxEJnk2HDY2DlnUZ+9oEcb1KzTVfYHio0UE6dG71n60d8D2I4qNvleWrrXpmjpt7vZeF1LnMZQ==,
      }
    engines: { node: ">=6" }

  tar@7.5.13:
    resolution:
      {
        integrity: sha512-tOG/7GyXpFevhXVh8jOPJrmtRpOTsYqUIkVdVooZYJS/z8WhfQUX8RJILmeuJNinGAMSu1veBr4asSHFt5/hng==,
      }
    engines: { node: ">=18" }

  temp-file@3.4.0:
    resolution:
      {
        integrity: sha512-C5tjlC/HCtVUOi3KWVokd4vHVViOmGjtLwIh4MuzPo/nMYTV/p1urt3RnMz2IWXDdKEGJH3k5+KPxtqRsUYGtg==,
      }

  temp@0.9.4:
    resolution:
      {
        integrity: sha512-yYrrsWnrXMcdsnu/7YMYAofM1ktpL5By7vZhf15CrXijWWrEYZks5AXBudalfSWJLlnen/QUJUB5aoB0kqZUGA==,
      }
    engines: { node: ">=6.0.0" }

  thenify-all@1.6.0:
    resolution:
      {
        integrity: sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==,
      }
    engines: { node: ">=0.8" }

  thenify@3.3.1:
    resolution:
      {
        integrity: sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==,
      }

  thread-stream@4.0.0:
    resolution:
      {
        integrity: sha512-4iMVL6HAINXWf1ZKZjIPcz5wYaOdPhtO8ATvZ+Xqp3BTdaqtAwQkNmKORqcIo5YkQqGXq5cwfswDwMqqQNrpJA==,
      }
    engines: { node: ">=20" }

  tiny-async-pool@1.3.0:
    resolution:
      {
        integrity: sha512-01EAw5EDrcVrdgyCLgoSPvqznC0sVxDSVeiOz09FUpjh71G79VCqneOr+xvt7T1r76CF6ZZfPjHorN2+d+3mqA==,
      }

  tinyglobby@0.2.16:
    resolution:
      {
        integrity: sha512-pn99VhoACYR8nFHhxqix+uvsbXineAasWm5ojXoN8xEwK5Kd3/TrhNn1wByuD52UxWRLy8pu+kRMniEi6Eq9Zg==,
      }
    engines: { node: ">=12.0.0" }

  tmp-promise@3.0.3:
    resolution:
      {
        integrity: sha512-RwM7MoPojPxsOBYnyd2hy0bxtIlVrihNs9pj5SUvY8Zz1sQcQG2tG1hSr8PDxfgEB8RNKDhqbIlroIarSNDNsQ==,
      }

  tmp@0.2.5:
    resolution:
      {
        integrity: sha512-voyz6MApa1rQGUxT3E+BK7/ROe8itEx7vD8/HEvt4xwXucvQ5G5oeEiHkmHZJuBO21RpOf+YYm9MOivj709jow==,
      }
    engines: { node: ">=14.14" }

  to-regex-range@5.0.1:
    resolution:
      {
        integrity: sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==,
      }
    engines: { node: ">=8.0" }

  toidentifier@1.0.1:
    resolution:
      {
        integrity: sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==,
      }
    engines: { node: ">=0.6" }

  truncate-utf8-bytes@1.0.2:
    resolution:
      {
        integrity: sha512-95Pu1QXQvruGEhv62XCMO3Mm90GscOCClvrIUwCM0PYOXK3kaF3l3sIHxx71ThJfcbM2O5Au6SO3AWCSEfW4mQ==,
      }

  ts-api-utils@2.5.0:
    resolution:
      {
        integrity: sha512-OJ/ibxhPlqrMM0UiNHJ/0CKQkoKF243/AEmplt3qpRgkW8VG7IfOS41h7V8TjITqdByHzrjcS/2si+y4lIh8NA==,
      }
    engines: { node: ">=18.12" }
    peerDependencies:
      typescript: ">=4.8.4"

  ts-interface-checker@0.1.13:
    resolution:
      {
        integrity: sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==,
      }

  tslib@2.8.1:
    resolution:
      {
        integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==,
      }

  tsx@4.21.0:
    resolution:
      {
        integrity: sha512-5C1sg4USs1lfG0GFb2RLXsdpXqBSEhAaA/0kPL01wxzpMqLILNxIxIOKiILz+cdg/pLnOUxFYOR5yhHU666wbw==,
      }
    engines: { node: ">=18.0.0" }
    hasBin: true

  tunnel-agent@0.6.0:
    resolution:
      {
        integrity: sha512-McnNiV1l8RYeY8tBgEpuodCC1mLUdbSN+CYBL7kJsJNInOP8UjDDEwdk6Mw60vdLLrr5NHKZhMAOSrR2NZuQ+w==,
      }

  type-check@0.4.0:
    resolution:
      {
        integrity: sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==,
      }
    engines: { node: ">= 0.8.0" }

  type-fest@0.13.1:
    resolution:
      {
        integrity: sha512-34R7HTnG0XIJcBSn5XhDd7nNFPRcXYRZrBB2O2jdKqYODldSzBAqzsWoZYYvduky73toYS/ESqxPvkDf/F0XMg==,
      }
    engines: { node: ">=10" }

  type-is@1.6.18:
    resolution:
      {
        integrity: sha512-TkRKr9sUTxEH8MdfuCSP7VizJyzRNMjj2J2do2Jr3Kym598JVdEksuzPQCnlFPW4ky9Q+iA+ma9BGm06XQBy8g==,
      }
    engines: { node: ">= 0.6" }

  type-is@2.0.1:
    resolution:
      {
        integrity: sha512-OZs6gsjF4vMp32qrCbiVSkrFmXtG/AZhY3t0iAMrMBiAZyV9oALtXO8hsrHbMXF9x6L3grlFuwW2oAz7cav+Gw==,
      }
    engines: { node: ">= 0.6" }

  typedarray@0.0.6:
    resolution:
      {
        integrity: sha512-/aCDEGatGvZ2BIk+HmLf4ifCJFwvKFNb9/JeZPMulfgFracn9QFcAf5GO8B/mweUjSoblS5In0cWhqpfs/5PQA==,
      }

  typescript-eslint@8.59.1:
    resolution:
      {
        integrity: sha512-xqDcFVBmlrltH64lklOVp1wYxgJr6LVdg3NamBgH2OOQDLFdTKfIZXF5PfghrnXQKXZGTQs8tr1vL7fJvq8CTQ==,
      }
    engines: { node: ^18.18.0 || ^20.9.0 || >=21.1.0 }
    peerDependencies:
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: ">=4.8.4 <6.1.0"

  typescript@5.9.3:
    resolution:
      {
        integrity: sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==,
      }
    engines: { node: ">=14.17" }
    hasBin: true

  undici-types@6.21.0:
    resolution:
      {
        integrity: sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==,
      }

  undici@6.25.0:
    resolution:
      {
        integrity: sha512-ZgpWDC5gmNiuY9CnLVXEH8rl50xhRCuLNA97fAUnKi8RRuV4E6KG31pDTsLVUKnohJE0I3XDrTeEydAXRw47xg==,
      }
    engines: { node: ">=18.17" }

  universalify@0.1.2:
    resolution:
      {
        integrity: sha512-rBJeI5CXAlmy1pV+617WB9J63U6XcazHHF2f2dbJix4XzpUF0RS3Zbj0FGIOCAva5P/d/GBOYaACQ1w+0azUkg==,
      }
    engines: { node: ">= 4.0.0" }

  universalify@2.0.1:
    resolution:
      {
        integrity: sha512-gptHNQghINnc/vTGIk0SOFGFNXw7JVrlRUtConJRlvaw6DuX0wO5Jeko9sWrMBhh+PsYAZ7oXAiOnf/UKogyiw==,
      }
    engines: { node: ">= 10.0.0" }

  unpipe@1.0.0:
    resolution:
      {
        integrity: sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==,
      }
    engines: { node: ">= 0.8" }

  update-browserslist-db@1.2.3:
    resolution:
      {
        integrity: sha512-Js0m9cx+qOgDxo0eMiFGEueWztz+d4+M3rGlmKPT+T4IS/jP4ylw3Nwpu6cpTTP8R1MAC1kF4VbdLt3ARf209w==,
      }
    hasBin: true
    peerDependencies:
      browserslist: ">= 4.21.0"

  uri-js@4.4.1:
    resolution:
      {
        integrity: sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==,
      }

  use-callback-ref@1.3.3:
    resolution:
      {
        integrity: sha512-jQL3lRnocaFtu3V00JToYz/4QkNWswxijDaCVNZRiRTO3HQDLsdu1ZtmIUvV4yPp+rvWm5j0y0TG/S61cuijTg==,
      }
    engines: { node: ">=10" }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  use-sidecar@1.1.3:
    resolution:
      {
        integrity: sha512-Fedw0aZvkhynoPYlA5WXrMCAMm+nSWdZt6lzJQ7Ok8S6Q+VsHmHpRWndVRJ8Be0ZbkfPc5LRYH+5XrzXcEeLRQ==,
      }
    engines: { node: ">=10" }
    peerDependencies:
      "@types/react": "*"
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      "@types/react":
        optional: true

  utf8-byte-length@1.0.5:
    resolution:
      {
        integrity: sha512-Xn0w3MtiQ6zoz2vFyUVruaCL53O/DwUvkEeOvj+uulMm0BkUGYWmBYVyElqZaSLhY6ZD0ulfU3aBra2aVT4xfA==,
      }

  util-deprecate@1.0.2:
    resolution:
      {
        integrity: sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==,
      }

  vary@1.1.2:
    resolution:
      {
        integrity: sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==,
      }
    engines: { node: ">= 0.8" }

  verror@1.10.1:
    resolution:
      {
        integrity: sha512-veufcmxri4e3XSrT0xwfUR7kguIkaxBeosDg00yDWhk49wdwkSUrvvsm7nc75e1PUyvIeZj6nS8VQRYz2/S4Xg==,
      }
    engines: { node: ">=0.6.0" }

  vite@7.3.2:
    resolution:
      {
        integrity: sha512-Bby3NOsna2jsjfLVOHKes8sGwgl4TT0E6vvpYgnAYDIF/tie7MRaFthmKuHx1NSXjiTueXH3do80FMQgvEktRg==,
      }
    engines: { node: ^20.19.0 || >=22.12.0 }
    hasBin: true
    peerDependencies:
      "@types/node": ^20.19.0 || >=22.12.0
      jiti: ">=1.21.0"
      less: ^4.0.0
      lightningcss: ^1.21.0
      sass: ^1.70.0
      sass-embedded: ^1.70.0
      stylus: ">=0.54.8"
      sugarss: ^5.0.0
      terser: ^5.16.0
      tsx: ^4.8.1
      yaml: ^2.4.2
    peerDependenciesMeta:
      "@types/node":
        optional: true
      jiti:
        optional: true
      less:
        optional: true
      lightningcss:
        optional: true
      sass:
        optional: true
      sass-embedded:
        optional: true
      stylus:
        optional: true
      sugarss:
        optional: true
      terser:
        optional: true
      tsx:
        optional: true
      yaml:
        optional: true

  which@2.0.2:
    resolution:
      {
        integrity: sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==,
      }
    engines: { node: ">= 8" }
    hasBin: true

  which@5.0.0:
    resolution:
      {
        integrity: sha512-JEdGzHwwkrbWoGOlIHqQ5gtprKGOenpDHpxE9zVR1bWbOtYRyPPHMe9FaP6x61CmNaTThSkb0DAJte5jD+DmzQ==,
      }
    engines: { node: ^18.17.0 || >=20.5.0 }
    hasBin: true

  which@6.0.1:
    resolution:
      {
        integrity: sha512-oGLe46MIrCRqX7ytPUf66EAYvdeMIZYn3WaocqqKZAxrBpkqHfL/qvTyJ/bTk5+AqHCjXmrv3CEWgy368zhRUg==,
      }
    engines: { node: ^20.17.0 || >=22.9.0 }
    hasBin: true

  word-wrap@1.2.5:
    resolution:
      {
        integrity: sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==,
      }
    engines: { node: ">=0.10.0" }

  wrap-ansi@7.0.0:
    resolution:
      {
        integrity: sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==,
      }
    engines: { node: ">=10" }

  wrappy@1.0.2:
    resolution:
      {
        integrity: sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==,
      }

  xmlbuilder@15.1.1:
    resolution:
      {
        integrity: sha512-yMqGBqtXyeN1e3TGYvgNgDVZ3j84W4cwkOXQswghol6APgZWaff9lnbvN7MHYJOiXsvGPXtjTYJEiC9J2wv9Eg==,
      }
    engines: { node: ">=8.0" }

  y18n@5.0.8:
    resolution:
      {
        integrity: sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==,
      }
    engines: { node: ">=10" }

  yallist@3.1.1:
    resolution:
      {
        integrity: sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==,
      }

  yallist@4.0.0:
    resolution:
      {
        integrity: sha512-3wdGidZyq5PB084XLES5TpOSRA3wjXAlIWMhum2kRcv/41Sn2emQ0dycQW4uZXLejwKvg6EsvbdlVL+FYEct7A==,
      }

  yallist@5.0.0:
    resolution:
      {
        integrity: sha512-YgvUTfwqyc7UXVMrB+SImsVYSmTS8X/tSrtdNZMImM+n7+QTriRXyXim0mBrTXNeqzVF0KWGgHPeiyViFFrNDw==,
      }
    engines: { node: ">=18" }

  yargs-parser@21.1.1:
    resolution:
      {
        integrity: sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==,
      }
    engines: { node: ">=12" }

  yargs@17.7.2:
    resolution:
      {
        integrity: sha512-7dSzzRQ++CKnNI/krKnYRV7JKKPUXMEh61soaHKg9mrWEhzFWhFnxPxGl+69cD1Ou63C13NUPCnmIcrvqCuM6w==,
      }
    engines: { node: ">=12" }

  yauzl@2.10.0:
    resolution:
      {
        integrity: sha512-p4a9I6X6nu6IhoGmBqAcbJy1mlC4j27vEPZX9F4L4/vZT3Lyq1VkFHw/V/PUcB9Buo+DG3iHkT0x3Qya58zc3g==,
      }

  yocto-queue@0.1.0:
    resolution:
      {
        integrity: sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==,
      }
    engines: { node: ">=10" }

  zod@4.4.3:
    resolution:
      {
        integrity: sha512-ytENFjIJFl2UwYglde2jchW2Hwm4GJFLDiSXWdTrJQBIN9Fcyp7n4DhxJEiWNAJMV1/BqWfW/kkg71UDcHJyTQ==,
      }

snapshots:
  7zip-bin@5.2.0: {}

  "@alloc/quick-lru@5.2.0": {}

  "@babel/code-frame@7.29.0":
    dependencies:
      "@babel/helper-validator-identifier": 7.28.5
      js-tokens: 4.0.0
      picocolors: 1.1.1

  "@babel/compat-data@7.29.3": {}

  "@babel/core@7.29.0":
    dependencies:
      "@babel/code-frame": 7.29.0
      "@babel/generator": 7.29.1
      "@babel/helper-compilation-targets": 7.28.6
      "@babel/helper-module-transforms": 7.28.6(@babel/core@7.29.0)
      "@babel/helpers": 7.29.2
      "@babel/parser": 7.29.3
      "@babel/template": 7.28.6
      "@babel/traverse": 7.29.0
      "@babel/types": 7.29.0
      "@jridgewell/remapping": 2.3.5
      convert-source-map: 2.0.0
      debug: 4.4.3
      gensync: 1.0.0-beta.2
      json5: 2.2.3
      semver: 6.3.1
    transitivePeerDependencies:
      - supports-color

  "@babel/generator@7.29.1":
    dependencies:
      "@babel/parser": 7.29.3
      "@babel/types": 7.29.0
      "@jridgewell/gen-mapping": 0.3.13
      "@jridgewell/trace-mapping": 0.3.31
      jsesc: 3.1.0

  "@babel/helper-compilation-targets@7.28.6":
    dependencies:
      "@babel/compat-data": 7.29.3
      "@babel/helper-validator-option": 7.27.1
      browserslist: 4.28.2
      lru-cache: 5.1.1
      semver: 6.3.1

  "@babel/helper-globals@7.28.0": {}

  "@babel/helper-module-imports@7.28.6":
    dependencies:
      "@babel/traverse": 7.29.0
      "@babel/types": 7.29.0
    transitivePeerDependencies:
      - supports-color

  "@babel/helper-module-transforms@7.28.6(@babel/core@7.29.0)":
    dependencies:
      "@babel/core": 7.29.0
      "@babel/helper-module-imports": 7.28.6
      "@babel/helper-validator-identifier": 7.28.5
      "@babel/traverse": 7.29.0
    transitivePeerDependencies:
      - supports-color

  "@babel/helper-plugin-utils@7.28.6": {}

  "@babel/helper-string-parser@7.27.1": {}

  "@babel/helper-validator-identifier@7.28.5": {}

  "@babel/helper-validator-option@7.27.1": {}

  "@babel/helpers@7.29.2":
    dependencies:
      "@babel/template": 7.28.6
      "@babel/types": 7.29.0

  "@babel/parser@7.29.3":
    dependencies:
      "@babel/types": 7.29.0

  "@babel/plugin-transform-arrow-functions@7.27.1(@babel/core@7.29.0)":
    dependencies:
      "@babel/core": 7.29.0
      "@babel/helper-plugin-utils": 7.28.6

  "@babel/plugin-transform-react-jsx-self@7.27.1(@babel/core@7.29.0)":
    dependencies:
      "@babel/core": 7.29.0
      "@babel/helper-plugin-utils": 7.28.6

  "@babel/plugin-transform-react-jsx-source@7.27.1(@babel/core@7.29.0)":
    dependencies:
      "@babel/core": 7.29.0
      "@babel/helper-plugin-utils": 7.28.6

  "@babel/template@7.28.6":
    dependencies:
      "@babel/code-frame": 7.29.0
      "@babel/parser": 7.29.3
      "@babel/types": 7.29.0

  "@babel/traverse@7.29.0":
    dependencies:
      "@babel/code-frame": 7.29.0
      "@babel/generator": 7.29.1
      "@babel/helper-globals": 7.28.0
      "@babel/parser": 7.29.3
      "@babel/template": 7.28.6
      "@babel/types": 7.29.0
      debug: 4.4.3
    transitivePeerDependencies:
      - supports-color

  "@babel/types@7.29.0":
    dependencies:
      "@babel/helper-string-parser": 7.27.1
      "@babel/helper-validator-identifier": 7.28.5

  "@develar/schema-utils@2.6.5":
    dependencies:
      ajv: 6.15.0
      ajv-keywords: 3.5.2(ajv@6.15.0)

  "@electron/asar@3.4.1":
    dependencies:
      commander: 5.1.0
      glob: 7.2.3
      minimatch: 3.1.5

  "@electron/fuses@1.8.0":
    dependencies:
      chalk: 4.1.2
      fs-extra: 9.1.0
      minimist: 1.2.8

  "@electron/get@2.0.3":
    dependencies:
      debug: 4.4.3
      env-paths: 2.2.1
      fs-extra: 8.1.0
      got: 11.8.6
      progress: 2.0.3
      semver: 6.3.1
      sumchecker: 3.0.1
    optionalDependencies:
      global-agent: 3.0.0
    transitivePeerDependencies:
      - supports-color

  "@electron/get@3.1.0":
    dependencies:
      debug: 4.4.3
      env-paths: 2.2.1
      fs-extra: 8.1.0
      got: 11.8.6
      progress: 2.0.3
      semver: 6.3.1
      sumchecker: 3.0.1
    optionalDependencies:
      global-agent: 3.0.0
    transitivePeerDependencies:
      - supports-color

  "@electron/notarize@2.5.0":
    dependencies:
      debug: 4.4.3
      fs-extra: 9.1.0
      promise-retry: 2.0.1
    transitivePeerDependencies:
      - supports-color

  "@electron/osx-sign@1.3.3":
    dependencies:
      compare-version: 0.1.2
      debug: 4.4.3
      fs-extra: 10.1.0
      isbinaryfile: 4.0.10
      minimist: 1.2.8
      plist: 3.1.0
    transitivePeerDependencies:
      - supports-color

  "@electron/rebuild@4.0.4":
    dependencies:
      "@malept/cross-spawn-promise": 2.0.0
      debug: 4.4.3
      node-abi: 4.29.0
      node-api-version: 0.2.1
      node-gyp: 12.3.0
      read-binary-file-arch: 1.0.6
    transitivePeerDependencies:
      - supports-color

  "@electron/universal@2.0.3":
    dependencies:
      "@electron/asar": 3.4.1
      "@malept/cross-spawn-promise": 2.0.0
      debug: 4.4.3
      dir-compare: 4.2.0
      fs-extra: 11.3.4
      minimatch: 9.0.9
      plist: 3.1.0
    transitivePeerDependencies:
      - supports-color

  "@electron/windows-sign@1.2.2":
    dependencies:
      cross-dirname: 0.1.0
      debug: 4.4.3
      fs-extra: 11.3.4
      minimist: 1.2.8
      postject: 1.0.0-alpha.6
    transitivePeerDependencies:
      - supports-color
    optional: true

  "@esbuild/aix-ppc64@0.25.12":
    optional: true

  "@esbuild/aix-ppc64@0.27.7":
    optional: true

  "@esbuild/android-arm64@0.25.12":
    optional: true

  "@esbuild/android-arm64@0.27.7":
    optional: true

  "@esbuild/android-arm@0.25.12":
    optional: true

  "@esbuild/android-arm@0.27.7":
    optional: true

  "@esbuild/android-x64@0.25.12":
    optional: true

  "@esbuild/android-x64@0.27.7":
    optional: true

  "@esbuild/darwin-arm64@0.25.12":
    optional: true

  "@esbuild/darwin-arm64@0.27.7":
    optional: true

  "@esbuild/darwin-x64@0.25.12":
    optional: true

  "@esbuild/darwin-x64@0.27.7":
    optional: true

  "@esbuild/freebsd-arm64@0.25.12":
    optional: true

  "@esbuild/freebsd-arm64@0.27.7":
    optional: true

  "@esbuild/freebsd-x64@0.25.12":
    optional: true

  "@esbuild/freebsd-x64@0.27.7":
    optional: true

  "@esbuild/linux-arm64@0.25.12":
    optional: true

  "@esbuild/linux-arm64@0.27.7":
    optional: true

  "@esbuild/linux-arm@0.25.12":
    optional: true

  "@esbuild/linux-arm@0.27.7":
    optional: true

  "@esbuild/linux-ia32@0.25.12":
    optional: true

  "@esbuild/linux-ia32@0.27.7":
    optional: true

  "@esbuild/linux-loong64@0.25.12":
    optional: true

  "@esbuild/linux-loong64@0.27.7":
    optional: true

  "@esbuild/linux-mips64el@0.25.12":
    optional: true

  "@esbuild/linux-mips64el@0.27.7":
    optional: true

  "@esbuild/linux-ppc64@0.25.12":
    optional: true

  "@esbuild/linux-ppc64@0.27.7":
    optional: true

  "@esbuild/linux-riscv64@0.25.12":
    optional: true

  "@esbuild/linux-riscv64@0.27.7":
    optional: true

  "@esbuild/linux-s390x@0.25.12":
    optional: true

  "@esbuild/linux-s390x@0.27.7":
    optional: true

  "@esbuild/linux-x64@0.25.12":
    optional: true

  "@esbuild/linux-x64@0.27.7":
    optional: true

  "@esbuild/netbsd-arm64@0.25.12":
    optional: true

  "@esbuild/netbsd-arm64@0.27.7":
    optional: true

  "@esbuild/netbsd-x64@0.25.12":
    optional: true

  "@esbuild/netbsd-x64@0.27.7":
    optional: true

  "@esbuild/openbsd-arm64@0.25.12":
    optional: true

  "@esbuild/openbsd-arm64@0.27.7":
    optional: true

  "@esbuild/openbsd-x64@0.25.12":
    optional: true

  "@esbuild/openbsd-x64@0.27.7":
    optional: true

  "@esbuild/openharmony-arm64@0.25.12":
    optional: true

  "@esbuild/openharmony-arm64@0.27.7":
    optional: true

  "@esbuild/sunos-x64@0.25.12":
    optional: true

  "@esbuild/sunos-x64@0.27.7":
    optional: true

  "@esbuild/win32-arm64@0.25.12":
    optional: true

  "@esbuild/win32-arm64@0.27.7":
    optional: true

  "@esbuild/win32-ia32@0.25.12":
    optional: true

  "@esbuild/win32-ia32@0.27.7":
    optional: true

  "@esbuild/win32-x64@0.25.12":
    optional: true

  "@esbuild/win32-x64@0.27.7":
    optional: true

  "@eslint-community/eslint-utils@4.9.1(eslint@9.39.4(jiti@2.6.1))":
    dependencies:
      eslint: 9.39.4(jiti@2.6.1)
      eslint-visitor-keys: 3.4.3

  "@eslint-community/regexpp@4.12.2": {}

  "@eslint/config-array@0.21.2":
    dependencies:
      "@eslint/object-schema": 2.1.7
      debug: 4.4.3
      minimatch: 3.1.5
    transitivePeerDependencies:
      - supports-color

  "@eslint/config-helpers@0.4.2":
    dependencies:
      "@eslint/core": 0.17.0

  "@eslint/core@0.17.0":
    dependencies:
      "@types/json-schema": 7.0.15

  "@eslint/eslintrc@3.3.5":
    dependencies:
      ajv: 6.15.0
      debug: 4.4.3
      espree: 10.4.0
      globals: 14.0.0
      ignore: 5.3.2
      import-fresh: 3.3.1
      js-yaml: 4.1.1
      minimatch: 3.1.5
      strip-json-comments: 3.1.1
    transitivePeerDependencies:
      - supports-color

  "@eslint/js@9.39.4": {}

  "@eslint/object-schema@2.1.7": {}

  "@eslint/plugin-kit@0.4.1":
    dependencies:
      "@eslint/core": 0.17.0
      levn: 0.4.1

  "@humanfs/core@0.19.2":
    dependencies:
      "@humanfs/types": 0.15.0

  "@humanfs/node@0.16.8":
    dependencies:
      "@humanfs/core": 0.19.2
      "@humanfs/types": 0.15.0
      "@humanwhocodes/retry": 0.4.3

  "@humanfs/types@0.15.0": {}

  "@humanwhocodes/module-importer@1.0.1": {}

  "@humanwhocodes/retry@0.4.3": {}

  "@isaacs/fs-minipass@4.0.1":
    dependencies:
      minipass: 7.1.3

  "@jridgewell/gen-mapping@0.3.13":
    dependencies:
      "@jridgewell/sourcemap-codec": 1.5.5
      "@jridgewell/trace-mapping": 0.3.31

  "@jridgewell/remapping@2.3.5":
    dependencies:
      "@jridgewell/gen-mapping": 0.3.13
      "@jridgewell/trace-mapping": 0.3.31

  "@jridgewell/resolve-uri@3.1.2": {}

  "@jridgewell/sourcemap-codec@1.5.5": {}

  "@jridgewell/trace-mapping@0.3.31":
    dependencies:
      "@jridgewell/resolve-uri": 3.1.2
      "@jridgewell/sourcemap-codec": 1.5.5

  "@malept/cross-spawn-promise@2.0.0":
    dependencies:
      cross-spawn: 7.0.6

  "@malept/flatpak-bundler@0.4.0":
    dependencies:
      debug: 4.4.3
      fs-extra: 9.1.0
      lodash: 4.18.1
      tmp-promise: 3.0.3
    transitivePeerDependencies:
      - supports-color

  "@nodelib/fs.scandir@2.1.5":
    dependencies:
      "@nodelib/fs.stat": 2.0.5
      run-parallel: 1.2.0

  "@nodelib/fs.stat@2.0.5": {}

  "@nodelib/fs.walk@1.2.8":
    dependencies:
      "@nodelib/fs.scandir": 2.1.5
      fastq: 1.20.1

  "@pinojs/redact@0.4.0": {}

  "@radix-ui/primitive@1.1.3": {}

  "@radix-ui/react-compose-refs@1.1.2(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@radix-ui/react-context@1.1.2(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@radix-ui/react-dialog@1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)":
    dependencies:
      "@radix-ui/primitive": 1.1.3
      "@radix-ui/react-compose-refs": 1.1.2(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-context": 1.1.2(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-dismissable-layer": 1.1.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)
      "@radix-ui/react-focus-guards": 1.1.3(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-focus-scope": 1.1.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)
      "@radix-ui/react-id": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-portal": 1.1.9(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)
      "@radix-ui/react-presence": 1.1.5(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)
      "@radix-ui/react-primitive": 2.1.3(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)
      "@radix-ui/react-slot": 1.2.3(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-use-controllable-state": 1.2.2(@types/react@19.2.14)(react@19.2.5)
      aria-hidden: 1.2.6
      react: 19.2.5
      react-dom: 19.2.5(react@19.2.5)
      react-remove-scroll: 2.7.2(@types/react@19.2.14)(react@19.2.5)
    optionalDependencies:
      "@types/react": 19.2.14
      "@types/react-dom": 19.2.3(@types/react@19.2.14)

  "@radix-ui/react-dismissable-layer@1.1.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)":
    dependencies:
      "@radix-ui/primitive": 1.1.3
      "@radix-ui/react-compose-refs": 1.1.2(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-primitive": 2.1.3(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)
      "@radix-ui/react-use-callback-ref": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-use-escape-keydown": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
      react-dom: 19.2.5(react@19.2.5)
    optionalDependencies:
      "@types/react": 19.2.14
      "@types/react-dom": 19.2.3(@types/react@19.2.14)

  "@radix-ui/react-focus-guards@1.1.3(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@radix-ui/react-focus-scope@1.1.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)":
    dependencies:
      "@radix-ui/react-compose-refs": 1.1.2(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-primitive": 2.1.3(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)
      "@radix-ui/react-use-callback-ref": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
      react-dom: 19.2.5(react@19.2.5)
    optionalDependencies:
      "@types/react": 19.2.14
      "@types/react-dom": 19.2.3(@types/react@19.2.14)

  "@radix-ui/react-id@1.1.1(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      "@radix-ui/react-use-layout-effect": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@radix-ui/react-portal@1.1.9(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)":
    dependencies:
      "@radix-ui/react-primitive": 2.1.3(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)
      "@radix-ui/react-use-layout-effect": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
      react-dom: 19.2.5(react@19.2.5)
    optionalDependencies:
      "@types/react": 19.2.14
      "@types/react-dom": 19.2.3(@types/react@19.2.14)

  "@radix-ui/react-presence@1.1.5(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)":
    dependencies:
      "@radix-ui/react-compose-refs": 1.1.2(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-use-layout-effect": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
      react-dom: 19.2.5(react@19.2.5)
    optionalDependencies:
      "@types/react": 19.2.14
      "@types/react-dom": 19.2.3(@types/react@19.2.14)

  "@radix-ui/react-primitive@2.1.3(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.5(react@19.2.5))(react@19.2.5)":
    dependencies:
      "@radix-ui/react-slot": 1.2.3(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
      react-dom: 19.2.5(react@19.2.5)
    optionalDependencies:
      "@types/react": 19.2.14
      "@types/react-dom": 19.2.3(@types/react@19.2.14)

  "@radix-ui/react-slot@1.2.3(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      "@radix-ui/react-compose-refs": 1.1.2(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@radix-ui/react-use-callback-ref@1.1.1(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@radix-ui/react-use-controllable-state@1.2.2(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      "@radix-ui/react-use-effect-event": 0.0.2(@types/react@19.2.14)(react@19.2.5)
      "@radix-ui/react-use-layout-effect": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@radix-ui/react-use-effect-event@0.0.2(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      "@radix-ui/react-use-layout-effect": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@radix-ui/react-use-escape-keydown@1.1.1(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      "@radix-ui/react-use-callback-ref": 1.1.1(@types/react@19.2.14)(react@19.2.5)
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@radix-ui/react-use-layout-effect@1.1.1(@types/react@19.2.14)(react@19.2.5)":
    dependencies:
      react: 19.2.5
    optionalDependencies:
      "@types/react": 19.2.14

  "@rolldown/pluginutils@1.0.0-rc.3": {}

  "@rollup/rollup-android-arm-eabi@4.60.2":
    optional: true

  "@rollup/rollup-android-arm64@4.60.2":
    optional: true

  "@rollup/rollup-darwin-arm64@4.60.2":
    optional: true

  "@rollup/rollup-darwin-x64@4.60.2":
    optional: true

  "@rollup/rollup-freebsd-arm64@4.60.2":
    optional: true

  "@rollup/rollup-freebsd-x64@4.60.2":
    optional: true

  "@rollup/rollup-linux-arm-gnueabihf@4.60.2":
    optional: true

  "@rollup/rollup-linux-arm-musleabihf@4.60.2":
    optional: true

  "@rollup/rollup-linux-arm64-gnu@4.60.2":
    optional: true

  "@rollup/rollup-linux-arm64-musl@4.60.2":
    optional: true

  "@rollup/rollup-linux-loong64-gnu@4.60.2":
    optional: true

  "@rollup/rollup-linux-loong64-musl@4.60.2":
    optional: true

  "@rollup/rollup-linux-ppc64-gnu@4.60.2":
    optional: true

  "@rollup/rollup-linux-ppc64-musl@4.60.2":
    optional: true

  "@rollup/rollup-linux-riscv64-gnu@4.60.2":
    optional: true

  "@rollup/rollup-linux-riscv64-musl@4.60.2":
    optional: true

  "@rollup/rollup-linux-s390x-gnu@4.60.2":
    optional: true

  "@rollup/rollup-linux-x64-gnu@4.60.2":
    optional: true

  "@rollup/rollup-linux-x64-musl@4.60.2":
    optional: true

  "@rollup/rollup-openbsd-x64@4.60.2":
    optional: true

  "@rollup/rollup-openharmony-arm64@4.60.2":
    optional: true

  "@rollup/rollup-win32-arm64-msvc@4.60.2":
    optional: true

  "@rollup/rollup-win32-ia32-msvc@4.60.2":
    optional: true

  "@rollup/rollup-win32-x64-gnu@4.60.2":
    optional: true

  "@rollup/rollup-win32-x64-msvc@4.60.2":
    optional: true

  "@sindresorhus/is@4.6.0": {}

  "@szmarczak/http-timer@4.0.6":
    dependencies:
      defer-to-connect: 2.0.1

  "@types/babel__core@7.20.5":
    dependencies:
      "@babel/parser": 7.29.3
      "@babel/types": 7.29.0
      "@types/babel__generator": 7.27.0
      "@types/babel__template": 7.4.4
      "@types/babel__traverse": 7.28.0

  "@types/babel__generator@7.27.0":
    dependencies:
      "@babel/types": 7.29.0

  "@types/babel__template@7.4.4":
    dependencies:
      "@babel/parser": 7.29.3
      "@babel/types": 7.29.0

  "@types/babel__traverse@7.28.0":
    dependencies:
      "@babel/types": 7.29.0

  "@types/better-sqlite3@7.6.13":
    dependencies:
      "@types/node": 22.19.17

  "@types/body-parser@1.19.6":
    dependencies:
      "@types/connect": 3.4.38
      "@types/node": 22.19.17

  "@types/cacheable-request@6.0.3":
    dependencies:
      "@types/http-cache-semantics": 4.2.0
      "@types/keyv": 3.1.4
      "@types/node": 22.19.17
      "@types/responselike": 1.0.3

  "@types/connect@3.4.38":
    dependencies:
      "@types/node": 22.19.17

  "@types/cors@2.8.19":
    dependencies:
      "@types/node": 22.19.17

  "@types/debug@4.1.13":
    dependencies:
      "@types/ms": 2.1.0

  "@types/estree@1.0.8": {}

  "@types/express-serve-static-core@5.1.1":
    dependencies:
      "@types/node": 22.19.17
      "@types/qs": 6.15.0
      "@types/range-parser": 1.2.7
      "@types/send": 1.2.1

  "@types/express@5.0.6":
    dependencies:
      "@types/body-parser": 1.19.6
      "@types/express-serve-static-core": 5.1.1
      "@types/serve-static": 2.2.0

  "@types/fs-extra@9.0.13":
    dependencies:
      "@types/node": 22.19.17

  "@types/http-cache-semantics@4.2.0": {}

  "@types/http-errors@2.0.5": {}

  "@types/json-schema@7.0.15": {}

  "@types/keyv@3.1.4":
    dependencies:
      "@types/node": 22.19.17

  "@types/ms@2.1.0": {}

  "@types/multer@2.1.0":
    dependencies:
      "@types/express": 5.0.6

  "@types/node@22.19.17":
    dependencies:
      undici-types: 6.21.0

  "@types/plist@3.0.5":
    dependencies:
      "@types/node": 22.19.17
      xmlbuilder: 15.1.1
    optional: true

  "@types/qs@6.15.0": {}

  "@types/range-parser@1.2.7": {}

  "@types/react-dom@19.2.3(@types/react@19.2.14)":
    dependencies:
      "@types/react": 19.2.14

  "@types/react@19.2.14":
    dependencies:
      csstype: 3.2.3

  "@types/responselike@1.0.3":
    dependencies:
      "@types/node": 22.19.17

  "@types/send@1.2.1":
    dependencies:
      "@types/node": 22.19.17

  "@types/serve-static@2.2.0":
    dependencies:
      "@types/http-errors": 2.0.5
      "@types/node": 22.19.17

  "@types/verror@1.10.11":
    optional: true

  "@types/yauzl@2.10.3":
    dependencies:
      "@types/node": 22.19.17
    optional: true

  "@typescript-eslint/eslint-plugin@8.59.1(@typescript-eslint/parser@8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3))(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)":
    dependencies:
      "@eslint-community/regexpp": 4.12.2
      "@typescript-eslint/parser": 8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)
      "@typescript-eslint/scope-manager": 8.59.1
      "@typescript-eslint/type-utils": 8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)
      "@typescript-eslint/utils": 8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)
      "@typescript-eslint/visitor-keys": 8.59.1
      eslint: 9.39.4(jiti@2.6.1)
      ignore: 7.0.5
      natural-compare: 1.4.0
      ts-api-utils: 2.5.0(typescript@5.9.3)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  "@typescript-eslint/parser@8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)":
    dependencies:
      "@typescript-eslint/scope-manager": 8.59.1
      "@typescript-eslint/types": 8.59.1
      "@typescript-eslint/typescript-estree": 8.59.1(typescript@5.9.3)
      "@typescript-eslint/visitor-keys": 8.59.1
      debug: 4.4.3
      eslint: 9.39.4(jiti@2.6.1)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  "@typescript-eslint/project-service@8.59.1(typescript@5.9.3)":
    dependencies:
      "@typescript-eslint/tsconfig-utils": 8.59.1(typescript@5.9.3)
      "@typescript-eslint/types": 8.59.1
      debug: 4.4.3
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  "@typescript-eslint/scope-manager@8.59.1":
    dependencies:
      "@typescript-eslint/types": 8.59.1
      "@typescript-eslint/visitor-keys": 8.59.1

  "@typescript-eslint/tsconfig-utils@8.59.1(typescript@5.9.3)":
    dependencies:
      typescript: 5.9.3

  "@typescript-eslint/type-utils@8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)":
    dependencies:
      "@typescript-eslint/types": 8.59.1
      "@typescript-eslint/typescript-estree": 8.59.1(typescript@5.9.3)
      "@typescript-eslint/utils": 8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)
      debug: 4.4.3
      eslint: 9.39.4(jiti@2.6.1)
      ts-api-utils: 2.5.0(typescript@5.9.3)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  "@typescript-eslint/types@8.59.1": {}

  "@typescript-eslint/typescript-estree@8.59.1(typescript@5.9.3)":
    dependencies:
      "@typescript-eslint/project-service": 8.59.1(typescript@5.9.3)
      "@typescript-eslint/tsconfig-utils": 8.59.1(typescript@5.9.3)
      "@typescript-eslint/types": 8.59.1
      "@typescript-eslint/visitor-keys": 8.59.1
      debug: 4.4.3
      minimatch: 10.2.5
      semver: 7.7.4
      tinyglobby: 0.2.16
      ts-api-utils: 2.5.0(typescript@5.9.3)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  "@typescript-eslint/utils@8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)":
    dependencies:
      "@eslint-community/eslint-utils": 4.9.1(eslint@9.39.4(jiti@2.6.1))
      "@typescript-eslint/scope-manager": 8.59.1
      "@typescript-eslint/types": 8.59.1
      "@typescript-eslint/typescript-estree": 8.59.1(typescript@5.9.3)
      eslint: 9.39.4(jiti@2.6.1)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  "@typescript-eslint/visitor-keys@8.59.1":
    dependencies:
      "@typescript-eslint/types": 8.59.1
      eslint-visitor-keys: 5.0.1

  "@vitejs/plugin-react@5.2.0(vite@7.3.2(@types/node@22.19.17)(jiti@1.21.7)(tsx@4.21.0))":
    dependencies:
      "@babel/core": 7.29.0
      "@babel/plugin-transform-react-jsx-self": 7.27.1(@babel/core@7.29.0)
      "@babel/plugin-transform-react-jsx-source": 7.27.1(@babel/core@7.29.0)
      "@rolldown/pluginutils": 1.0.0-rc.3
      "@types/babel__core": 7.20.5
      react-refresh: 0.18.0
      vite: 7.3.2(@types/node@22.19.17)(jiti@1.21.7)(tsx@4.21.0)
    transitivePeerDependencies:
      - supports-color

  "@xmldom/xmldom@0.8.13": {}

  "@xmldom/xmldom@0.9.10":
    optional: true

  abbrev@4.0.0: {}

  accepts@2.0.0:
    dependencies:
      mime-types: 3.0.2
      negotiator: 1.0.0

  acorn-jsx@5.3.2(acorn@8.16.0):
    dependencies:
      acorn: 8.16.0

  acorn@8.16.0: {}

  agent-base@7.1.4: {}

  ajv-keywords@3.5.2(ajv@6.15.0):
    dependencies:
      ajv: 6.15.0

  ajv@6.15.0:
    dependencies:
      fast-deep-equal: 3.1.3
      fast-json-stable-stringify: 2.1.0
      json-schema-traverse: 0.4.1
      uri-js: 4.4.1

  ansi-regex@5.0.1: {}

  ansi-styles@4.3.0:
    dependencies:
      color-convert: 2.0.1

  any-promise@1.3.0: {}

  anymatch@3.1.3:
    dependencies:
      normalize-path: 3.0.0
      picomatch: 2.3.2

  app-builder-bin@5.0.0-alpha.12: {}

  app-builder-lib@26.8.1(dmg-builder@26.8.1)(electron-builder-squirrel-windows@26.8.1):
    dependencies:
      "@develar/schema-utils": 2.6.5
      "@electron/asar": 3.4.1
      "@electron/fuses": 1.8.0
      "@electron/get": 3.1.0
      "@electron/notarize": 2.5.0
      "@electron/osx-sign": 1.3.3
      "@electron/rebuild": 4.0.4
      "@electron/universal": 2.0.3
      "@malept/flatpak-bundler": 0.4.0
      "@types/fs-extra": 9.0.13
      async-exit-hook: 2.0.1
      builder-util: 26.8.1
      builder-util-runtime: 9.5.1
      chromium-pickle-js: 0.2.0
      ci-info: 4.3.1
      debug: 4.4.3
      dmg-builder: 26.8.1(electron-builder-squirrel-windows@26.8.1)
      dotenv: 16.6.1
      dotenv-expand: 11.0.7
      ejs: 3.1.10
      electron-builder-squirrel-windows: 26.8.1(dmg-builder@26.8.1)
      electron-publish: 26.8.1
      fs-extra: 10.1.0
      hosted-git-info: 4.1.0
      isbinaryfile: 5.0.7
      jiti: 2.6.1
      js-yaml: 4.1.1
      json5: 2.2.3
      lazy-val: 1.0.5
      minimatch: 10.2.5
      plist: 3.1.0
      proper-lockfile: 4.1.2
      resedit: 1.7.2
      semver: 7.7.4
      tar: 7.5.13
      temp-file: 3.4.0
      tiny-async-pool: 1.3.0
      which: 5.0.0
    transitivePeerDependencies:
      - supports-color

  append-field@1.0.0: {}

  arg@5.0.2: {}

  argparse@2.0.1: {}

  aria-hidden@1.2.6:
    dependencies:
      tslib: 2.8.1

  assert-plus@1.0.0:
    optional: true

  astral-regex@2.0.0:
    optional: true

  async-exit-hook@2.0.1: {}

  async@3.2.6: {}

  asynckit@0.4.0: {}

  at-least-node@1.0.0: {}

  atomic-sleep@1.0.0: {}

  autoprefixer@10.5.0(postcss@8.5.13):
    dependencies:
      browserslist: 4.28.2
      caniuse-lite: 1.0.30001791
      fraction.js: 5.3.4
      picocolors: 1.1.1
      postcss: 8.5.13
      postcss-value-parser: 4.2.0

  balanced-match@1.0.2: {}

  balanced-match@4.0.4: {}

  base64-js@1.5.1: {}

  baseline-browser-mapping@2.10.27: {}

  better-sqlite3@12.9.0:
    dependencies:
      bindings: 1.5.0
      prebuild-install: 7.1.3

  binary-extensions@2.3.0: {}

  bindings@1.5.0:
    dependencies:
      file-uri-to-path: 1.0.0

  bl@4.1.0:
    dependencies:
      buffer: 5.7.1
      inherits: 2.0.4
      readable-stream: 3.6.2

  body-parser@2.2.2:
    dependencies:
      bytes: 3.1.2
      content-type: 1.0.5
      debug: 4.4.3
      http-errors: 2.0.1
      iconv-lite: 0.7.2
      on-finished: 2.4.1
      qs: 6.15.1
      raw-body: 3.0.2
      type-is: 2.0.1
    transitivePeerDependencies:
      - supports-color

  boolean@3.2.0:
    optional: true

  brace-expansion@1.1.14:
    dependencies:
      balanced-match: 1.0.2
      concat-map: 0.0.1

  brace-expansion@2.1.0:
    dependencies:
      balanced-match: 1.0.2

  brace-expansion@5.0.5:
    dependencies:
      balanced-match: 4.0.4

  braces@3.0.3:
    dependencies:
      fill-range: 7.1.1

  browserslist@4.28.2:
    dependencies:
      baseline-browser-mapping: 2.10.27
      caniuse-lite: 1.0.30001791
      electron-to-chromium: 1.5.349
      node-releases: 2.0.38
      update-browserslist-db: 1.2.3(browserslist@4.28.2)

  buffer-crc32@0.2.13: {}

  buffer-from@1.1.2: {}

  buffer@5.7.1:
    dependencies:
      base64-js: 1.5.1
      ieee754: 1.2.1

  builder-util-runtime@9.5.1:
    dependencies:
      debug: 4.4.3
      sax: 1.6.0
    transitivePeerDependencies:
      - supports-color

  builder-util@26.8.1:
    dependencies:
      7zip-bin: 5.2.0
      "@types/debug": 4.1.13
      app-builder-bin: 5.0.0-alpha.12
      builder-util-runtime: 9.5.1
      chalk: 4.1.2
      cross-spawn: 7.0.6
      debug: 4.4.3
      fs-extra: 10.1.0
      http-proxy-agent: 7.0.2
      https-proxy-agent: 7.0.6
      js-yaml: 4.1.1
      sanitize-filename: 1.6.4
      source-map-support: 0.5.21
      stat-mode: 1.0.0
      temp-file: 3.4.0
      tiny-async-pool: 1.3.0
    transitivePeerDependencies:
      - supports-color

  busboy@1.6.0:
    dependencies:
      streamsearch: 1.1.0

  bytes@3.1.2: {}

  cac@6.7.14: {}

  cacheable-lookup@5.0.4: {}

  cacheable-request@7.0.4:
    dependencies:
      clone-response: 1.0.3
      get-stream: 5.2.0
      http-cache-semantics: 4.2.0
      keyv: 4.5.4
      lowercase-keys: 2.0.0
      normalize-url: 6.1.0
      responselike: 2.0.1

  call-bind-apply-helpers@1.0.2:
    dependencies:
      es-errors: 1.3.0
      function-bind: 1.1.2

  call-bound@1.0.4:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      get-intrinsic: 1.3.0

  callsites@3.1.0: {}

  camelcase-css@2.0.1: {}

  caniuse-lite@1.0.30001791: {}

  chalk@4.1.2:
    dependencies:
      ansi-styles: 4.3.0
      supports-color: 7.2.0

  chokidar@3.6.0:
    dependencies:
      anymatch: 3.1.3
      braces: 3.0.3
      glob-parent: 5.1.2
      is-binary-path: 2.1.0
      is-glob: 4.0.3
      normalize-path: 3.0.0
      readdirp: 3.6.0
    optionalDependencies:
      fsevents: 2.3.3

  chownr@1.1.4: {}

  chownr@3.0.0: {}

  chromium-pickle-js@0.2.0: {}

  ci-info@4.3.1: {}

  ci-info@4.4.0: {}

  cli-truncate@2.1.0:
    dependencies:
      slice-ansi: 3.0.0
      string-width: 4.2.3
    optional: true

  cliui@8.0.1:
    dependencies:
      string-width: 4.2.3
      strip-ansi: 6.0.1
      wrap-ansi: 7.0.0

  clone-response@1.0.3:
    dependencies:
      mimic-response: 1.0.1

  clsx@2.1.1: {}

  color-convert@2.0.1:
    dependencies:
      color-name: 1.1.4

  color-name@1.1.4: {}

  combined-stream@1.0.8:
    dependencies:
      delayed-stream: 1.0.0

  commander@4.1.1: {}

  commander@5.1.0: {}

  commander@9.5.0:
    optional: true

  compare-version@0.1.2: {}

  concat-map@0.0.1: {}

  concat-stream@2.0.0:
    dependencies:
      buffer-from: 1.1.2
      inherits: 2.0.4
      readable-stream: 3.6.2
      typedarray: 0.0.6

  content-disposition@1.1.0: {}

  content-type@1.0.5: {}

  convert-source-map@2.0.0: {}

  cookie-signature@1.2.2: {}

  cookie@0.7.2: {}

  core-util-is@1.0.2:
    optional: true

  cors@2.8.6:
    dependencies:
      object-assign: 4.1.1
      vary: 1.1.2

  crc@3.8.0:
    dependencies:
      buffer: 5.7.1
    optional: true

  cross-dirname@0.1.0:
    optional: true

  cross-spawn@7.0.6:
    dependencies:
      path-key: 3.1.1
      shebang-command: 2.0.0
      which: 2.0.2

  cssesc@3.0.0: {}

  csstype@3.2.3: {}

  debug@4.4.3:
    dependencies:
      ms: 2.1.3

  decompress-response@6.0.0:
    dependencies:
      mimic-response: 3.1.0

  deep-extend@0.6.0: {}

  deep-is@0.1.4: {}

  defer-to-connect@2.0.1: {}

  define-data-property@1.1.4:
    dependencies:
      es-define-property: 1.0.1
      es-errors: 1.3.0
      gopd: 1.2.0
    optional: true

  define-properties@1.2.1:
    dependencies:
      define-data-property: 1.1.4
      has-property-descriptors: 1.0.2
      object-keys: 1.1.1
    optional: true

  delayed-stream@1.0.0: {}

  depd@2.0.0: {}

  detect-libc@2.1.2: {}

  detect-node-es@1.1.0: {}

  detect-node@2.1.0:
    optional: true

  didyoumean@1.2.2: {}

  dir-compare@4.2.0:
    dependencies:
      minimatch: 3.1.5
      p-limit: 3.1.0

  dlv@1.1.3: {}

  dmg-builder@26.8.1(electron-builder-squirrel-windows@26.8.1):
    dependencies:
      app-builder-lib: 26.8.1(dmg-builder@26.8.1)(electron-builder-squirrel-windows@26.8.1)
      builder-util: 26.8.1
      fs-extra: 10.1.0
      iconv-lite: 0.6.3
      js-yaml: 4.1.1
    optionalDependencies:
      dmg-license: 1.0.11
    transitivePeerDependencies:
      - electron-builder-squirrel-windows
      - supports-color

  dmg-license@1.0.11:
    dependencies:
      "@types/plist": 3.0.5
      "@types/verror": 1.10.11
      ajv: 6.15.0
      crc: 3.8.0
      iconv-corefoundation: 1.1.7
      plist: 3.1.1
      smart-buffer: 4.2.0
      verror: 1.10.1
    optional: true

  dotenv-expand@11.0.7:
    dependencies:
      dotenv: 16.6.1

  dotenv@16.6.1: {}

  dotenv@17.4.2: {}

  drizzle-orm@0.44.7(@types/better-sqlite3@7.6.13)(better-sqlite3@12.9.0):
    optionalDependencies:
      "@types/better-sqlite3": 7.6.13
      better-sqlite3: 12.9.0

  dunder-proto@1.0.1:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-errors: 1.3.0
      gopd: 1.2.0

  ee-first@1.1.1: {}

  ejs@3.1.10:
    dependencies:
      jake: 10.9.4

  electron-builder-squirrel-windows@26.8.1(dmg-builder@26.8.1):
    dependencies:
      app-builder-lib: 26.8.1(dmg-builder@26.8.1)(electron-builder-squirrel-windows@26.8.1)
      builder-util: 26.8.1
      electron-winstaller: 5.4.0
    transitivePeerDependencies:
      - dmg-builder
      - supports-color

  electron-builder@26.8.1(electron-builder-squirrel-windows@26.8.1):
    dependencies:
      app-builder-lib: 26.8.1(dmg-builder@26.8.1)(electron-builder-squirrel-windows@26.8.1)
      builder-util: 26.8.1
      builder-util-runtime: 9.5.1
      chalk: 4.1.2
      ci-info: 4.4.0
      dmg-builder: 26.8.1(electron-builder-squirrel-windows@26.8.1)
      fs-extra: 10.1.0
      lazy-val: 1.0.5
      simple-update-notifier: 2.0.0
      yargs: 17.7.2
    transitivePeerDependencies:
      - electron-builder-squirrel-windows
      - supports-color

  electron-publish@26.8.1:
    dependencies:
      "@types/fs-extra": 9.0.13
      builder-util: 26.8.1
      builder-util-runtime: 9.5.1
      chalk: 4.1.2
      form-data: 4.0.5
      fs-extra: 10.1.0
      lazy-val: 1.0.5
      mime: 2.6.0
    transitivePeerDependencies:
      - supports-color

  electron-to-chromium@1.5.349: {}

  electron-vite@4.0.1(vite@7.3.2(@types/node@22.19.17)(jiti@1.21.7)(tsx@4.21.0)):
    dependencies:
      "@babel/core": 7.29.0
      "@babel/plugin-transform-arrow-functions": 7.27.1(@babel/core@7.29.0)
      cac: 6.7.14
      esbuild: 0.25.12
      magic-string: 0.30.21
      picocolors: 1.1.1
      vite: 7.3.2(@types/node@22.19.17)(jiti@1.21.7)(tsx@4.21.0)
    transitivePeerDependencies:
      - supports-color

  electron-winstaller@5.4.0:
    dependencies:
      "@electron/asar": 3.4.1
      debug: 4.4.3
      fs-extra: 7.0.1
      lodash: 4.18.1
      temp: 0.9.4
    optionalDependencies:
      "@electron/windows-sign": 1.2.2
    transitivePeerDependencies:
      - supports-color

  electron@39.8.9:
    dependencies:
      "@electron/get": 2.0.3
      "@types/node": 22.19.17
      extract-zip: 2.0.1
    transitivePeerDependencies:
      - supports-color

  emoji-regex@8.0.0: {}

  encodeurl@2.0.0: {}

  end-of-stream@1.4.5:
    dependencies:
      once: 1.4.0

  env-paths@2.2.1: {}

  err-code@2.0.3: {}

  es-define-property@1.0.1: {}

  es-errors@1.3.0: {}

  es-object-atoms@1.1.1:
    dependencies:
      es-errors: 1.3.0

  es-set-tostringtag@2.1.0:
    dependencies:
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      has-tostringtag: 1.0.2
      hasown: 2.0.3

  es6-error@4.1.1:
    optional: true

  esbuild@0.25.12:
    optionalDependencies:
      "@esbuild/aix-ppc64": 0.25.12
      "@esbuild/android-arm": 0.25.12
      "@esbuild/android-arm64": 0.25.12
      "@esbuild/android-x64": 0.25.12
      "@esbuild/darwin-arm64": 0.25.12
      "@esbuild/darwin-x64": 0.25.12
      "@esbuild/freebsd-arm64": 0.25.12
      "@esbuild/freebsd-x64": 0.25.12
      "@esbuild/linux-arm": 0.25.12
      "@esbuild/linux-arm64": 0.25.12
      "@esbuild/linux-ia32": 0.25.12
      "@esbuild/linux-loong64": 0.25.12
      "@esbuild/linux-mips64el": 0.25.12
      "@esbuild/linux-ppc64": 0.25.12
      "@esbuild/linux-riscv64": 0.25.12
      "@esbuild/linux-s390x": 0.25.12
      "@esbuild/linux-x64": 0.25.12
      "@esbuild/netbsd-arm64": 0.25.12
      "@esbuild/netbsd-x64": 0.25.12
      "@esbuild/openbsd-arm64": 0.25.12
      "@esbuild/openbsd-x64": 0.25.12
      "@esbuild/openharmony-arm64": 0.25.12
      "@esbuild/sunos-x64": 0.25.12
      "@esbuild/win32-arm64": 0.25.12
      "@esbuild/win32-ia32": 0.25.12
      "@esbuild/win32-x64": 0.25.12

  esbuild@0.27.7:
    optionalDependencies:
      "@esbuild/aix-ppc64": 0.27.7
      "@esbuild/android-arm": 0.27.7
      "@esbuild/android-arm64": 0.27.7
      "@esbuild/android-x64": 0.27.7
      "@esbuild/darwin-arm64": 0.27.7
      "@esbuild/darwin-x64": 0.27.7
      "@esbuild/freebsd-arm64": 0.27.7
      "@esbuild/freebsd-x64": 0.27.7
      "@esbuild/linux-arm": 0.27.7
      "@esbuild/linux-arm64": 0.27.7
      "@esbuild/linux-ia32": 0.27.7
      "@esbuild/linux-loong64": 0.27.7
      "@esbuild/linux-mips64el": 0.27.7
      "@esbuild/linux-ppc64": 0.27.7
      "@esbuild/linux-riscv64": 0.27.7
      "@esbuild/linux-s390x": 0.27.7
      "@esbuild/linux-x64": 0.27.7
      "@esbuild/netbsd-arm64": 0.27.7
      "@esbuild/netbsd-x64": 0.27.7
      "@esbuild/openbsd-arm64": 0.27.7
      "@esbuild/openbsd-x64": 0.27.7
      "@esbuild/openharmony-arm64": 0.27.7
      "@esbuild/sunos-x64": 0.27.7
      "@esbuild/win32-arm64": 0.27.7
      "@esbuild/win32-ia32": 0.27.7
      "@esbuild/win32-x64": 0.27.7

  escalade@3.2.0: {}

  escape-html@1.0.3: {}

  escape-string-regexp@4.0.0: {}

  eslint-scope@8.4.0:
    dependencies:
      esrecurse: 4.3.0
      estraverse: 5.3.0

  eslint-visitor-keys@3.4.3: {}

  eslint-visitor-keys@4.2.1: {}

  eslint-visitor-keys@5.0.1: {}

  eslint@9.39.4(jiti@2.6.1):
    dependencies:
      "@eslint-community/eslint-utils": 4.9.1(eslint@9.39.4(jiti@2.6.1))
      "@eslint-community/regexpp": 4.12.2
      "@eslint/config-array": 0.21.2
      "@eslint/config-helpers": 0.4.2
      "@eslint/core": 0.17.0
      "@eslint/eslintrc": 3.3.5
      "@eslint/js": 9.39.4
      "@eslint/plugin-kit": 0.4.1
      "@humanfs/node": 0.16.8
      "@humanwhocodes/module-importer": 1.0.1
      "@humanwhocodes/retry": 0.4.3
      "@types/estree": 1.0.8
      ajv: 6.15.0
      chalk: 4.1.2
      cross-spawn: 7.0.6
      debug: 4.4.3
      escape-string-regexp: 4.0.0
      eslint-scope: 8.4.0
      eslint-visitor-keys: 4.2.1
      espree: 10.4.0
      esquery: 1.7.0
      esutils: 2.0.3
      fast-deep-equal: 3.1.3
      file-entry-cache: 8.0.0
      find-up: 5.0.0
      glob-parent: 6.0.2
      ignore: 5.3.2
      imurmurhash: 0.1.4
      is-glob: 4.0.3
      json-stable-stringify-without-jsonify: 1.0.1
      lodash.merge: 4.6.2
      minimatch: 3.1.5
      natural-compare: 1.4.0
      optionator: 0.9.4
    optionalDependencies:
      jiti: 2.6.1
    transitivePeerDependencies:
      - supports-color

  espree@10.4.0:
    dependencies:
      acorn: 8.16.0
      acorn-jsx: 5.3.2(acorn@8.16.0)
      eslint-visitor-keys: 4.2.1

  esquery@1.7.0:
    dependencies:
      estraverse: 5.3.0

  esrecurse@4.3.0:
    dependencies:
      estraverse: 5.3.0

  estraverse@5.3.0: {}

  esutils@2.0.3: {}

  etag@1.8.1: {}

  expand-template@2.0.3: {}

  exponential-backoff@3.1.3: {}

  express@5.2.1:
    dependencies:
      accepts: 2.0.0
      body-parser: 2.2.2
      content-disposition: 1.1.0
      content-type: 1.0.5
      cookie: 0.7.2
      cookie-signature: 1.2.2
      debug: 4.4.3
      depd: 2.0.0
      encodeurl: 2.0.0
      escape-html: 1.0.3
      etag: 1.8.1
      finalhandler: 2.1.1
      fresh: 2.0.0
      http-errors: 2.0.1
      merge-descriptors: 2.0.0
      mime-types: 3.0.2
      on-finished: 2.4.1
      once: 1.4.0
      parseurl: 1.3.3
      proxy-addr: 2.0.7
      qs: 6.15.1
      range-parser: 1.2.1
      router: 2.2.0
      send: 1.2.1
      serve-static: 2.2.1
      statuses: 2.0.2
      type-is: 2.0.1
      vary: 1.1.2
    transitivePeerDependencies:
      - supports-color

  extract-zip@2.0.1:
    dependencies:
      debug: 4.4.3
      get-stream: 5.2.0
      yauzl: 2.10.0
    optionalDependencies:
      "@types/yauzl": 2.10.3
    transitivePeerDependencies:
      - supports-color

  extsprintf@1.4.1:
    optional: true

  fast-deep-equal@3.1.3: {}

  fast-glob@3.3.3:
    dependencies:
      "@nodelib/fs.stat": 2.0.5
      "@nodelib/fs.walk": 1.2.8
      glob-parent: 5.1.2
      merge2: 1.4.1
      micromatch: 4.0.8

  fast-json-stable-stringify@2.1.0: {}

  fast-levenshtein@2.0.6: {}

  fastq@1.20.1:
    dependencies:
      reusify: 1.1.0

  fd-slicer@1.1.0:
    dependencies:
      pend: 1.2.0

  fdir@6.5.0(picomatch@4.0.4):
    optionalDependencies:
      picomatch: 4.0.4

  file-entry-cache@8.0.0:
    dependencies:
      flat-cache: 4.0.1

  file-uri-to-path@1.0.0: {}

  filelist@1.0.6:
    dependencies:
      minimatch: 5.1.9

  fill-range@7.1.1:
    dependencies:
      to-regex-range: 5.0.1

  finalhandler@2.1.1:
    dependencies:
      debug: 4.4.3
      encodeurl: 2.0.0
      escape-html: 1.0.3
      on-finished: 2.4.1
      parseurl: 1.3.3
      statuses: 2.0.2
    transitivePeerDependencies:
      - supports-color

  find-up@5.0.0:
    dependencies:
      locate-path: 6.0.0
      path-exists: 4.0.0

  flat-cache@4.0.1:
    dependencies:
      flatted: 3.4.2
      keyv: 4.5.4

  flatted@3.4.2: {}

  form-data@4.0.5:
    dependencies:
      asynckit: 0.4.0
      combined-stream: 1.0.8
      es-set-tostringtag: 2.1.0
      hasown: 2.0.3
      mime-types: 2.1.35

  forwarded@0.2.0: {}

  fraction.js@5.3.4: {}

  fresh@2.0.0: {}

  fs-constants@1.0.0: {}

  fs-extra@10.1.0:
    dependencies:
      graceful-fs: 4.2.11
      jsonfile: 6.2.1
      universalify: 2.0.1

  fs-extra@11.3.4:
    dependencies:
      graceful-fs: 4.2.11
      jsonfile: 6.2.1
      universalify: 2.0.1

  fs-extra@7.0.1:
    dependencies:
      graceful-fs: 4.2.11
      jsonfile: 4.0.0
      universalify: 0.1.2

  fs-extra@8.1.0:
    dependencies:
      graceful-fs: 4.2.11
      jsonfile: 4.0.0
      universalify: 0.1.2

  fs-extra@9.1.0:
    dependencies:
      at-least-node: 1.0.0
      graceful-fs: 4.2.11
      jsonfile: 6.2.1
      universalify: 2.0.1

  fs.realpath@1.0.0: {}

  fsevents@2.3.3:
    optional: true

  function-bind@1.1.2: {}

  gensync@1.0.0-beta.2: {}

  get-caller-file@2.0.5: {}

  get-intrinsic@1.3.0:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-define-property: 1.0.1
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      function-bind: 1.1.2
      get-proto: 1.0.1
      gopd: 1.2.0
      has-symbols: 1.1.0
      hasown: 2.0.3
      math-intrinsics: 1.1.0

  get-nonce@1.0.1: {}

  get-proto@1.0.1:
    dependencies:
      dunder-proto: 1.0.1
      es-object-atoms: 1.1.1

  get-stream@5.2.0:
    dependencies:
      pump: 3.0.4

  get-tsconfig@4.14.0:
    dependencies:
      resolve-pkg-maps: 1.0.0

  github-from-package@0.0.0: {}

  glob-parent@5.1.2:
    dependencies:
      is-glob: 4.0.3

  glob-parent@6.0.2:
    dependencies:
      is-glob: 4.0.3

  glob@7.2.3:
    dependencies:
      fs.realpath: 1.0.0
      inflight: 1.0.6
      inherits: 2.0.4
      minimatch: 3.1.5
      once: 1.4.0
      path-is-absolute: 1.0.1

  global-agent@3.0.0:
    dependencies:
      boolean: 3.2.0
      es6-error: 4.1.1
      matcher: 3.0.0
      roarr: 2.15.4
      semver: 7.7.4
      serialize-error: 7.0.1
    optional: true

  globals@14.0.0: {}

  globals@16.5.0: {}

  globalthis@1.0.4:
    dependencies:
      define-properties: 1.2.1
      gopd: 1.2.0
    optional: true

  gopd@1.2.0: {}

  got@11.8.6:
    dependencies:
      "@sindresorhus/is": 4.6.0
      "@szmarczak/http-timer": 4.0.6
      "@types/cacheable-request": 6.0.3
      "@types/responselike": 1.0.3
      cacheable-lookup: 5.0.4
      cacheable-request: 7.0.4
      decompress-response: 6.0.0
      http2-wrapper: 1.0.3
      lowercase-keys: 2.0.0
      p-cancelable: 2.1.1
      responselike: 2.0.1

  graceful-fs@4.2.11: {}

  has-flag@4.0.0: {}

  has-property-descriptors@1.0.2:
    dependencies:
      es-define-property: 1.0.1
    optional: true

  has-symbols@1.1.0: {}

  has-tostringtag@1.0.2:
    dependencies:
      has-symbols: 1.1.0

  hasown@2.0.3:
    dependencies:
      function-bind: 1.1.2

  hosted-git-info@4.1.0:
    dependencies:
      lru-cache: 6.0.0

  http-cache-semantics@4.2.0: {}

  http-errors@2.0.1:
    dependencies:
      depd: 2.0.0
      inherits: 2.0.4
      setprototypeof: 1.2.0
      statuses: 2.0.2
      toidentifier: 1.0.1

  http-proxy-agent@7.0.2:
    dependencies:
      agent-base: 7.1.4
      debug: 4.4.3
    transitivePeerDependencies:
      - supports-color

  http2-wrapper@1.0.3:
    dependencies:
      quick-lru: 5.1.1
      resolve-alpn: 1.2.1

  https-proxy-agent@7.0.6:
    dependencies:
      agent-base: 7.1.4
      debug: 4.4.3
    transitivePeerDependencies:
      - supports-color

  iconv-corefoundation@1.1.7:
    dependencies:
      cli-truncate: 2.1.0
      node-addon-api: 1.7.2
    optional: true

  iconv-lite@0.6.3:
    dependencies:
      safer-buffer: 2.1.2

  iconv-lite@0.7.2:
    dependencies:
      safer-buffer: 2.1.2

  ieee754@1.2.1: {}

  ignore@5.3.2: {}

  ignore@7.0.5: {}

  import-fresh@3.3.1:
    dependencies:
      parent-module: 1.0.1
      resolve-from: 4.0.0

  imurmurhash@0.1.4: {}

  inflight@1.0.6:
    dependencies:
      once: 1.4.0
      wrappy: 1.0.2

  inherits@2.0.4: {}

  ini@1.3.8: {}

  ipaddr.js@1.9.1: {}

  is-binary-path@2.1.0:
    dependencies:
      binary-extensions: 2.3.0

  is-core-module@2.16.1:
    dependencies:
      hasown: 2.0.3

  is-extglob@2.1.1: {}

  is-fullwidth-code-point@3.0.0: {}

  is-glob@4.0.3:
    dependencies:
      is-extglob: 2.1.1

  is-number@7.0.0: {}

  is-promise@4.0.0: {}

  isbinaryfile@4.0.10: {}

  isbinaryfile@5.0.7: {}

  isexe@2.0.0: {}

  isexe@3.1.5: {}

  isexe@4.0.0: {}

  jake@10.9.4:
    dependencies:
      async: 3.2.6
      filelist: 1.0.6
      picocolors: 1.1.1

  jiti@1.21.7: {}

  jiti@2.6.1: {}

  js-tokens@4.0.0: {}

  js-yaml@4.1.1:
    dependencies:
      argparse: 2.0.1

  jsesc@3.1.0: {}

  json-buffer@3.0.1: {}

  json-schema-traverse@0.4.1: {}

  json-stable-stringify-without-jsonify@1.0.1: {}

  json-stringify-safe@5.0.1:
    optional: true

  json5@2.2.3: {}

  jsonfile@4.0.0:
    optionalDependencies:
      graceful-fs: 4.2.11

  jsonfile@6.2.1:
    dependencies:
      universalify: 2.0.1
    optionalDependencies:
      graceful-fs: 4.2.11

  keyv@4.5.4:
    dependencies:
      json-buffer: 3.0.1

  lazy-val@1.0.5: {}

  levn@0.4.1:
    dependencies:
      prelude-ls: 1.2.1
      type-check: 0.4.0

  lilconfig@3.1.3: {}

  lines-and-columns@1.2.4: {}

  locate-path@6.0.0:
    dependencies:
      p-locate: 5.0.0

  lodash.merge@4.6.2: {}

  lodash@4.18.1: {}

  lowercase-keys@2.0.0: {}

  lru-cache@5.1.1:
    dependencies:
      yallist: 3.1.1

  lru-cache@6.0.0:
    dependencies:
      yallist: 4.0.0

  lucide-react@0.552.0(react@19.2.5):
    dependencies:
      react: 19.2.5

  magic-string@0.30.21:
    dependencies:
      "@jridgewell/sourcemap-codec": 1.5.5

  matcher@3.0.0:
    dependencies:
      escape-string-regexp: 4.0.0
    optional: true

  math-intrinsics@1.1.0: {}

  media-typer@0.3.0: {}

  media-typer@1.1.0: {}

  merge-descriptors@2.0.0: {}

  merge2@1.4.1: {}

  micromatch@4.0.8:
    dependencies:
      braces: 3.0.3
      picomatch: 2.3.2

  mime-db@1.52.0: {}

  mime-db@1.54.0: {}

  mime-types@2.1.35:
    dependencies:
      mime-db: 1.52.0

  mime-types@3.0.2:
    dependencies:
      mime-db: 1.54.0

  mime@2.6.0: {}

  mimic-response@1.0.1: {}

  mimic-response@3.1.0: {}

  minimatch@10.2.5:
    dependencies:
      brace-expansion: 5.0.5

  minimatch@3.1.5:
    dependencies:
      brace-expansion: 1.1.14

  minimatch@5.1.9:
    dependencies:
      brace-expansion: 2.1.0

  minimatch@9.0.9:
    dependencies:
      brace-expansion: 2.1.0

  minimist@1.2.8: {}

  minipass@7.1.3: {}

  minizlib@3.1.0:
    dependencies:
      minipass: 7.1.3

  mkdirp-classic@0.5.3: {}

  mkdirp@0.5.6:
    dependencies:
      minimist: 1.2.8

  ms@2.1.3: {}

  multer@2.1.1:
    dependencies:
      append-field: 1.0.0
      busboy: 1.6.0
      concat-stream: 2.0.0
      type-is: 1.6.18

  mz@2.7.0:
    dependencies:
      any-promise: 1.3.0
      object-assign: 4.1.1
      thenify-all: 1.6.0

  nanoid@3.3.12: {}

  napi-build-utils@2.0.0: {}

  natural-compare@1.4.0: {}

  negotiator@1.0.0: {}

  node-abi@3.90.0:
    dependencies:
      semver: 7.7.4

  node-abi@4.29.0:
    dependencies:
      semver: 7.7.4

  node-addon-api@1.7.2:
    optional: true

  node-api-version@0.2.1:
    dependencies:
      semver: 7.7.4

  node-gyp@12.3.0:
    dependencies:
      env-paths: 2.2.1
      exponential-backoff: 3.1.3
      graceful-fs: 4.2.11
      nopt: 9.0.0
      proc-log: 6.1.0
      semver: 7.7.4
      tar: 7.5.13
      tinyglobby: 0.2.16
      undici: 6.25.0
      which: 6.0.1

  node-releases@2.0.38: {}

  nopt@9.0.0:
    dependencies:
      abbrev: 4.0.0

  normalize-path@3.0.0: {}

  normalize-url@6.1.0: {}

  object-assign@4.1.1: {}

  object-hash@3.0.0: {}

  object-inspect@1.13.4: {}

  object-keys@1.1.1:
    optional: true

  on-exit-leak-free@2.1.2: {}

  on-finished@2.4.1:
    dependencies:
      ee-first: 1.1.1

  once@1.4.0:
    dependencies:
      wrappy: 1.0.2

  optionator@0.9.4:
    dependencies:
      deep-is: 0.1.4
      fast-levenshtein: 2.0.6
      levn: 0.4.1
      prelude-ls: 1.2.1
      type-check: 0.4.0
      word-wrap: 1.2.5

  p-cancelable@2.1.1: {}

  p-limit@3.1.0:
    dependencies:
      yocto-queue: 0.1.0

  p-locate@5.0.0:
    dependencies:
      p-limit: 3.1.0

  parent-module@1.0.1:
    dependencies:
      callsites: 3.1.0

  parseurl@1.3.3: {}

  path-exists@4.0.0: {}

  path-is-absolute@1.0.1: {}

  path-key@3.1.1: {}

  path-parse@1.0.7: {}

  path-to-regexp@8.4.2: {}

  pe-library@0.4.1: {}

  pend@1.2.0: {}

  picocolors@1.1.1: {}

  picomatch@2.3.2: {}

  picomatch@4.0.4: {}

  pify@2.3.0: {}

  pino-abstract-transport@3.0.0:
    dependencies:
      split2: 4.2.0

  pino-http@11.0.0:
    dependencies:
      get-caller-file: 2.0.5
      pino: 10.3.1
      pino-std-serializers: 7.1.0
      process-warning: 5.0.0

  pino-std-serializers@7.1.0: {}

  pino@10.3.1:
    dependencies:
      "@pinojs/redact": 0.4.0
      atomic-sleep: 1.0.0
      on-exit-leak-free: 2.1.2
      pino-abstract-transport: 3.0.0
      pino-std-serializers: 7.1.0
      process-warning: 5.0.0
      quick-format-unescaped: 4.0.4
      real-require: 0.2.0
      safe-stable-stringify: 2.5.0
      sonic-boom: 4.2.1
      thread-stream: 4.0.0

  pirates@4.0.7: {}

  plist@3.1.0:
    dependencies:
      "@xmldom/xmldom": 0.8.13
      base64-js: 1.5.1
      xmlbuilder: 15.1.1

  plist@3.1.1:
    dependencies:
      "@xmldom/xmldom": 0.9.10
      base64-js: 1.5.1
      xmlbuilder: 15.1.1
    optional: true

  postcss-import@15.1.0(postcss@8.5.13):
    dependencies:
      postcss: 8.5.13
      postcss-value-parser: 4.2.0
      read-cache: 1.0.0
      resolve: 1.22.12

  postcss-js@4.1.0(postcss@8.5.13):
    dependencies:
      camelcase-css: 2.0.1
      postcss: 8.5.13

  postcss-load-config@6.0.1(jiti@1.21.7)(postcss@8.5.13)(tsx@4.21.0):
    dependencies:
      lilconfig: 3.1.3
    optionalDependencies:
      jiti: 1.21.7
      postcss: 8.5.13
      tsx: 4.21.0

  postcss-nested@6.2.0(postcss@8.5.13):
    dependencies:
      postcss: 8.5.13
      postcss-selector-parser: 6.1.2

  postcss-selector-parser@6.1.2:
    dependencies:
      cssesc: 3.0.0
      util-deprecate: 1.0.2

  postcss-value-parser@4.2.0: {}

  postcss@8.5.13:
    dependencies:
      nanoid: 3.3.12
      picocolors: 1.1.1
      source-map-js: 1.2.1

  postject@1.0.0-alpha.6:
    dependencies:
      commander: 9.5.0
    optional: true

  prebuild-install@7.1.3:
    dependencies:
      detect-libc: 2.1.2
      expand-template: 2.0.3
      github-from-package: 0.0.0
      minimist: 1.2.8
      mkdirp-classic: 0.5.3
      napi-build-utils: 2.0.0
      node-abi: 3.90.0
      pump: 3.0.4
      rc: 1.2.8
      simple-get: 4.0.1
      tar-fs: 2.1.4
      tunnel-agent: 0.6.0

  prelude-ls@1.2.1: {}

  prettier@3.8.3: {}

  proc-log@6.1.0: {}

  process-warning@5.0.0: {}

  progress@2.0.3: {}

  promise-retry@2.0.1:
    dependencies:
      err-code: 2.0.3
      retry: 0.12.0

  proper-lockfile@4.1.2:
    dependencies:
      graceful-fs: 4.2.11
      retry: 0.12.0
      signal-exit: 3.0.7

  proxy-addr@2.0.7:
    dependencies:
      forwarded: 0.2.0
      ipaddr.js: 1.9.1

  pump@3.0.4:
    dependencies:
      end-of-stream: 1.4.5
      once: 1.4.0

  punycode@2.3.1: {}

  qs@6.15.1:
    dependencies:
      side-channel: 1.1.0

  queue-microtask@1.2.3: {}

  quick-format-unescaped@4.0.4: {}

  quick-lru@5.1.1: {}

  range-parser@1.2.1: {}

  raw-body@3.0.2:
    dependencies:
      bytes: 3.1.2
      http-errors: 2.0.1
      iconv-lite: 0.7.2
      unpipe: 1.0.0

  rc@1.2.8:
    dependencies:
      deep-extend: 0.6.0
      ini: 1.3.8
      minimist: 1.2.8
      strip-json-comments: 2.0.1

  react-dom@19.2.5(react@19.2.5):
    dependencies:
      react: 19.2.5
      scheduler: 0.27.0

  react-refresh@0.18.0: {}

  react-remove-scroll-bar@2.3.8(@types/react@19.2.14)(react@19.2.5):
    dependencies:
      react: 19.2.5
      react-style-singleton: 2.2.3(@types/react@19.2.14)(react@19.2.5)
      tslib: 2.8.1
    optionalDependencies:
      "@types/react": 19.2.14

  react-remove-scroll@2.7.2(@types/react@19.2.14)(react@19.2.5):
    dependencies:
      react: 19.2.5
      react-remove-scroll-bar: 2.3.8(@types/react@19.2.14)(react@19.2.5)
      react-style-singleton: 2.2.3(@types/react@19.2.14)(react@19.2.5)
      tslib: 2.8.1
      use-callback-ref: 1.3.3(@types/react@19.2.14)(react@19.2.5)
      use-sidecar: 1.1.3(@types/react@19.2.14)(react@19.2.5)
    optionalDependencies:
      "@types/react": 19.2.14

  react-style-singleton@2.2.3(@types/react@19.2.14)(react@19.2.5):
    dependencies:
      get-nonce: 1.0.1
      react: 19.2.5
      tslib: 2.8.1
    optionalDependencies:
      "@types/react": 19.2.14

  react@19.2.5: {}

  read-binary-file-arch@1.0.6:
    dependencies:
      debug: 4.4.3
    transitivePeerDependencies:
      - supports-color

  read-cache@1.0.0:
    dependencies:
      pify: 2.3.0

  readable-stream@3.6.2:
    dependencies:
      inherits: 2.0.4
      string_decoder: 1.3.0
      util-deprecate: 1.0.2

  readdirp@3.6.0:
    dependencies:
      picomatch: 2.3.2

  real-require@0.2.0: {}

  require-directory@2.1.1: {}

  resedit@1.7.2:
    dependencies:
      pe-library: 0.4.1

  resolve-alpn@1.2.1: {}

  resolve-from@4.0.0: {}

  resolve-pkg-maps@1.0.0: {}

  resolve@1.22.12:
    dependencies:
      es-errors: 1.3.0
      is-core-module: 2.16.1
      path-parse: 1.0.7
      supports-preserve-symlinks-flag: 1.0.0

  responselike@2.0.1:
    dependencies:
      lowercase-keys: 2.0.0

  retry@0.12.0: {}

  reusify@1.1.0: {}

  rimraf@2.6.3:
    dependencies:
      glob: 7.2.3

  roarr@2.15.4:
    dependencies:
      boolean: 3.2.0
      detect-node: 2.1.0
      globalthis: 1.0.4
      json-stringify-safe: 5.0.1
      semver-compare: 1.0.0
      sprintf-js: 1.1.3
    optional: true

  rollup@4.60.2:
    dependencies:
      "@types/estree": 1.0.8
    optionalDependencies:
      "@rollup/rollup-android-arm-eabi": 4.60.2
      "@rollup/rollup-android-arm64": 4.60.2
      "@rollup/rollup-darwin-arm64": 4.60.2
      "@rollup/rollup-darwin-x64": 4.60.2
      "@rollup/rollup-freebsd-arm64": 4.60.2
      "@rollup/rollup-freebsd-x64": 4.60.2
      "@rollup/rollup-linux-arm-gnueabihf": 4.60.2
      "@rollup/rollup-linux-arm-musleabihf": 4.60.2
      "@rollup/rollup-linux-arm64-gnu": 4.60.2
      "@rollup/rollup-linux-arm64-musl": 4.60.2
      "@rollup/rollup-linux-loong64-gnu": 4.60.2
      "@rollup/rollup-linux-loong64-musl": 4.60.2
      "@rollup/rollup-linux-ppc64-gnu": 4.60.2
      "@rollup/rollup-linux-ppc64-musl": 4.60.2
      "@rollup/rollup-linux-riscv64-gnu": 4.60.2
      "@rollup/rollup-linux-riscv64-musl": 4.60.2
      "@rollup/rollup-linux-s390x-gnu": 4.60.2
      "@rollup/rollup-linux-x64-gnu": 4.60.2
      "@rollup/rollup-linux-x64-musl": 4.60.2
      "@rollup/rollup-openbsd-x64": 4.60.2
      "@rollup/rollup-openharmony-arm64": 4.60.2
      "@rollup/rollup-win32-arm64-msvc": 4.60.2
      "@rollup/rollup-win32-ia32-msvc": 4.60.2
      "@rollup/rollup-win32-x64-gnu": 4.60.2
      "@rollup/rollup-win32-x64-msvc": 4.60.2
      fsevents: 2.3.3

  router@2.2.0:
    dependencies:
      debug: 4.4.3
      depd: 2.0.0
      is-promise: 4.0.0
      parseurl: 1.3.3
      path-to-regexp: 8.4.2
    transitivePeerDependencies:
      - supports-color

  run-parallel@1.2.0:
    dependencies:
      queue-microtask: 1.2.3

  safe-buffer@5.2.1: {}

  safe-stable-stringify@2.5.0: {}

  safer-buffer@2.1.2: {}

  sanitize-filename@1.6.4:
    dependencies:
      truncate-utf8-bytes: 1.0.2

  sax@1.6.0: {}

  scheduler@0.27.0: {}

  semver-compare@1.0.0:
    optional: true

  semver@5.7.2: {}

  semver@6.3.1: {}

  semver@7.7.4: {}

  send@1.2.1:
    dependencies:
      debug: 4.4.3
      encodeurl: 2.0.0
      escape-html: 1.0.3
      etag: 1.8.1
      fresh: 2.0.0
      http-errors: 2.0.1
      mime-types: 3.0.2
      ms: 2.1.3
      on-finished: 2.4.1
      range-parser: 1.2.1
      statuses: 2.0.2
    transitivePeerDependencies:
      - supports-color

  serialize-error@7.0.1:
    dependencies:
      type-fest: 0.13.1
    optional: true

  serve-static@2.2.1:
    dependencies:
      encodeurl: 2.0.0
      escape-html: 1.0.3
      parseurl: 1.3.3
      send: 1.2.1
    transitivePeerDependencies:
      - supports-color

  setprototypeof@1.2.0: {}

  shebang-command@2.0.0:
    dependencies:
      shebang-regex: 3.0.0

  shebang-regex@3.0.0: {}

  side-channel-list@1.0.1:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4

  side-channel-map@1.0.1:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4

  side-channel-weakmap@1.0.2:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4
      side-channel-map: 1.0.1

  side-channel@1.1.0:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4
      side-channel-list: 1.0.1
      side-channel-map: 1.0.1
      side-channel-weakmap: 1.0.2

  signal-exit@3.0.7: {}

  simple-concat@1.0.1: {}

  simple-get@4.0.1:
    dependencies:
      decompress-response: 6.0.0
      once: 1.4.0
      simple-concat: 1.0.1

  simple-update-notifier@2.0.0:
    dependencies:
      semver: 7.7.4

  slice-ansi@3.0.0:
    dependencies:
      ansi-styles: 4.3.0
      astral-regex: 2.0.0
      is-fullwidth-code-point: 3.0.0
    optional: true

  smart-buffer@4.2.0:
    optional: true

  sonic-boom@4.2.1:
    dependencies:
      atomic-sleep: 1.0.0

  source-map-js@1.2.1: {}

  source-map-support@0.5.21:
    dependencies:
      buffer-from: 1.1.2
      source-map: 0.6.1

  source-map@0.6.1: {}

  split2@4.2.0: {}

  sprintf-js@1.1.3:
    optional: true

  stat-mode@1.0.0: {}

  statuses@2.0.2: {}

  streamsearch@1.1.0: {}

  string-width@4.2.3:
    dependencies:
      emoji-regex: 8.0.0
      is-fullwidth-code-point: 3.0.0
      strip-ansi: 6.0.1

  string_decoder@1.3.0:
    dependencies:
      safe-buffer: 5.2.1

  strip-ansi@6.0.1:
    dependencies:
      ansi-regex: 5.0.1

  strip-json-comments@2.0.1: {}

  strip-json-comments@3.1.1: {}

  sucrase@3.35.1:
    dependencies:
      "@jridgewell/gen-mapping": 0.3.13
      commander: 4.1.1
      lines-and-columns: 1.2.4
      mz: 2.7.0
      pirates: 4.0.7
      tinyglobby: 0.2.16
      ts-interface-checker: 0.1.13

  sumchecker@3.0.1:
    dependencies:
      debug: 4.4.3
    transitivePeerDependencies:
      - supports-color

  supports-color@7.2.0:
    dependencies:
      has-flag: 4.0.0

  supports-preserve-symlinks-flag@1.0.0: {}

  tailwind-merge@3.5.0: {}

  tailwindcss@3.4.19(tsx@4.21.0):
    dependencies:
      "@alloc/quick-lru": 5.2.0
      arg: 5.0.2
      chokidar: 3.6.0
      didyoumean: 1.2.2
      dlv: 1.1.3
      fast-glob: 3.3.3
      glob-parent: 6.0.2
      is-glob: 4.0.3
      jiti: 1.21.7
      lilconfig: 3.1.3
      micromatch: 4.0.8
      normalize-path: 3.0.0
      object-hash: 3.0.0
      picocolors: 1.1.1
      postcss: 8.5.13
      postcss-import: 15.1.0(postcss@8.5.13)
      postcss-js: 4.1.0(postcss@8.5.13)
      postcss-load-config: 6.0.1(jiti@1.21.7)(postcss@8.5.13)(tsx@4.21.0)
      postcss-nested: 6.2.0(postcss@8.5.13)
      postcss-selector-parser: 6.1.2
      resolve: 1.22.12
      sucrase: 3.35.1
    transitivePeerDependencies:
      - tsx
      - yaml

  tar-fs@2.1.4:
    dependencies:
      chownr: 1.1.4
      mkdirp-classic: 0.5.3
      pump: 3.0.4
      tar-stream: 2.2.0

  tar-stream@2.2.0:
    dependencies:
      bl: 4.1.0
      end-of-stream: 1.4.5
      fs-constants: 1.0.0
      inherits: 2.0.4
      readable-stream: 3.6.2

  tar@7.5.13:
    dependencies:
      "@isaacs/fs-minipass": 4.0.1
      chownr: 3.0.0
      minipass: 7.1.3
      minizlib: 3.1.0
      yallist: 5.0.0

  temp-file@3.4.0:
    dependencies:
      async-exit-hook: 2.0.1
      fs-extra: 10.1.0

  temp@0.9.4:
    dependencies:
      mkdirp: 0.5.6
      rimraf: 2.6.3

  thenify-all@1.6.0:
    dependencies:
      thenify: 3.3.1

  thenify@3.3.1:
    dependencies:
      any-promise: 1.3.0

  thread-stream@4.0.0:
    dependencies:
      real-require: 0.2.0

  tiny-async-pool@1.3.0:
    dependencies:
      semver: 5.7.2

  tinyglobby@0.2.16:
    dependencies:
      fdir: 6.5.0(picomatch@4.0.4)
      picomatch: 4.0.4

  tmp-promise@3.0.3:
    dependencies:
      tmp: 0.2.5

  tmp@0.2.5: {}

  to-regex-range@5.0.1:
    dependencies:
      is-number: 7.0.0

  toidentifier@1.0.1: {}

  truncate-utf8-bytes@1.0.2:
    dependencies:
      utf8-byte-length: 1.0.5

  ts-api-utils@2.5.0(typescript@5.9.3):
    dependencies:
      typescript: 5.9.3

  ts-interface-checker@0.1.13: {}

  tslib@2.8.1: {}

  tsx@4.21.0:
    dependencies:
      esbuild: 0.27.7
      get-tsconfig: 4.14.0
    optionalDependencies:
      fsevents: 2.3.3

  tunnel-agent@0.6.0:
    dependencies:
      safe-buffer: 5.2.1

  type-check@0.4.0:
    dependencies:
      prelude-ls: 1.2.1

  type-fest@0.13.1:
    optional: true

  type-is@1.6.18:
    dependencies:
      media-typer: 0.3.0
      mime-types: 2.1.35

  type-is@2.0.1:
    dependencies:
      content-type: 1.0.5
      media-typer: 1.1.0
      mime-types: 3.0.2

  typedarray@0.0.6: {}

  typescript-eslint@8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3):
    dependencies:
      "@typescript-eslint/eslint-plugin": 8.59.1(@typescript-eslint/parser@8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3))(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)
      "@typescript-eslint/parser": 8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)
      "@typescript-eslint/typescript-estree": 8.59.1(typescript@5.9.3)
      "@typescript-eslint/utils": 8.59.1(eslint@9.39.4(jiti@2.6.1))(typescript@5.9.3)
      eslint: 9.39.4(jiti@2.6.1)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  typescript@5.9.3: {}

  undici-types@6.21.0: {}

  undici@6.25.0: {}

  universalify@0.1.2: {}

  universalify@2.0.1: {}

  unpipe@1.0.0: {}

  update-browserslist-db@1.2.3(browserslist@4.28.2):
    dependencies:
      browserslist: 4.28.2
      escalade: 3.2.0
      picocolors: 1.1.1

  uri-js@4.4.1:
    dependencies:
      punycode: 2.3.1

  use-callback-ref@1.3.3(@types/react@19.2.14)(react@19.2.5):
    dependencies:
      react: 19.2.5
      tslib: 2.8.1
    optionalDependencies:
      "@types/react": 19.2.14

  use-sidecar@1.1.3(@types/react@19.2.14)(react@19.2.5):
    dependencies:
      detect-node-es: 1.1.0
      react: 19.2.5
      tslib: 2.8.1
    optionalDependencies:
      "@types/react": 19.2.14

  utf8-byte-length@1.0.5: {}

  util-deprecate@1.0.2: {}

  vary@1.1.2: {}

  verror@1.10.1:
    dependencies:
      assert-plus: 1.0.0
      core-util-is: 1.0.2
      extsprintf: 1.4.1
    optional: true

  vite@7.3.2(@types/node@22.19.17)(jiti@1.21.7)(tsx@4.21.0):
    dependencies:
      esbuild: 0.27.7
      fdir: 6.5.0(picomatch@4.0.4)
      picomatch: 4.0.4
      postcss: 8.5.13
      rollup: 4.60.2
      tinyglobby: 0.2.16
    optionalDependencies:
      "@types/node": 22.19.17
      fsevents: 2.3.3
      jiti: 1.21.7
      tsx: 4.21.0

  which@2.0.2:
    dependencies:
      isexe: 2.0.0

  which@5.0.0:
    dependencies:
      isexe: 3.1.5

  which@6.0.1:
    dependencies:
      isexe: 4.0.0

  word-wrap@1.2.5: {}

  wrap-ansi@7.0.0:
    dependencies:
      ansi-styles: 4.3.0
      string-width: 4.2.3
      strip-ansi: 6.0.1

  wrappy@1.0.2: {}

  xmlbuilder@15.1.1: {}

  y18n@5.0.8: {}

  yallist@3.1.1: {}

  yallist@4.0.0: {}

  yallist@5.0.0: {}

  yargs-parser@21.1.1: {}

  yargs@17.7.2:
    dependencies:
      cliui: 8.0.1
      escalade: 3.2.0
      get-caller-file: 2.0.5
      require-directory: 2.1.1
      string-width: 4.2.3
      y18n: 5.0.8
      yargs-parser: 21.1.1

  yauzl@2.10.0:
    dependencies:
      buffer-crc32: 0.2.13
      fd-slicer: 1.1.0

  yocto-queue@0.1.0: {}

  zod@4.4.3: {}
```

### pnpm-workspace.yaml

```
packages:
  - apps/*
  - packages/*
```

### README.md

````
# Inumaki AI

Inumaki AI is a Windows-first internal voice productivity tool that turns natural speech into polished text and pastes it into any focused app.

## MVP Scope

- Electron, React, and TypeScript desktop app
- Express and TypeScript backend API
- Local/offline Whisper adapter for transcription
- Groq-backed rewrite layer with deterministic local fallback
- SQLite persistence for preferences, usage metadata, and lightweight admin controls
- CI and Windows release workflow foundations

## Repository Layout

```text
apps/
  api/       Express API for dictation, rewrite orchestration, settings, admin, and usage
  desktop/   Electron desktop client with tray, hotkey, recording UI, settings, preview
packages/
  shared/    Shared output modes, settings, and API contracts
docs/        Architecture and workflow notes
```

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The API runs on `http://127.0.0.1:4141` by default. The desktop app reads `INUMAKI_API_BASE_URL`, defaulting to that local API URL.

For local transcription, install whisper.cpp and a ggml model:

```bash
pnpm setup:whisper
```

Or configure an existing local whisper.cpp installation:

```bash
WHISPER_CPP_BINARY=/path/to/whisper-cli
WHISPER_MODEL_PATH=/path/to/ggml-model.bin
```

## Common Commands

```bash
pnpm dev          # Run API and desktop in development
pnpm lint         # Lint workspace
pnpm typecheck    # Type-check all packages
pnpm test         # Run unit tests where present
pnpm build        # Build all packages
pnpm --filter @inumaki/desktop dist:win
```

## Branch Workflow

Use `main` as the protected release branch and `dev` as the integration branch. Feature work should branch from `dev` and merge back through pull requests.
````

### tsconfig.base.json

```
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "lib": ["ES2023", "DOM"],
    "moduleResolution": "Bundler",
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  }
}
```
