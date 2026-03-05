import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  clean: true,
  format: ["esm"],
  target: "node18",
  sourcemap: true,
  splitting: false,
  banner: {
    js: "#!/usr/bin/env node"
  }
});
