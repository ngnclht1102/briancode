import fs from "fs";
import fg from "fast-glob";
import path from "path";

export interface FileNode {
  path: string;
  type: "file" | "dir";
}

const ALWAYS_IGNORE = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  ".playwright",
  "test-results",
  ".DS_Store",
];

let cachedTree: FileNode[] | null = null;
let projectRoot = process.cwd();
let watcher: fs.FSWatcher | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let onChangeCallback: (() => void) | null = null;

export function setFileChangeCallback(cb: () => void) {
  onChangeCallback = cb;
}

function startWatcher() {
  stopWatcher();
  try {
    watcher = fs.watch(projectRoot, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      // Ignore common noise
      if (filename.includes("node_modules") || filename.includes(".git/") || filename.startsWith(".git/")) return;
      // Debounce: coalesce rapid changes into one update
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        cachedTree = null;
        onChangeCallback?.();
      }, 500);
    });
    watcher.on("error", () => {
      // Watcher failed (e.g. too many files) — fall back to polling only
      stopWatcher();
    });
  } catch {
    // fs.watch not supported or too many files — silent fail
  }
}

function stopWatcher() {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

export function setProjectRoot(root: string) {
  projectRoot = root;
  cachedTree = null;
  startWatcher();
}

export function getProjectRoot(): string {
  return projectRoot;
}

export async function getFileTree(): Promise<FileNode[]> {
  if (cachedTree) return cachedTree;

  const entries = await fg("**/*", {
    cwd: projectRoot,
    dot: false,
    onlyFiles: true,
    ignore: ALWAYS_IGNORE.map((p) => `**/${p}/**`),
    followSymbolicLinks: false,
  });

  cachedTree = entries.sort().map((p) => ({ path: p, type: "file" as const }));
  return cachedTree;
}

export function getFileTreeAsString(maxDepth = 4): string {
  if (!cachedTree) return "(file tree not loaded)";

  const dirCounts = new Map<string, number>();

  for (const entry of cachedTree) {
    const parts = entry.path.split("/");
    if (parts.length > maxDepth) {
      const truncDir = parts.slice(0, maxDepth).join("/");
      dirCounts.set(truncDir, (dirCounts.get(truncDir) ?? 0) + 1);
    }
  }

  const lines: string[] = [];
  const seen = new Set<string>();

  for (const entry of cachedTree) {
    const parts = entry.path.split("/");
    if (parts.length > maxDepth) {
      const truncDir = parts.slice(0, maxDepth).join("/");
      if (!seen.has(truncDir)) {
        seen.add(truncDir);
        lines.push(`${truncDir}/ (${dirCounts.get(truncDir)} files)`);
      }
    } else {
      lines.push(entry.path);
    }
  }

  return lines.join("\n");
}

export function invalidateCache() {
  cachedTree = null;
}

export function resolveProjectPath(relativePath: string): string | null {
  const resolved = path.resolve(projectRoot, relativePath);
  if (!resolved.startsWith(projectRoot)) return null;
  return resolved;
}
