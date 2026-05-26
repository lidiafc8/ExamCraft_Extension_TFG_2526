import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path"; 

export default defineConfig({
  plugins: [react()],
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
      exclude: ["src/models/**/*.ts", "src/**/*.d.ts", "src/types/**/*.ts"],
    },
  },
});