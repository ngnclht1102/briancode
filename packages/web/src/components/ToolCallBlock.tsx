import { useState } from "react";
import type { ToolCall } from "../stores/chatStore";

const WRITE_TOOLS = new Set(["write_file", "edit_file"]);

function summarizeArgs(name: string, args: Record<string, unknown>): string {
  if (WRITE_TOOLS.has(name)) {
    const path = args.path as string | undefined;
    const content = args.content as string | undefined;
    const lines = content ? content.split("\n").length : 0;
    return `path: "${path ?? "?"}" (${lines} lines)`;
  }
  return Object.entries(args)
    .map(([k, v]) => {
      const s = JSON.stringify(v);
      return `${k}: ${s.length > 80 ? s.slice(0, 77) + "..." : s}`;
    })
    .join(", ");
}

function DiffView({ text }: { text: string }) {
  // Find the diff section (starts with --- a/)
  const diffStart = text.indexOf("--- a/");
  if (diffStart === -1) {
    return <span>{text}</span>;
  }

  const summary = text.slice(0, diffStart).trim();
  const diffText = text.slice(diffStart);
  const lines = diffText.split("\n");

  return (
    <>
      {summary && <div className="mb-2 text-zinc-300">{summary}</div>}
      <div className="font-mono text-xs leading-relaxed">
        {lines.map((line, i) => {
          let className = "text-zinc-500";
          if (line.startsWith("+") && !line.startsWith("+++")) {
            className = "text-green-400 bg-green-400/10";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            className = "text-red-400 bg-red-400/10";
          } else if (line.startsWith("@@")) {
            className = "text-blue-400";
          } else if (line.startsWith("---") || line.startsWith("+++")) {
            className = "text-zinc-400 font-semibold";
          }
          return (
            <div key={i} className={className}>
              {line}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function ToolCallBlock({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const isLoading = toolCall.result === undefined;
  const isWriteTool = WRITE_TOOLS.has(toolCall.name) || toolCall.name === "delete_file";
  const hasDiff = isWriteTool && toolCall.result?.includes("--- a/");

  return (
    <div className="my-2 rounded border border-zinc-700 bg-zinc-900 text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800"
      >
        {isLoading ? (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-500 border-t-blue-400" />
        ) : (
          <span className="text-green-400">✓</span>
        )}
        <span className="font-mono text-blue-400">{toolCall.name}</span>
        <span className="truncate text-zinc-500">
          ({summarizeArgs(toolCall.name, toolCall.args)})
        </span>
        <span className="ml-auto text-zinc-600">{expanded ? "▼" : "▶"}</span>
      </button>
      {expanded && toolCall.result !== undefined && (
        <div className="max-h-80 overflow-auto border-t border-zinc-700 px-3 py-2 text-xs">
          {hasDiff ? (
            <DiffView text={toolCall.result} />
          ) : (
            <pre className="text-zinc-400 whitespace-pre-wrap">{toolCall.result}</pre>
          )}
        </div>
      )}
    </div>
  );
}
