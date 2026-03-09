import fs from "fs";
import path from "path";
import { resolveProjectPath } from "../context/workspace.js";
import { log } from "../logger.js";
const changeHistory = [];
export function recordChange(executionId, filePath, type, before, after) {
    changeHistory.push({ filePath, type, before, after, timestamp: Date.now(), executionId });
}
export function getChangeHistory() {
    return changeHistory.map((c) => ({
        filePath: c.filePath,
        type: c.type,
        executionId: c.executionId,
        timestamp: c.timestamp,
    }));
}
export function rollbackExecution(executionId) {
    const changes = changeHistory.filter((c) => c.executionId === executionId).reverse();
    log.file.start(`Rollback ${executionId}: ${changes.length} changes`);
    const restored = [];
    const errors = [];
    for (const change of changes) {
        const absPath = resolveProjectPath(change.filePath);
        if (!absPath) {
            errors.push(`${change.filePath}: path blocked`);
            continue;
        }
        try {
            if (change.before === null) {
                // Was created — delete it
                if (fs.existsSync(absPath))
                    fs.unlinkSync(absPath);
            }
            else {
                // Restore original
                fs.mkdirSync(path.dirname(absPath), { recursive: true });
                fs.writeFileSync(absPath, change.before, "utf-8");
            }
            restored.push(change.filePath);
        }
        catch (err) {
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
export function undoLast() {
    if (changeHistory.length === 0)
        return { restored: null, error: "No changes to undo" };
    const last = changeHistory.pop();
    const absPath = resolveProjectPath(last.filePath);
    if (!absPath)
        return { restored: null, error: `Path blocked: ${last.filePath}` };
    try {
        if (last.before === null) {
            if (fs.existsSync(absPath))
                fs.unlinkSync(absPath);
        }
        else {
            fs.mkdirSync(path.dirname(absPath), { recursive: true });
            fs.writeFileSync(absPath, last.before, "utf-8");
        }
        log.file.info(`Undo: restored ${last.filePath}`);
        return { restored: last.filePath };
    }
    catch (err) {
        log.file.error(`Undo failed: ${String(err)}`);
        return { restored: null, error: String(err) };
    }
}
export function clearChangeHistory() {
    changeHistory.length = 0;
}
//# sourceMappingURL=change-tracker.js.map