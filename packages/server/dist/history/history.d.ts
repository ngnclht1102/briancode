export interface ConversationEntry {
    id: string;
    projectPath: string;
    projectName: string;
    startedAt: string;
    title: string;
    messageCount: number;
}
export interface Conversation {
    id: string;
    projectPath: string;
    startedAt: string;
    title: string;
    messages: Array<{
        role: string;
        content: string;
        timestamp: number;
        toolCalls?: Array<{
            name: string;
            args: Record<string, unknown>;
        }>;
    }>;
}
export declare function getCurrentConversationId(): string | null;
export declare function startConversation(): Conversation;
export declare function addMessageToHistory(role: string, content: string, toolCalls?: Array<{
    name: string;
}>): void;
export declare function listConversations(filterProjectPath?: string): ConversationEntry[];
export declare function loadConversation(id: string): Conversation | null;
export declare function deleteConversation(id: string): boolean;
export declare function setActiveConversation(conversation: Conversation): void;
export declare function resetConversation(): void;
//# sourceMappingURL=history.d.ts.map