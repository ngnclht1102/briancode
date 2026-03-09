import { readFile } from "./file-reader.js";
import { searchFiles } from "./search.js";
import { listDirectory, getGitDiff } from "./git.js";
import { createFile, editFile, deleteFile, setExecutionId, clearBackups } from "../executor/file-ops.js";
import { runCommand } from "../executor/shell-ops.js";
import { log } from "../logger.js";
const tools = [
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
            return readFile(args.path, args.startLine, args.endLine);
        },
    },
    {
        tool: {
            name: "search_files",
            description: "Search for a text pattern across project files. Returns matching lines with context.",
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
            return searchFiles(args.query, args.glob);
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
            return listDirectory(args.path);
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
            return getGitDiff(args.staged);
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
            const filePath = args.path;
            const content = args.content;
            const result = createFile(filePath, content);
            if (!result.success)
                return `Error: ${result.error}`;
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
            const filePath = args.path;
            const content = args.content;
            const result = editFile(filePath, content);
            if (!result.success)
                return `Error: ${result.error}`;
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
            const filePath = args.path;
            const result = deleteFile(filePath);
            if (!result.success)
                return `Error: ${result.error}`;
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
            const command = args.command;
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
export function getToolDefinitions() {
    return tools.map((t) => t.tool);
}
export async function executeTool(name, args) {
    const tool = tools.find((t) => t.tool.name === name);
    if (!tool) {
        log.tool.error(`Unknown tool: "${name}"`);
        return `Error: Unknown tool "${name}"`;
    }
    try {
        const result = await tool.handler(args);
        return result;
    }
    catch (err) {
        log.tool.error(`${name} failed: ${String(err)}`);
        return `Error executing ${name}: ${String(err)}`;
    }
}
//# sourceMappingURL=tool-handler.js.map