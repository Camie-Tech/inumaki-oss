import { config } from "./config";
import { createServer, startApi } from "./server";

export { createServer, startApi };
export type { StartedApi } from "./server";

const isDirectRun =
  typeof require !== "undefined" && require.main === module;

if (isDirectRun) {
  const app = createServer();
  app.listen(config.port, config.host, () => {
    console.log(
      `Inumaki API listening on http://${config.host}:${config.port}`,
    );
  });
}
