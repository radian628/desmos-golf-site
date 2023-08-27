import * as process from "node:process";
import { spawn } from "node:child_process";

const isDev = process.argv[2] === "dev";

function spawnWait(...args) {
  const proc = spawn(...args);
  return new Promise((resolve) => {
    proc.on("close", resolve);
  });
}

const npm = /^win/.test(process.platform) ? "npm.cmd" : "npm";
const npx = /^win/.test(process.platform) ? "npx.cmd" : "npx";

if (isDev) {
  await spawnWait(npm, ["install"], { stdio: "inherit" });
  process.chdir("client/sandbox");
  await spawnWait(npm, ["install"], { stdio: "inherit" });
  process.chdir("../../server");
  await spawnWait(npm, ["install"], { stdio: "inherit" });
  process.chdir("../");

  await spawnWait(
    npx,
    [
      "concurrently",
      "--names",
      "ClientBuild,ServerBuild,Server",
      "npm --prefix client/sandbox run dev",
      "npm --prefix server run dev",
      "npm --prefix server run start",
    ],
    { stdio: "inherit" }
  );
} else {
  await spawnWait(npm, ["install"], { stdio: "inherit" });
  process.chdir("client/sandbox");
  await spawnWait(npm, ["install"], { stdio: "inherit" });
  await spawnWait(npm, ["run", "build"], { stdio: "inherit" });

  process.chdir("../../server");
  await spawnWait(npm, ["run", "build"], { stdio: "inherit" });
  await spawnWait(npm, ["start"], { stdio: "inherit" });
}
