export interface FileChange {
    filePath: string;
    type: "create" | "edit" | "delete";
    before: string | null;
    after: string | null;
    timestamp: number;
    executionId: string;
}
export declare function recordChange(executionId: string, filePath: string, type: "create" | "edit" | "delete", before: string | null, after: string | null): void;
export declare function getChangeHistory(): Array<{
    filePath: string;
    type: string;
    executionId: string;
    timestamp: number;
}>;
export declare function rollbackExecution(executionId: string): {
    restored: string[];
    errors: string[];
    shellWarning: boolean;
};
export declare function undoLast(): {
    restored: string | null;
    error?: string;
};
export declare function clearChangeHistory(): void;
//# sourceMappingURL=change-tracker.d.ts.map