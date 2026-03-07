import type { WebSocket } from "ws";
import { chatHandler } from "./chat-handler.js";

const connectedClients = new Set<WebSocket>();

export function getConnectedClients(): Set<WebSocket> {
  return connectedClients;
}

export function broadcastMessage(message: Record<string, unknown>) {
  const data = JSON.stringify(message);
  for (const client of connectedClients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}

export function handleWebSocket(socket: WebSocket) {
  console.log("Client connected");
  connectedClients.add(socket);

  socket.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      switch (msg.type) {
        case "chat":
          await chatHandler(socket, msg.message);
          break;
        default:
          socket.send(
            JSON.stringify({ type: "error", message: `Unknown message type: ${msg.type}` }),
          );
      }
    } catch (err) {
      socket.send(
        JSON.stringify({ type: "error", message: String(err) }),
      );
    }
  });

  socket.on("close", () => {
    connectedClients.delete(socket);
    console.log("Client disconnected");
  });
}
