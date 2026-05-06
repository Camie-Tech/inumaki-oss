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

### Native prerequisites

The API transcribes locally with whisper.cpp. Install Node/pnpm plus the native tools required to build whisper.cpp before running the app.

Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install -y git cmake build-essential
```

macOS:

```bash
xcode-select --install
brew install cmake
```

Windows:

1. Install Git for Windows.
2. Install Visual Studio Build Tools with the "Desktop development with C++" workload.
3. Install CMake and make sure it is available on `PATH`.
4. Run setup commands from PowerShell or a Developer PowerShell.

Verify the native toolchain:

```bash
git --version
cmake --version
g++ --version # Linux/macOS
```

### Project setup

```bash
pnpm install
cp .env.example .env
pnpm setup:whisper
pnpm dev
```

The API runs on `http://127.0.0.1:4141` by default. The desktop app reads `INUMAKI_API_BASE_URL`, defaulting to that local API URL.

`pnpm setup:whisper` clones official whisper.cpp under `.local/whisper.cpp`, builds `whisper-cli`, and downloads `ggml-base.en.bin` by default. No Whisper binaries or models are committed to the repo.

Useful setup overrides:

```bash
WHISPER_CPP_REF=v1.8.4 pnpm setup:whisper
WHISPER_CPP_MODEL=small.en pnpm setup:whisper
WHISPER_CPP_HOME=.local/whisper.cpp pnpm setup:whisper
```

You can also bypass the managed install with an existing local whisper.cpp binary and ggml model:

```bash
WHISPER_CPP_BINARY=/path/to/whisper-cli
WHISPER_MODEL_PATH=/path/to/ggml-base.en.bin
```

Mock transcription is not supported.

## Common Commands

```bash
pnpm dev          # Run API and desktop in development
pnpm lint         # Lint workspace
pnpm typecheck    # Type-check all packages
pnpm test         # Run unit tests where present
pnpm build        # Build all packages
pnpm dist:win     # Build the Windows desktop installer
pnpm setup:whisper # Build whisper.cpp and download the default local model
```

## Branch Workflow

Use `main` as the protected release branch and `dev` as the integration branch. Feature work should branch from `dev` and merge back through pull requests.
