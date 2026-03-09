export interface FileNode {
    path: string;
    type: "file" | "dir";
}
export declare function setFileChangeCallback(cb: () => void): void;
export declare function setProjectRoot(root: string): void;
export declare function getProjectRoot(): string;
export declare function getFileTree(): Promise<FileNode[]>;
export declare function getFileTreeAsString(maxDepth?: number): string;
export declare function invalidateCache(): void;
export declare function resolveProjectPath(relativePath: string): string | null;
//# sourceMappingURL=workspace.d.ts.map