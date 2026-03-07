export interface PlanStep {
  id: string;
  type: "create" | "edit" | "delete" | "shell";
  description: string;
  target: string;
  content?: string;
}

export interface Plan {
  summary: string;
  steps: PlanStep[];
}
