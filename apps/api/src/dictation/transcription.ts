import { execFile } from "node:child_process";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import ffmpegPath from "ffmpeg-static";

import { config } from "../config";

const execFileAsync = promisify(execFile);
const maxProcessBuffer = 1024 * 1024 * 20;

interface WhisperAssets {
  binaryPath: string;
  modelPath: string;
}

export async function transcribeAudio(audioPath: string): Promise<string> {
  const assets = resolveWhisperAssets();
  const wavPath = `${audioPath}.wav`;
  const outputBase = audioPath;
  const outputTextPath = `${outputBase}.txt`;

  try {
    await convertToWhisperWav(audioPath, wavPath);
    await execFileAsync(
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
      { maxBuffer: maxProcessBuffer },
    );

    const text = await fsPromises.readFile(outputTextPath, "utf8");
    return text.trim();
  } finally {
    await fsPromises.unlink(wavPath).catch(() => undefined);
    await fsPromises.unlink(outputTextPath).catch(() => undefined);
  }
}

function resolveWhisperAssets(): WhisperAssets {
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

  return { binaryPath, modelPath };
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

  await execFileAsync(
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
    { maxBuffer: maxProcessBuffer },
  );
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
