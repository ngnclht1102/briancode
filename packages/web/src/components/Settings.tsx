import { useEffect, useState } from "react";

interface ProviderInfo {
  model?: string;
  baseUrl?: string;
  hasKey: boolean;
}

interface ConfigData {
  defaultProvider: string;
  providers: Record<string, ProviderInfo>;
}

const PROVIDER_LABELS: Record<string, string> = {
  deepseek: "DeepSeek",
  anthropic: "Anthropic (Claude)",
  groq: "Groq",
  kimi: "Kimi (Moonshot)",
  ollama: "Ollama (Local)",
};

export default function Settings({ onClose }: { onClose: () => void }) {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => setConfig(data as ConfigData))
      .catch(() => setMessage("Failed to load config"));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage("");

    const providers: Record<string, Record<string, string>> = {};
    for (const [name, key] of Object.entries(apiKeys)) {
      if (key) providers[name] = { apiKey: key };
    }

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultProvider: config.defaultProvider,
          providers,
        }),
      });
      const updated = await res.json();
      setConfig(updated as ConfigData);
      setApiKeys({});
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
                {prov.model && (
                  <div className="text-xs text-zinc-500">
                    Model: <span className="text-zinc-400">{prov.model}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

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
              disabled={saving || Object.values(apiKeys).every((k) => !k)}
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
