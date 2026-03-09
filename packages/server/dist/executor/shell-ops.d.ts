export interface ShellResult {
    exitCode: number;
    output: string;
    error?: string;
}
export type OnOutputLine = (line: string, stream: "stdout" | "stderr") => void;
export declare function runCommand(command: string, options?: {
    cwd?: string;
    timeout?: number;
    onOutput?: OnOutputLine;
    retries?: number;
}): Promise<ShellResult>;
export declare function cancelRunning(): boolean;
//# sourceMappingURL=shell-ops.d.ts.map