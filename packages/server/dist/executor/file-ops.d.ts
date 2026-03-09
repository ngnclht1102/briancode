export interface FileOpResult {
    success: boolean;
    diff: string;
    error?: string;
}
export declare function setExecutionId(id: string): void;
export declare function createFile(relativePath: string, content: string): FileOpResult;
export declare function editFile(relativePath: string, newContent: string): FileOpResult;
export declare function deleteFile(relativePath: string): FileOpResult;
export declare function rollbackAll(): {
    restored: string[];
    errors: string[];
};
export declare function clearBackups(): void;
export declare function getBackupCount(): number;
//# sourceMappingURL=file-ops.d.ts.map