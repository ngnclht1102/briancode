import { useState } from "react";

interface DiffViewProps {
  diff: string;
  filePath?: string;
}

export default function DiffView({ diff, filePath }: DiffViewProps) {
  const [expanded, setExpanded] = useState(true);
  const lines = diff.split("\n");

  return (
    <div className="my-2 rounded border border-zinc-700 bg-zinc-900 text-xs font-mono overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-zinc-800 text-zinc-300 border-b border-zinc-700"
      >
        <span>{expanded ? "▼" : "▶"}</span>
        <span>{filePath ?? "diff"}</span>
      </button>
      {expanded && (
        <div className="overflow-x-auto max-h-80">
          {lines.map((line, i) => {
            let bg = "";
            let color = "text-zinc-400";
            if (line.startsWith("+") && !line.startsWith("+++")) {
              bg = "bg-green-950/40";
              color = "text-green-400";
            } else if (line.startsWith("-") && !line.startsWith("---")) {
              bg = "bg-red-950/40";
              color = "text-red-400";
            } else if (line.startsWith("@@")) {
              color = "text-blue-400";
            } else if (line.startsWith("---") || line.startsWith("+++")) {
              color = "text-zinc-500";
            }
            return (
              <div key={i} className={`px-3 py-0 leading-5 ${bg} ${color}`}>
                {line || " "}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
