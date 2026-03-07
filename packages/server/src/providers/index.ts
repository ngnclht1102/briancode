import type { AIProvider } from "./types.js";
import { getConfig } from "../config.js";
import { DeepSeekProvider } from "./deepseek.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAICompatProvider, PROVIDER_PRESETS } from "./openai-compat.js";

let currentProvider: AIProvider | null = null;

function createProvider(name: string): AIProvider {
  const config = getConfig();
  const provConfig = config.providers[name];
  if (!provConfig?.apiKey && name !== "ollama") {
    throw new Error(`No API key configured for provider "${name}". Set it in config or environment.`);
  }

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
    currentProvider = createProvider(config.defaultProvider);
  }
  return currentProvider;
}

export function setProvider(provider: AIProvider) {
  currentProvider = provider;
}

export function switchProvider(name: string): AIProvider {
  currentProvider = createProvider(name);
  return currentProvider;
}
