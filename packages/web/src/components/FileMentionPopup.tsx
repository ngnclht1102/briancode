import { useState, useEffect, useRef, useCallback } from "react";

interface FileMentionPopupProps {
  query: string;
  files: string[];
  onSelect: (filePath: string) => void;
  onClose: () => void;
  visible: boolean;
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function FileMentionPopup({ query, files, onSelect, onClose, visible }: FileMentionPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? files.filter((f) => fuzzyMatch(query, f))
    : files;

  const MAX_DISPLAY = 12;
  const displayed = filtered.slice(0, MAX_DISPLAY);
  const hasMore = filtered.length > MAX_DISPLAY;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!visible) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, displayed.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (displayed[selectedIndex]) {
          onSelect(displayed[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [visible, displayed, selectedIndex, onSelect, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIndex] as HTMLElement;
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!visible || displayed.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="absolute bottom-full left-0 mb-1 w-full max-h-64 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg z-50"
    >
      {displayed.map((file, i) => (
        <button
          key={file}
          className={`w-full text-left px-3 py-1.5 text-sm truncate ${
            i === selectedIndex
              ? "bg-blue-600 text-white"
              : "text-zinc-300 hover:bg-zinc-800"
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(file);
          }}
          onMouseEnter={() => setSelectedIndex(i)}
        >
          <span className="text-zinc-500 mr-1">@</span>
          {file}
        </button>
      ))}
      {hasMore && (
        <div className="px-3 py-1.5 text-xs text-zinc-500 border-t border-zinc-800">
          {filtered.length - MAX_DISPLAY} more — type to filter
        </div>
      )}
    </div>
  );
}
