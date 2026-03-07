import { create } from "zustand";

export interface ExecutionStep {
  id: string;
  description: string;
  status: "pending" | "running" | "success" | "error" | "skipped";
  error?: string;
  diff?: string;
  filePath?: string;
  output: string[];
}

export interface ExecutionSummary {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  filesModified: string[];
}

interface ExecutionState {
  isExecuting: boolean;
  steps: ExecutionStep[];
  summary: ExecutionSummary | null;

  startExecution: (steps: Array<{ id: string; description: string }>) => void;
  updateStep: (stepId: string, update: Partial<ExecutionStep>) => void;
  appendOutput: (stepId: string, line: string) => void;
  setDiff: (stepId: string, diff: string, filePath?: string) => void;
  finishExecution: (summary: ExecutionSummary) => void;
  resetExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  isExecuting: false,
  steps: [],
  summary: null,

  startExecution: (steps) => {
    set({
      isExecuting: true,
      summary: null,
      steps: steps.map((s) => ({
        id: s.id,
        description: s.description,
        status: "pending",
        output: [],
      })),
    });
  },

  updateStep: (stepId, update) => {
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId ? { ...s, ...update } : s,
      ),
    }));
  },

  appendOutput: (stepId, line) => {
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId ? { ...s, output: [...s.output, line] } : s,
      ),
    }));
  },

  setDiff: (stepId, diff, filePath) => {
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId ? { ...s, diff, filePath } : s,
      ),
    }));
  },

  finishExecution: (summary) => {
    set({ isExecuting: false, summary });
  },

  resetExecution: () => {
    set({ isExecuting: false, steps: [], summary: null });
  },
}));
