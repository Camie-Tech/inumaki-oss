# inumaki-oss Project Memory

This file is the durable working memory for Camie Dev Console sessions in this repository.
It was auto-generated from a first-pass repository scan and should be refined as the project evolves.

## Product Overview

- Inumaki AI is a Windows-first internal voice productivity tool for developers.
- MVP flow: press/toggle hotkey, record microphone audio, transcribe locally with Whisper, rewrite with Groq/fallback logic, then copy or paste polished text into the focused app.

## Architecture

- pnpm monorepo with `apps/desktop`, `apps/api`, and `packages/shared`.
- Desktop app: Electron + React + TypeScript + electron-vite. Main process owns tray, default and per-mode global shortcut registration, launch-at-login registration for packaged builds, clipboard, and Windows paste IPC; renderer owns MediaRecorder capture, output mode selection, settings, preview, and admin UI.
- API app: Express + TypeScript. Routes cover `/dictations`, `/settings`, `/admin/users`, `/admin/usage`, and `/health`.
- Shared package exports output modes, labels, default settings, and API contract types.
- SQLite is the MVP persistence layer via `better-sqlite3` and Drizzle schema definitions. API creates tables on startup.
- Transcription uses local whisper.cpp. `pnpm setup:whisper` downloads the official Windows binary release by default on Windows, clones/builds whisper.cpp on Linux/macOS, and downloads the configured ggml model; `WHISPER_CPP_BINARY` and `WHISPER_MODEL_PATH` can override resolution.
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
- `pnpm dist:win` builds the Windows desktop installer from the repo root.
- `pnpm setup:whisper` builds local whisper.cpp and downloads the default ggml transcription model.
- API port is configured with `INUMAKI_API_PORT` and defaults to `4141`; desktop defaults to `INUMAKI_API_BASE_URL` or that same port.

## Conventions

- TypeScript is strict across the workspace.
- Use shared output/settings contracts from `packages/shared` rather than duplicating mode strings. `UserSettings.captureHotkeys` maps each output mode to its direct-capture accelerator.
- Desktop UI uses Tailwind defaults, `cn` from `clsx` + `tailwind-merge`, lucide icons, Radix Dialog for previews, and Radix AlertDialog for destructive confirmations.
- Mock transcription is forbidden; development and production must use local whisper.cpp inference.
- The API should not retain raw audio; uploaded audio is temporary and deleted after dictation processing.
- No authentication is implemented for the MVP; admin controls are intentionally lightweight.

## Important Files

- `README.md`
- `docs/architecture.md`
- `docs/branching.md`
- `docs/downloads.md`
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
- Packaged desktop builds default to launching at login with `--background`, so startup creates the tray app without showing the main window.
- Whisper integration expects a whisper.cpp-compatible CLI and ggml model; run `pnpm setup:whisper` because no model binaries are committed.
- `pnpm setup:whisper` requires git, CMake, and a C++ build toolchain for source builds; default Windows setup uses the official prebuilt whisper.cpp release asset instead of Visual Studio.
- Groq model is configurable via `GROQ_MODEL`; verify model choice before production use.
- `better-sqlite3`, Electron, and esbuild require pnpm approved build scripts; root `package.json` records these under `pnpm.onlyBuiltDependencies`.

## Recent Decisions

- Repository was initialized with Git on branch `main`.
- Branch workflow is documented as `main` for releases and `dev` for integration; CI triggers on both.
- Internal users download the desktop installer from GitHub Releases; `.github/workflows/release.yml` builds and uploads Windows release assets.
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
