/* eslint-disable no-console */
import * as esbuild from "esbuild";
import { lessLoader } from "esbuild-plugin-less";
import { solidPlugin } from "esbuild-plugin-solid";
import * as fs from "node:fs/promises";
import * as chokidar from "chokidar";
import * as path from "node:path";

console.log("Client build script ran with ", process.argv);

const isDev = process.argv.includes("dev");

if (isDev) {
  console.log("Building for development.");
} else {
  console.log("Building for production.");
}

// plugin for the ?raw query param
// to make "raw" resources use the text loader
const rawQueryParamPlugin = {
  name: "raw",
  setup(build) {
    build.onResolve({ filter: /\?.*raw/ }, (args) => {
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "raw-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "raw-ns" }, async (args) => {
      return {
        contents: (
          await fs.readFile(args.path.replace(/\?.*$/, ""))
        ).toString(),
        loader: "text",
      };
    });
  },
};

// watch for changes to index.html
chokidar.watch(["index.html"]).on("all", (evt, path) => {
  console.log("Detected change to", path);
  fs.cp("index.html", "dist/index.html");
});

// actually build
let ctx = await esbuild.context({
  entryPoints: ["src/index.tsx"],
  outdir: "dist",
  plugins: [
    lessLoader(),
    solidPlugin(),
    rawQueryParamPlugin,
    {
      name: "build-notify",
      setup(build) {
        let time = Date.now();
        build.onStart(() => {
          time = Date.now();
          console.log("Build started!");
        });
        build.onEnd(() => {
          console.log(`Build ended! (took ${Date.now() - time}ms)`);
        });
      },
    },
  ],
  bundle: true,
  loader: {
    ".html": "text",
    ".eot": "file",
    ".woff": "file",
    ".woff2": "file",
    ".otf": "file",
    ".svg": "file",
    ".png": "file",
    ".ttf": "file",
  },
  sourcemap: isDev,
  format: "esm",
  publicPath: "/",
  minify: !isDev,
  metafile: isDev,
  splitting: true,
});

if (isDev) {
  ctx.watch();
} else {
  await ctx.rebuild();
  process.exit(0);
}

console.log("Watching for changes...");
