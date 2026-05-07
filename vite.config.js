import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Antenaeum/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.html")
      }
    }
  }
});
