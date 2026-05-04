import "dotenv/config";

import path from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/inumaki.sqlite";

export const config = {
  databasePath: databaseUrl.startsWith("file:")
    ? path.resolve(process.cwd(), databaseUrl.slice("file:".length))
    : path.resolve(process.cwd(), databaseUrl),
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.INUMAKI_API_PORT ?? 4141),
  allowMockTranscription:
    process.env.INUMAKI_ALLOW_MOCK_TRANSCRIPTION === "true",
  whisperBinary: process.env.WHISPER_CPP_BINARY ?? "",
  whisperModelPath: process.env.WHISPER_MODEL_PATH ?? "",
};
