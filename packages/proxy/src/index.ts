import Fastify from "fastify";

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

// Health check
app.get("/", async () => {
  return {
    status: "ok",
    providers: Object.keys(PROVIDER_TARGETS),
  };
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
