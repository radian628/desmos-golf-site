import { PluginOption, defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
// import devtools from 'solid-devtools/vite';

const typedocPlugin: () => PluginOption = () => {
  return {
    name: "typedoc",
    resolveID(id: string) {
      if (id === "virtual:typedoc") {
      }
    },
  };
};

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
  },
  base: "./",
});
