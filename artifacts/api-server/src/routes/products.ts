import { Router, type IRouter } from "express";
import { eq, and, ilike, sql, desc } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import {
  ListProductsResponse,
  ListProductsQueryParams,
  ListFeaturedProductsResponse,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toProductJson(
  row: typeof productsTable.$inferSelect,
  categoryName?: string | null,
) {
  return {
    ...row,
    price: Number(row.price),
    oldPrice: row.oldPrice != null ? Number(row.oldPrice) : null,
    priceTiers: Array.isArray(row.priceTiers) ? row.priceTiers : [],
    specs: Array.isArray(row.specs) ? row.specs : [],
    images: Array.isArray(row.images) ? row.images : [],
    variantStocks: Array.isArray(row.variantStocks) ? row.variantStocks : [],
    categoryName: categoryName ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/products/featured", async (req, res): Promise<void> => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.featured, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);

  res.json(
    ListFeaturedProductsResponse.parse(
      rows.map((r) => toProductJson(r.product, r.categoryName)),
    ),
  );
});

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.categoryId) conditions.push(eq(productsTable.categoryId, filters.categoryId));
  if (filters.featured !== undefined) conditions.push(eq(productsTable.featured, filters.featured));
  if (filters.search) {
    conditions.push(
      sql`(${ilike(productsTable.name, `%${filters.search}%`)} OR ${ilike(productsTable.sku, `%${filters.search}%`)})`,
    );
  }

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(productsTable.createdAt))
    .limit(filters.limit ?? 100)
    .offset(filters.offset ?? 0);

  res.json(
    ListProductsResponse.parse(
      rows.map((r) => toProductJson(r.product, r.categoryName)),
    ),
  );
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { price, oldPrice, priceTiers, specs, images, variantStocks, ...rest } = parsed.data;
  const resolvedVariantStocks = variantStocks ?? [];
  const computedStock = resolvedVariantStocks.length > 0
    ? resolvedVariantStocks.reduce((sum, v) => sum + v.stock, 0)
    : (rest.stock ?? 0);
  const [row] = await db
    .insert(productsTable)
    .values({
      ...rest,
      stock: computedStock,
      price: String(price),
      oldPrice: oldPrice != null ? String(oldPrice) : null,
      priceTiers: (priceTiers ?? []) as unknown as string,
      specs: (specs ?? []) as unknown as string,
      images: (images ?? []) as unknown as string,
      variantStocks: resolvedVariantStocks as unknown as string,
    })
    .returning();
  res.status(201).json(GetProductResponse.parse(toProductJson(row)));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id));
  if (!rows[0]) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(GetProductResponse.parse(toProductJson(rows[0].product, rows[0].categoryName)));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateProductParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { price, oldPrice, priceTiers, specs, images, variantStocks, ...rest } = parsed.data;
  const updateData: Partial<typeof productsTable.$inferInsert> = { ...rest };
  if (price !== undefined) updateData.price = String(price);
  if (oldPrice !== undefined) updateData.oldPrice = oldPrice != null ? String(oldPrice) : null;
  if (priceTiers !== undefined) updateData.priceTiers = priceTiers as unknown as string;
  if (specs !== undefined) updateData.specs = specs as unknown as string;
  if (images !== undefined) updateData.images = images as unknown as string;
  if (variantStocks !== undefined) {
    updateData.variantStocks = variantStocks as unknown as string;
    if (variantStocks.length > 0) {
      updateData.stock = variantStocks.reduce((sum, v) => sum + v.stock, 0);
    }
  }

  const [row] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(UpdateProductResponse.parse(toProductJson(row)));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteProductParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
