import express, { Router, type IRouter, type Request, type Response } from "express";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

type UploadRequestBody = {
  name: string;
  size: number;
  contentType: string;
};

function parseUploadBody(body: unknown): UploadRequestBody | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const rawName = typeof b.name === "string" ? b.name.trim() : "";
  const rawSize = typeof b.size === "number"
    ? b.size
    : typeof b.size === "string"
      ? Number(b.size)
      : Number.NaN;
  const rawContentType = typeof b.contentType === "string" ? b.contentType.trim() : "";

  if (!rawName || !Number.isFinite(rawSize) || rawSize <= 0) {
    return null;
  }

  return {
    name: rawName,
    size: rawSize,
    contentType: rawContentType || "application/octet-stream",
  };
}

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();
const rawUploadParser = express.raw({ type: () => true, limit: "25mb" });

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 */
router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const uploadBody = parseUploadBody(req.body);

  if (!uploadBody) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const { name, size, contentType } = uploadBody;

    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

router.put("/storage/uploads/direct/:objectId", rawUploadParser, async (req: Request, res: Response) => {
  try {
    if (!objectStorageService.isLocalObjectStorageEnabled()) {
      res.status(404).json({ error: "Local object storage is not enabled" });
      return;
    }

    const rawObjectId = req.params.objectId;
    const objectId = Array.isArray(rawObjectId) ? rawObjectId[0] : rawObjectId;
    if (!objectId) {
      res.status(400).json({ error: "Missing object id" });
      return;
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ error: "Missing upload body" });
      return;
    }

    await objectStorageService.saveLocalObjectEntity({
      objectId,
      body: req.body,
      contentType: req.header("content-type") || "application/octet-stream",
    });

    res.status(204).end();
  } catch (error) {
    req.log.error({ err: error }, "Error saving local object");
    res.status(500).json({ error: "Failed to save local object" });
  }
});

router.post("/storage/uploads/file", rawUploadParser, async (req: Request, res: Response) => {
  try {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ error: "Missing upload body" });
      return;
    }

    const objectPath = await objectStorageService.saveObjectEntity({
      body: req.body,
      contentType: req.header("content-type") || "application/octet-stream",
    });

    res.status(201).json({ objectPath });
  } catch (error) {
    req.log.error({ err: error }, "Error uploading file directly");
    res.status(500).json({ error: "Failed to upload file" });
  }
});

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 * IMPORTANT: Always provide this endpoint when object storage is set up.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const response = await objectStorageService.downloadObject(file);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

/**
 * GET /storage/objects/*
 *
 * Serve object entities from PRIVATE_OBJECT_DIR.
 * These are served from a separate path from /public-objects and can optionally
 * be protected with authentication or ACL checks based on the use case.
 */
router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;

    const localAbsolutePath = await objectStorageService.assertLocalObjectEntityExists(objectPath);
    if (localAbsolutePath) {
      const metadata = await objectStorageService.getLocalObjectEntityMetadata(objectPath);
      const stat = await import("fs").then(fs => fs.promises.stat(localAbsolutePath));

      res.setHeader("Content-Type", metadata?.contentType || "application/octet-stream");
      res.setHeader("Content-Length", String(stat.size));
      res.setHeader("Cache-Control", "private, max-age=3600");

      createReadStream(localAbsolutePath).pipe(res);
      return;
    }

    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    // --- Protected route example (uncomment when using replit-auth) ---
    // if (!req.isAuthenticated()) {
    //   res.status(401).json({ error: "Unauthorized" });
    //   return;
    // }
    // const canAccess = await objectStorageService.canAccessObjectEntity({
    //   userId: req.user.id,
    //   objectFile,
    //   requestedPermission: ObjectPermission.READ,
    // });
    // if (!canAccess) {
    //   res.status(403).json({ error: "Forbidden" });
    //   return;
    // }

    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, "Object not found");
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
