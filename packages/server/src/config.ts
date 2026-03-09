import fs from "fs";
import path from "path";
import os from "os";
import { getProjectRoot } from "./context/workspace.js";
import { log } from "./logger.js";

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

const CONFIG_DIR = path.join(os.homedir(), ".brian-code");
const GLOBAL_CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const PROJECT_CONFIG_FILE = ".brian-code.json";

const DEFAULT_CONFIG: AppConfig = {
  defaultProvider: "deepseek",
  providers: {
    deepseek: { model: "deepseek-chat" },
    anthropic: { model: "claude-sonnet-4-20250514" },
    kimi: { model: "moonshot-v1-8k" },
    qwen: { model: "qwen-turbo" },
  },
};

let cachedConfig: AppConfig | null = null;

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function readJsonFile(filePath: string): Partial<AppConfig> | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function loadConfig(cliOverrides?: { provider?: string; model?: string }): AppConfig {
  log.config.start("Loading config");
  ensureConfigDir();

  // 1. Start with defaults
  const config: AppConfig = structuredClone(DEFAULT_CONFIG);

  // 2. Global config file
  const globalConfig = readJsonFile(GLOBAL_CONFIG_FILE);
  if (globalConfig) {
    if (globalConfig.defaultProvider) config.defaultProvider = globalConfig.defaultProvider;
    if (globalConfig.providers) {
      for (const [name, provConfig] of Object.entries(globalConfig.providers)) {
        config.providers[name] = { ...config.providers[name], ...provConfig };
      }
    }
    log.config.info("Loaded global config");
  }

  // 3. Project-level config
  const projectConfigPath = path.join(getProjectRoot(), PROJECT_CONFIG_FILE);
  const projectConfig = readJsonFile(projectConfigPath);
  if (projectConfig) {
    if (projectConfig.defaultProvider) config.defaultProvider = projectConfig.defaultProvider;
    if (projectConfig.providers) {
      for (const [name, provConfig] of Object.entries(projectConfig.providers)) {
        config.providers[name] = { ...config.providers[name], ...provConfig };
      }
    }
    log.config.info("Loaded project config");
  }

  // 4. Environment variables
  const envKeys: Record<string, string> = {
    DEEPSEEK_API_KEY: "deepseek",
    ANTHROPIC_API_KEY: "anthropic",
    MOONSHOT_API_KEY: "kimi",
    DASHSCOPE_API_KEY: "qwen",
  };
  for (const [envVar, providerName] of Object.entries(envKeys)) {
    const val = process.env[envVar];
    if (val) {
      if (!config.providers[providerName]) config.providers[providerName] = {};
      config.providers[providerName].apiKey = val;
      log.config.info(`API key loaded from ${envVar}`);
    }
  }

  // 5. CLI overrides
  if (cliOverrides?.provider) config.defaultProvider = cliOverrides.provider;
  if (cliOverrides?.model) {
    const prov = config.providers[config.defaultProvider];
    if (prov) prov.model = cliOverrides.model;
  }

  cachedConfig = config;
  log.config.done(`Config loaded (provider: ${config.defaultProvider})`);
  return config;
}

export function getConfig(): AppConfig {
  if (!cachedConfig) return loadConfig();
  return cachedConfig;
}

export function saveConfig(updates: Partial<AppConfig>) {
  ensureConfigDir();

  // Read existing global config
  const existing = readJsonFile(GLOBAL_CONFIG_FILE) ?? {};

  if (updates.defaultProvider) existing.defaultProvider = updates.defaultProvider;
  if (updates.providers) {
    if (!existing.providers) existing.providers = {};
    for (const [name, provConfig] of Object.entries(updates.providers)) {
      existing.providers[name] = { ...existing.providers[name], ...provConfig };
    }
  }

  fs.writeFileSync(GLOBAL_CONFIG_FILE, JSON.stringify(existing, null, 2), { mode: 0o600 });
  log.config.info("Config saved");

  // Reload
  cachedConfig = null;
  loadConfig();
}

export function getRecentProjects(): RecentProject[] {
  ensureConfigDir();
  const raw = readJsonFile(GLOBAL_CONFIG_FILE) as Record<string, unknown> | null;
  return (raw?.recentProjects as RecentProject[]) ?? [];
}

export function addRecentProject(projectPath: string) {
  ensureConfigDir();
  const existing = (readJsonFile(GLOBAL_CONFIG_FILE) ?? {}) as Record<string, unknown>;
  const list: RecentProject[] = (existing.recentProjects as RecentProject[]) ?? [];

  const name = path.basename(projectPath);
  const entry: RecentProject = { path: projectPath, name, lastOpened: new Date().toISOString() };

  const filtered = list.filter((p) => p.path !== projectPath);
  filtered.unshift(entry);
  existing.recentProjects = filtered.slice(0, 10);

  fs.writeFileSync(GLOBAL_CONFIG_FILE, JSON.stringify(existing, null, 2), { mode: 0o600 });
}

export function removeRecentProject(projectPath: string) {
  ensureConfigDir();
  const existing = (readJsonFile(GLOBAL_CONFIG_FILE) ?? {}) as Record<string, unknown>;
  const list: RecentProject[] = (existing.recentProjects as RecentProject[]) ?? [];
  existing.recentProjects = list.filter((p) => p.path !== projectPath);
  fs.writeFileSync(GLOBAL_CONFIG_FILE, JSON.stringify(existing, null, 2), { mode: 0o600 });
}

/** Returns config safe for frontend (no API keys) */
export function getSafeConfig(): { defaultProvider: string; providers: Record<string, { model?: string; baseUrl?: string; hasKey: boolean }> } {
  const config = getConfig();
  const providers: Record<string, { model?: string; baseUrl?: string; hasKey: boolean }> = {};
  for (const [name, prov] of Object.entries(config.providers)) {
    providers[name] = {
      model: prov.model,
      baseUrl: prov.baseUrl,
      hasKey: !!prov.apiKey,
    };
  }
  return { defaultProvider: config.defaultProvider, providers };
}
