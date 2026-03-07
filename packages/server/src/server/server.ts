import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import { handleWebSocket } from "./ws-handler.js";
import { registerRoutes } from "./router.js";

interface ServerOptions {
  port: number;
}

export async function createServer(_options: ServerOptions) {
  const app = Fastify({ logger: false });

  await app.register(fastifyCors, { origin: true });
  await app.register(fastifyWebsocket);

  // Serve bundled frontend in production
  // Compiled to dist/server/server.js, web is at dist/web/
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const webDistPath = path.resolve(__dirname, "../web");
  if (fs.existsSync(webDistPath)) {
    await app.register(fastifyStatic, {
      root: webDistPath,
      prefix: "/",
      wildcard: false,
    });

    // SPA fallback: serve index.html for non-API routes
    app.setNotFoundHandler((_req, reply) => {
      reply.sendFile("index.html");
    });
  }

  app.register(async (fastify) => {
    fastify.get("/ws", { websocket: true }, (socket, _req) => {
      handleWebSocket(socket);
    });
  });

  registerRoutes(app);

  return app;
}
