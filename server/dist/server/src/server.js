import express from "express";
import { getServerConfig } from "./server-config.js";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createClientServerAPI } from "./api/client-server-api.js";
import sqlite3DatabaseAPI from "./db/sqlite-db-io-api.js";
import * as fs from "node:fs/promises";
import { dummyValidationAPI } from "./validation/validation-api.js";
import { exit } from "node:process";
const secret = (await fs.readFile("secret.txt").catch(() => {
    console.error("Create a secret.txt file under the server directory so you have a key for database write access!");
    exit();
})).toString();
const config = await getServerConfig();
const app = express();
const api = createClientServerAPI(await sqlite3DatabaseAPI(), dummyValidationAPI(), secret);
app.use(express.static("../client/sandbox/dist"));
const indexRoutes = ["/", "/sandbox", "/challenge/*"];
for (const r of indexRoutes) {
    app.get(r, async (req, res) => {
        try {
            res.end(await fs.readFile("../client/sandbox/dist/index.html"));
        }
        catch {
            res.status(404).end("404 not found");
        }
    });
}
app.use("/api", trpcExpress.createExpressMiddleware({
    router: api,
}));
app.listen(config.port, config.hostname, () => {
    console.log(`Running Desmos Golf Server on port ${config.port}, hostname ${config.hostname}`);
    console.log("cwd", process.cwd());
});
