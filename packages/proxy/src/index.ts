import Fastify from "fastify";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * API Proxy Server
 *
 * Runs on an Android device (via Termux + Node.js) to forward API calls
 * to AI providers, bypassing MDM restrictions on the MacBook.
 *
 * Route pattern: /{provider}/* → forwards to the provider's actual API
 *
 * Usage on MacBook: set baseUrl in config to http://<android-ip>:3100/<provider>
 * e.g. baseUrl for anthropic → http://192.168.1.50:3100/anthropic
 */

const PROVIDER_TARGETS: Record<string, string> = {
  anthropic: "https://api.anthropic.com",
  deepseek: "https://api.deepseek.com",
  openai: "https://api.openai.com",
  kimi: "https://api.moonshot.ai",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode",
  groq: "https://api.groq.com/openai",
  ollama: "http://localhost:11434",
};

const PORT = parseInt(process.env.PROXY_PORT ?? "3100", 10);
const HOST = process.env.PROXY_HOST ?? "0.0.0.0";

// In-memory ring buffer for recent proxy logs
const MAX_LOG_ENTRIES = 200;
const recentLogs: string[] = [];

function addLog(entry: string) {
  recentLogs.push(entry);
  if (recentLogs.length > MAX_LOG_ENTRIES) recentLogs.shift();
}

const app = Fastify({ logger: true });

// Override ALL content type parsers to keep body as raw buffer (for proxying as-is)
app.removeContentTypeParser("application/json");
app.addContentTypeParser("application/json", { parseAs: "buffer" }, (_req, body, done) => {
  done(null, body);
});
app.addContentTypeParser("*", { parseAs: "buffer" }, (_req, body, done) => {
  done(null, body);
});

const SKIP_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
  "content-length",
]);

// Capture request/response logs
app.addHook("onRequest", async (request) => {
  addLog(`${new Date().toISOString()} → ${request.method} ${request.url}`);
});

app.addHook("onResponse", async (request, reply) => {
  addLog(`${new Date().toISOString()} ← ${request.method} ${request.url} ${reply.statusCode} (${Math.round(reply.elapsedTime)}ms)`);
});

// Health check
app.get("/", async () => {
  return {
    status: "ok",
    providers: Object.keys(PROVIDER_TARGETS),
  };
});

// Bug reports storage
const BUGS_DIR = path.join(os.homedir(), ".brian-code", "bugs");
fs.mkdirSync(BUGS_DIR, { recursive: true });

app.post("/bugs", async (request, reply) => {
  try {
    const body = JSON.parse((request.body as Buffer).toString());
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `bug-${timestamp}.txt`;
    const filepath = path.join(BUGS_DIR, filename);

    const lines: string[] = [
      `Bug Report — ${new Date().toISOString()}`,
      "=".repeat(60),
      "",
      `Provider: ${body.provider ?? "unknown"}`,
      `Model: ${body.model ?? "unknown"}`,
      `Project: ${body.project ?? "unknown"}`,
      "",
      "--- User Description ---",
      body.description ?? "(no description)",
      "",
      "--- Conversation ---",
    ];

    if (body.messages && Array.isArray(body.messages)) {
      for (const msg of body.messages) {
        lines.push("");
        lines.push(`[${msg.role}] (${new Date(msg.timestamp).toLocaleString()})`);
        lines.push(msg.content ?? "");
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          for (const tc of msg.toolCalls) {
            lines.push(`  > tool: ${tc.name}(${JSON.stringify(tc.args)})`);
            if (tc.result) lines.push(`  < ${tc.result.slice(0, 500)}`);
          }
        }
      }
    }

    if (body.serverLogs && Array.isArray(body.serverLogs) && body.serverLogs.length > 0) {
      lines.push("");
      lines.push("--- Server Logs (recent) ---");
      for (const entry of body.serverLogs) {
        lines.push(entry);
      }
    }

    lines.push("");
    lines.push("--- Proxy Logs (recent) ---");
    for (const entry of recentLogs) {
      lines.push(entry);
    }

    lines.push("");
    lines.push("--- End of Report ---");

    fs.writeFileSync(filepath, lines.join("\n"), "utf-8");
    app.log.info(`Bug report saved: ${filename}`);
    return reply.send({ success: true, filename });
  } catch (err) {
    app.log.error(err, "Failed to save bug report");
    return reply.status(500).send({ error: "Failed to save bug report" });
  }
});

app.get("/bugs", async () => {
  const files = fs.readdirSync(BUGS_DIR).filter(f => f.endsWith(".txt")).sort().reverse();
  return { count: files.length, files };
});

app.get("/logs", async () => {
  return { count: recentLogs.length, logs: [...recentLogs] };
});

// Catch-all proxy route: /:provider/*
app.all("/:provider/*", async (request, reply) => {
  const { provider } = request.params as { provider: string; "*": string };
  const wildcard = (request.params as { "*": string })["*"];

  const targetBase = PROVIDER_TARGETS[provider];
  if (!targetBase) {
    return reply.status(404).send({
      error: `Unknown provider: ${provider}`,
      available: Object.keys(PROVIDER_TARGETS),
    });
  }

  const targetUrl = `${targetBase}/${wildcard}`;
  const method = request.method;
  const headers = new Headers();

  // Forward relevant headers
  for (const [key, value] of Object.entries(request.headers)) {
    if (SKIP_HEADERS.has(key.toLowerCase()) || !value) continue;
    const headerValue = Array.isArray(value) ? value.join(", ") : value;
    headers.set(key, headerValue);
  }

  app.log.info(`→ ${method} ${targetUrl}`);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Forward body for methods that have one
    if (method !== "GET" && method !== "HEAD" && request.body) {
      fetchOptions.body = request.body as Buffer;
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Forward response status
    reply.status(response.status);

    // Forward response headers
    for (const [key, value] of response.headers.entries()) {
      if (SKIP_HEADERS.has(key.toLowerCase())) continue;
      reply.header(key, value);
    }

    // Stream the response body back
    if (!response.body) {
      return reply.send(await response.text());
    }

    return reply.send(response.body);
  } catch (err) {
    addLog(`${new Date().toISOString()} ERROR ${provider}: ${err instanceof Error ? err.message : String(err)}`);
    app.log.error(err, `Proxy error for ${provider}`);
    return reply.status(502).send({
      error: "Proxy error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`\nBrian Code API Proxy running on http://${HOST}:${PORT}`);
    console.log(`\nConfigured providers:`);
    for (const [name, url] of Object.entries(PROVIDER_TARGETS)) {
      console.log(`  ${name} → ${url}`);
    }
    console.log(`\nOn MacBook, set provider baseUrl to:`);
    console.log(`  http://<this-device-ip>:${PORT}/<provider>`);
    console.log(`  e.g. http://192.168.1.50:${PORT}/anthropic\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
