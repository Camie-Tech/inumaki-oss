import type { UsageSummary } from "@inumaki/shared";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { db, sqlite } from "../db/client";
import { users } from "../db/schema";

const inviteSchema = z.object({
  email: z.string().email(),
});

export const adminRouter = Router();

adminRouter.get("/users", (_req, res) => {
  res.json(db.select().from(users).all());
});

adminRouter.post("/users", (req, res) => {
  const input = inviteSchema.parse(req.body);
  const now = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    email: input.email,
    status: "active" as const,
    createdAt: now,
    disabledAt: null,
  };

  db.insert(users)
    .values(user)
    .onConflictDoUpdate({
      target: users.email,
      set: { status: "active", disabledAt: null },
    })
    .run();

  res.status(201).json(user);
});

adminRouter.post("/users/:id/disable", (req, res) => {
  const disabledAt = new Date().toISOString();
  db.update(users)
    .set({ status: "disabled", disabledAt })
    .where(eq(users.id, req.params.id))
    .run();
  res.status(204).send();
});

adminRouter.get("/usage", (_req, res) => {
  const row = sqlite
    .prepare(
      `
    SELECT
      SUM(CASE WHEN kind = 'dictation' THEN 1 ELSE 0 END) AS dictations,
      SUM(CASE WHEN kind = 'rewrite' THEN 1 ELSE 0 END) AS rewrites,
      SUM(audio_seconds) AS totalAudioSeconds
    FROM usage_events
    WHERE ok = 1
  `,
    )
    .get() as Partial<UsageSummary> | undefined;

  res.json({
    dictations: Number(row?.dictations ?? 0),
    rewrites: Number(row?.rewrites ?? 0),
    totalAudioSeconds: Number(row?.totalAudioSeconds ?? 0),
  } satisfies UsageSummary);
});
