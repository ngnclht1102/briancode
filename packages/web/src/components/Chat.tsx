import { useEffect, useRef } from "react";
import { useChatStore } from "../stores/chatStore";
import Markdown from "react-markdown";
import ToolCallBlock from "./ToolCallBlock";

export default function Chat() {
  const messages = useChatStore((s) => s.messages);
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
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              msg.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-100"
            }`}
          >
            {msg.role === "user" ? (
              <p className="whitespace-pre-wrap">{msg.content}</p>
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
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
