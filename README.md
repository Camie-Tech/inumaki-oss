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

## Desktop Downloads

Internal users get the Windows installer from GitHub Releases. Each release attaches an asset named like `Inumaki-AI-0.1.0-x64.exe`.

Maintainers create that downloadable installer by pushing a version tag or manually running the `Release` workflow in GitHub Actions. See [docs/downloads.md](docs/downloads.md).

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The API runs on `http://127.0.0.1:4141` by default. The desktop app reads `INUMAKI_API_BASE_URL`, defaulting to that local API URL.

For local transcription, configure a whisper.cpp-compatible binary:

```bash
WHISPER_CPP_BINARY=/path/to/whisper-cli
WHISPER_MODEL_PATH=/path/to/ggml-model.bin
```

For development without Whisper installed, set `INUMAKI_ALLOW_MOCK_TRANSCRIPTION=true`.

## Common Commands

```bash
pnpm dev          # Run API and desktop in development
pnpm lint         # Lint workspace
pnpm typecheck    # Type-check all packages
pnpm test         # Run unit tests where present
pnpm build        # Build all packages
pnpm dist:win     # Build the Windows desktop installer
```

## Branch Workflow

Use `main` as the protected release branch and `dev` as the integration branch. Feature work should branch from `dev` and merge back through pull requests.
