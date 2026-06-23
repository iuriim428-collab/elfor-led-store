import { Storage, File } from "@google-cloud/storage";
import { Readable } from "stream";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const LOCAL_UPLOAD_ROUTE_PREFIX = "/api/storage/uploads/direct/";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  isLocalObjectStorageEnabled(): boolean {
    return Boolean(process.env.LOCAL_OBJECT_STORAGE_DIR?.trim());
  }

  getLocalObjectStorageDir(): string {
    const dir = process.env.LOCAL_OBJECT_STORAGE_DIR?.trim() || "";
    if (!dir) {
      throw new Error(
        "LOCAL_OBJECT_STORAGE_DIR not set. Set it to a writable directory to enable local object storage."
      );
    }
    return path.resolve(dir);
  }

  private parseLocalUploadPath(rawPath: string): string | null {
    let pathname = rawPath;

    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      pathname = new URL(rawPath).pathname;
    }

    if (!pathname.startsWith(LOCAL_UPLOAD_ROUTE_PREFIX)) {
      return null;
    }

    const objectId = pathname.slice(LOCAL_UPLOAD_ROUTE_PREFIX.length).trim();
    if (!/^[A-Za-z0-9-]+$/.test(objectId)) {
      throw new Error("Invalid local upload path");
    }

    return `/objects/uploads/${objectId}`;
  }

  private resolveLocalObjectPath(objectPath: string): string {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const relativePath = objectPath.slice("/objects/".length);
    if (!relativePath) {
      throw new ObjectNotFoundError();
    }

    const baseDir = this.getLocalObjectStorageDir();
    const absolutePath = path.resolve(baseDir, relativePath);
    const allowedPrefix = `${baseDir}${path.sep}`;

    if (absolutePath !== baseDir && !absolutePath.startsWith(allowedPrefix)) {
      throw new ObjectNotFoundError();
    }

    return absolutePath;
  }

  getLocalObjectEntityAbsolutePath(objectPath: string): string | null {
    if (!this.isLocalObjectStorageEnabled()) {
      return null;
    }

    return this.resolveLocalObjectPath(objectPath);
  }

  async assertLocalObjectEntityExists(objectPath: string): Promise<string | null> {
    const absolutePath = this.getLocalObjectEntityAbsolutePath(objectPath);
    if (!absolutePath) {
      return null;
    }

    try {
      const stat = await fs.stat(absolutePath);
      if (!stat.isFile()) {
        throw new ObjectNotFoundError();
      }
      return absolutePath;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new ObjectNotFoundError();
      }
      throw error;
    }
  }

  async saveLocalObjectEntity({
    objectId,
    body,
    contentType,
  }: {
    objectId: string;
    body: Buffer;
    contentType?: string;
  }): Promise<string> {
    if (!this.isLocalObjectStorageEnabled()) {
      throw new Error("Local object storage is not enabled");
    }

    if (!/^[A-Za-z0-9-]+$/.test(objectId)) {
      throw new Error("Invalid object id");
    }

    const objectPath = `/objects/uploads/${objectId}`;
    const absolutePath = this.resolveLocalObjectPath(objectPath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, body);
    await fs.writeFile(
      `${absolutePath}.meta.json`,
      JSON.stringify(
        {
          contentType: contentType || "application/octet-stream",
          size: body.length,
        },
        null,
        2
      )
    );

    return objectPath;
  }

  async getLocalObjectEntityMetadata(objectPath: string): Promise<{ contentType?: string; size?: number } | null> {
    const absolutePath = this.getLocalObjectEntityAbsolutePath(objectPath);
    if (!absolutePath) {
      return null;
    }

    try {
      const raw = await fs.readFile(`${absolutePath}.meta.json`, "utf8");
      return JSON.parse(raw) as { contentType?: string; size?: number };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;

      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }

    return null;
  }

  async downloadObject(file: File, cacheTtlSec: number = 3600): Promise<Response> {
    const [metadata] = await file.getMetadata();
    const aclPolicy = await getObjectAclPolicy(file);
    const isPublic = aclPolicy?.visibility === "public";

    const nodeStream = file.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const headers: Record<string, string> = {
      "Content-Type": (metadata.contentType as string) || "application/octet-stream",
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) {
      headers["Content-Length"] = String(metadata.size);
    }

    return new Response(webStream, { headers });
  }

  async getObjectEntityUploadURL(): Promise<string> {
    if (this.isLocalObjectStorageEnabled()) {
      const objectId = randomUUID();
      return `${LOCAL_UPLOAD_ROUTE_PREFIX}${objectId}`;
    }

    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }

    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;

    const { bucketName, objectName } = parseObjectPath(fullPath);

    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    const localObjectPath = this.parseLocalUploadPath(rawPath);
    if (localObjectPath) {
      return localObjectPath;
    }

    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30_000),
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json() as { signed_url: string };
  return signedURL;
}
