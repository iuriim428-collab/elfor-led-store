import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";

const router: IRouter = Router();

function toProjectJson(row: typeof projectsTable.$inferSelect) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function parsePublishedQuery(value: unknown): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw === "boolean") {
    return raw;
  }

  if (typeof raw === "string") {
    return raw === "true" || raw === "1";
  }

  return undefined;
}

function parseProjectPayload(body: unknown, partial = false) {
  if (!body || typeof body !== "object") {
    return { success: false as const, error: "Invalid request body" };
  }

  const data = body as Record<string, unknown>;
  const payload: {
    title?: string;
    description?: string | null;
    imageUrl?: string | null;
    published?: boolean;
  } = {};

  if ("title" in data) {
    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      return { success: false as const, error: "Title is required" };
    }

    payload.title = data.title.trim();
  } else if (!partial) {
    return { success: false as const, error: "Title is required" };
  }

  if ("description" in data) {
    if (data.description !== null && data.description !== undefined && typeof data.description !== "string") {
      return { success: false as const, error: "Description must be a string" };
    }

    payload.description = typeof data.description === "string" ? data.description : null;
  }

  if ("imageUrl" in data) {
    if (data.imageUrl !== null && data.imageUrl !== undefined && typeof data.imageUrl !== "string") {
      return { success: false as const, error: "Image URL must be a string" };
    }

    payload.imageUrl = typeof data.imageUrl === "string" ? data.imageUrl : null;
  }

  if ("published" in data) {
    if (typeof data.published !== "boolean") {
      return { success: false as const, error: "Published must be a boolean" };
    }

    payload.published = data.published;
  }

  return { success: true as const, data: payload };
}

router.get("/projects", async (req, res): Promise<void> => {
  const published = parsePublishedQuery(req.query.published);
  const conditions = [];

  if (published !== undefined) {
    conditions.push(eq(projectsTable.published, published));
  }

  const rows = await db
    .select()
    .from(projectsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(projectsTable.createdAt));

  res.json(rows.map(toProjectJson));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = parseProjectPayload(req.body, false);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const [row] = await db
    .insert(projectsTable)
    .values({
      title: parsed.data.title!,
      description: parsed.data.description ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      published: parsed.data.published ?? true,
    })
    .returning();

  res.status(201).json(toProjectJson(row));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const [row] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(toProjectJson(row));
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const parsed = parseProjectPayload(req.body, true);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const updateData: Partial<typeof projectsTable.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (parsed.data.title !== undefined) {
    updateData.title = parsed.data.title;
  }

  if ("description" in parsed.data) {
    updateData.description = parsed.data.description ?? null;
  }

  if ("imageUrl" in parsed.data) {
    updateData.imageUrl = parsed.data.imageUrl ?? null;
  }

  if (parsed.data.published !== undefined) {
    updateData.published = parsed.data.published;
  }

  const [row] = await db
    .update(projectsTable)
    .set(updateData)
    .where(eq(projectsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(toProjectJson(row));
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const [row] = await db.delete(projectsTable).where(eq(projectsTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
