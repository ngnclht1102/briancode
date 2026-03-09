import { useEffect, useState } from "react";

interface ProviderInfo {
  model?: string;
  baseUrl?: string;
  hasKey: boolean;
}

interface AgentLimits {
  maxToolIterations: number;
  shellTimeout: number;
  shellRetries: number;
  maxSearchMatches: number;
  maxFileLines: number;
  maxConversations: number;
}

interface ConfigData {
  defaultProvider: string;
  providers: Record<string, ProviderInfo>;
  agentLimits: AgentLimits;
}

const PROVIDER_LABELS: Record<string, string> = {
  deepseek: "DeepSeek",
  anthropic: "Anthropic (Claude)",
  kimi: "Kimi (Moonshot)",
  qwen: "Qwen (Alibaba)",
  groq: "Groq",
  ollama: "Ollama (Local)",
};

const DEFAULT_BASE_URLS: Record<string, string> = {
  deepseek: "https://api.deepseek.com",
  anthropic: "https://api.anthropic.com",
  kimi: "https://api.moonshot.cn",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode",
  groq: "https://api.groq.com/openai",
  ollama: "http://localhost:11434",
};

const LIMIT_FIELDS: { key: keyof AgentLimits; label: string; description: string; min: number; max: number }[] = [
  { key: "maxToolIterations", label: "Max Tool Iterations", description: "Maximum tool call rounds per message", min: 1, max: 200 },
  { key: "shellTimeout", label: "Shell Timeout (s)", description: "Seconds before a shell command times out", min: 5, max: 600 },
  { key: "shellRetries", label: "Shell Retries", description: "Retry count on shell timeout", min: 0, max: 10 },
  { key: "maxSearchMatches", label: "Max Search Matches", description: "Maximum results from file search", min: 5, max: 100 },
  { key: "maxFileLines", label: "Max File Lines", description: "Default lines returned when reading a file", min: 50, max: 2000 },
  { key: "maxConversations", label: "Max Conversations", description: "Conversation history limit", min: 10, max: 500 },
];

export default function Settings({ onClose }: { onClose: () => void }) {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [baseUrls, setBaseUrls] = useState<Record<string, string>>({});
  const [limits, setLimits] = useState<AgentLimits | null>(null);
  const [origLimits, setOrigLimits] = useState<AgentLimits | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        const cfg = data as ConfigData;
        setConfig(cfg);
        setLimits({ ...cfg.agentLimits });
        setOrigLimits({ ...cfg.agentLimits });
        // Initialize baseUrls from config (show current values)
        const urls: Record<string, string> = {};
        for (const [name, prov] of Object.entries(cfg.providers)) {
          urls[name] = prov.baseUrl ?? "";
        }
        setBaseUrls(urls);
      })
      .catch(() => setMessage("Failed to load config"));
  }, []);

  const hasChanges = () => {
    if (Object.values(apiKeys).some((k) => k)) return true;
    if (!config) return false;
    for (const [name, url] of Object.entries(baseUrls)) {
      const original = config.providers[name]?.baseUrl ?? "";
      if (url !== original) return true;
    }
    if (limits && origLimits) {
      for (const field of LIMIT_FIELDS) {
        if (limits[field.key] !== origLimits[field.key]) return true;
      }
    }
    return false;
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage("");

    const providers: Record<string, Record<string, string>> = {};

    // Include API keys
    for (const [name, key] of Object.entries(apiKeys)) {
      if (key) {
        if (!providers[name]) providers[name] = {};
        providers[name].apiKey = key;
      }
    }

    // Include base URLs (save empty string to clear custom URL)
    for (const [name, url] of Object.entries(baseUrls)) {
      const original = config.providers[name]?.baseUrl ?? "";
      if (url !== original) {
        if (!providers[name]) providers[name] = {};
        providers[name].baseUrl = url;
      }
    }

    // Include changed agent limits
    const changedLimits: Partial<AgentLimits> = {};
    if (limits && origLimits) {
      for (const field of LIMIT_FIELDS) {
        if (limits[field.key] !== origLimits[field.key]) {
          changedLimits[field.key] = limits[field.key];
        }
      }
    }

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultProvider: config.defaultProvider,
          providers,
          ...(Object.keys(changedLimits).length > 0 ? { agentLimits: changedLimits } : {}),
        }),
      });
      const updated = await res.json();
      const cfg = updated as ConfigData;
      setConfig(cfg);
      setApiKeys({});
      setLimits({ ...cfg.agentLimits });
      setOrigLimits({ ...cfg.agentLimits });
      // Update baseUrls from saved config
      const urls: Record<string, string> = {};
      for (const [name, prov] of Object.entries(cfg.providers)) {
        urls[name] = prov.baseUrl ?? "";
      }
      setBaseUrls(urls);
      setMessage("Saved!");
    } catch {
      setMessage("Failed to save");
    }
    setSaving(false);
  };

  const handleSwitch = async (provider: string) => {
    try {
      const res = await fetch("/api/provider/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (data.success) {
        setConfig((c) => c ? { ...c, defaultProvider: provider } : c);
        setMessage(`Switched to ${provider}`);
      } else {
        setMessage(data.error ?? "Failed to switch");
      }
    } catch {
      setMessage("Failed to switch provider");
    }
  };

  if (!config) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-zinc-900 rounded-lg p-6 text-zinc-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-zinc-900 rounded-lg border border-zinc-700 p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-xl">×</button>
        </div>

        {/* Providers */}
        <div className="space-y-4">
          {Object.entries(config.providers).map(([name, prov]) => (
            <div key={name} className="rounded border border-zinc-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-200">
                    {PROVIDER_LABELS[name] ?? name}
                  </span>
                  {config.defaultProvider === name && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-800 text-green-200">Active</span>
                  )}
                </div>
                {config.defaultProvider !== name && (
                  <button
                    onClick={() => handleSwitch(name)}
                    className="px-2 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                  >
                    Switch
                  </button>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <label className="text-xs text-zinc-500">API Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder={prov.hasKey ? "••••••••••" : "Enter API key"}
                      value={apiKeys[name] ?? ""}
                      onChange={(e) => setApiKeys((k) => ({ ...k, [name]: e.target.value }))}
                      className="flex-1 rounded bg-zinc-800 border border-zinc-600 px-2 py-1 text-xs text-zinc-300"
                    />
                    {prov.hasKey && (
                      <span className="text-green-400 text-xs">✓</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500">API Endpoint</label>
                  <input
                    type="text"
                    placeholder={DEFAULT_BASE_URLS[name] ?? "https://api.example.com"}
                    value={baseUrls[name] ?? ""}
                    onChange={(e) => setBaseUrls((u) => ({ ...u, [name]: e.target.value }))}
                    className="w-full rounded bg-zinc-800 border border-zinc-600 px-2 py-1 text-xs text-zinc-300 placeholder-zinc-600"
                  />
                  {DEFAULT_BASE_URLS[name] && !baseUrls[name] && (
                    <div className="text-[10px] text-zinc-600 mt-0.5">
                      Default: {DEFAULT_BASE_URLS[name]}
                    </div>
                  )}
                </div>
                {prov.model && (
                  <div className="text-xs text-zinc-500">
                    Model: <span className="text-zinc-400">{prov.model}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Agent Limits */}
        {limits && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Agent Limits</h3>
            <div className="rounded border border-zinc-700 p-3 space-y-3">
              {LIMIT_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-zinc-300">{field.label}</div>
                    <div className="text-[10px] text-zinc-500">{field.description}</div>
                  </div>
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    value={limits[field.key]}
                    onChange={(e) => {
                      const val = Math.max(field.min, Math.min(field.max, parseInt(e.target.value) || field.min));
                      setLimits((l) => l ? { ...l, [field.key]: val } : l);
                    }}
                    className="w-20 rounded bg-zinc-800 border border-zinc-600 px-2 py-1 text-xs text-zinc-300 text-right"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          {message && (
            <span className="text-xs text-zinc-400">{message}</span>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges()}
              className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
