const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

function timestamp(): string {
  return new Date().toISOString().slice(11, 23);
}

// In-memory ring buffer for recent logs (included in bug reports)
const MAX_LOG_ENTRIES = 300;
const recentLogs: string[] = [];

function addLog(entry: string) {
  recentLogs.push(entry);
  if (recentLogs.length > MAX_LOG_ENTRIES) recentLogs.shift();
}

export function getRecentLogs(): string[] {
  return [...recentLogs];
}

function format(level: string, color: string, scope: string, msg: string, meta?: unknown): string {
  const ts = `${COLORS.dim}${timestamp()}${COLORS.reset}`;
  const tag = `${color}${level.padEnd(5)}${COLORS.reset}`;
  const sc = `${COLORS.cyan}[${scope}]${COLORS.reset}`;
  const metaStr = meta !== undefined ? ` ${COLORS.dim}${typeof meta === "string" ? meta : JSON.stringify(meta)}${COLORS.reset}` : "";
  return `${ts} ${tag} ${sc} ${msg}${metaStr}`;
}

function formatPlain(level: string, scope: string, msg: string, meta?: unknown): string {
  const ts = timestamp();
  const metaStr = meta !== undefined ? ` ${typeof meta === "string" ? meta : JSON.stringify(meta)}` : "";
  return `${ts} ${level.padEnd(5)} [${scope}] ${msg}${metaStr}`;
}

function logAndStore(level: string, color: string, scope: string, msg: string, meta?: unknown, writer = console.log) {
  writer(format(level, color, scope, msg, meta));
  addLog(formatPlain(level, scope, msg, meta));
}

function createScopedLogger(scope: string) {
  return {
    info: (msg: string, meta?: unknown) => logAndStore("INFO", COLORS.green, scope, msg, meta),
    warn: (msg: string, meta?: unknown) => logAndStore("WARN", COLORS.yellow, scope, msg, meta, console.warn),
    error: (msg: string, meta?: unknown) => logAndStore("ERROR", COLORS.red, scope, msg, meta, console.error),
    debug: (msg: string, meta?: unknown) => logAndStore("DEBUG", COLORS.dim, scope, msg, meta),
    start: (msg: string, meta?: unknown) => logAndStore("START", COLORS.blue, scope, msg, meta),
    done: (msg: string, meta?: unknown) => logAndStore("DONE", COLORS.magenta, scope, msg, meta),
  };
}

export const log = {
  server: createScopedLogger("server"),
  ws: createScopedLogger("ws"),
  chat: createScopedLogger("chat"),
  provider: createScopedLogger("provider"),
  tool: createScopedLogger("tool"),
  context: createScopedLogger("context"),
  file: createScopedLogger("file"),
  shell: createScopedLogger("shell"),
  config: createScopedLogger("config"),
  history: createScopedLogger("history"),
  router: createScopedLogger("router"),
};
