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
function timestamp() {
    return new Date().toISOString().slice(11, 23);
}
function format(level, color, scope, msg, meta) {
    const ts = `${COLORS.dim}${timestamp()}${COLORS.reset}`;
    const tag = `${color}${level.padEnd(5)}${COLORS.reset}`;
    const sc = `${COLORS.cyan}[${scope}]${COLORS.reset}`;
    const metaStr = meta !== undefined ? ` ${COLORS.dim}${typeof meta === "string" ? meta : JSON.stringify(meta)}${COLORS.reset}` : "";
    return `${ts} ${tag} ${sc} ${msg}${metaStr}`;
}
function createScopedLogger(scope) {
    return {
        info: (msg, meta) => console.log(format("INFO", COLORS.green, scope, msg, meta)),
        warn: (msg, meta) => console.warn(format("WARN", COLORS.yellow, scope, msg, meta)),
        error: (msg, meta) => console.error(format("ERROR", COLORS.red, scope, msg, meta)),
        debug: (msg, meta) => {
            console.log(format("DEBUG", COLORS.dim, scope, msg, meta));
        },
        start: (msg, meta) => console.log(format("START", COLORS.blue, scope, msg, meta)),
        done: (msg, meta) => console.log(format("DONE", COLORS.magenta, scope, msg, meta)),
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
//# sourceMappingURL=logger.js.map