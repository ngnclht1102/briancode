import { build } from "esbuild";
import fs from "fs";

fs.rmSync("dist", { recursive: true, force: true });

await build({
  entryPoints: ["src/cli.ts"],
  bundle: true,
  minify: false,
  sourcemap: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/cli.js",
  banner: {
    // esbuild ESM bundles need createRequire for some CJS deps
    js: `import { createRequire } from "module"; const require = createRequire(import.meta.url);`,
  },
  external: [
    // Native/binary modules that can't be bundled
    "fsevents",
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

// Copy public folder into dist so it's self-contained
if (fs.existsSync("public")) {
  fs.cpSync("public", "dist/public", { recursive: true });
}

console.log("Server bundled: dist/cli.js");
