# Transcription Performance Plan

## Implementation Status

- Implemented: client/API timing fields, `Server-Timing` response header, slow dictation logs, cached Whisper asset resolution, Whisper/Groq timeouts, auto-detected Whisper thread fallback, optional `GROQ_FAST_MODEL`, rewrite skip gates for raw/empty/filler/very-short transcripts, and overlay phase labels for preparing/transcribing/pasting.
- Remaining: warm Whisper worker/server, PCM or WAV capture path, chunk upload while recording, elapsed-time overlay, and benchmark script/default tuning.

## Problem

Dictation currently feels slow because the post-recording path is serialized:

1. The desktop records the whole session with `MediaRecorder`.
2. The renderer waits for `stop`, builds one WebM `Blob`, and uploads it to `/dictations`.
3. The API writes the upload to disk.
4. The API converts the complete upload to 16 kHz mono WAV with `ffmpeg-static`.
5. The API launches `whisper-cli` for that one request.
6. `whisper-cli` loads the model, transcribes, writes a `.txt` file, and exits.
7. The API optionally waits for Groq rewrite.
8. The desktop copies or pastes only after the full response returns.

The biggest likely costs are per-request Whisper process/model startup, whole-file conversion before transcription can begin, and the optional 70B-class rewrite call.

## Target

- Short dictation, 5-10 seconds: result visible or pasted in under 2 seconds after mark-complete at p50.
- Longer dictation, 30 seconds: result visible in under 5 seconds after mark-complete at p50.
- Raw transcript mode should avoid rewrite latency entirely.
- The overlay should show truthful phase progress so the app never appears stuck.

## Phase 1: Measure the Critical Path

Add timing data before changing architecture.

- Desktop: measure `recorder.stop` to `Blob`, upload request duration, response parse, clipboard write, and paste duration.
- API route: measure upload handling, preference lookup, audio conversion, Whisper execution, transcript file read, rewrite, usage DB writes, cleanup, and total request duration.
- Return timing fields in development responses or a `Server-Timing` header.
- Log slow requests with `usageId`, audio seconds, mode, model name, thread count, and timings.

Files:

- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/lib/api.ts`
- `apps/api/src/dictation/routes.ts`
- `apps/api/src/dictation/transcription.ts`

Acceptance:

- A single dictation produces timings that identify whether conversion, Whisper, or rewrite is the dominant delay.

## Phase 2: Remove Easy Latency

Make low-risk changes that improve the current design.

- Resolve Whisper binary/model paths once at API startup instead of on every request.
- Add an explicit timeout and clearer error for Whisper execution.
- Make `WHISPER_CPP_THREADS` default to the detected physical CPU count capped to a safe range, while keeping the environment override.
- Document Windows fast setup as the preferred path: use the optimized whisper.cpp release asset when available, not the plain binary, and benchmark it.
- For non-raw modes, use a low-latency rewrite model by default or add `GROQ_FAST_MODEL`; keep the current configurable model as an override for quality-sensitive users.
- Skip rewrite for empty or near-empty transcripts.

Files:

- `apps/api/src/config.ts`
- `apps/api/src/dictation/transcription.ts`
- `apps/api/src/rewrite/rewriter.ts`
- `README.md`

Acceptance:

- Same API contract, lower p50 latency, no regression to local/offline transcription.

## Phase 3: Stop Paying Model Startup Per Dictation

The current per-request `whisper-cli` launch likely reloads the model every time. Replace that with a warm transcription worker.

Preferred implementation:

- Add an API-side transcription worker module that starts once with the configured model.
- Keep the model loaded between requests.
- Queue requests with a small concurrency limit, usually 1 per local machine unless benchmarks prove parallelism helps.
- Expose health/status for "model warming", "ready", and "busy".
- Preserve the temporary-audio deletion rule.

Implementation options to evaluate:

- Use a persistent whisper.cpp server binary if available in the installed whisper.cpp build.
- Use a Node native binding only if it is actively maintained and packages cleanly for Windows/Electron.
- Keep `whisper-cli` as a fallback path behind `WHISPER_ENGINE=cli`.

Files:

- `apps/api/src/dictation/transcription.ts`
- `apps/api/src/server.ts`
- `apps/api/src/config.ts`
- `scripts/setup-whisper.cpp.mjs`

Acceptance:

- First dictation may warm the model, but subsequent dictations avoid model-load startup.
- Worker restart is automatic after failure.
- The API reports busy/ready state without blocking the desktop UI.

## Phase 4: Avoid Whole-File Conversion After Stop

The API currently converts WebM to WAV only after the user marks complete. Move capture closer to Whisper's input format.

Preferred implementation:

- Replace `MediaRecorder` audio capture with an `AudioWorklet` PCM capture path.
- Downsample to 16 kHz mono in the renderer.
- Encode WAV incrementally or upload raw PCM chunks with metadata.
- Keep `MediaRecorder` as a fallback for unsupported environments.

Follow-up:

- Upload chunks while recording, not only after stop.
- The server writes chunks to a temp file or worker stream as they arrive.
- On mark-complete, the server finalizes the last chunk and starts or completes transcription immediately.

Files:

- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/lib/api.ts`
- `apps/api/src/dictation/routes.ts`
- `apps/api/src/dictation/transcription.ts`

Acceptance:

- Conversion time is eliminated or reduced to near-zero for the main path.
- Network upload time overlaps with recording instead of starting after mark-complete.

## Phase 5: Improve Perceived Speed

Even when transcription is still running, the overlay should make the state obvious.

- Add phase text: "Preparing audio", "Transcribing", "Polishing", "Pasting".
- Show elapsed time after mark-complete.
- If chunked transcription is implemented, show partial transcript preview only in the overlay result state or a debug setting, not during normal hands-free capture.
- Keep Cancel available until the server starts finalization; after that, expose Close while work continues in the background only if the workflow can safely recover the result.

Files:

- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/main/index.ts`

Acceptance:

- Users can tell whether the app is recording, transcribing, rewriting, or pasting.
- The overlay no longer looks frozen during slow operations.

## Phase 6: Benchmark and Choose Defaults

Create a repeatable benchmark so model and engine choices are not guesswork.

- Add a script that runs sample audio through conversion, Whisper, and rewrite separately.
- Record audio seconds, model, threads, engine, CPU, OS, and timings.
- Compare default model, smaller model, quantized model, optimized Windows asset, and thread counts.
- Use benchmark results to choose default `WHISPER_CPP_MODEL`, `WHISPER_CPP_THREADS`, and recommended Windows asset.

Files:

- `scripts/benchmark-dictation.mjs`
- `README.md`
- `docs/downloads.md`

Acceptance:

- Default setup is based on measured latency and accuracy tradeoffs.
- Any future model change can be justified with benchmark output.

## Delivery Order

1. Add instrumentation and slow-request logs.
2. Make the current CLI path faster and safer.
3. Add a warm Whisper worker while keeping CLI fallback.
4. Replace post-stop WebM conversion with PCM/WAV capture.
5. Stream chunks during recording.
6. Tune model/thread defaults using benchmarks.

This order gives immediate visibility first, then lower-risk wins, then the architectural changes that should produce the largest latency reduction.
