import * as process from "node:process";
import { spawn } from "node:child_process";

function spawnWait(...args) {
  const proc = spawn(...args);
  return new Promise((resolve) => {
    proc.on("close", resolve);
  });
}

const npm = /^win/.test(process.platform) ? "npm.cmd" : "npm";

await spawnWait(npm, ["install"], { stdio: "inherit" });
process.chdir("client/sandbox");
await spawnWait(npm, ["install"], { stdio: "inherit" });
await spawnWait(npm, ["run", "build"], { stdio: "inherit" });

process.chdir("../../server");
await spawnWait(npm, ["run", "build"], { stdio: "inherit" });
await spawnWait(npm, ["start"], { stdio: "inherit" });
