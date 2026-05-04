import { config } from "./config";
import { createServer } from "./server";

const app = createServer();

app.listen(config.port, config.host, () => {
  console.log(`Inumaki API listening on http://${config.host}:${config.port}`);
});
