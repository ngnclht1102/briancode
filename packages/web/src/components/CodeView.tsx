import { useState, useEffect } from "react";

interface CodeViewProps {
  filePath: string;
  onClose: () => void;
  onMention: (filePath: string) => void;
}

function getLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    py: "python", rs: "rust", go: "go", java: "java", rb: "ruby",
    css: "css", html: "html", json: "json", md: "markdown", yaml: "yaml",
    yml: "yaml", toml: "toml", sh: "shell", bash: "shell", sql: "sql",
  };
  return map[ext] ?? "plaintext";
}

export default function CodeView({ filePath, onClose, onMention }: CodeViewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setContent(null);
    fetch(`/api/file/${encodeURIComponent(filePath)}`)
      .then((r) => r.json())
      .then((data: { content?: string; error?: string }) => {
        if (data.error) {
          setError(data.error);
        } else {
          setContent(data.content ?? "");
        }
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [filePath]);

  const lines = content?.split("\n") ?? [];
  const lineNumWidth = String(lines.length).length;
  const lang = getLanguage(filePath);
  const fileName = filePath.split("/").pop() ?? filePath;

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-zinc-500 uppercase">{lang}</span>
          <span className="text-sm text-zinc-300 truncate" title={filePath}>
            {fileName}
          </span>
          <span className="text-xs text-zinc-600 truncate hidden sm:inline" title={filePath}>
            {filePath}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onMention(filePath)}
            className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            title="Add as @ mention in chat"
          >
            @ Mention
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {loading && (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Loading...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full text-red-400 px-4 text-center">
            {error}
          </div>
        )}
        {content !== null && (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-zinc-900/50">
                  <td
                    className="text-right text-zinc-600 select-none px-3 py-0 leading-5 border-r border-zinc-800 sticky left-0 bg-zinc-950"
                    style={{ minWidth: `${lineNumWidth + 2}ch` }}
                  >
                    {i + 1}
                  </td>
                  <td className="px-3 py-0 leading-5 text-zinc-300 whitespace-pre">
                    {line || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {content !== null && (
        <div className="flex items-center justify-between px-3 py-1 border-t border-zinc-800 text-xs text-zinc-600 shrink-0">
          <span>{lines.length} lines</span>
          <span>{filePath}</span>
        </div>
      )}
    </div>
  );
}
