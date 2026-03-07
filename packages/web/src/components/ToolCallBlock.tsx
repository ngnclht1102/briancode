import { useState } from "react";
import type { ToolCall } from "../stores/chatStore";

export default function ToolCallBlock({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const isLoading = toolCall.result === undefined;

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
        <span className="text-zinc-500">
          ({Object.entries(toolCall.args).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ")})
        </span>
        <span className="ml-auto text-zinc-600">{expanded ? "▼" : "▶"}</span>
      </button>
      {expanded && toolCall.result !== undefined && (
        <pre className="max-h-60 overflow-auto border-t border-zinc-700 px-3 py-2 text-xs text-zinc-400 whitespace-pre-wrap">
          {toolCall.result}
        </pre>
      )}
    </div>
  );
}
