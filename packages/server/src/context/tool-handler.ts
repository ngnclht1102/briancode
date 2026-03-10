import type { Tool } from "../providers/types.js";
import { readFile } from "./file-reader.js";
import { searchFiles } from "./search.js";
import { listDirectory, getGitDiff } from "./git.js";
import { createFile, editFile, deleteFile, setExecutionId, clearBackups } from "../executor/file-ops.js";
import { runCommand } from "../executor/shell-ops.js";
import {
  listPullRequests,
  viewPullRequest,
  createPullRequest,
  getPrDiff,
  getPrChecks,
  mergePullRequest,
  listIssues,
  viewIssue,
  createIssue,
  viewRepo,
  listWorkflowRuns,
  viewWorkflowRun,
} from "../executor/github-ops.js";
import {
  listBranches,
  createBranch,
  switchBranch,
  deleteBranch,
  stageFiles,
  unstageFiles,
  stageAll,
  commit,
  gitLog,
  push,
  pull,
  fetch,
  merge,
  rebase,
  rebaseAbort,
  rebaseContinue,
  mergeAbort,
  stash,
  stashPop,
  stashList,
  createTag,
  reset,
  cherryPick,
} from "../executor/git-ops.js";
import { log } from "../logger.js";

export interface ToolDefinition {
  tool: Tool;
  handler: (args: Record<string, unknown>) => Promise<string>;
}

const tools: ToolDefinition[] = [
  {
    tool: {
      name: "read_file",
      description: "Read the contents of a file. Returns line-numbered content.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path from project root" },
          startLine: { type: "number", description: "Start line number (optional)" },
          endLine: { type: "number", description: "End line number (optional)" },
        },
        required: ["path"],
      },
    },
    handler: async (args) => {
      return readFile(
        args.path as string,
        args.startLine as number | undefined,
        args.endLine as number | undefined,
      );
    },
  },
  {
    tool: {
      name: "search_files",
      description:
        "Search for a text pattern across project files. Returns matching lines with context.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Text to search for (case-insensitive)" },
          glob: { type: "string", description: "Glob pattern to filter files (e.g. **/*.ts)" },
        },
        required: ["query"],
      },
    },
    handler: async (args) => {
      return searchFiles(args.query as string, args.glob as string | undefined);
    },
  },
  {
    tool: {
      name: "list_directory",
      description: "List files and folders in a directory.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative directory path from project root" },
        },
        required: ["path"],
      },
    },
    handler: async (args) => {
      return listDirectory(args.path as string);
    },
  },
  {
    tool: {
      name: "read_git_diff",
      description: "Get git status and diff for unstaged or staged changes.",
      parameters: {
        type: "object",
        properties: {
          staged: { type: "boolean", description: "If true, show staged changes" },
        },
      },
    },
    handler: async (args) => {
      return getGitDiff(args.staged as boolean | undefined);
    },
  },
  {
    tool: {
      name: "write_file",
      description: "Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Creates parent directories as needed.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path from project root" },
          content: { type: "string", description: "The complete file content to write" },
        },
        required: ["path", "content"],
      },
    },
    handler: async (args) => {
      ensureExecutionId();
      const filePath = args.path as string;
      const content = args.content as string;
      const result = createFile(filePath, content);
      if (!result.success) return `Error: ${result.error}`;
      return `File written: ${filePath} (${content.split("\n").length} lines)\n\n${result.diff}`;
    },
  },
  {
    tool: {
      name: "edit_file",
      description: "Replace the entire contents of an existing file with new content. Use read_file first to see the current content, then provide the complete new content.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path from project root" },
          content: { type: "string", description: "The complete new file content" },
        },
        required: ["path", "content"],
      },
    },
    handler: async (args) => {
      ensureExecutionId();
      const filePath = args.path as string;
      const content = args.content as string;
      const result = editFile(filePath, content);
      if (!result.success) return `Error: ${result.error}`;
      return `File updated: ${filePath} (${content.split("\n").length} lines)\n\n${result.diff}`;
    },
  },
  {
    tool: {
      name: "delete_file",
      description: "Delete a file from the project.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path from project root" },
        },
        required: ["path"],
      },
    },
    handler: async (args) => {
      ensureExecutionId();
      const filePath = args.path as string;
      const result = deleteFile(filePath);
      if (!result.success) return `Error: ${result.error}`;
      return `File deleted: ${filePath}`;
    },
  },
  {
    tool: {
      name: "run_shell",
      description: "Run a shell command in the project directory. Use for installing packages, running tests, builds, etc. Returns stdout+stderr and exit code.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "The shell command to run" },
        },
        required: ["command"],
      },
    },
    handler: async (args) => {
      const command = args.command as string;
      const result = await runCommand(command);
      const output = result.output ? `\n${result.output}` : "";
      if (result.error?.includes("timed out")) {
        return `Command timed out: ${result.error}${output ? `\n\nPartial output:${output}` : ""}`;
      }
      if (result.exitCode !== 0) {
        return `Command failed (exit ${result.exitCode}):${output}${result.error ? `\nError: ${result.error}` : ""}`;
      }
      return `Command succeeded:${output}`;
    },
  },

  // --- GitHub CLI Tools ---
  {
    tool: {
      name: "github_pr_list",
      description:
        "List pull requests in the current GitHub repository. Returns PR number, title, author, and status.",
      parameters: {
        type: "object",
        properties: {
          state: {
            type: "string",
            description: "Filter by state: open, closed, merged, all (default: open)",
          },
          limit: { type: "number", description: "Max number of PRs to return (default: 30)" },
          author: { type: "string", description: "Filter by author username" },
          base: { type: "string", description: "Filter by base branch" },
          label: { type: "string", description: "Filter by label" },
        },
      },
    },
    handler: async (args) => {
      const result = await listPullRequests({
        state: args.state as string | undefined,
        limit: args.limit as number | undefined,
        author: args.author as string | undefined,
        base: args.base as string | undefined,
        label: args.label as string | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "No pull requests found.";
    },
  },
  {
    tool: {
      name: "github_pr_view",
      description:
        "View details of a specific pull request including title, body, status, reviewers, and optionally comments.",
      parameters: {
        type: "object",
        properties: {
          number: { type: "number", description: "PR number" },
          comments: { type: "boolean", description: "Include comments (default: false)" },
        },
        required: ["number"],
      },
    },
    handler: async (args) => {
      const result = await viewPullRequest({
        number: args.number as number,
        comments: args.comments as boolean | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output;
    },
  },
  {
    tool: {
      name: "github_pr_create",
      description:
        "Create a new pull request from the current branch. Pushes the branch first if needed.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "PR title" },
          body: { type: "string", description: "PR description/body" },
          base: { type: "string", description: "Base branch (default: repo default branch)" },
          head: { type: "string", description: "Head branch (default: current branch)" },
          draft: { type: "boolean", description: "Create as draft PR" },
          label: { type: "string", description: "Add label to the PR" },
        },
        required: ["title"],
      },
    },
    handler: async (args) => {
      const result = await createPullRequest({
        title: args.title as string,
        body: args.body as string | undefined,
        base: args.base as string | undefined,
        head: args.head as string | undefined,
        draft: args.draft as boolean | undefined,
        label: args.label as string | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output;
    },
  },
  {
    tool: {
      name: "github_pr_diff",
      description: "View the diff/changes of a pull request.",
      parameters: {
        type: "object",
        properties: {
          number: { type: "number", description: "PR number" },
        },
        required: ["number"],
      },
    },
    handler: async (args) => {
      const result = await getPrDiff(args.number as number);
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "No changes in this PR.";
    },
  },
  {
    tool: {
      name: "github_pr_checks",
      description: "View CI/CD check statuses for a pull request.",
      parameters: {
        type: "object",
        properties: {
          number: { type: "number", description: "PR number" },
        },
        required: ["number"],
      },
    },
    handler: async (args) => {
      const result = await getPrChecks(args.number as number);
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "No checks found for this PR.";
    },
  },
  {
    tool: {
      name: "github_pr_merge",
      description: "Merge a pull request.",
      parameters: {
        type: "object",
        properties: {
          number: { type: "number", description: "PR number" },
          method: {
            type: "string",
            description: "Merge method: merge, squash, or rebase (default: merge)",
          },
          deleteAfter: {
            type: "boolean",
            description: "Delete the branch after merging (default: false)",
          },
        },
        required: ["number"],
      },
    },
    handler: async (args) => {
      const result = await mergePullRequest({
        number: args.number as number,
        method: args.method as string | undefined,
        deleteAfter: args.deleteAfter as boolean | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output;
    },
  },
  {
    tool: {
      name: "github_issue_list",
      description: "List issues in the current GitHub repository.",
      parameters: {
        type: "object",
        properties: {
          state: {
            type: "string",
            description: "Filter by state: open, closed, all (default: open)",
          },
          limit: { type: "number", description: "Max number of issues to return (default: 30)" },
          label: { type: "string", description: "Filter by label" },
          assignee: { type: "string", description: "Filter by assignee username" },
        },
      },
    },
    handler: async (args) => {
      const result = await listIssues({
        state: args.state as string | undefined,
        limit: args.limit as number | undefined,
        label: args.label as string | undefined,
        assignee: args.assignee as string | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "No issues found.";
    },
  },
  {
    tool: {
      name: "github_issue_view",
      description: "View details of a specific issue including title, body, labels, and optionally comments.",
      parameters: {
        type: "object",
        properties: {
          number: { type: "number", description: "Issue number" },
          comments: { type: "boolean", description: "Include comments (default: false)" },
        },
        required: ["number"],
      },
    },
    handler: async (args) => {
      const result = await viewIssue({
        number: args.number as number,
        comments: args.comments as boolean | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output;
    },
  },
  {
    tool: {
      name: "github_issue_create",
      description: "Create a new issue in the current GitHub repository.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Issue title" },
          body: { type: "string", description: "Issue body/description" },
          label: { type: "string", description: "Add label to the issue" },
          assignee: { type: "string", description: "Assign to a user" },
        },
        required: ["title"],
      },
    },
    handler: async (args) => {
      const result = await createIssue({
        title: args.title as string,
        body: args.body as string | undefined,
        label: args.label as string | undefined,
        assignee: args.assignee as string | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output;
    },
  },
  {
    tool: {
      name: "github_repo_view",
      description:
        "View information about the current GitHub repository including description, stars, forks, and default branch.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
    handler: async () => {
      const result = await viewRepo();
      if (!result.success) return `Error: ${result.error}`;
      return result.output;
    },
  },
  {
    tool: {
      name: "github_run_list",
      description: "List recent GitHub Actions workflow runs.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max number of runs to return (default: 20)" },
          workflow: { type: "string", description: "Filter by workflow name or filename" },
          branch: { type: "string", description: "Filter by branch" },
          status: {
            type: "string",
            description:
              "Filter by status: queued, in_progress, completed, success, failure, cancelled",
          },
        },
      },
    },
    handler: async (args) => {
      const result = await listWorkflowRuns({
        limit: args.limit as number | undefined,
        workflow: args.workflow as string | undefined,
        branch: args.branch as string | undefined,
        status: args.status as string | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "No workflow runs found.";
    },
  },
  {
    tool: {
      name: "github_run_view",
      description: "View details of a specific GitHub Actions workflow run including jobs and status.",
      parameters: {
        type: "object",
        properties: {
          run_id: { type: "number", description: "Workflow run ID" },
        },
        required: ["run_id"],
      },
    },
    handler: async (args) => {
      const result = await viewWorkflowRun(args.run_id as number);
      if (!result.success) return `Error: ${result.error}`;
      return result.output;
    },
  },

  // --- Git Tools ---
  {
    tool: {
      name: "git_branch_list",
      description: "List git branches, sorted by most recent commit. Shows current branch marked with *.",
      parameters: {
        type: "object",
        properties: {
          all: { type: "boolean", description: "Include remote-tracking branches (default: false)" },
        },
      },
    },
    handler: async (args) => {
      const result = await listBranches(args.all as boolean | undefined);
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "No branches found.";
    },
  },
  {
    tool: {
      name: "git_branch_create",
      description: "Create a new branch and switch to it.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "New branch name" },
          start_point: { type: "string", description: "Starting commit/branch (default: HEAD)" },
        },
        required: ["name"],
      },
    },
    handler: async (args) => {
      const result = await createBranch(
        args.name as string,
        args.start_point as string | undefined,
      );
      if (!result.success) return `Error: ${result.error}`;
      return result.output || `Switched to new branch '${args.name}'`;
    },
  },
  {
    tool: {
      name: "git_branch_switch",
      description: "Switch to an existing branch.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Branch name to switch to" },
        },
        required: ["name"],
      },
    },
    handler: async (args) => {
      const result = await switchBranch(args.name as string);
      if (!result.success) return `Error: ${result.error}`;
      return result.output || `Switched to branch '${args.name}'`;
    },
  },
  {
    tool: {
      name: "git_branch_delete",
      description: "Delete a branch.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Branch name to delete" },
          force: { type: "boolean", description: "Force delete even if not fully merged (default: false)" },
        },
        required: ["name"],
      },
    },
    handler: async (args) => {
      const result = await deleteBranch(
        args.name as string,
        args.force as boolean | undefined,
      );
      if (!result.success) return `Error: ${result.error}`;
      return result.output || `Deleted branch '${args.name}'`;
    },
  },
  {
    tool: {
      name: "git_stage",
      description: "Stage files for commit. Can stage specific files or all changes.",
      parameters: {
        type: "object",
        properties: {
          paths: {
            type: "array",
            items: { type: "string" },
            description: "File paths to stage. Omit to stage all changes.",
          },
        },
      },
    },
    handler: async (args) => {
      const paths = args.paths as string[] | undefined;
      const result = paths && paths.length > 0
        ? await stageFiles(paths)
        : await stageAll();
      if (!result.success) return `Error: ${result.error}`;
      return paths && paths.length > 0
        ? `Staged ${paths.length} file(s): ${paths.join(", ")}`
        : "Staged all changes.";
    },
  },
  {
    tool: {
      name: "git_unstage",
      description: "Unstage files (remove from staging area, keep working changes).",
      parameters: {
        type: "object",
        properties: {
          paths: {
            type: "array",
            items: { type: "string" },
            description: "File paths to unstage",
          },
        },
        required: ["paths"],
      },
    },
    handler: async (args) => {
      const paths = args.paths as string[];
      const result = await unstageFiles(paths);
      if (!result.success) return `Error: ${result.error}`;
      return `Unstaged ${paths.length} file(s): ${paths.join(", ")}`;
    },
  },
  {
    tool: {
      name: "git_commit",
      description: "Create a git commit with staged changes.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "Commit message" },
        },
        required: ["message"],
      },
    },
    handler: async (args) => {
      const result = await commit(args.message as string);
      if (!result.success) return `Error: ${result.error}`;
      return result.output;
    },
  },
  {
    tool: {
      name: "git_log",
      description: "Show commit history log.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of commits to show (default: 10)" },
          oneline: { type: "boolean", description: "Show compact one-line format (default: false)" },
          branch: { type: "string", description: "Branch to show log for (default: current)" },
        },
      },
    },
    handler: async (args) => {
      const result = await gitLog({
        limit: args.limit as number | undefined,
        oneline: args.oneline as boolean | undefined,
        branch: args.branch as string | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "No commits found.";
    },
  },
  {
    tool: {
      name: "git_push",
      description: "Push commits to remote repository.",
      parameters: {
        type: "object",
        properties: {
          remote: { type: "string", description: "Remote name (default: origin)" },
          branch: { type: "string", description: "Branch to push (default: current)" },
          set_upstream: { type: "boolean", description: "Set upstream tracking branch (-u flag)" },
          force: { type: "boolean", description: "Force push with --force-with-lease (safe force push)" },
        },
      },
    },
    handler: async (args) => {
      const result = await push({
        remote: args.remote as string | undefined,
        branch: args.branch as string | undefined,
        setUpstream: args.set_upstream as boolean | undefined,
        force: args.force as boolean | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "Push completed.";
    },
  },
  {
    tool: {
      name: "git_pull",
      description: "Pull changes from remote repository.",
      parameters: {
        type: "object",
        properties: {
          remote: { type: "string", description: "Remote name (default: origin)" },
          branch: { type: "string", description: "Branch to pull (default: current tracking)" },
          rebase: { type: "boolean", description: "Rebase instead of merge (default: false)" },
        },
      },
    },
    handler: async (args) => {
      const result = await pull({
        remote: args.remote as string | undefined,
        branch: args.branch as string | undefined,
        rebase: args.rebase as boolean | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "Pull completed.";
    },
  },
  {
    tool: {
      name: "git_fetch",
      description: "Fetch updates from remote without merging.",
      parameters: {
        type: "object",
        properties: {
          remote: { type: "string", description: "Remote name (default: all remotes)" },
          prune: { type: "boolean", description: "Remove stale remote-tracking refs (default: false)" },
        },
      },
    },
    handler: async (args) => {
      const result = await fetch({
        remote: args.remote as string | undefined,
        prune: args.prune as boolean | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "Fetch completed.";
    },
  },
  {
    tool: {
      name: "git_merge",
      description: "Merge a branch into the current branch.",
      parameters: {
        type: "object",
        properties: {
          branch: { type: "string", description: "Branch to merge" },
          no_ff: { type: "boolean", description: "Create a merge commit even for fast-forward (default: false)" },
        },
        required: ["branch"],
      },
    },
    handler: async (args) => {
      const result = await merge(
        args.branch as string,
        args.no_ff as boolean | undefined,
      );
      if (!result.success) return `Error: ${result.error}`;
      return result.output || `Merged '${args.branch}' into current branch.`;
    },
  },
  {
    tool: {
      name: "git_merge_abort",
      description: "Abort an in-progress merge.",
      parameters: { type: "object", properties: {} },
    },
    handler: async () => {
      const result = await mergeAbort();
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "Merge aborted.";
    },
  },
  {
    tool: {
      name: "git_rebase",
      description: "Rebase current branch onto another branch.",
      parameters: {
        type: "object",
        properties: {
          branch: { type: "string", description: "Branch to rebase onto" },
        },
        required: ["branch"],
      },
    },
    handler: async (args) => {
      const result = await rebase(args.branch as string);
      if (!result.success) return `Error: ${result.error}`;
      return result.output || `Rebased onto '${args.branch}'.`;
    },
  },
  {
    tool: {
      name: "git_rebase_abort",
      description: "Abort an in-progress rebase.",
      parameters: { type: "object", properties: {} },
    },
    handler: async () => {
      const result = await rebaseAbort();
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "Rebase aborted.";
    },
  },
  {
    tool: {
      name: "git_rebase_continue",
      description: "Continue a rebase after resolving conflicts.",
      parameters: { type: "object", properties: {} },
    },
    handler: async () => {
      const result = await rebaseContinue();
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "Rebase continued.";
    },
  },
  {
    tool: {
      name: "git_stash",
      description: "Stash current working changes.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "Optional stash message" },
        },
      },
    },
    handler: async (args) => {
      const result = await stash(args.message as string | undefined);
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "Changes stashed.";
    },
  },
  {
    tool: {
      name: "git_stash_pop",
      description: "Apply and remove the most recent stash.",
      parameters: { type: "object", properties: {} },
    },
    handler: async () => {
      const result = await stashPop();
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "Stash applied and removed.";
    },
  },
  {
    tool: {
      name: "git_stash_list",
      description: "List all stashed changes.",
      parameters: { type: "object", properties: {} },
    },
    handler: async () => {
      const result = await stashList();
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "No stashes found.";
    },
  },
  {
    tool: {
      name: "git_tag",
      description: "Create a git tag at the current commit.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Tag name" },
          message: { type: "string", description: "Tag message (creates annotated tag)" },
        },
        required: ["name"],
      },
    },
    handler: async (args) => {
      const result = await createTag(
        args.name as string,
        args.message as string | undefined,
      );
      if (!result.success) return `Error: ${result.error}`;
      return result.output || `Tag '${args.name}' created.`;
    },
  },
  {
    tool: {
      name: "git_reset",
      description: "Reset current HEAD to a specified state. Use with caution.",
      parameters: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            description: "Reset mode: soft (keep staged), mixed (unstage, keep working), hard (discard all)",
          },
          ref: { type: "string", description: "Commit ref to reset to (default: HEAD)" },
        },
        required: ["mode"],
      },
    },
    handler: async (args) => {
      const mode = args.mode as string;
      if (!["soft", "mixed", "hard"].includes(mode)) {
        return "Error: mode must be soft, mixed, or hard";
      }
      const result = await reset({
        mode: mode as "soft" | "mixed" | "hard",
        ref: args.ref as string | undefined,
      });
      if (!result.success) return `Error: ${result.error}`;
      return result.output || `Reset --${mode} completed.`;
    },
  },
  {
    tool: {
      name: "git_cherry_pick",
      description: "Apply a commit from another branch onto the current branch.",
      parameters: {
        type: "object",
        properties: {
          commit: { type: "string", description: "Commit hash to cherry-pick" },
        },
        required: ["commit"],
      },
    },
    handler: async (args) => {
      const result = await cherryPick(args.commit as string);
      if (!result.success) return `Error: ${result.error}`;
      return result.output || "Cherry-pick applied.";
    },
  },
];

let hasExecutionId = false;

function ensureExecutionId() {
  if (!hasExecutionId) {
    clearBackups();
    setExecutionId(`exec-${Date.now()}`);
    hasExecutionId = true;
  }
}

export function resetToolExecutionState() {
  hasExecutionId = false;
}

export function getToolDefinitions(): Tool[] {
  return tools.map((t) => t.tool);
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  const tool = tools.find((t) => t.tool.name === name);
  if (!tool) {
    log.tool.error(`Unknown tool: "${name}"`);
    return `Error: Unknown tool "${name}"`;
  }

  try {
    const result = await tool.handler(args);
    return result;
  } catch (err) {
    log.tool.error(`${name} failed: ${String(err)}`);
    return `Error executing ${name}: ${String(err)}`;
  }
}
