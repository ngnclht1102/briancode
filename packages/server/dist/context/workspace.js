import fs from "fs";
import fg from "fast-glob";
import path from "path";
import { log } from "../logger.js";
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
let cachedTree = null;
let projectRoot = process.cwd();
let watcher = null;
let debounceTimer = null;
let onChangeCallback = null;
export function setFileChangeCallback(cb) {
    onChangeCallback = cb;
}
function startWatcher() {
    stopWatcher();
    try {
        watcher = fs.watch(projectRoot, { recursive: true }, (_event, filename) => {
            if (!filename)
                return;
            // Ignore common noise
            if (filename.includes("node_modules") || filename.includes(".git/") || filename.startsWith(".git/"))
                return;
            // Debounce: coalesce rapid changes into one update
            if (debounceTimer)
                clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                cachedTree = null;
                onChangeCallback?.();
            }, 500);
        });
        watcher.on("error", (err) => {
            log.context.warn(`File watcher error: ${String(err)}`);
            stopWatcher();
        });
        log.context.info(`File watcher started: ${projectRoot}`);
    }
    catch {
        log.context.warn("File watcher not available, using polling");
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
export function setProjectRoot(root) {
    log.context.info(`Project root: ${root}`);
    projectRoot = root;
    cachedTree = null;
    startWatcher();
}
export function getProjectRoot() {
    return projectRoot;
}
export async function getFileTree() {
    if (cachedTree)
        return cachedTree;
    log.context.start("Building file tree");
    const entries = await fg("**/*", {
        cwd: projectRoot,
        dot: false,
        onlyFiles: true,
        ignore: ALWAYS_IGNORE.map((p) => `**/${p}/**`),
        followSymbolicLinks: false,
    });
    cachedTree = entries.sort().map((p) => ({ path: p, type: "file" }));
    log.context.done(`File tree: ${cachedTree.length} files`);
    return cachedTree;
}
export function getFileTreeAsString(maxDepth = 4) {
    if (!cachedTree)
        return "(file tree not loaded)";
    const dirCounts = new Map();
    for (const entry of cachedTree) {
        const parts = entry.path.split("/");
        if (parts.length > maxDepth) {
            const truncDir = parts.slice(0, maxDepth).join("/");
            dirCounts.set(truncDir, (dirCounts.get(truncDir) ?? 0) + 1);
        }
    }
    const lines = [];
    const seen = new Set();
    for (const entry of cachedTree) {
        const parts = entry.path.split("/");
        if (parts.length > maxDepth) {
            const truncDir = parts.slice(0, maxDepth).join("/");
            if (!seen.has(truncDir)) {
                seen.add(truncDir);
                lines.push(`${truncDir}/ (${dirCounts.get(truncDir)} files)`);
            }
        }
        else {
            lines.push(entry.path);
        }
    }
    return lines.join("\n");
}
export function invalidateCache() {
    cachedTree = null;
}
export function resolveProjectPath(relativePath) {
    const resolved = path.resolve(projectRoot, relativePath);
    if (!resolved.startsWith(projectRoot))
        return null;
    return resolved;
}
//# sourceMappingURL=workspace.js.map