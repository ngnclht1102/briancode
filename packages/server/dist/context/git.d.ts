export declare function isGitRepo(): boolean;
export declare function getGitStatus(): Promise<string>;
export declare function getGitDiff(staged?: boolean): Promise<string>;
export declare function getGitBranch(): Promise<string>;
export declare function listDirectory(relativePath: string): Promise<string>;
//# sourceMappingURL=git.d.ts.map