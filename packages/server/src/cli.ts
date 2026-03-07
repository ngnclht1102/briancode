import { program } from "commander";
import { createServer } from "./server/server.js";
import { addRecentProject } from "./config.js";

program
  .name("brian-code")
  .description("AI coding assistant with web UI")
  .version("0.1.0")
  .option("-p, --port <number>", "port to listen on", "5001")
  .option("--no-open", "do not open browser automatically")
  .parse();

const opts = program.opts<{ port: string; open: boolean }>();
const port = parseInt(opts.port, 10);

const server = await createServer({ port });

await server.listen({ port, host: "0.0.0.0" });
addRecentProject(process.cwd());
console.log(`Brian Code v0.1.0 — http://localhost:${port}`);

if (opts.open) {
  const open = await import("open");
  await open.default(`http://localhost:${port}`);
}
