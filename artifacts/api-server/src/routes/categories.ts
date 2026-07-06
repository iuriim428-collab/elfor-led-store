import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, categoriesTable } from "@workspace/db";
import {
  ListCategoriesResponse,
  CreateCategoryBody,
  GetCategoryParams,
  GetCategoryResponse,
  UpdateCategoryParams,
  UpdateCategoryBody,
  UpdateCategoryResponse,
  DeleteCategoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const includeHidden = (() => {
    const raw = Array.isArray(req.query.includeHidden) ? req.query.includeHidden[0] : req.query.includeHidden;
    return raw === "true" || raw === "1";
  })();

  const rows = await db
    .select()
    .from(categoriesTable)
    .where(includeHidden ? undefined : eq(categoriesTable.isHidden, false))
    .orderBy(categoriesTable.sortOrder, categoriesTable.createdAt);
  res.json(ListCategoriesResponse.parse(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))));
});

router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json(GetCategoryResponse.parse({ ...row, createdAt: row.createdAt.toISOString() }));
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const params = GetCategoryParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(GetCategoryResponse.parse({ ...row, createdAt: row.createdAt.toISOString() }));
});

router.patch("/categories/:id", async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(categoriesTable)
    .set(parsed.data)
    .where(eq(categoriesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(UpdateCategoryResponse.parse({ ...row, createdAt: row.createdAt.toISOString() }));
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
