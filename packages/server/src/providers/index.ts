import type { AIProvider } from "./types.js";
import { getConfig, saveConfig } from "../config.js";
import { DeepSeekProvider } from "./deepseek.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAICompatProvider, PROVIDER_PRESETS } from "./openai-compat.js";
import { log } from "../logger.js";

let currentProvider: AIProvider | null = null;

function createProvider(name: string): AIProvider {
  const config = getConfig();
  const provConfig = config.providers[name];
  if (!provConfig?.apiKey && name !== "ollama") {
    log.provider.error(`No API key for provider "${name}"`);
    throw new Error(`No API key configured for provider "${name}". Set it in config or environment.`);
  }

  log.provider.info(`Creating provider: ${name} (model: ${provConfig?.model ?? "default"})`);

  switch (name) {
    case "deepseek":
      return new DeepSeekProvider({
        apiKey: provConfig.apiKey!,
        model: provConfig.model,
        baseUrl: provConfig.baseUrl,
      });
    case "anthropic":
      return new AnthropicProvider({
        apiKey: provConfig.apiKey!,
        model: provConfig.model,
        baseUrl: provConfig.baseUrl,
      });
    default: {
      const preset = PROVIDER_PRESETS[name];
      return new OpenAICompatProvider({
        name,
        apiKey: provConfig?.apiKey ?? "",
        model: provConfig?.model ?? preset?.defaultModel ?? "gpt-3.5-turbo",
        baseUrl: provConfig?.baseUrl ?? preset?.baseUrl ?? "",
      });
    }
  }
}

export function getProvider(): AIProvider {
  if (!currentProvider) {
    const config = getConfig();
    log.provider.info(`Initializing default provider: ${config.defaultProvider}`);
    currentProvider = createProvider(config.defaultProvider);
  }
  return currentProvider;
}

export function setProvider(provider: AIProvider) {
  currentProvider = provider;
}

export function switchProvider(name: string): AIProvider {
  log.provider.info(`Switching provider to: ${name}`);
  currentProvider = createProvider(name);
  // Persist the switch so config stays in sync
  const config = getConfig();
  if (config.defaultProvider !== name) {
    saveConfig({ defaultProvider: name });
  }
  return currentProvider;
}

export function switchModel(model: string): AIProvider {
  const config = getConfig();
  const providerName = config.defaultProvider;
  log.provider.info(`Switching model to: ${model} (provider: ${providerName})`);
  // Update config with new model
  const provConfig = config.providers[providerName];
  if (provConfig) provConfig.model = model;
  // Recreate provider with new model
  currentProvider = createProvider(providerName);
  return currentProvider;
}

export function getCurrentModel(): string | undefined {
  const config = getConfig();
  return config.providers[config.defaultProvider]?.model;
}
