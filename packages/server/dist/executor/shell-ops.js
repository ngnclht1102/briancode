import { spawn } from "child_process";
import { getProjectRoot } from "../context/workspace.js";
import { log } from "../logger.js";
const BLOCKED_PATTERNS = [
    /\brm\s+-rf\s+\/(?!\S)/,
    /\bsudo\b/,
    /\bmkfs\b/,
    /\bdd\s+if=/,
    /\b:\(\)\s*\{/,
];
const DEFAULT_TIMEOUT = 60_000;
const MAX_RETRIES = 2;
let activeProcess = null;
export function runCommand(command, options) {
    // Security check
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(command)) {
            log.shell.error(`Blocked dangerous command: ${command.slice(0, 80)}`);
            return Promise.resolve({
                exitCode: 1,
                output: "",
                error: `Blocked: command matches dangerous pattern — ${pattern}`,
            });
        }
    }
    const cwd = options?.cwd ?? getProjectRoot();
    const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
    const maxRetries = options?.retries ?? MAX_RETRIES;
    return runCommandOnce(command, cwd, timeout, options?.onOutput, 0, maxRetries);
}
function runCommandOnce(command, cwd, timeout, onOutput, attempt, maxRetries) {
    const attemptLabel = attempt > 0 ? ` (retry ${attempt}/${maxRetries})` : "";
    log.shell.start(`$ ${command.slice(0, 120)}${command.length > 120 ? "..." : ""}${attemptLabel}`);
    return new Promise((resolve) => {
        const proc = spawn("sh", ["-c", command], {
            cwd,
            stdio: ["ignore", "pipe", "pipe"],
            env: { ...process.env },
        });
        activeProcess = proc;
        let output = "";
        let killed = false;
        const timer = setTimeout(() => {
            killed = true;
            log.shell.warn(`Command timed out after ${timeout}ms${attemptLabel}: ${command.slice(0, 80)}`);
            proc.kill("SIGTERM");
        }, timeout);
        proc.stdout?.on("data", (chunk) => {
            const text = chunk.toString();
            output += text;
            if (onOutput) {
                for (const line of text.split("\n").filter(Boolean)) {
                    onOutput(line, "stdout");
                }
            }
        });
        proc.stderr?.on("data", (chunk) => {
            const text = chunk.toString();
            output += text;
            if (onOutput) {
                for (const line of text.split("\n").filter(Boolean)) {
                    onOutput(line, "stderr");
                }
            }
        });
        proc.on("close", (code) => {
            clearTimeout(timer);
            activeProcess = null;
            if (killed && attempt < maxRetries) {
                log.shell.info(`Retrying command (attempt ${attempt + 1}/${maxRetries}): ${command.slice(0, 80)}`);
                resolve(runCommandOnce(command, cwd, timeout, onOutput, attempt + 1, maxRetries));
                return;
            }
            if (code !== 0) {
                log.shell.error(`Exit ${code}${killed ? " (timed out)" : ""}${attemptLabel}: ${command.slice(0, 80)}`);
            }
            else {
                log.shell.done(`Exit 0${attemptLabel}: ${command.slice(0, 80)}`);
            }
            if (killed) {
                const timeoutSec = timeout / 1000;
                resolve({
                    exitCode: code ?? 1,
                    output: output.trim(),
                    error: `Command timed out after ${timeoutSec}s (tried ${attempt + 1} time${attempt > 0 ? "s" : ""}). The command may need more time to complete, or it may be hanging. Consider: increasing the timeout, running a simpler command, or checking if the process is stuck.`,
                });
            }
            else {
                resolve({
                    exitCode: code ?? 1,
                    output: output.trim(),
                });
            }
        });
        proc.on("error", (err) => {
            clearTimeout(timer);
            activeProcess = null;
            log.shell.error(`Spawn error: ${String(err)}`);
            resolve({
                exitCode: 1,
                output: "",
                error: String(err),
            });
        });
    });
}
export function cancelRunning() {
    if (activeProcess) {
        log.shell.info("Cancelling running command");
        activeProcess.kill("SIGTERM");
        activeProcess = null;
        return true;
    }
    return false;
}
//# sourceMappingURL=shell-ops.js.map