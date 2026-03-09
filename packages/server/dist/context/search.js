import fs from "fs";
import fg from "fast-glob";
import { getProjectRoot, resolveProjectPath } from "./workspace.js";
const MAX_MATCHES = 20;
const CONTEXT_LINES = 2;
export async function searchFiles(query, glob) {
    const root = getProjectRoot();
    const pattern = glob ?? "**/*";
    const files = await fg(pattern, {
        cwd: root,
        onlyFiles: true,
        ignore: [
            "**/node_modules/**",
            "**/.git/**",
            "**/dist/**",
            "**/build/**",
            "**/coverage/**",
        ],
        followSymbolicLinks: false,
    });
    const matches = [];
    const queryLower = query.toLowerCase();
    for (const file of files) {
        if (matches.length >= MAX_MATCHES)
            break;
        const absPath = resolveProjectPath(file);
        if (!absPath)
            continue;
        let content;
        try {
            const stat = fs.statSync(absPath);
            if (stat.size > 1_000_000)
                continue; // skip files > 1MB
            content = fs.readFileSync(absPath, "utf-8");
        }
        catch {
            continue;
        }
        // Skip binary
        if (content.includes("\0"))
            continue;
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            if (matches.length >= MAX_MATCHES)
                break;
            if (lines[i].toLowerCase().includes(queryLower)) {
                const ctxStart = Math.max(0, i - CONTEXT_LINES);
                const ctxEnd = Math.min(lines.length - 1, i + CONTEXT_LINES);
                const context = [];
                for (let j = ctxStart; j <= ctxEnd; j++) {
                    const prefix = j === i ? ">" : " ";
                    context.push(`${prefix} ${j + 1}\t${lines[j]}`);
                }
                matches.push({
                    file,
                    line: i + 1,
                    content: lines[i].trim(),
                    context,
                });
            }
        }
    }
    if (matches.length === 0)
        return "No matches found.";
    const parts = matches.map((m) => `${m.file}:${m.line}\n${m.context.join("\n")}`);
    let result = parts.join("\n\n");
    // Check if we hit the limit
    if (matches.length >= MAX_MATCHES) {
        result += `\n\n... and more matches. Narrow your search with a glob pattern.`;
    }
    return result;
}
//# sourceMappingURL=search.js.map