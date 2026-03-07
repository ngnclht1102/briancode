import { spawn, type ChildProcess } from "child_process";
import { getProjectRoot } from "../context/workspace.js";

export interface ShellResult {
  exitCode: number;
  output: string;
  error?: string;
}

export type OnOutputLine = (line: string, stream: "stdout" | "stderr") => void;

const BLOCKED_PATTERNS = [
  /\brm\s+-rf\s+\/(?!\S)/,
  /\bsudo\b/,
  /\bmkfs\b/,
  /\bdd\s+if=/,
  /\b:\(\)\s*\{/,
];

const DEFAULT_TIMEOUT = 60_000;

let activeProcess: ChildProcess | null = null;

export function runCommand(
  command: string,
  options?: {
    cwd?: string;
    timeout?: number;
    onOutput?: OnOutputLine;
  },
): Promise<ShellResult> {
  // Security check
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      return Promise.resolve({
        exitCode: 1,
        output: "",
        error: `Blocked: command matches dangerous pattern — ${pattern}`,
      });
    }
  }

  const cwd = options?.cwd ?? getProjectRoot();
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

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
      proc.kill("SIGTERM");
    }, timeout);

    proc.stdout?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      if (options?.onOutput) {
        for (const line of text.split("\n").filter(Boolean)) {
          options.onOutput(line, "stdout");
        }
      }
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      if (options?.onOutput) {
        for (const line of text.split("\n").filter(Boolean)) {
          options.onOutput(line, "stderr");
        }
      }
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      activeProcess = null;
      resolve({
        exitCode: code ?? 1,
        output: output.trim(),
        error: killed ? "Command timed out" : undefined,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      activeProcess = null;
      resolve({
        exitCode: 1,
        output: "",
        error: String(err),
      });
    });
  });
}

export function cancelRunning(): boolean {
  if (activeProcess) {
    activeProcess.kill("SIGTERM");
    activeProcess = null;
    return true;
  }
  return false;
}
