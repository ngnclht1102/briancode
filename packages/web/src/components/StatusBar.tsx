import { useState, useEffect, useRef } from "react";

interface StatusBarProps {
  status: "connecting" | "connected" | "disconnected";
  providerName?: string;
  currentModel?: string;
  projectName?: string;
  sidebarOpen?: boolean;
  contextUsage?: { usedTokens: number; contextWindow: number; usagePercent: number; messageCount: number } | null;
  onToggleSidebar?: () => void;
  onSettingsClick?: () => void;
  onBugReportClick?: () => void;
  onProjectClick?: () => void;
  onModelChange?: (model: string) => void;
}

const PROVIDER_MODELS: Record<string, string[]> = {
  deepseek: ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"],
  anthropic: [
    "claude-sonnet-4-20250514",
    "claude-opus-4-20250514",
    "claude-haiku-4-20250414",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
  ],
  kimi: [
    "kimi-k2.5",
    "kimi-k2-thinking",
    "kimi-k2-thinking-turbo",
    "kimi-k2-turbo-preview",
    "moonshot-v1-auto",
    "moonshot-v1-8k",
    "moonshot-v1-32k",
    "moonshot-v1-128k",
    "moonshot-v1-8k-vision-preview",
    "moonshot-v1-32k-vision-preview",
    "moonshot-v1-128k-vision-preview",
  ],
  qwen: ["qwen-turbo", "qwen-plus", "qwen-max", "qwen-long"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
  ollama: ["llama3.2", "llama3.1", "codellama", "mistral", "deepseek-coder-v2"],
};

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function StatusBar({
  status,
  providerName,
  currentModel,
  projectName,
  sidebarOpen,
  contextUsage,
  onToggleSidebar,
  onSettingsClick,
  onBugReportClick,
  onProjectClick,
  onModelChange,
}: StatusBarProps) {
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [customModel, setCustomModel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const colors = {
    connecting: "bg-yellow-500",
    connected: "bg-green-500",
    disconnected: "bg-red-500",
  };

  const labels = {
    connecting: "Connecting...",
    connected: "Connected",
    disconnected: "Disconnected",
  };

  const provider = providerName ?? "deepseek";
  const models = PROVIDER_MODELS[provider] ?? [];
  const displayModel = currentModel ?? models[0] ?? "unknown";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    }
    if (showModelDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showModelDropdown]);

  const handleSelectModel = (model: string) => {
    if (model && model !== currentModel) {
      onModelChange?.(model);
    }
    setShowModelDropdown(false);
    setCustomModel("");
  };

  const handleCustomSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customModel.trim()) {
      handleSelectModel(customModel.trim());
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 text-sm text-zinc-400">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`text-lg transition-colors ${sidebarOpen ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-200"}`}
            title="Toggle file tree (Cmd+B)"
          >
            ☰
          </button>
        )}
        <span className="font-semibold text-zinc-200">Brian Code</span>
        {projectName && (
          <>
            <span className="text-zinc-600">/</span>
            <button
              onClick={onProjectClick}
              className="text-zinc-400 hover:text-zinc-200 transition-colors truncate max-w-48"
              title="Switch project (Cmd+O)"
            >
              {projectName}
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowModelDropdown((v) => !v)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Switch model"
          >
            <span>{provider}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-500 max-w-40 truncate">{displayModel}</span>
            <span className="text-[10px] text-zinc-600">▼</span>
          </button>
          {showModelDropdown && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-56 rounded border border-zinc-700 bg-zinc-900 shadow-lg py-1">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => handleSelectModel(model)}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-800 transition-colors ${
                    model === currentModel ? "text-blue-400" : "text-zinc-300"
                  }`}
                >
                  {model}
                  {model === currentModel && <span className="ml-2 text-xs text-blue-500">●</span>}
                </button>
              ))}
              <div className="border-t border-zinc-700 mt-1 pt-1 px-3 pb-1">
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  onKeyDown={handleCustomSubmit}
                  placeholder="Custom model..."
                  className="w-full bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700 outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${colors[status]}`} />
          <span>{labels[status]}</span>
        </div>
        {contextUsage && contextUsage.usagePercent > 0 && (
          <div
            className="flex items-center gap-1.5 text-xs"
            title={`Context: ~${formatTokens(contextUsage.usedTokens)} / ${formatTokens(contextUsage.contextWindow)} tokens (${contextUsage.messageCount} messages)`}
          >
            <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  contextUsage.usagePercent > 90 ? "bg-red-500" :
                  contextUsage.usagePercent > 70 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(contextUsage.usagePercent, 100)}%` }}
              />
            </div>
            <span className={
              contextUsage.usagePercent > 90 ? "text-red-400" :
              contextUsage.usagePercent > 70 ? "text-yellow-400" : "text-zinc-500"
            }>
              {contextUsage.usagePercent}%
            </span>
          </div>
        )}
        {onBugReportClick && (
          <button
            onClick={onBugReportClick}
            className="text-zinc-500 hover:text-red-400 transition-colors text-xs"
            title="Report a problem"
          >
            Report
          </button>
        )}
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="text-zinc-500 hover:text-zinc-200 transition-colors"
            title="Settings"
          >
            ⚙
          </button>
        )}
      </div>
    </div>
  );
}
