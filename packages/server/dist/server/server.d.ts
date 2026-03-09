interface ServerOptions {
    port: number;
}
export declare function createServer(_options: ServerOptions): Promise<import("fastify").FastifyInstance<import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>>;
export {};
//# sourceMappingURL=server.d.ts.map