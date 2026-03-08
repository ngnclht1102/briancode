import { useEffect, useRef } from "react";
import { useChatStore } from "../stores/chatStore";
import Markdown from "react-markdown";
import ToolCallBlock from "./ToolCallBlock";

interface ChatProps {
  onDelete: (messageId: string) => void;
  onRegenerate: (messageId: string) => void;
}

export default function Chat({ onDelete, onRegenerate }: ChatProps) {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center text-zinc-500">
          <h2 className="mb-2 text-xl font-semibold text-zinc-300">Brian Code</h2>
          <p>AI coding assistant. Type a message to start.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`group flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className="flex flex-col max-w-[80%]">
            <div
              className={`rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              {msg.role === "user" ? (
                <div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {msg.attachments.map((att, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded bg-blue-700/50 px-1.5 py-0.5 text-xs"
                        >
                          {att.type === "image" && att.thumbnailUrl ? (
                            <img src={att.thumbnailUrl} alt="" className="w-4 h-4 rounded object-cover" />
                          ) : att.type === "file_mention" ? (
                            <span className="text-blue-300">@</span>
                          ) : (
                            <span>{"\uD83D\uDCC4"}</span>
                          )}
                          <span className="max-w-[120px] truncate">{att.path ?? att.filename}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  {msg.toolCalls?.map((tc) => (
                    <ToolCallBlock key={tc.id} toolCall={tc} />
                  ))}
                  {msg.content && <Markdown>{msg.content}</Markdown>}
                  {msg.isStreaming && !msg.toolCalls?.some((tc) => tc.result === undefined) && (
                    <span className="inline-block w-2 h-4 bg-zinc-400 animate-pulse ml-0.5" />
                  )}
                </div>
              )}
            </div>
            {/* Action buttons */}
            {!isLoading && (
              <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {msg.role === "user" && (
                  <button
                    onClick={() => onRegenerate(msg.id)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 px-1.5 py-0.5 rounded hover:bg-zinc-800"
                    title="Regenerate response to this message"
                  >
                    Regenerate
                  </button>
                )}
                <button
                  onClick={() => onDelete(msg.id)}
                  className="text-xs text-zinc-500 hover:text-red-400 px-1.5 py-0.5 rounded hover:bg-zinc-800"
                  title="Delete this message and all after it"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
