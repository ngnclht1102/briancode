import { getConfig } from "../config.js";
import { DeepSeekProvider } from "./deepseek.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAICompatProvider, PROVIDER_PRESETS } from "./openai-compat.js";
import { log } from "../logger.js";
let currentProvider = null;
function createProvider(name) {
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
                apiKey: provConfig.apiKey,
                model: provConfig.model,
                baseUrl: provConfig.baseUrl,
            });
        case "anthropic":
            return new AnthropicProvider({
                apiKey: provConfig.apiKey,
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
export function getProvider() {
    if (!currentProvider) {
        const config = getConfig();
        log.provider.info(`Initializing default provider: ${config.defaultProvider}`);
        currentProvider = createProvider(config.defaultProvider);
    }
    return currentProvider;
}
export function setProvider(provider) {
    currentProvider = provider;
}
export function switchProvider(name) {
    log.provider.info(`Switching provider to: ${name}`);
    currentProvider = createProvider(name);
    return currentProvider;
}
//# sourceMappingURL=index.js.map