import { getFileTree, getFileTreeAsString } from "./workspace.js";
import { getAgentsMd } from "./agents-md.js";
import { getGitBranch, getGitStatus, isGitRepo } from "./git.js";

const TOKEN_BUDGET = 4000; // approx chars for baseline context

export async function buildSystemPrompt(): Promise<string> {
  const parts: string[] = [];

  parts.push(
    "You are Brian Code, an AI coding assistant. You help users understand and modify their codebase.",
    "You have access to tools for reading files, searching code, listing directories, viewing git diffs, writing files, editing files, deleting files, and running shell commands.",
    "Use tools to gather context before answering. Be concise and accurate.",
    "",
    "When the user asks you to make changes:",
    "1. First read the relevant files to understand the current code.",
    "2. Explain what you plan to do briefly.",
    "3. Use write_file/edit_file/delete_file/run_shell tools to apply the changes directly.",
    "4. For edits, always read the file first, then provide the complete new content via edit_file.",
    "Keep changes focused — one file per tool call.",
  );

  // Agents.md — project-specific instructions
  const agentsMd = getAgentsMd();
  if (agentsMd) {
    parts.push("\n## Project Instructions (Agents.md)\n" + agentsMd);
  }

  // File tree
  await getFileTree(); // ensure cache is populated
  const fileTree = getFileTreeAsString();
  if (fileTree && fileTree !== "(file tree not loaded)") {
    const trimmed = trimToFit(fileTree, TOKEN_BUDGET);
    parts.push("\n## Project File Tree\n" + trimmed);
  }

  // Git info
  if (isGitRepo()) {
    const [branch, status] = await Promise.all([getGitBranch(), getGitStatus()]);
    const gitParts: string[] = [];
    if (branch) gitParts.push(`Branch: ${branch}`);
    if (status && status !== "Not a git repository.") gitParts.push(`Status:\n${status}`);
    if (gitParts.length > 0) {
      parts.push("\n## Git Info\n" + gitParts.join("\n"));
    }
  }

  return parts.join("\n");
}

function trimToFit(text: string, budget: number): string {
  if (text.length <= budget) return text;
  const lines = text.split("\n");
  const result: string[] = [];
  let len = 0;
  for (const line of lines) {
    if (len + line.length + 1 > budget) {
      result.push(`... (${lines.length - result.length} more entries)`);
      break;
    }
    result.push(line);
    len += line.length + 1;
  }
  return result.join("\n");
}
