import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { config } from "../config";
import * as schema from "./schema";

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const sqlite = new Database(config.databasePath);
export const db = drizzle(sqlite, { schema });

export function initializeDatabase(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      disabled_at TEXT
    );

    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usage_events (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      mode TEXT,
      audio_seconds REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      ok INTEGER NOT NULL DEFAULT 1
    );
  `);
}
