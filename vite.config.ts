import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/onnxruntime-web/dist/*.wasm",
          dest: ".",
        },
        {
          src: "node_modules/onnxruntime-web/dist/*.mjs",
          dest: ".",
        },
      ],
    }),
  ],
  base: "https://github.com/vntion/chicken-part-detection",
});
