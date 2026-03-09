import type { WebSocket } from "ws";
export declare function getConnectedClients(): Set<WebSocket>;
export declare function broadcastMessage(message: Record<string, unknown>): void;
export declare function handleWebSocket(socket: WebSocket): void;
//# sourceMappingURL=ws-handler.d.ts.map