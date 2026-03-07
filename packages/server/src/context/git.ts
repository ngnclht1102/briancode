import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { getProjectRoot } from "./workspace.js";

const execFileAsync = promisify(execFile);

async function runGit(args: string[]): Promise<string> {
  const cwd = getProjectRoot();
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd,
      maxBuffer: 1024 * 1024,
    });
    return stdout.trim();
  } catch (err) {
    const e = err as { stderr?: string; code?: string };
    if (e.code === "ENOENT") return "Git is not installed.";
    return e.stderr?.trim() ?? String(err);
  }
}

export function isGitRepo(): boolean {
  return fs.existsSync(path.join(getProjectRoot(), ".git"));
}

export async function getGitStatus(): Promise<string> {
  if (!isGitRepo()) return "Not a git repository.";
  return runGit(["status", "--short"]);
}

export async function getGitDiff(staged = false): Promise<string> {
  if (!isGitRepo()) return "Not a git repository.";

  const statusOutput = await runGit(["status", "--short"]);
  const args = staged ? ["diff", "--staged"] : ["diff"];
  const diffOutput = await runGit(args);

  const parts: string[] = [];
  if (statusOutput) parts.push(`Status:\n${statusOutput}`);
  if (diffOutput) parts.push(`Diff:\n${diffOutput}`);

  return parts.join("\n\n") || "No changes.";
}

export async function getGitBranch(): Promise<string> {
  if (!isGitRepo()) return "";
  return runGit(["branch", "--show-current"]);
}

export async function listDirectory(relativePath: string): Promise<string> {
  const root = getProjectRoot();
  const absPath = path.resolve(root, relativePath);
  if (!absPath.startsWith(root)) return "Error: Path outside project root.";

  try {
    const entries = fs.readdirSync(absPath, { withFileTypes: true });
    return entries
      .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
      .sort((a, b) => {
        const aDir = a.endsWith("/");
        const bDir = b.endsWith("/");
        if (aDir !== bDir) return aDir ? -1 : 1;
        return a.localeCompare(b);
      })
      .join("\n");
  } catch {
    return `Error: Cannot read directory: ${relativePath}`;
  }
}
