import type { Tool } from "../providers/types.js";
export interface ToolDefinition {
    tool: Tool;
    handler: (args: Record<string, unknown>) => Promise<string>;
}
export declare function resetToolExecutionState(): void;
export declare function getToolDefinitions(): Tool[];
export declare function executeTool(name: string, args: Record<string, unknown>): Promise<string>;
//# sourceMappingURL=tool-handler.d.ts.map