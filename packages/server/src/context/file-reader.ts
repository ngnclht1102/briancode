import fs from "fs";
import { resolveProjectPath } from "./workspace.js";

const MAX_LINES_DEFAULT = 200;
const MAX_LINE_LENGTH = 2000;

export function readFile(
  relativePath: string,
  startLine?: number,
  endLine?: number,
): string {
  const absPath = resolveProjectPath(relativePath);
  if (!absPath) return `Error: Path traversal blocked for "${relativePath}"`;

  if (!fs.existsSync(absPath)) return `Error: File not found: ${relativePath}`;

  const stat = fs.statSync(absPath);
  if (!stat.isFile()) return `Error: Not a file: ${relativePath}`;

  // Binary detection
  const sample = Buffer.alloc(512);
  const fd = fs.openSync(absPath, "r");
  const bytesRead = fs.readSync(fd, sample, 0, 512, 0);
  fs.closeSync(fd);
  for (let i = 0; i < bytesRead; i++) {
    if (sample[i] === 0) return `[Binary file, ${stat.size} bytes]`;
  }

  const content = fs.readFileSync(absPath, "utf-8");
  const allLines = content.split("\n");
  const totalLines = allLines.length;

  const start = startLine ? Math.max(1, startLine) : 1;
  const end = endLine ? Math.min(totalLines, endLine) : Math.min(totalLines, start + MAX_LINES_DEFAULT - 1);

  const selectedLines = allLines.slice(start - 1, end);
  const numbered = selectedLines.map((line, i) => {
    const lineNum = start + i;
    const truncated = line.length > MAX_LINE_LENGTH ? line.slice(0, MAX_LINE_LENGTH) + "..." : line;
    return `${lineNum}\t${truncated}`;
  });

  let result = numbered.join("\n");

  if (!startLine && !endLine && totalLines > MAX_LINES_DEFAULT) {
    result += `\n\n... (truncated, ${totalLines - MAX_LINES_DEFAULT} more lines. Use startLine/endLine to read more)`;
  }

  return result;
}
