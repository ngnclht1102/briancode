import { create } from "zustand";

export interface PlanStep {
  id: string;
  type: "create" | "edit" | "delete" | "shell";
  description: string;
  target: string;
  content?: string;
  approved: boolean;
}

export interface Plan {
  summary: string;
  steps: PlanStep[];
}

interface PlanState {
  plan: Plan | null;
  setPlan: (plan: { summary: string; steps: Array<Omit<PlanStep, "approved">> }) => void;
  toggleStep: (stepId: string) => void;
  updateStepContent: (stepId: string, content: string) => void;
  clearPlan: () => void;
  getApprovedSteps: () => PlanStep[];
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: null,

  setPlan: (raw) => {
    set({
      plan: {
        summary: raw.summary,
        steps: raw.steps.map((s) => ({ ...s, approved: true })),
      },
    });
  },

  toggleStep: (stepId) => {
    set((state) => {
      if (!state.plan) return state;
      return {
        plan: {
          ...state.plan,
          steps: state.plan.steps.map((s) =>
            s.id === stepId ? { ...s, approved: !s.approved } : s,
          ),
        },
      };
    });
  },

  updateStepContent: (stepId, content) => {
    set((state) => {
      if (!state.plan) return state;
      return {
        plan: {
          ...state.plan,
          steps: state.plan.steps.map((s) =>
            s.id === stepId ? { ...s, content } : s,
          ),
        },
      };
    });
  },

  clearPlan: () => set({ plan: null }),

  getApprovedSteps: () => {
    const plan = get().plan;
    if (!plan) return [];
    return plan.steps.filter((s) => s.approved);
  },
}));
