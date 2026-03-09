import type { WebSocket } from "ws";
import type { PlanStep } from "../plan/types.js";
export type { PlanStep };
export interface ExecutableStep extends PlanStep {
    status?: "pending" | "skipped";
}
export interface ExecutionContext {
    planSummary: string;
    allSteps: PlanStep[];
}
export interface ExecutionSummary {
    total: number;
    succeeded: number;
    failed: number;
    skipped: number;
    filesModified: string[];
}
export declare function executeSteps(socket: WebSocket, steps: ExecutableStep[], context?: ExecutionContext): Promise<ExecutionSummary>;
export declare function cancelExecution(): void;
export declare function rollback(): {
    restored: string[];
    errors: string[];
};
//# sourceMappingURL=executor.d.ts.map