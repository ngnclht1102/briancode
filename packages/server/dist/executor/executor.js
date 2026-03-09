import { createFile, editFile, deleteFile, rollbackAll, clearBackups, setExecutionId } from "./file-ops.js";
import { runCommand, cancelRunning } from "./shell-ops.js";
import { generateStepContent } from "./step-generator.js";
let cancelled = false;
export async function executeSteps(socket, steps, context) {
    cancelled = false;
    clearBackups();
    const executionId = `exec-${Date.now()}`;
    setExecutionId(executionId);
    const summary = {
        total: steps.length,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        filesModified: [],
    };
    const planSummary = context?.planSummary ?? "Execute plan steps";
    const allSteps = context?.allSteps ?? steps;
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (cancelled) {
            summary.skipped += steps.length - i;
            break;
        }
        if (step.status === "skipped") {
            summary.skipped++;
            sendEvent(socket, "execute:progress", {
                stepId: step.id,
                stepIndex: i,
                status: "skipped",
                description: step.description,
            });
            continue;
        }
        try {
            switch (step.type) {
                case "create":
                case "edit": {
                    let content = step.content;
                    // If no content provided, generate it via AI
                    if (!content) {
                        sendEvent(socket, "execute:progress", {
                            stepId: step.id,
                            stepIndex: i,
                            status: "generating",
                            description: step.description,
                        });
                        content = await generateStepContent(step, planSummary, allSteps);
                    }
                    if (cancelled) {
                        summary.skipped += steps.length - i;
                        break;
                    }
                    // Apply to disk
                    sendEvent(socket, "execute:progress", {
                        stepId: step.id,
                        stepIndex: i,
                        status: "running",
                        description: step.description,
                    });
                    const result = step.type === "create"
                        ? createFile(step.target, content)
                        : editFile(step.target, content);
                    if (!result.success)
                        throw new Error(result.error);
                    sendEvent(socket, "execute:diff", { stepId: step.id, diff: result.diff, filePath: step.target });
                    summary.filesModified.push(step.target);
                    break;
                }
                case "delete": {
                    sendEvent(socket, "execute:progress", {
                        stepId: step.id,
                        stepIndex: i,
                        status: "running",
                        description: step.description,
                    });
                    const result = deleteFile(step.target);
                    if (!result.success)
                        throw new Error(result.error);
                    sendEvent(socket, "execute:diff", { stepId: step.id, diff: result.diff, filePath: step.target });
                    summary.filesModified.push(step.target);
                    break;
                }
                case "shell": {
                    sendEvent(socket, "execute:progress", {
                        stepId: step.id,
                        stepIndex: i,
                        status: "running",
                        description: step.description,
                    });
                    const result = await runCommand(step.target, {
                        onOutput: (line, stream) => {
                            sendEvent(socket, "execute:output", { stepId: step.id, line, stream });
                        },
                    });
                    if (result.exitCode !== 0) {
                        throw new Error(result.error ?? `Exit code ${result.exitCode}\n${result.output}`);
                    }
                    break;
                }
            }
            if (cancelled) {
                summary.skipped += steps.length - i - 1;
                break;
            }
            summary.succeeded++;
            sendEvent(socket, "execute:progress", {
                stepId: step.id,
                stepIndex: i,
                status: "success",
                description: step.description,
            });
        }
        catch (err) {
            summary.failed++;
            sendEvent(socket, "execute:progress", {
                stepId: step.id,
                stepIndex: i,
                status: "error",
                description: step.description,
                error: String(err),
            });
            // Halt on first error
            summary.skipped += steps.length - i - 1;
            break;
        }
    }
    sendEvent(socket, "execute:done", { summary });
    return summary;
}
export function cancelExecution() {
    cancelled = true;
    cancelRunning();
}
export function rollback() {
    return rollbackAll();
}
function sendEvent(socket, type, data) {
    if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({ type, ...data }));
    }
}
//# sourceMappingURL=executor.js.map