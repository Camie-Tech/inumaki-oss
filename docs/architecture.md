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
