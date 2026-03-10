#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const webDist = path.join(root, "packages/web/dist");
const serverPublic = path.join(root, "packages/server/public");
const serverDistPublic = path.join(root, "packages/server/dist/public");

if (!fs.existsSync(webDist)) {
  console.error("Error: packages/web/dist not found. Run web build first.");
  process.exit(1);
}

// Copy web dist → server/public (for dev server)
fs.rmSync(serverPublic, { recursive: true, force: true });
fs.cpSync(webDist, serverPublic, { recursive: true });
console.log(`Copied frontend → ${path.relative(root, serverPublic)}`);

// Copy web dist → server/dist/public (for production — self-contained)
if (fs.existsSync(path.join(root, "packages/server/dist"))) {
  fs.rmSync(serverDistPublic, { recursive: true, force: true });
  fs.cpSync(webDist, serverDistPublic, { recursive: true });
  console.log(`Copied frontend → ${path.relative(root, serverDistPublic)}`);
}
