import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import pinoHttp from "pino-http";

import { adminRouter } from "./admin/routes";
import { dictationRouter } from "./dictation/routes";
import { initializeDatabase } from "./db/client";
import { settingsRouter } from "./settings/routes";

export function createServer() {
  initializeDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/dictations", dictationRouter);
  app.use("/settings", settingsRouter);
  app.use("/admin", adminRouter);
  app.use(errorHandler);

  return app;
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message =
    error instanceof Error ? error.message : "Unexpected server error.";
  res.status(500).json({ error: message });
};
