#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const webDist = path.join(root, "packages/web/dist");
const serverWebDist = path.join(root, "packages/server/dist/web");

// Copy web dist into server dist
if (!fs.existsSync(webDist)) {
  console.error("Error: packages/web/dist not found. Run `pnpm --filter web build` first.");
  process.exit(1);
}

fs.cpSync(webDist, serverWebDist, { recursive: true });
console.log(`Bundled frontend into ${serverWebDist}`);
