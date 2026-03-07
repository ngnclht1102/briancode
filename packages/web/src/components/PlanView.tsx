import { useState } from "react";
import { usePlanStore, type PlanStep } from "../stores/planStore";

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  create: { label: "CREATE", color: "bg-green-700 text-green-100" },
  edit: { label: "EDIT", color: "bg-blue-700 text-blue-100" },
  delete: { label: "DELETE", color: "bg-red-700 text-red-100" },
  shell: { label: "SHELL", color: "bg-yellow-700 text-yellow-100" },
};

function StepItem({
  step,
  onToggle,
  onEdit,
}: {
  step: PlanStep;
  onToggle: () => void;
  onEdit: (content: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(step.content ?? "");
  const badge = TYPE_BADGES[step.type] ?? { label: step.type, color: "bg-zinc-700" };

  return (
    <div className={`rounded border p-3 ${step.approved ? "border-zinc-600 bg-zinc-800" : "border-zinc-700 bg-zinc-900 opacity-60"}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={step.approved}
          onChange={onToggle}
          className="mt-1 h-4 w-4 accent-blue-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-sm text-zinc-200">{step.description}</span>
          </div>
          <div className="text-xs text-zinc-400 font-mono truncate">{step.target}</div>
        </div>
        <div className="flex gap-1">
          {step.content && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200"
            >
              {expanded ? "▼" : "▶"}
            </button>
          )}
          {step.content && (
            <button
              onClick={() => { setEditing(!editing); setExpanded(true); }}
              className="px-2 py-1 text-xs text-blue-400 hover:text-blue-300"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {expanded && step.content && !editing && (
        <pre className="mt-2 max-h-48 overflow-auto rounded bg-black/40 px-3 py-2 text-xs text-zinc-400 font-mono whitespace-pre-wrap">
          {step.content}
        </pre>
      )}

      {editing && (
        <div className="mt-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full rounded bg-black/40 border border-zinc-600 px-3 py-2 text-xs text-zinc-300 font-mono resize-y min-h-[100px]"
          />
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => { onEdit(editValue); setEditing(false); }}
              className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white"
            >
              Save
            </button>
            <button
              onClick={() => { setEditValue(step.content ?? ""); setEditing(false); }}
              className="px-2 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanView({
  onExecute,
  onReject,
}: {
  onExecute: (steps: PlanStep[]) => void;
  onReject: () => void;
}) {
  const { plan, toggleStep, updateStepContent, getApprovedSteps } = usePlanStore();

  if (!plan) return null;

  const approved = getApprovedSteps();

  return (
    <div className="border-t border-zinc-700 bg-zinc-900 p-4 space-y-3 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Plan</h3>
          <p className="text-xs text-zinc-400">{plan.summary}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReject}
            className="px-3 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
          >
            Reject
          </button>
          <button
            onClick={() => onExecute(approved)}
            disabled={approved.length === 0}
            className="px-3 py-1.5 text-xs rounded bg-green-700 hover:bg-green-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Execute ({approved.length}/{plan.steps.length})
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {plan.steps.map((step) => (
          <StepItem
            key={step.id}
            step={step}
            onToggle={() => toggleStep(step.id)}
            onEdit={(content) => updateStepContent(step.id, content)}
          />
        ))}
      </div>
    </div>
  );
}
