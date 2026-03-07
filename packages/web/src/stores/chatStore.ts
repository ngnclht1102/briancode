import { create } from "zustand";

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  conversationId: string | null;
  addMessage: (role: "user" | "assistant", content: string) => string;
  appendToMessage: (id: string, delta: string) => void;
  finishMessage: (id: string) => void;
  addToolCall: (msgId: string, toolCall: ToolCall) => void;
  setToolResult: (msgId: string, toolCallId: string, result: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
  setConversationId: (id: string | null) => void;
}

let messageCounter = 0;

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  conversationId: null,

  addMessage: (role, content) => {
    const id = `msg-${++messageCounter}`;
    set((state) => ({
      messages: [
        ...state.messages,
        { id, role, content, timestamp: Date.now(), isStreaming: role === "assistant" },
      ],
    }));
    return id;
  },

  appendToMessage: (id, delta) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + delta } : m,
      ),
    }));
  },

  finishMessage: (id) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isStreaming: false } : m,
      ),
      isLoading: false,
    }));
  },

  addToolCall: (msgId, toolCall) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === msgId
          ? { ...m, toolCalls: [...(m.toolCalls ?? []), toolCall] }
          : m,
      ),
    }));
  },

  setToolResult: (msgId, toolCallId, result) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === msgId
          ? {
              ...m,
              toolCalls: m.toolCalls?.map((tc) =>
                tc.id === toolCallId ? { ...tc, result } : tc,
              ),
            }
          : m,
      ),
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [], isLoading: false, conversationId: null }),
  setMessages: (messages) => set({ messages, isLoading: false }),
  setConversationId: (id) => set({ conversationId: id }),
}));
