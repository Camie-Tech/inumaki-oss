import "dotenv/config";

import os from "node:os";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/inumaki.sqlite";
const defaultWhisperThreads = Math.min(
  8,
  Math.max(1, os.availableParallelism() - 1),
);

export const config = {
  databasePath: databaseUrl.startsWith("file:")
    ? path.resolve(process.cwd(), databaseUrl.slice("file:".length))
    : path.resolve(process.cwd(), databaseUrl),
  groqFastModel: process.env.GROQ_FAST_MODEL ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  groqTimeoutMs: readPositiveInteger("GROQ_TIMEOUT_MS", 20_000),
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.INUMAKI_API_PORT ?? 4141),
  slowDictationThresholdMs: readPositiveInteger(
    "SLOW_DICTATION_THRESHOLD_MS",
    5_000,
  ),
  whisperBinary: process.env.WHISPER_CPP_BINARY ?? "",
  whisperCppHome: process.env.WHISPER_CPP_HOME ?? "",
  whisperModelName: process.env.WHISPER_CPP_MODEL ?? "base.en",
  whisperModelPath: process.env.WHISPER_MODEL_PATH ?? "",
  whisperThreads: readPositiveInteger(
    "WHISPER_CPP_THREADS",
    defaultWhisperThreads,
  ),
  whisperTimeoutMs: readPositiveInteger("WHISPER_CPP_TIMEOUT_MS", 120_000),
};

function readPositiveInteger(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}
