import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, articlesTable } from "@workspace/db";
import {
  ListArticlesResponse,
  ListArticlesQueryParams,
  CreateArticleBody,
  GetArticleParams,
  GetArticleResponse,
  UpdateArticleParams,
  UpdateArticleBody,
  UpdateArticleResponse,
  DeleteArticleParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toArticleJson(row: typeof articlesTable.$inferSelect) {
  return {
    ...row,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/articles", async (req, res): Promise<void> => {
  const query = ListArticlesQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.type) conditions.push(eq(articlesTable.type, filters.type));
  if (filters.published !== undefined) conditions.push(eq(articlesTable.published, filters.published));

  const rows = await db
    .select()
    .from(articlesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(articlesTable.createdAt))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);

  res.json(ListArticlesResponse.parse(rows.map(toArticleJson)));
});

router.post("/articles", async (req, res): Promise<void> => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { published, ...rest } = parsed.data;
  const insertData = {
    ...rest,
    published: published ?? false,
    publishedAt: published ? new Date() : null,
  };
  const [row] = await db.insert(articlesTable).values(insertData).returning();
  res.status(201).json(GetArticleResponse.parse(toArticleJson(row)));
});

router.get("/articles/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetArticleParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(articlesTable).where(eq(articlesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(GetArticleResponse.parse(toArticleJson(row)));
});

router.patch("/articles/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateArticleParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Partial<typeof articlesTable.$inferInsert> = { ...parsed.data };
  if (parsed.data.published === true) {
    updateData.publishedAt = new Date();
  }
  const [row] = await db
    .update(articlesTable)
    .set(updateData)
    .where(eq(articlesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(UpdateArticleResponse.parse(toArticleJson(row)));
});

router.delete("/articles/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteArticleParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(articlesTable).where(eq(articlesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
