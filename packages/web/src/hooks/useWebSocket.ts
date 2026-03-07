import { useEffect, useRef, useCallback, useState } from "react";
import { useChatStore } from "../stores/chatStore";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface ProjectSwitchedEvent {
  path: string;
  name: string;
}

export function useWebSocket(onProjectSwitched?: (event: ProjectSwitchedEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const assistantMsgIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const { addMessage, appendToMessage, finishMessage, addToolCall, setToolResult, setLoading, setConversationId } =
    useChatStore();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    setStatus("connecting");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "chat:stream":
          if (!assistantMsgIdRef.current) {
            assistantMsgIdRef.current = addMessage("assistant", "");
          }
          appendToMessage(assistantMsgIdRef.current, msg.delta);
          break;

        case "chat:tool_call":
          if (!assistantMsgIdRef.current) {
            assistantMsgIdRef.current = addMessage("assistant", "");
          }
          addToolCall(assistantMsgIdRef.current, {
            id: msg.toolCallId,
            name: msg.name,
            args: msg.args,
          });
          break;

        case "chat:tool_result":
          if (assistantMsgIdRef.current) {
            setToolResult(assistantMsgIdRef.current, msg.toolCallId, msg.result);
          }
          break;

        case "chat:done":
          if (assistantMsgIdRef.current) {
            finishMessage(assistantMsgIdRef.current);
            assistantMsgIdRef.current = null;
          }
          if (msg.conversationId) {
            setConversationId(msg.conversationId);
          }
          break;

        case "project:switched":
          onProjectSwitched?.({ path: msg.path, name: msg.name });
          break;

        case "files:changed":
          window.dispatchEvent(new CustomEvent("filetree:refresh", { detail: msg }));
          break;

        case "error":
          if (assistantMsgIdRef.current) {
            appendToMessage(assistantMsgIdRef.current, `\n\n**Error:** ${msg.message}`);
            finishMessage(assistantMsgIdRef.current);
            assistantMsgIdRef.current = null;
          }
          setLoading(false);
          break;
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;

      // Exponential backoff reconnect
      const attempts = reconnectAttemptsRef.current;
      if (attempts < 5) {
        const delay = Math.min(1000 * 2 ** attempts, 16000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [addMessage, appendToMessage, finishMessage, addToolCall, setToolResult, setLoading, setConversationId, onProjectSwitched]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, payload?: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }));
    }
  }, []);

  return { status, sendMessage };
}
