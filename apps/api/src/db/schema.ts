import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status", { enum: ["active", "disabled"] })
    .notNull()
    .default("active"),
  createdAt: text("created_at").notNull(),
  disabledAt: text("disabled_at"),
});

export const preferences = sqliteTable("preferences", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const usageEvents = sqliteTable("usage_events", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["dictation", "rewrite"] }).notNull(),
  mode: text("mode"),
  audioSeconds: real("audio_seconds").notNull().default(0),
  createdAt: text("created_at").notNull(),
  ok: integer("ok", { mode: "boolean" }).notNull().default(true),
});
