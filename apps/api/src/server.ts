import type { Server } from "node:http";

import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import pinoHttp from "pino-http";

import { adminRouter } from "./admin/routes";
import { config } from "./config";
import { dictationRouter } from "./dictation/routes";
import { initializeDatabase } from "./db/client";
import { settingsRouter } from "./settings/routes";

export interface StartedApi {
  host: string;
  port: number;
  baseUrl: string;
  server: Server;
  close: () => Promise<void>;
}

export async function startApi(options?: {
  host?: string;
  port?: number;
}): Promise<StartedApi> {
  const app = createServer();
  const host = options?.host ?? config.host;
  const port = options?.port ?? config.port;

  const server: Server = await new Promise((resolve, reject) => {
    const listener = app.listen(port, host, () => resolve(listener));
    listener.once("error", reject);
  });

  const address = server.address();
  const resolvedPort =
    typeof address === "object" && address ? address.port : port;

  return {
    host,
    port: resolvedPort,
    baseUrl: `http://${host}:${resolvedPort}`,
    server,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

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
