import type { PlanStep } from "../plan/types.js";
/**
 * Generate file content for a single plan step by making an AI API call.
 * Only used for "create" and "edit" steps.
 */
export declare function generateStepContent(step: PlanStep, planSummary: string, allSteps: PlanStep[]): Promise<string>;
//# sourceMappingURL=step-generator.d.ts.map