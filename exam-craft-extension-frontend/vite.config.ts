import { defineConfig } from "vitest/config";
import type { Plugin } from "vitest/config"; 
import react from "@vitejs/plugin-react";
import path from "path";

function bundleTextPlugin(): Plugin {
  return {
    name: "bundle-text",
    resolveId(id) {
      if (id.startsWith("bundle-text:")) {
        return "\0bundle-text-mock";
      }
    },
    load(id) {
      if (id === "\0bundle-text-mock") {
        return `export default "";`;
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), bundleTextPlugin()],
  resolve: {
    alias: {
      "~src": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.tsx", "src/**/*.ts"],
    },
  },
});