import { useEffect } from "react";

interface ShortcutHandlers {
  onNewChat?: () => void;
  onFocusInput?: () => void;
  onToggleSidebar?: () => void;
  onEscape?: () => void;
  onShowHelp?: () => void;
  onOpenProject?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "n") {
        e.preventDefault();
        handlers.onNewChat?.();
      } else if (mod && e.key === "k") {
        e.preventDefault();
        handlers.onFocusInput?.();
      } else if (mod && e.key === "b") {
        e.preventDefault();
        handlers.onToggleSidebar?.();
      } else if (mod && e.key === "o") {
        e.preventDefault();
        handlers.onOpenProject?.();
      } else if (mod && e.key === "/") {
        e.preventDefault();
        handlers.onShowHelp?.();
      } else if (e.key === "Escape") {
        handlers.onEscape?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}

export const SHORTCUTS = [
  { keys: "⌘/Ctrl + N", description: "New chat" },
  { keys: "⌘/Ctrl + K", description: "Focus input" },
  { keys: "⌘/Ctrl + B", description: "Toggle sidebar" },
  { keys: "⌘/Ctrl + O", description: "Switch project" },
  { keys: "⌘/Ctrl + /", description: "Show shortcuts" },
  { keys: "Escape", description: "Dismiss / cancel" },
  { keys: "Enter", description: "Send message" },
  { keys: "Shift + Enter", description: "New line" },
];
