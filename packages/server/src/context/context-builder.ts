import { getFileTree, getFileTreeAsString } from "./workspace.js";
import { getAgentsMd } from "./agents-md.js";
import { getGitBranch, getGitStatus, isGitRepo } from "./git.js";
import { log } from "../logger.js";

const TOKEN_BUDGET = 4000; // approx chars for baseline context

export async function buildSystemPrompt(): Promise<string> {
  log.context.start("Building system prompt");
  const parts: string[] = [];

  parts.push(
    "You are Brian Code, an AI coding assistant. You help users understand and modify their codebase.",
    "You have access to tools for reading files, searching code, listing directories, viewing git diffs, writing files, editing files, deleting files, and running shell commands.",
    "Use tools to gather context before answering. Be concise and accurate.",
    "",
    "CRITICAL RULES:",
    "- NEVER say you updated/changed/edited a file unless you actually called write_file or edit_file tool. Saying you made changes without calling a tool is lying to the user.",
    "- NEVER describe file contents in text as if you wrote them. You MUST call the tool to actually write.",
    "- If you need to modify a file, you MUST call the tool. No exceptions.",
    "",
    "When the user asks you to make changes:",
    "1. First read the relevant files to understand the current code.",
    "2. Explain what you plan to do briefly.",
    "3. Use write_file/edit_file/delete_file/run_shell tools to apply the changes directly. You MUST actually call the tool — do not just describe the changes in text.",
    "4. For edits, always read the file first, then provide the complete new content via edit_file.",
    "5. After calling the tool, confirm what was done based on the tool result.",
    "Keep changes focused — one file per tool call.",
  );

  // Agents.md — project-specific instructions
  const agentsMd = getAgentsMd();
  if (agentsMd) {
    parts.push("\n## Project Instructions (Agents.md)\n" + agentsMd);
    log.context.info("Loaded Agents.md");
  }

  // File tree
  await getFileTree(); // ensure cache is populated
  const fileTree = getFileTreeAsString();
  if (fileTree && fileTree !== "(file tree not loaded)") {
    const trimmed = trimToFit(fileTree, TOKEN_BUDGET);
    parts.push("\n## Project File Tree\n" + trimmed);
    log.context.info(`File tree: ${trimmed.split("\n").length} entries`);
  }

  // Git info
  if (isGitRepo()) {
    const [branch, status] = await Promise.all([getGitBranch(), getGitStatus()]);
    const gitParts: string[] = [];
    if (branch) gitParts.push(`Branch: ${branch}`);
    if (status && status !== "Not a git repository.") gitParts.push(`Status:\n${status}`);
    if (gitParts.length > 0) {
      parts.push("\n## Git Info\n" + gitParts.join("\n"));
      log.context.info(`Git: branch=${branch}`);
    }
  }

  const prompt = parts.join("\n");
  log.context.done(`System prompt built (${prompt.length} chars)`);
  return prompt;
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
