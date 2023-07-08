import * as z from "zod";
import * as fs from "node:fs/promises";
import { SubmitAPICall, dbParser } from "../../shared/validation.js";

export async function getdbString() {
  return (await fs.readFile("db/db.json")).toString();
}

export async function getdb() {
  const db = JSON.parse(await getdbString());

  const parsedDB = dbParser.parse(db);

  return parsedDB;
}
