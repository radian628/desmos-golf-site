import express from "express";
import { getServerConfig } from "./server-config.js";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createClientServerAPI } from "./api/client-server-api.js";
import sqlite3DatabaseAPI from "./db/sqlite-db-io-api.js";
import * as fs from "node:fs/promises";
import { puppeteerValidationAPI } from "./validation/validation-api.js";

const { hostname, port, adminPass } = await getServerConfig();

const app = express();

const api = createClientServerAPI(
  await sqlite3DatabaseAPI(),
  await puppeteerValidationAPI(`http://${hostname}:${port}`),
  adminPass
);

app.use(express.static("../client/sandbox/dist"));

const indexRoutes = ["/", "/sandbox", "/challenge/*", "/verify/*"];

for (const r of indexRoutes) {
  app.get(r, async (req, res) => {
    try {
      res.end(await fs.readFile("../client/sandbox/dist/index.html"));
    } catch {
      res.status(404).end("404 not found");
    }
  });
}

app.use(
  "/api",
  trpcExpress.createExpressMiddleware({
    router: api,
  })
);

// eslint-disable-next-line no-console
export const debugPrint = (...args: unknown[]) => console.log(args);

app.listen(port, hostname, () => {
  debugPrint(
    `Running Desmos Golf Server on port ${port}, hostname ${hostname}`
  );
});
