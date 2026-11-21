import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function offlineShell(): Plugin {
  return {
    name: "nur-offline-shell",
    apply: "build",
    generateBundle: {
      order: "post",
      handler(_, bundle) {
        const worker = readFileSync(
          path.resolve(__dirname, "src/offline-worker.js"),
          "utf8",
        );
        const index = bundle["index.html"];
        const assets = Object.keys(bundle)
          .filter((name) => !name.endsWith(".map"))
          .sort();
        const publicShell = [
          "nur.svg",
          "manifest.webmanifest",
          "nur-180.png",
          "nur-192.png",
          "nur-512.png",
        ];
        const files = [...new Set(["index.html", ...publicShell, ...assets])];
        const hash = createHash("sha256")
          .update(worker)
          .update(JSON.stringify(files))
          .update(index?.type === "asset" ? index.source : "");
        for (const file of publicShell)
          hash.update(readFileSync(path.resolve(__dirname, "public", file)));
        const version = hash.digest("hex").slice(0, 16);
        this.emitFile({
          type: "asset",
          fileName: "sw.js",
          source: `const SHELL = ${JSON.stringify(files)};\nconst VERSION = ${JSON.stringify(version)};\n${worker}`,
        });
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), offlineShell()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
