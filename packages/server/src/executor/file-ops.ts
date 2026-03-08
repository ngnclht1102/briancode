import fs from "fs";
import path from "path";
import { getProjectRoot, resolveProjectPath } from "../context/workspace.js";
import { recordChange } from "./change-tracker.js";
import { log } from "../logger.js";

export interface FileOpResult {
  success: boolean;
  diff: string;
  error?: string;
}

// In-memory backups for rollback (path → original content or null if file didn't exist)
const backups = new Map<string, string | null>();
let currentExecutionId = "";

export function setExecutionId(id: string) {
  currentExecutionId = id;
}

export function createFile(relativePath: string, content: string): FileOpResult {
  const absPath = resolveProjectPath(relativePath);
  if (!absPath) {
    log.file.error(`Path traversal blocked: ${relativePath}`);
    return { success: false, diff: "", error: `Path traversal blocked: ${relativePath}` };
  }

  try {
    // Backup: if file already exists, store its content; if not, mark as null (new file)
    if (fs.existsSync(absPath)) {
      if (!backups.has(absPath)) {
        backups.set(absPath, fs.readFileSync(absPath, "utf-8"));
      }
    } else {
      if (!backups.has(absPath)) {
        backups.set(absPath, null);
      }
    }

    const before = fs.existsSync(absPath) ? fs.readFileSync(absPath, "utf-8") : null;

    // Create parent directories
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, content, "utf-8");

    recordChange(currentExecutionId, relativePath, "create", before, content);
    log.file.info(`Created: ${relativePath} (${content.split("\n").length} lines)`);
    const diff = formatDiff(relativePath, "", content);
    return { success: true, diff };
  } catch (err) {
    log.file.error(`Create failed: ${relativePath} — ${String(err)}`);
    return { success: false, diff: "", error: String(err) };
  }
}

export function editFile(
  relativePath: string,
  newContent: string,
): FileOpResult {
  const absPath = resolveProjectPath(relativePath);
  if (!absPath) {
    log.file.error(`Path traversal blocked: ${relativePath}`);
    return { success: false, diff: "", error: `Path traversal blocked: ${relativePath}` };
  }

  if (!fs.existsSync(absPath)) {
    log.file.error(`File not found: ${relativePath}`);
    return { success: false, diff: "", error: `File not found: ${relativePath}` };
  }

  try {
    const original = fs.readFileSync(absPath, "utf-8");

    // Check for binary
    if (original.includes("\0")) {
      return { success: false, diff: "", error: `Binary file, cannot edit: ${relativePath}` };
    }

    // Backup
    if (!backups.has(absPath)) {
      backups.set(absPath, original);
    }

    fs.writeFileSync(absPath, newContent, "utf-8");

    recordChange(currentExecutionId, relativePath, "edit", original, newContent);
    log.file.info(`Edited: ${relativePath} (${newContent.split("\n").length} lines)`);
    const diff = formatDiff(relativePath, original, newContent);
    return { success: true, diff };
  } catch (err) {
    log.file.error(`Edit failed: ${relativePath} — ${String(err)}`);
    return { success: false, diff: "", error: String(err) };
  }
}

export function deleteFile(relativePath: string): FileOpResult {
  const absPath = resolveProjectPath(relativePath);
  if (!absPath) {
    log.file.error(`Path traversal blocked: ${relativePath}`);
    return { success: false, diff: "", error: `Path traversal blocked: ${relativePath}` };
  }

  if (!fs.existsSync(absPath)) {
    return { success: false, diff: "", error: `File not found: ${relativePath}` };
  }

  try {
    const original = fs.readFileSync(absPath, "utf-8");

    // Backup
    if (!backups.has(absPath)) {
      backups.set(absPath, original);
    }

    fs.unlinkSync(absPath);

    recordChange(currentExecutionId, relativePath, "delete", original, null);
    log.file.info(`Deleted: ${relativePath}`);
    const diff = formatDiff(relativePath, original, "");
    return { success: true, diff };
  } catch (err) {
    log.file.error(`Delete failed: ${relativePath} — ${String(err)}`);
    return { success: false, diff: "", error: String(err) };
  }
}

export function rollbackAll(): { restored: string[]; errors: string[] } {
  log.file.start(`Rolling back ${backups.size} file(s)`);
  const restored: string[] = [];
  const errors: string[] = [];
  const root = getProjectRoot();

  for (const [absPath, original] of backups) {
    const rel = path.relative(root, absPath);
    try {
      if (original === null) {
        // File was created — delete it
        if (fs.existsSync(absPath)) {
          fs.unlinkSync(absPath);
        }
      } else {
        // Restore original content
        fs.mkdirSync(path.dirname(absPath), { recursive: true });
        fs.writeFileSync(absPath, original, "utf-8");
      }
      restored.push(rel);
    } catch (err) {
      errors.push(`${rel}: ${String(err)}`);
    }
  }

  backups.clear();
  log.file.done(`Rollback: ${restored.length} restored, ${errors.length} errors`);
  return { restored, errors };
}

export function clearBackups() {
  backups.clear();
}

export function getBackupCount(): number {
  return backups.size;
}

function formatDiff(filePath: string, before: string, after: string): string {
  const oldLines = before ? before.split("\n") : [];
  const newLines = after ? after.split("\n") : [];

  const lines: string[] = [`--- a/${filePath}`, `+++ b/${filePath}`];

  if (before === "" && after !== "") {
    // New file
    lines.push(`@@ -0,0 +1,${newLines.length} @@`);
    for (const line of newLines) lines.push(`+${line}`);
  } else if (after === "" && before !== "") {
    // Deleted file
    lines.push(`@@ -1,${oldLines.length} +0,0 @@`);
    for (const line of oldLines) lines.push(`-${line}`);
  } else {
    // Simple full-file diff (line by line)
    lines.push(`@@ -1,${oldLines.length} +1,${newLines.length} @@`);
    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
      const oldLine = i < oldLines.length ? oldLines[i] : undefined;
      const newLine = i < newLines.length ? newLines[i] : undefined;
      if (oldLine === newLine) {
        lines.push(` ${oldLine}`);
      } else {
        if (oldLine !== undefined) lines.push(`-${oldLine}`);
        if (newLine !== undefined) lines.push(`+${newLine}`);
      }
    }
  }

  return lines.join("\n");
}
