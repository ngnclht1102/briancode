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

function format(level: string, color: string, scope: string, msg: string, meta?: unknown): string {
  const ts = `${COLORS.dim}${timestamp()}${COLORS.reset}`;
  const tag = `${color}${level.padEnd(5)}${COLORS.reset}`;
  const sc = `${COLORS.cyan}[${scope}]${COLORS.reset}`;
  const metaStr = meta !== undefined ? ` ${COLORS.dim}${typeof meta === "string" ? meta : JSON.stringify(meta)}${COLORS.reset}` : "";
  return `${ts} ${tag} ${sc} ${msg}${metaStr}`;
}

function createScopedLogger(scope: string) {
  return {
    info: (msg: string, meta?: unknown) => console.log(format("INFO", COLORS.green, scope, msg, meta)),
    warn: (msg: string, meta?: unknown) => console.warn(format("WARN", COLORS.yellow, scope, msg, meta)),
    error: (msg: string, meta?: unknown) => console.error(format("ERROR", COLORS.red, scope, msg, meta)),
    debug: (msg: string, meta?: unknown) => {
      console.log(format("DEBUG", COLORS.dim, scope, msg, meta));
    },
    start: (msg: string, meta?: unknown) => console.log(format("START", COLORS.blue, scope, msg, meta)),
    done: (msg: string, meta?: unknown) => console.log(format("DONE", COLORS.magenta, scope, msg, meta)),
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
