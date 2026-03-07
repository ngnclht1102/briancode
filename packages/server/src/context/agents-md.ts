import fs from "fs";
import path from "path";
import { getProjectRoot } from "./workspace.js";

let cachedContent: string | null = null;
let watcher: fs.FSWatcher | null = null;

function getAgentsMdPath(): string {
  return path.join(getProjectRoot(), "Agents.md");
}

export function loadAgentsMd(): string {
  const filePath = getAgentsMdPath();
  try {
    cachedContent = fs.readFileSync(filePath, "utf-8");
    const lines = cachedContent.split("\n").length;
    console.log(`Loaded Agents.md (${lines} lines)`);
    return cachedContent;
  } catch {
    cachedContent = "";
    console.log("No Agents.md found");
    return "";
  }
}

export function getAgentsMd(): string {
  if (cachedContent === null) return loadAgentsMd();
  return cachedContent;
}

export function watchAgentsMd(onChange?: () => void) {
  if (watcher) return;

  const filePath = getAgentsMdPath();
  let debounceTimer: ReturnType<typeof setTimeout>;

  try {
    watcher = fs.watch(path.dirname(filePath), (event, filename) => {
      if (filename !== "Agents.md") return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const old = cachedContent;
        loadAgentsMd();
        if (old !== cachedContent) {
          console.log("Agents.md changed, reloaded");
          onChange?.();
        }
      }, 500);
    });
  } catch {
    // directory may not exist
  }
}

export function stopWatchingAgentsMd() {
  watcher?.close();
  watcher = null;
}
