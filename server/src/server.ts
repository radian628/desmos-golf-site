import express from "express";
import { getServerConfig } from "./server-config.js";
import { getdbString } from "./db.js";
import bodyParser from "body-parser";
import { apiCallParser } from "../../shared/validation.js";
import { submitGraph } from "./submit.js";

const config = await getServerConfig();

const app = express();

app.post("/api", bodyParser.json(), (req, res) => {
  const apiCall = apiCallParser.safeParse(req.body);
  console.log(apiCall);

  if (!apiCall.success) {
    res.status(400).end("Bad API call.");
    return;
  }

  const data = apiCall.data;

  if (data.type === "submit") {
    submitGraph(data);
    return;
  }
});

app.get("/db", async (req, res) => {
  res.end(await getdbString());
});

app.get("/", async (req, res) => {
  res.end(
    `<!DOCTYPE html><html><head></head><body>text content test!</body></html>`
  );
});

app.listen(config.port, config.hostname, () => {
  console.log(
    `Running Desmos Golf Server on port ${config.port}, hostname ${config.hostname}`
  );
});
