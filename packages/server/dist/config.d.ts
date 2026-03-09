export interface ProviderConfig {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
}
export interface RecentProject {
    path: string;
    name: string;
    lastOpened: string;
}
export interface AppConfig {
    defaultProvider: string;
    providers: Record<string, ProviderConfig>;
    recentProjects?: RecentProject[];
}
export declare function loadConfig(cliOverrides?: {
    provider?: string;
    model?: string;
}): AppConfig;
export declare function getConfig(): AppConfig;
export declare function saveConfig(updates: Partial<AppConfig>): void;
export declare function getRecentProjects(): RecentProject[];
export declare function addRecentProject(projectPath: string): void;
export declare function removeRecentProject(projectPath: string): void;
/** Returns config safe for frontend (no API keys) */
export declare function getSafeConfig(): {
    defaultProvider: string;
    providers: Record<string, {
        model?: string;
        baseUrl?: string;
        hasKey: boolean;
    }>;
};
//# sourceMappingURL=config.d.ts.map