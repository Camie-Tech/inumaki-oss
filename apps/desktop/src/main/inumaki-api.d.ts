declare module "@inumaki/api" {
  import type { Server } from "node:http";

  export interface StartedApi {
    host: string;
    port: number;
    baseUrl: string;
    server: Server;
    close: () => Promise<void>;
  }

  export function startApi(options?: {
    host?: string;
    port?: number;
  }): Promise<StartedApi>;
}
