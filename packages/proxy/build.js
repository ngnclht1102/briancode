import { build } from "esbuild";
import fs from "fs";

fs.rmSync("dist", { recursive: true, force: true });

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: false,
  sourcemap: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.js",
  banner: {
    js: `import { createRequire } from "module"; const require = createRequire(import.meta.url);`,
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

console.log("Proxy bundled: dist/index.js");
