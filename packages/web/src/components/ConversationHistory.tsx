import { useEffect, useState, useCallback } from "react";
import { useChatStore } from "../stores/chatStore";
import type { Message } from "../stores/chatStore";

interface ConversationEntry {
  id: string;
  projectPath: string;
  projectName: string;
  startedAt: string;
  title: string;
  messageCount: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ConversationHistory({
  onNewChat,
}: {
  onNewChat: () => void;
}) {
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const conversationId = useChatStore((s) => s.conversationId);
  const setMessages = useChatStore((s) => s.setMessages);
  const setConversationId = useChatStore((s) => s.setConversationId);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const fetchConversations = useCallback(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data: { conversations?: ConversationEntry[] }) => {
        setConversations(data.conversations ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refresh when conversationId changes (new messages saved)
  useEffect(() => {
    if (conversationId) fetchConversations();
  }, [conversationId, fetchConversations]);

  const handleLoad = async (id: string) => {
    if (id === conversationId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/conversation/load/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.conversation) {
        const msgs: Message[] = data.conversation.messages
          .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
          .map((m: { role: string; content: string; timestamp: number }, i: number) => ({
            id: `loaded-${i}`,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.timestamp,
            isStreaming: false,
          }));
        setMessages(msgs);
        setConversationId(id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (id === conversationId) {
        clearMessages();
      }
      fetchConversations();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const handleNewChat = () => {
    fetch("/api/conversation/new", { method: "POST" }).catch(() => {});
    onNewChat();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2">
        <button
          onClick={handleNewChat}
          className="w-full rounded bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors"
        >
          + New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="px-3 py-4 text-xs text-zinc-600 text-center">Loading...</div>
        )}
        {conversations.length === 0 && !loading && (
          <div className="px-3 py-4 text-xs text-zinc-600 text-center">
            No conversations yet
          </div>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => handleLoad(conv.id)}
            className={`group flex w-full items-start gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-800 ${
              conv.id === conversationId
                ? "bg-zinc-800 border-l-2 border-blue-500"
                : "border-l-2 border-transparent"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="truncate text-zinc-300 font-medium">{conv.title}</div>
              <div className="flex items-center gap-2 mt-0.5 text-zinc-600">
                <span>{conv.messageCount} msgs</span>
                <span>{timeAgo(conv.startedAt)}</span>
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(conv.id, e)}
              disabled={deletingId === conv.id}
              className="shrink-0 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity p-0.5"
              title="Delete conversation"
            >
              {deletingId === conv.id ? "..." : "x"}
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}
