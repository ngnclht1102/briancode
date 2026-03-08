import type { FastifyInstance } from "fastify";
import { log } from "../logger.js";

const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

const DOCUMENT_MIMES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export function registerUploadRoute(app: FastifyInstance) {
  app.post("/api/upload", async (req, reply) => {
    const file = await req.file();
    if (!file) {
      reply.status(400);
      return { error: "No file uploaded" };
    }

    const mimeType = file.mimetype;
    const filename = file.filename;
    const buffer = await file.toBuffer();
    const size = buffer.length;

    log.router.info(`Upload: ${filename} (${mimeType}, ${size} bytes)`);

    const isImage = IMAGE_MIMES.has(mimeType);
    const isDocument = DOCUMENT_MIMES.has(mimeType);

    if (!isImage && !isDocument) {
      reply.status(400);
      return { error: `Unsupported file type: ${mimeType}` };
    }

    if (isDocument && size > MAX_DOC_SIZE) {
      reply.status(400);
      return { error: `Document too large. Max size: ${MAX_DOC_SIZE / 1024 / 1024}MB` };
    }

    if (isImage && size > MAX_IMAGE_SIZE) {
      reply.status(400);
      return { error: `Image too large. Max size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB` };
    }

    try {
      if (isImage) {
        const data = buffer.toString("base64");
        return { filename, mimeType, size, type: "image" as const, data };
      }

      // Document extraction
      let content: string;
      if (mimeType === "application/pdf") {
        content = await extractPdfText(buffer);
      } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        content = await extractDocxText(buffer);
      } else {
        content = buffer.toString("utf-8");
      }

      return { filename, mimeType, size, type: "document" as const, content };
    } catch (err) {
      log.router.error(`Upload processing failed: ${String(err)}`);
      reply.status(500);
      return { error: `Failed to process file: ${String(err)}` };
    }
  });
}
