import type { WebSocket } from "ws";
import type { PlanStep } from "../plan/types.js";
import { createFile, editFile, deleteFile, rollbackAll, clearBackups, setExecutionId } from "./file-ops.js";
import { runCommand, cancelRunning } from "./shell-ops.js";

export type { PlanStep };

export interface ExecutableStep extends PlanStep {
  status?: "pending" | "skipped";
}

export interface ExecutionSummary {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  filesModified: string[];
}

let cancelled = false;

export async function executeSteps(
  socket: WebSocket,
  steps: ExecutableStep[],
): Promise<ExecutionSummary> {
  cancelled = false;
  clearBackups();
  const executionId = `exec-${Date.now()}`;
  setExecutionId(executionId);

  const summary: ExecutionSummary = {
    total: steps.length,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    filesModified: [],
  };

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

    // Mark running
    sendEvent(socket, "execute:progress", {
      stepId: step.id,
      stepIndex: i,
      status: "running",
      description: step.description,
    });

    try {
      switch (step.type) {
        case "create": {
          const result = createFile(step.target, step.content ?? "");
          if (!result.success) throw new Error(result.error);
          sendEvent(socket, "execute:diff", { stepId: step.id, diff: result.diff, filePath: step.target });
          summary.filesModified.push(step.target);
          break;
        }
        case "edit": {
          const result = editFile(step.target, step.content ?? "");
          if (!result.success) throw new Error(result.error);
          sendEvent(socket, "execute:diff", { stepId: step.id, diff: result.diff, filePath: step.target });
          summary.filesModified.push(step.target);
          break;
        }
        case "delete": {
          const result = deleteFile(step.target);
          if (!result.success) throw new Error(result.error);
          sendEvent(socket, "execute:diff", { stepId: step.id, diff: result.diff, filePath: step.target });
          summary.filesModified.push(step.target);
          break;
        }
        case "shell": {
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

      summary.succeeded++;
      sendEvent(socket, "execute:progress", {
        stepId: step.id,
        stepIndex: i,
        status: "success",
        description: step.description,
      });
    } catch (err) {
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

export function rollback(): { restored: string[]; errors: string[] } {
  return rollbackAll();
}

function sendEvent(socket: WebSocket, type: string, data: Record<string, unknown>) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify({ type, ...data }));
  }
}
