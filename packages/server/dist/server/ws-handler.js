import { chatHandler, cancelChat, deleteMessagesFrom, popLastAssistantTurn } from "./chat-handler.js";
import { log } from "../logger.js";
const connectedClients = new Set();
export function getConnectedClients() {
    return connectedClients;
}
export function broadcastMessage(message) {
    const data = JSON.stringify(message);
    for (const client of connectedClients) {
        if (client.readyState === 1) {
            client.send(data);
        }
    }
}
export function handleWebSocket(socket) {
    log.ws.info(`Client connected (total: ${connectedClients.size + 1})`);
    connectedClients.add(socket);
    socket.on("message", async (raw) => {
        try {
            const msg = JSON.parse(raw.toString());
            log.ws.info(`Message received: ${msg.type}`);
            switch (msg.type) {
                case "chat":
                    await chatHandler(socket, msg.message, msg.attachments);
                    break;
                case "chat:cancel":
                    log.ws.info("Chat cancelled by user");
                    cancelChat();
                    break;
                case "chat:delete":
                    log.ws.info(`Delete messages from index ${msg.messageIndex}`);
                    deleteMessagesFrom(msg.messageIndex);
                    break;
                case "chat:regenerate": {
                    log.ws.info("Regenerating last response");
                    cancelChat();
                    const lastUserMessage = popLastAssistantTurn();
                    if (lastUserMessage) {
                        await chatHandler(socket, lastUserMessage);
                    }
                    break;
                }
                default:
                    log.ws.warn(`Unknown message type: ${msg.type}`);
                    socket.send(JSON.stringify({ type: "error", message: `Unknown message type: ${msg.type}` }));
            }
        }
        catch (err) {
            log.ws.error(`WebSocket error: ${String(err)}`);
            socket.send(JSON.stringify({ type: "error", message: String(err) }));
        }
    });
    socket.on("close", () => {
        connectedClients.delete(socket);
        log.ws.info(`Client disconnected (total: ${connectedClients.size})`);
    });
}
//# sourceMappingURL=ws-handler.js.map