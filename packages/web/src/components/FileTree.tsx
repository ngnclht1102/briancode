import { useEffect, useState, useMemo } from "react";

interface FileNode {
  path: string;
  type: "file" | "dir";
}

interface TreeNode {
  name: string;
  fullPath: string;
  isDir: boolean;
  children: TreeNode[];
}

function buildTree(files: FileNode[]): TreeNode[] {
  const root: TreeNode = { name: "", fullPath: "", isDir: true, children: [] };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;
      let child = current.children.find((c) => c.name === name);
      if (!child) {
        child = {
          name,
          fullPath: parts.slice(0, i + 1).join("/"),
          isDir: !isLast,
          children: [],
        };
        current.children.push(child);
      }
      current = child;
    }
  }

  // Sort: dirs first, then alphabetical
  const sortChildren = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortChildren);
  };
  sortChildren(root);
  return root.children;
}

function TreeItem({
  node,
  depth,
  filter,
  onFileClick,
}: {
  node: TreeNode;
  depth: number;
  filter: string;
  onFileClick: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  // Filter: show if this node or any descendant matches
  const matches = useMemo(() => {
    if (!filter) return true;
    const lower = filter.toLowerCase();
    const check = (n: TreeNode): boolean =>
      n.name.toLowerCase().includes(lower) || n.children.some(check);
    return check(node);
  }, [node, filter]);

  if (!matches) return null;

  if (!node.isDir) {
    return (
      <button
        onClick={() => onFileClick(node.fullPath)}
        className="flex items-center gap-1.5 w-full px-2 py-0.5 text-left text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <span className="text-zinc-600">📄</span>
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full px-2 py-0.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 rounded font-medium"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <span className="text-[10px] text-zinc-500">{expanded ? "▼" : "▶"}</span>
        <span className="truncate">{node.name}</span>
      </button>
      {expanded &&
        node.children.map((child) => (
          <TreeItem
            key={child.fullPath}
            node={child}
            depth={depth + 1}
            filter={filter}
            onFileClick={onFileClick}
          />
        ))}
    </div>
  );
}

export default function FileTree({
  visible,
  onToggle,
  onFileClick,
  embedded,
}: {
  visible: boolean;
  onToggle: () => void;
  onFileClick: (path: string) => void;
  embedded?: boolean;
}) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [filter, setFilter] = useState("");

  const fetchFiles = () => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((data: { files?: FileNode[] }) => setFiles(data.files ?? []))
      .catch(() => {});
  };

  // Fetch on mount and when becoming visible
  useEffect(() => {
    if (!visible) return;
    fetchFiles();
  }, [visible]);

  // Poll every 60s while visible
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(fetchFiles, 60_000);
    return () => clearInterval(interval);
  }, [visible]);

  // Listen for files:changed WS event
  useEffect(() => {
    if (!visible) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    // Reuse existing WS by listening on window custom events
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === "files:changed") {
        fetchFiles();
      }
    };
    window.addEventListener("filetree:refresh", handler);
    return () => window.removeEventListener("filetree:refresh", handler);
  }, [visible]);

  const tree = useMemo(() => buildTree(files), [files]);

  if (!visible) return null;

  if (embedded) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="px-2 py-1">
          <input
            type="text"
            placeholder="Filter files..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-zinc-300 placeholder-zinc-600"
          />
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {tree.map((node) => (
            <TreeItem key={node.fullPath} node={node} depth={0} filter={filter} onFileClick={onFileClick} />
          ))}
          {tree.length === 0 && (
            <div className="px-3 py-4 text-xs text-zinc-600 text-center">Loading...</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Files</span>
        <button onClick={onToggle} className="text-zinc-500 hover:text-zinc-300 text-xs">x</button>
      </div>
      <div className="px-2 py-1">
        <input
          type="text"
          placeholder="Filter files..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-zinc-300 placeholder-zinc-600"
        />
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {tree.map((node) => (
          <TreeItem key={node.fullPath} node={node} depth={0} filter={filter} onFileClick={onFileClick} />
        ))}
        {tree.length === 0 && (
          <div className="px-3 py-4 text-xs text-zinc-600 text-center">Loading...</div>
        )}
      </div>
    </div>
  );
}
