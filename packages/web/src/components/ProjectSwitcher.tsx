import { useEffect, useState } from "react";

interface RecentProject {
  path: string;
  name: string;
  lastOpened: string;
  exists: boolean;
}

export default function ProjectSwitcher({
  currentProject,
  onClose,
  onSwitched,
}: {
  currentProject: { path: string; name: string };
  onClose: () => void;
  onSwitched: (project: { path: string; name: string }) => void;
}) {
  const [pathInput, setPathInput] = useState("");
  const [recent, setRecent] = useState<RecentProject[]>([]);
  const [error, setError] = useState("");
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch("/api/project/recent")
      .then((r) => r.json())
      .then((data: { projects?: RecentProject[] }) => setRecent(data.projects ?? []))
      .catch(() => {});
  }, []);

  const handleSwitch = async (targetPath: string) => {
    if (!targetPath.trim()) {
      setError("Please enter a path");
      return;
    }
    setSwitching(true);
    setError("");

    try {
      const res = await fetch("/api/project/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: targetPath.trim() }),
      });
      const data = (await res.json()) as { success: boolean; path?: string; name?: string; error?: string };
      if (data.success && data.path && data.name) {
        onSwitched({ path: data.path, name: data.name });
        onClose();
      } else {
        setError(data.error ?? "Failed to switch project");
      }
    } catch {
      setError("Failed to switch project");
    }
    setSwitching(false);
  };

  const handleRemove = async (projectPath: string) => {
    try {
      await fetch("/api/project/recent/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: projectPath }),
      });
      setRecent((prev) => prev.filter((p) => p.path !== projectPath));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-zinc-900 rounded-lg border border-zinc-700 p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Switch Project</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-xl">x</button>
        </div>

        {/* Current project */}
        <div className="mb-4 px-3 py-2 rounded bg-zinc-800 border border-zinc-700">
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Current Project</div>
          <div className="text-sm text-zinc-200 font-medium">{currentProject.name}</div>
          <div className="text-xs text-zinc-500 truncate">{currentProject.path}</div>
        </div>

        {/* Manual path input */}
        <div className="mb-4">
          <label className="text-xs text-zinc-500 mb-1 block">Open directory</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="~/Work/my-project or /absolute/path"
              value={pathInput}
              onChange={(e) => { setPathInput(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSwitch(pathInput); }}
              className="flex-1 rounded bg-zinc-800 border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-600"
              autoFocus
            />
            <button
              onClick={() => handleSwitch(pathInput)}
              disabled={switching || !pathInput.trim()}
              className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40"
            >
              {switching ? "..." : "Switch"}
            </button>
          </div>
          {error && <div className="mt-1 text-xs text-red-400">{error}</div>}
        </div>

        {/* Recent projects */}
        {recent.length > 0 && (
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Recent Projects</div>
            <div className="space-y-1">
              {recent.map((project) => {
                const isCurrent = project.path === currentProject.path;
                return (
                  <div
                    key={project.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded border ${
                      isCurrent
                        ? "border-blue-700 bg-blue-950/30"
                        : project.exists
                          ? "border-zinc-700 hover:bg-zinc-800 cursor-pointer"
                          : "border-zinc-800 opacity-50"
                    }`}
                    onClick={() => {
                      if (!isCurrent && project.exists) handleSwitch(project.path);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isCurrent ? "text-blue-300" : "text-zinc-200"}`}>
                          {project.name}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-800 text-blue-200">Current</span>
                        )}
                        {!project.exists && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-900 text-red-300">Missing</span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">{project.path}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(project.path); }}
                      className="text-zinc-600 hover:text-zinc-400 text-xs shrink-0"
                      title="Remove from recent"
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recent.length === 0 && (
          <div className="text-xs text-zinc-600 text-center py-4">No recent projects</div>
        )}
      </div>
    </div>
  );
}
