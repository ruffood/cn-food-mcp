import { defineConfig } from "tsup";
import { cpSync, mkdirSync } from "fs";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  onSuccess: async () => {
    // Copy foods.json to dist/data/ so readFileSync can find it at runtime
    mkdirSync("dist/data", { recursive: true });
    cpSync("src/data/foods.json", "dist/data/foods.json");
    console.log("Copied foods.json to dist/data/");
  },
});
