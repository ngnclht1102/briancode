import { useExecutionStore } from "../stores/executionStore";
import DiffView from "./DiffView";

const STATUS_ICONS: Record<string, string> = {
  pending: "○",
  running: "◎",
  success: "✓",
  error: "✗",
  skipped: "—",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-zinc-500",
  running: "text-blue-400",
  success: "text-green-400",
  error: "text-red-400",
  skipped: "text-zinc-600",
};

export default function ExecutionProgress({
  onCancel,
  onRollback,
}: {
  onCancel?: () => void;
  onRollback?: () => void;
}) {
  const { isExecuting, steps, summary } = useExecutionStore();

  if (steps.length === 0) return null;

  const hasFailed = steps.some((s) => s.status === "error");

  return (
    <div className="border-t border-zinc-700 bg-zinc-900 p-4 space-y-3 max-h-[60vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">Execution Progress</h3>
        <div className="flex gap-2">
          {isExecuting && onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-xs rounded bg-red-700 hover:bg-red-600 text-white"
            >
              Cancel
            </button>
          )}
          {hasFailed && !isExecuting && onRollback && (
            <button
              onClick={onRollback}
              className="px-3 py-1 text-xs rounded bg-yellow-700 hover:bg-yellow-600 text-white"
            >
              Rollback
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="rounded border border-zinc-700 bg-zinc-950 p-3">
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm ${STATUS_COLORS[step.status]}`}>
                {step.status === "running" ? (
                  <span className="inline-block animate-spin">◎</span>
                ) : (
                  STATUS_ICONS[step.status]
                )}
              </span>
              <span
                className={`text-sm ${
                  step.status === "skipped" ? "text-zinc-600 line-through" : "text-zinc-200"
                }`}
              >
                {step.description}
              </span>
            </div>

            {step.error && (
              <div className="mt-2 text-xs text-red-400 bg-red-950/30 rounded px-2 py-1">
                {step.error}
              </div>
            )}

            {step.output.length > 0 && (
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-black/50 px-2 py-1 text-xs text-zinc-400 font-mono">
                {step.output.join("\n")}
              </pre>
            )}

            {step.diff && <DiffView diff={step.diff} filePath={step.filePath} />}
          </div>
        ))}
      </div>

      {summary && (
        <div className="rounded bg-zinc-800 px-3 py-2 text-xs text-zinc-300">
          <span className="text-green-400">{summary.succeeded} succeeded</span>
          {summary.failed > 0 && <span className="text-red-400 ml-2">{summary.failed} failed</span>}
          {summary.skipped > 0 && <span className="text-zinc-500 ml-2">{summary.skipped} skipped</span>}
          {summary.filesModified.length > 0 && (
            <div className="mt-1 text-zinc-500">
              Files: {summary.filesModified.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
