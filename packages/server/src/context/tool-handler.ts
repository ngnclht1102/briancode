import type { Tool } from "../providers/types.js";
import { readFile } from "./file-reader.js";
import { searchFiles } from "./search.js";
import { listDirectory, getGitDiff } from "./git.js";
import { createFile, editFile, deleteFile, setExecutionId, clearBackups } from "../executor/file-ops.js";
import { runCommand } from "../executor/shell-ops.js";

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
      if (result.exitCode !== 0) {
        return `Command failed (exit ${result.exitCode}):${output}${result.error ? `\n${result.error}` : ""}`;
      }
      return `Command succeeded:${output}`;
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
  if (!tool) return `Error: Unknown tool "${name}"`;
  try {
    return await tool.handler(args);
  } catch (err) {
    return `Error executing ${name}: ${String(err)}`;
  }
}
