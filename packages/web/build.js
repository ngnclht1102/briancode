import { build } from "esbuild";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const outDir = "dist";

// Clean
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(`${outDir}/assets`, { recursive: true });

// 1. Bundle JS with code splitting (for lazy-loaded shiki grammars)
await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  minify: true,
  sourcemap: false,
  format: "esm",
  splitting: true,
  jsx: "automatic",
  outdir: `${outDir}/assets`,
  entryNames: "[name]-[hash]",
  chunkNames: "chunks/[name]-[hash]",
  loader: {
    ".ts": "ts",
    ".tsx": "tsx",
    ".css": "empty",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

// 2. Build Tailwind CSS
execSync(
  `./node_modules/.bin/tailwindcss -i src/styles/globals.css -o ${outDir}/assets/index.css --minify`,
  { stdio: "inherit" },
);

// 3. Hash the CSS file for cache busting
const cssPath = path.join(outDir, "assets", "index.css");
const cssContent = fs.readFileSync(cssPath);
const cssHash = crypto.createHash("md5").update(cssContent).digest("hex").slice(0, 8);
const hashedCss = `index-${cssHash}.css`;
fs.renameSync(cssPath, path.join(outDir, "assets", hashedCss));

// 4. Find the entry JS file (esbuild already hashes it)
const assets = fs.readdirSync(`${outDir}/assets`);
const jsFile = assets.find((f) => f.startsWith("main-") && f.endsWith(".js"));

// 5. Generate index.html
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Brian Code</title>
    <link rel="stylesheet" href="/assets/${hashedCss}" />
  </head>
  <body class="bg-zinc-950 text-zinc-100">
    <div id="root"></div>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>`;

fs.writeFileSync(`${outDir}/index.html`, html);

// Count chunks
const chunks = fs.existsSync(`${outDir}/assets/chunks`)
  ? fs.readdirSync(`${outDir}/assets/chunks`).length
  : 0;
console.log(`Built: assets/${jsFile}, assets/${hashedCss}${chunks ? ` + ${chunks} chunks` : ""}`);
