import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        privacy: fileURLToPath(new URL("privacy.html", import.meta.url)),
        terms: fileURLToPath(new URL("terms.html", import.meta.url)),
        contact: fileURLToPath(new URL("contact.html", import.meta.url))
      }
    }
  }
});
