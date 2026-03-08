import fs from "fs";
import path from "path";
import { getProjectRoot, resolveProjectPath } from "../context/workspace.js";
import { log } from "../logger.js";

export interface FileChange {
  filePath: string;
  type: "create" | "edit" | "delete";
  before: string | null; // null = file didn't exist
  after: string | null; // null = file was deleted
  timestamp: number;
  executionId: string;
}

const changeHistory: FileChange[] = [];

export function recordChange(
  executionId: string,
  filePath: string,
  type: "create" | "edit" | "delete",
  before: string | null,
  after: string | null,
) {
  changeHistory.push({ filePath, type, before, after, timestamp: Date.now(), executionId });
}

export function getChangeHistory(): Array<{ filePath: string; type: string; executionId: string; timestamp: number }> {
  return changeHistory.map((c) => ({
    filePath: c.filePath,
    type: c.type,
    executionId: c.executionId,
    timestamp: c.timestamp,
  }));
}

export function rollbackExecution(executionId: string): { restored: string[]; errors: string[]; shellWarning: boolean } {
  const changes = changeHistory.filter((c) => c.executionId === executionId).reverse();
  log.file.start(`Rollback ${executionId}: ${changes.length} changes`);
  const restored: string[] = [];
  const errors: string[] = [];

  for (const change of changes) {
    const absPath = resolveProjectPath(change.filePath);
    if (!absPath) {
      errors.push(`${change.filePath}: path blocked`);
      continue;
    }
    try {
      if (change.before === null) {
        // Was created — delete it
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      } else {
        // Restore original
        fs.mkdirSync(path.dirname(absPath), { recursive: true });
        fs.writeFileSync(absPath, change.before, "utf-8");
      }
      restored.push(change.filePath);
    } catch (err) {
      log.file.error(`Rollback failed for ${change.filePath}: ${String(err)}`);
      errors.push(`${change.filePath}: ${String(err)}`);
    }
  }

  // Remove rolled-back changes from history
  const remaining = changeHistory.filter((c) => c.executionId !== executionId);
  changeHistory.length = 0;
  changeHistory.push(...remaining);

  log.file.done(`Rollback: ${restored.length} restored, ${errors.length} errors`);
  return { restored, errors, shellWarning: false };
}

export function undoLast(): { restored: string | null; error?: string } {
  if (changeHistory.length === 0) return { restored: null, error: "No changes to undo" };

  const last = changeHistory.pop()!;
  const absPath = resolveProjectPath(last.filePath);
  if (!absPath) return { restored: null, error: `Path blocked: ${last.filePath}` };

  try {
    if (last.before === null) {
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
    } else {
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, last.before, "utf-8");
    }
    log.file.info(`Undo: restored ${last.filePath}`);
    return { restored: last.filePath };
  } catch (err) {
    log.file.error(`Undo failed: ${String(err)}`);
    return { restored: null, error: String(err) };
  }
}

export function clearChangeHistory() {
  changeHistory.length = 0;
}
