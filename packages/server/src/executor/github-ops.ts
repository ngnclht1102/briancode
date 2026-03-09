import { runCommand } from "./shell-ops.js";
import { log } from "../logger.js";

export interface GithubResult {
  success: boolean;
  output: string;
  error?: string;
}

async function runGh(args: string): Promise<GithubResult> {
  const result = await runCommand(`gh ${args}`, { retries: 0 });
  if (result.exitCode !== 0) {
    const error = result.error || result.output;
    log.tool.error(`gh command failed: ${error}`);
    return { success: false, output: "", error };
  }
  return { success: true, output: result.output };
}

// --- Pull Requests ---

export async function listPullRequests(opts: {
  state?: string;
  limit?: number;
  author?: string;
  base?: string;
  label?: string;
}): Promise<GithubResult> {
  const flags: string[] = ["pr", "list"];
  if (opts.state) flags.push("--state", opts.state);
  if (opts.limit) flags.push("--limit", String(opts.limit));
  if (opts.author) flags.push("--author", opts.author);
  if (opts.base) flags.push("--base", opts.base);
  if (opts.label) flags.push("--label", opts.label);
  return runGh(flags.join(" "));
}

export async function viewPullRequest(opts: {
  number: number;
  comments?: boolean;
}): Promise<GithubResult> {
  const flags = ["pr", "view", String(opts.number)];
  if (opts.comments) flags.push("--comments");
  return runGh(flags.join(" "));
}

export async function createPullRequest(opts: {
  title: string;
  body?: string;
  base?: string;
  head?: string;
  draft?: boolean;
  label?: string;
}): Promise<GithubResult> {
  const flags = ["pr", "create", "--title", JSON.stringify(opts.title)];
  if (opts.body) flags.push("--body", JSON.stringify(opts.body));
  if (opts.base) flags.push("--base", opts.base);
  if (opts.head) flags.push("--head", opts.head);
  if (opts.draft) flags.push("--draft");
  if (opts.label) flags.push("--label", opts.label);
  return runGh(flags.join(" "));
}

export async function getPrDiff(number: number): Promise<GithubResult> {
  return runGh(`pr diff ${number}`);
}

export async function getPrChecks(number: number): Promise<GithubResult> {
  return runGh(`pr checks ${number}`);
}

export async function mergePullRequest(opts: {
  number: number;
  method?: string;
  deleteAfter?: boolean;
}): Promise<GithubResult> {
  const flags = ["pr", "merge", String(opts.number)];
  if (opts.method === "squash") flags.push("--squash");
  else if (opts.method === "rebase") flags.push("--rebase");
  else flags.push("--merge");
  if (opts.deleteAfter) flags.push("--delete-branch");
  return runGh(flags.join(" "));
}

// --- Issues ---

export async function listIssues(opts: {
  state?: string;
  limit?: number;
  label?: string;
  assignee?: string;
}): Promise<GithubResult> {
  const flags: string[] = ["issue", "list"];
  if (opts.state) flags.push("--state", opts.state);
  if (opts.limit) flags.push("--limit", String(opts.limit));
  if (opts.label) flags.push("--label", opts.label);
  if (opts.assignee) flags.push("--assignee", opts.assignee);
  return runGh(flags.join(" "));
}

export async function viewIssue(opts: {
  number: number;
  comments?: boolean;
}): Promise<GithubResult> {
  const flags = ["issue", "view", String(opts.number)];
  if (opts.comments) flags.push("--comments");
  return runGh(flags.join(" "));
}

export async function createIssue(opts: {
  title: string;
  body?: string;
  label?: string;
  assignee?: string;
}): Promise<GithubResult> {
  const flags = ["issue", "create", "--title", JSON.stringify(opts.title)];
  if (opts.body) flags.push("--body", JSON.stringify(opts.body));
  if (opts.label) flags.push("--label", opts.label);
  if (opts.assignee) flags.push("--assignee", opts.assignee);
  return runGh(flags.join(" "));
}

// --- Repo ---

export async function viewRepo(): Promise<GithubResult> {
  return runGh("repo view");
}

// --- Workflow / Actions ---

export async function listWorkflowRuns(opts: {
  limit?: number;
  workflow?: string;
  branch?: string;
  status?: string;
}): Promise<GithubResult> {
  const flags: string[] = ["run", "list"];
  if (opts.limit) flags.push("--limit", String(opts.limit));
  if (opts.workflow) flags.push("--workflow", opts.workflow);
  if (opts.branch) flags.push("--branch", opts.branch);
  if (opts.status) flags.push("--status", opts.status);
  return runGh(flags.join(" "));
}

export async function viewWorkflowRun(runId: number): Promise<GithubResult> {
  return runGh(`run view ${runId}`);
}
