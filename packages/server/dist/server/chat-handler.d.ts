import type { WebSocket } from "ws";
import type { ChatMessage } from "../providers/types.js";
interface Attachment {
    type: "file_mention" | "document" | "image";
    path?: string;
    filename?: string;
    content?: string;
    mimeType?: string;
    data?: string;
}
export declare function resetChatState(): void;
export declare function loadChatMessages(messages: ChatMessage[]): void;
export declare function cancelChat(): void;
/**
 * Delete messages from conversation history starting at the given index.
 * Index is relative to non-system messages (0 = first user message).
 * Deletes the message at that index and all messages after it.
 */
export declare function deleteMessagesFrom(messageIndex: number): void;
/**
 * Get the last user message content for regeneration.
 * Removes everything from the last user message onwards.
 */
export declare function popLastAssistantTurn(): string | null;
export declare function chatHandler(socket: WebSocket, message: string, attachments?: Attachment[]): Promise<void>;
export {};
//# sourceMappingURL=chat-handler.d.ts.map