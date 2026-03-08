import { create } from "zustand";

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

export interface MessageAttachment {
  type: "file_mention" | "document" | "image";
  filename: string;
  path?: string;
  content?: string;
  mimeType?: string;
  data?: string;
  thumbnailUrl?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  attachments?: MessageAttachment[];
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  conversationId: string | null;
  addMessage: (role: "user" | "assistant", content: string, attachments?: MessageAttachment[]) => string;
  appendToMessage: (id: string, delta: string) => void;
  finishMessage: (id: string) => void;
  addToolCall: (msgId: string, toolCall: ToolCall) => void;
  setToolResult: (msgId: string, toolCallId: string, result: string) => void;
  deleteMessageAndAfter: (id: string) => number;
  removeLastAssistantTurn: () => void;
  regenerateFrom: (assistantMsgId: string) => { userMessage: string; deleteIndex: number } | null;
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

  addMessage: (role, content, attachments) => {
    const id = `msg-${++messageCounter}`;
    set((state) => ({
      messages: [
        ...state.messages,
        { id, role, content, timestamp: Date.now(), isStreaming: role === "assistant", attachments },
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

  deleteMessageAndAfter: (id) => {
    let idx = -1;
    set((state) => {
      idx = state.messages.findIndex((m) => m.id === id);
      if (idx === -1) return state;
      return { messages: state.messages.slice(0, idx) };
    });
    return idx;
  },

  removeLastAssistantTurn: () => {
    set((state) => {
      let lastUserIdx = -1;
      for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].role === "user") {
          lastUserIdx = i;
          break;
        }
      }
      if (lastUserIdx === -1) return state;
      return { messages: state.messages.slice(0, lastUserIdx) };
    });
  },

  regenerateFrom: (userMsgId) => {
    let result: { userMessage: string; deleteIndex: number } | null = null;
    set((state) => {
      const idx = state.messages.findIndex((m) => m.id === userMsgId);
      if (idx === -1 || state.messages[idx].role !== "user") return state;
      const userMessage = state.messages[idx].content;
      // Keep messages before this user message, delete it + everything after
      result = { userMessage, deleteIndex: idx };
      return { messages: state.messages.slice(0, idx) };
    });
    return result;
  },

  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [], isLoading: false, conversationId: null }),
  setMessages: (messages) => set({ messages, isLoading: false }),
  setConversationId: (id) => set({ conversationId: id }),
}));
