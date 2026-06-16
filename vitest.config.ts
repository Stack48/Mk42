import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true, // permet d'utiliser describe/it/expect sans les importer
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."), // résolution de l'alias @/* comme dans tsconfig
    },
  },
});
