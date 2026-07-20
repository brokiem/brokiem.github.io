import {defineConfig} from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  base: "/",
  plugins: [solid()],
  build: {
    target: "baseline-widely-available",
    modulePreload: {polyfill: false},
    sourcemap: false,
  },
});
