import type { Tool } from "../providers/types.js";
import { readFile } from "./file-reader.js";
import { searchFiles } from "./search.js";
import { listDirectory, getGitDiff } from "./git.js";

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
];

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
