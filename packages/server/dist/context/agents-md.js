import fs from "fs";
import path from "path";
import { getProjectRoot } from "./workspace.js";
let cachedContent = null;
let watcher = null;
function getAgentsMdPath() {
    return path.join(getProjectRoot(), "Agents.md");
}
export function loadAgentsMd() {
    const filePath = getAgentsMdPath();
    try {
        cachedContent = fs.readFileSync(filePath, "utf-8");
        const lines = cachedContent.split("\n").length;
        console.log(`Loaded Agents.md (${lines} lines)`);
        return cachedContent;
    }
    catch {
        cachedContent = "";
        console.log("No Agents.md found");
        return "";
    }
}
export function getAgentsMd() {
    if (cachedContent === null)
        return loadAgentsMd();
    return cachedContent;
}
export function watchAgentsMd(onChange) {
    if (watcher)
        return;
    const filePath = getAgentsMdPath();
    let debounceTimer;
    try {
        watcher = fs.watch(path.dirname(filePath), (event, filename) => {
            if (filename !== "Agents.md")
                return;
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
    }
    catch {
        // directory may not exist
    }
}
export function stopWatchingAgentsMd() {
    watcher?.close();
    watcher = null;
}
//# sourceMappingURL=agents-md.js.map