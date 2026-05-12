import { execFile } from "node:child_process";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";

import type { DictationTimings } from "@inumaki/shared";
import ffmpegPath from "ffmpeg-static";

import { config } from "../config";

const execFileAsync = promisify(execFile);
const maxProcessBuffer = 1024 * 1024 * 20;

interface WhisperAssets {
  binaryPath: string;
  modelPath: string;
}

interface TranscriptionResult {
  text: string;
  timings: Pick<
    DictationTimings,
    "serverAudioConversionMs" | "serverTranscriptionMs" | "serverWhisperMs"
  >;
}

interface ExecFileError extends Error {
  killed?: boolean;
  signal?: NodeJS.Signals;
  stderr?: string;
}

let cachedWhisperAssets: WhisperAssets | null = null;

export async function transcribeAudio(
  audioPath: string,
): Promise<TranscriptionResult> {
  const startedAt = performance.now();
  const assets = resolveWhisperAssets();
  const wavPath = `${audioPath}.wav`;
  const outputBase = audioPath;
  const outputTextPath = `${outputBase}.txt`;

  try {
    const [, serverAudioConversionMs] = await measureMs(() =>
      convertToWhisperWav(audioPath, wavPath),
    );
    const [, serverWhisperMs] = await measureMs(() =>
      runWhisperCli(assets, wavPath, outputBase),
    );

    const text = await fsPromises.readFile(outputTextPath, "utf8");
    return {
      text: text.trim(),
      timings: {
        serverAudioConversionMs: roundMs(serverAudioConversionMs),
        serverTranscriptionMs: roundMs(performance.now() - startedAt),
        serverWhisperMs: roundMs(serverWhisperMs),
      },
    };
  } finally {
    await fsPromises.unlink(wavPath).catch(() => undefined);
    await fsPromises.unlink(outputTextPath).catch(() => undefined);
  }
}

function resolveWhisperAssets(): WhisperAssets {
  if (cachedWhisperAssets) {
    return cachedWhisperAssets;
  }

  const binaryPath = resolveWhisperBinary();
  const modelPath = resolveWhisperModel();

  if (!binaryPath || !modelPath) {
    const missing = [
      !binaryPath ? "whisper.cpp binary" : null,
      !modelPath ? "Whisper ggml model" : null,
    ]
      .filter(Boolean)
      .join(" and ");
    throw new Error(
      `${missing} not found. Run \`pnpm setup:whisper\`, or set WHISPER_CPP_BINARY and WHISPER_MODEL_PATH to existing local files.`,
    );
  }

  cachedWhisperAssets = { binaryPath, modelPath };
  return cachedWhisperAssets;
}

function resolveWhisperBinary(): string | null {
  const configured = fileIfExists(config.whisperBinary);
  if (configured) {
    return configured;
  }

  for (const candidate of whisperBinaryCandidates()) {
    const found = fileIfExists(candidate);
    if (found) {
      return found;
    }
  }

  return findOnPath("whisper-cli") ?? findOnPath("main");
}

function resolveWhisperModel(): string | null {
  const configured = fileIfExists(config.whisperModelPath);
  if (configured) {
    return configured;
  }

  for (const candidate of whisperModelCandidates()) {
    const found = fileIfExists(candidate);
    if (found) {
      return found;
    }
  }

  return null;
}

async function convertToWhisperWav(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  if (!ffmpegPath) {
    throw new Error(
      "ffmpeg-static did not provide an ffmpeg binary for this platform.",
    );
  }

  await execFileWithTimeout(
    ffmpegPath,
    [
      "-y",
      "-i",
      inputPath,
      "-ar",
      "16000",
      "-ac",
      "1",
      "-c:a",
      "pcm_s16le",
      outputPath,
    ],
    "Audio conversion",
  );
}

async function runWhisperCli(
  assets: WhisperAssets,
  wavPath: string,
  outputBase: string,
): Promise<void> {
  await execFileWithTimeout(
    assets.binaryPath,
    [
      "-m",
      assets.modelPath,
      "-f",
      wavPath,
      "-otxt",
      "-of",
      outputBase,
      "-t",
      String(config.whisperThreads),
    ],
    "Whisper transcription",
  );
}

async function execFileWithTimeout(
  command: string,
  args: string[],
  label: string,
): Promise<void> {
  try {
    await execFileAsync(command, args, {
      maxBuffer: maxProcessBuffer,
      timeout: config.whisperTimeoutMs,
    });
  } catch (error) {
    if (isExecFileError(error) && error.killed) {
      throw new Error(`${label} timed out after ${config.whisperTimeoutMs}ms.`);
    }

    if (isExecFileError(error) && error.stderr?.trim()) {
      throw new Error(`${label} failed: ${error.stderr.trim()}`);
    }

    throw error;
  }
}

async function measureMs<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const startedAt = performance.now();
  const result = await fn();
  return [result, performance.now() - startedAt];
}

function roundMs(value: number): number {
  return Math.round(value);
}

function isExecFileError(error: unknown): error is ExecFileError {
  return error instanceof Error;
}

function whisperBinaryCandidates(): string[] {
  const home = whisperCppHome();
  const names =
    process.platform === "win32"
      ? ["whisper-cli.exe", "main.exe"]
      : ["whisper-cli", "main"];

  return names.flatMap((name) => [
    path.join(home, "build", "bin", name),
    path.join(home, "build", "bin", "Release", name),
    path.join(home, name),
    path.join(apiRoot(), "bin", name),
  ]);
}

function whisperModelCandidates(): string[] {
  const fileName = `ggml-${config.whisperModelName}.bin`;

  return [
    path.join(whisperCppHome(), "models", fileName),
    path.join(apiRoot(), "models", fileName),
    path.join(repoRoot(), "models", "whisper", fileName),
  ];
}

function whisperCppHome(): string {
  return config.whisperCppHome
    ? path.resolve(repoRoot(), config.whisperCppHome)
    : path.join(repoRoot(), ".local", "whisper.cpp");
}

function fileIfExists(value: string): string | null {
  if (!value) {
    return null;
  }

  const resolved = path.resolve(repoRoot(), value);
  return fs.existsSync(resolved) && fs.statSync(resolved).isFile()
    ? resolved
    : null;
}

function findOnPath(command: string): string | null {
  const pathValue = process.env.PATH ?? "";
  const extensions =
    process.platform === "win32"
      ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";")
      : [""];

  for (const directory of pathValue.split(path.delimiter)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, `${command}${extension}`);
      const found = fileIfExists(candidate);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

function repoRoot(): string {
  return path.resolve(apiRoot(), "..", "..");
}

function apiRoot(): string {
  let current = __dirname;
  while (current !== path.dirname(current)) {
    const packageJsonPath = path.join(current, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      if (packageJson.name === "@inumaki/api") {
        return current;
      }
    }
    current = path.dirname(current);
  }

  return path.resolve(process.cwd());
}
