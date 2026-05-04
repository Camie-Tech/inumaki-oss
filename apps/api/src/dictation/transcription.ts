import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { config } from "../config";

const execFileAsync = promisify(execFile);

export async function transcribeAudio(audioPath: string): Promise<string> {
  if (config.allowMockTranscription) {
    return "This is a mock transcript for local development.";
  }

  if (!config.whisperBinary || !config.whisperModelPath) {
    throw new Error(
      "Local transcription is not configured. Set WHISPER_CPP_BINARY and WHISPER_MODEL_PATH, or use INUMAKI_ALLOW_MOCK_TRANSCRIPTION=true for development.",
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
