import { PluginOption, defineConfig, splitVendorChunkPlugin } from "vite";
import solidPlugin from "vite-plugin-solid";
// import devtools from 'solid-devtools/vite';
import { run } from "vite-plugin-run";
import * as path from "node:path";

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        sourcemapIgnoreList: (p) => {
          return path.normalize(p).includes("node_modules");
        },
      },
    },
  },
  base: "/",
});
