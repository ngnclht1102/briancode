import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import fastifyMultipart from "@fastify/multipart";
import { handleWebSocket } from "./ws-handler.js";
import { registerRoutes } from "./router.js";
import { log } from "../logger.js";

interface ServerOptions {
  port: number;
}

export async function createServer(_options: ServerOptions) {
  log.server.start("Creating server");
  const app = Fastify({ logger: false });

  await app.register(fastifyCors, { origin: true });
  await app.register(fastifyWebsocket);
  await app.register(fastifyMultipart, {
    limits: { fileSize: 20 * 1024 * 1024 },
  });

  // Serve bundled frontend
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const webDistPath = path.resolve(__dirname, "../web");
  const publicPath = path.resolve(__dirname, "../../public");
  const staticRoot = fs.existsSync(webDistPath) ? webDistPath : publicPath;
  log.server.info(`Static files: ${staticRoot}`);

  if (fs.existsSync(staticRoot)) {
    await app.register(fastifyStatic, {
      root: staticRoot,
      prefix: "/",
    });

    // SPA fallback: serve index.html for non-API/non-asset routes
    app.setNotFoundHandler((_req, reply) => {
      if (_req.url.startsWith("/api/") || _req.url.startsWith("/assets/")) {
        reply.code(404).send({ error: "Not Found" });
      } else {
        reply.sendFile("index.html");
      }
    });
  }

  app.register(async (fastify) => {
    fastify.get("/ws", { websocket: true }, (socket, _req) => {
      handleWebSocket(socket);
    });
  });

  registerRoutes(app);

  log.server.done("Server created");
  return app;
}
