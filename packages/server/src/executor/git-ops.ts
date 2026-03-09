import { execFile } from "child_process";
import { promisify } from "util";
import { getProjectRoot } from "../context/workspace.js";
import { log } from "../logger.js";

const execFileAsync = promisify(execFile);

export interface GitResult {
  success: boolean;
  output: string;
  error?: string;
}

async function runGit(args: string[]): Promise<GitResult> {
  const cwd = getProjectRoot();
  try {
    const { stdout, stderr } = await execFileAsync("git", args, {
      cwd,
      maxBuffer: 2 * 1024 * 1024,
    });
    const output = stdout.trim();
    const warn = stderr.trim();
    return { success: true, output: warn ? `${output}\n${warn}` : output };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: string | number };
    const msg = e.stderr?.trim() || e.stdout?.trim() || String(err);
    log.tool.error(`git ${args[0]} failed: ${msg}`);
    return { success: false, output: e.stdout?.trim() || "", error: msg };
  }
}

// --- Branch ---

export async function listBranches(all?: boolean): Promise<GitResult> {
  const args = ["branch"];
  if (all) args.push("-a");
  args.push("--sort=-committerdate");
  return runGit(args);
}

export async function createBranch(name: string, startPoint?: string): Promise<GitResult> {
  const args = ["checkout", "-b", name];
  if (startPoint) args.push(startPoint);
  return runGit(args);
}

export async function switchBranch(name: string): Promise<GitResult> {
  return runGit(["checkout", name]);
}

export async function deleteBranch(name: string, force?: boolean): Promise<GitResult> {
  return runGit(["branch", force ? "-D" : "-d", name]);
}

// --- Staging ---

export async function stageFiles(paths: string[]): Promise<GitResult> {
  return runGit(["add", ...paths]);
}

export async function unstageFiles(paths: string[]): Promise<GitResult> {
  return runGit(["restore", "--staged", ...paths]);
}

export async function stageAll(): Promise<GitResult> {
  return runGit(["add", "-A"]);
}

// --- Commit ---

export async function commit(message: string): Promise<GitResult> {
  return runGit(["commit", "-m", message]);
}

// --- Log ---

export async function gitLog(opts: {
  limit?: number;
  oneline?: boolean;
  branch?: string;
}): Promise<GitResult> {
  const args = ["log"];
  if (opts.oneline) args.push("--oneline");
  args.push(`-n`, String(opts.limit ?? 10));
  if (opts.branch) args.push(opts.branch);
  return runGit(args);
}

// --- Push / Pull / Fetch ---

export async function push(opts?: {
  remote?: string;
  branch?: string;
  setUpstream?: boolean;
  force?: boolean;
}): Promise<GitResult> {
  const args = ["push"];
  if (opts?.setUpstream) args.push("-u");
  if (opts?.force) args.push("--force-with-lease");
  if (opts?.remote) args.push(opts.remote);
  if (opts?.branch) args.push(opts.branch);
  return runGit(args);
}

export async function pull(opts?: {
  remote?: string;
  branch?: string;
  rebase?: boolean;
}): Promise<GitResult> {
  const args = ["pull"];
  if (opts?.rebase) args.push("--rebase");
  if (opts?.remote) args.push(opts.remote);
  if (opts?.branch) args.push(opts.branch);
  return runGit(args);
}

export async function fetch(opts?: {
  remote?: string;
  prune?: boolean;
}): Promise<GitResult> {
  const args = ["fetch"];
  if (opts?.prune) args.push("--prune");
  if (opts?.remote) args.push(opts.remote);
  return runGit(args);
}

// --- Merge / Rebase ---

export async function merge(branch: string, noFf?: boolean): Promise<GitResult> {
  const args = ["merge"];
  if (noFf) args.push("--no-ff");
  args.push(branch);
  return runGit(args);
}

export async function rebase(branch: string): Promise<GitResult> {
  return runGit(["rebase", branch]);
}

export async function rebaseAbort(): Promise<GitResult> {
  return runGit(["rebase", "--abort"]);
}

export async function rebaseContinue(): Promise<GitResult> {
  return runGit(["rebase", "--continue"]);
}

export async function mergeAbort(): Promise<GitResult> {
  return runGit(["merge", "--abort"]);
}

// --- Stash ---

export async function stash(message?: string): Promise<GitResult> {
  const args = ["stash", "push"];
  if (message) args.push("-m", message);
  return runGit(args);
}

export async function stashPop(): Promise<GitResult> {
  return runGit(["stash", "pop"]);
}

export async function stashList(): Promise<GitResult> {
  return runGit(["stash", "list"]);
}

// --- Tags ---

export async function createTag(name: string, message?: string): Promise<GitResult> {
  const args = ["tag"];
  if (message) args.push("-a", name, "-m", message);
  else args.push(name);
  return runGit(args);
}

// --- Reset ---

export async function reset(opts: {
  mode: "soft" | "mixed" | "hard";
  ref?: string;
}): Promise<GitResult> {
  const args = ["reset", `--${opts.mode}`];
  if (opts.ref) args.push(opts.ref);
  return runGit(args);
}

// --- Cherry-pick ---

export async function cherryPick(commit: string): Promise<GitResult> {
  return runGit(["cherry-pick", commit]);
}
