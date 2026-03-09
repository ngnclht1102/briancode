import { context } from "esbuild";
import { spawn } from "child_process";
import fs from "fs";

const outDir = "dist";
const serverPublic = "../server/public";

// Clean
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(`${outDir}/assets`, { recursive: true });

function copyToServer() {
  if (!fs.existsSync(serverPublic)) return;
  // Clean server assets and copy fresh
  fs.rmSync(`${serverPublic}/assets`, { recursive: true, force: true });
  fs.cpSync(`${outDir}/assets`, `${serverPublic}/assets`, { recursive: true });
  // Copy index.html
  if (fs.existsSync(`${outDir}/index.html`)) {
    fs.copyFileSync(`${outDir}/index.html`, `${serverPublic}/index.html`);
  }
}

function writeHtml() {
  const assets = fs.readdirSync(`${outDir}/assets`);
  const jsFile = assets.find((f) => f.startsWith("main") && f.endsWith(".js")) ?? "main.js";
  const cssFile = "index.css";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Brian Code</title>
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body class="bg-zinc-950 text-zinc-100">
    <div id="root"></div>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>`;
  fs.writeFileSync(`${outDir}/index.html`, html);
}

// 1. esbuild watch mode (no hashing in dev for speed)
const ctx = await context({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  minify: false,
  sourcemap: true,
  format: "esm",
  splitting: true,
  jsx: "automatic",
  outdir: `${outDir}/assets`,
  loader: {
    ".ts": "ts",
    ".tsx": "tsx",
    ".css": "empty",
  },
  define: {
    "process.env.NODE_ENV": '"development"',
  },
  plugins: [
    {
      name: "rebuild-notify",
      setup(build) {
        let count = 0;
        build.onEnd((result) => {
          count++;
          if (result.errors.length > 0) {
            console.log(`\x1b[31m[esbuild] Build failed with ${result.errors.length} error(s)\x1b[0m`);
          } else {
            writeHtml();
            copyToServer();
            if (count === 1) {
              console.log(`\x1b[32m[esbuild] Initial build done\x1b[0m`);
            } else {
              console.log(`\x1b[32m[esbuild] Rebuilt (#${count})\x1b[0m`);
            }
          }
        });
      },
    },
  ],
});

await ctx.watch();

// 2. Tailwind CSS watch mode — outputs directly to dist and server public
const tailwind = spawn(
  "./node_modules/.bin/tailwindcss",
  ["-i", "src/styles/globals.css", "-o", `${outDir}/assets/index.css`, "--watch"],
  { stdio: ["ignore", "pipe", "pipe"] },
);

tailwind.stdout.on("data", (data) => {
  const msg = data.toString().trim();
  if (msg) {
    console.log(`\x1b[35m[tailwind]\x1b[0m ${msg}`);
    copyToServer();
  }
});

tailwind.stderr.on("data", (data) => {
  const msg = data.toString().trim();
  if (msg && !msg.includes("warn")) {
    console.log(`\x1b[35m[tailwind]\x1b[0m ${msg}`);
  }
});

console.log("\x1b[36m[dev] Watching for changes... (Ctrl+C to stop)\x1b[0m");

// Cleanup on exit
process.on("SIGINT", async () => {
  tailwind.kill();
  await ctx.dispose();
  process.exit(0);
});
