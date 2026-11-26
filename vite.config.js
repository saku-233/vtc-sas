import { readFileSync } from "node:fs";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";

const NOT_PREBUNDLED = new Set(["react", "react-dom", "@tanstack/react-start", "@tanstack/react-router", "@tanstack/react-router-ssr-query", "tailwindcss-animate"]);
const { dependencies } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const PREBUNDLE = [...Object.keys(dependencies).filter((name) => !NOT_PREBUNDLED.has(name))];

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  optimizeDeps: { include: PREBUNDLE },
  environments: {
    ssr: { optimizeDeps: { include: PREBUNDLE }, build: { sourcemap: true } },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" }, inspectorPort: false }),
    tanstackStart({ srcDirectory: "src" }),
    react(),
  ],
});
