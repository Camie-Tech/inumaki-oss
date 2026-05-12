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

### Platform prerequisites

The API transcribes locally with whisper.cpp.

Windows does not require Visual Studio or a local C++ compiler for the default setup. The setup script downloads the official `whisper-bin-x64.zip` release asset, extracts `whisper-cli.exe`, and downloads the configured ggml model.

Windows:

1. Install Node.js and pnpm.
2. Use PowerShell.
3. Run `pnpm setup:whisper`.

Optional Windows overrides:

```powershell
$env:WHISPER_CPP_WINDOWS_ASSET = "whisper-bin-x64.zip"
pnpm setup:whisper

$env:WHISPER_CPP_WINDOWS_ASSET = "whisper-blas-bin-x64.zip"
pnpm setup:whisper
```

Only set `WHISPER_CPP_BUILD_FROM_SOURCE=true` if you intentionally want to compile whisper.cpp on Windows. Source builds require a real compiler toolchain such as Visual Studio Build Tools, Ninja, or another CMake-compatible C++ setup; VS Code alone is not a compiler.

Linux and macOS build whisper.cpp from source by default. Install the native tools first.

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

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp .env.example .env`.

The API runs on `http://127.0.0.1:4141` by default. The desktop app reads `INUMAKI_API_BASE_URL`, defaulting to that local API URL.

`pnpm setup:whisper` prepares whisper.cpp under `.local/whisper.cpp` and downloads `ggml-base.en.bin` by default. On Windows it downloads the official prebuilt release zip; on Linux/macOS it clones and builds whisper.cpp from source. No Whisper binaries or models are committed to the repo.

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

Runtime tuning:

```bash
WHISPER_CPP_THREADS=        # Empty uses an auto-detected local default
WHISPER_CPP_TIMEOUT_MS=120000
GROQ_FAST_MODEL=            # Optional low-latency rewrite model override
GROQ_TIMEOUT_MS=20000
SLOW_DICTATION_THRESHOLD_MS=5000
```

Dictation responses include timing fields, and the API returns a `Server-Timing` header so slow captures can be split into conversion, Whisper, rewrite, DB, and total request time.

Mock transcription is not supported.

## Common Commands

```bash
pnpm dev          # Run API and desktop in development
pnpm lint         # Lint workspace
pnpm typecheck    # Type-check all packages
pnpm test         # Run unit tests where present
pnpm build        # Build all packages
pnpm dist:win     # Build the Windows desktop installer
pnpm setup:whisper # Prepare whisper.cpp and download the default local model
```

## Branch Workflow

Use `main` as the protected release branch and `dev` as the integration branch. Feature work should branch from `dev` and merge back through pull requests.
