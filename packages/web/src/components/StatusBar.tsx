interface StatusBarProps {
  status: "connecting" | "connected" | "disconnected";
  providerName?: string;
  projectName?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onSettingsClick?: () => void;
  onProjectClick?: () => void;
}

export default function StatusBar({ status, providerName, projectName, sidebarOpen, onToggleSidebar, onSettingsClick, onProjectClick }: StatusBarProps) {
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
        <span className="text-zinc-400">{providerName ?? "deepseek"}</span>
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${colors[status]}`} />
          <span>{labels[status]}</span>
        </div>
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
