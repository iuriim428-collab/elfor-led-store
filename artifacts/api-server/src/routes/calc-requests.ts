import { Router } from "express";
import { db } from "@workspace/db";
import { calcRequestsTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";

const router = Router();

router.post("/calc-requests", async (req, res) => {
  const { name, phone, productId, productSku, productName } = req.body ?? {};

  if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
    return res.status(400).json({ ok: false, message: "Укажите телефон" });
  }

  const [row] = await db
    .insert(calcRequestsTable)
    .values({
      name: name?.trim() || null,
      phone: phone.trim(),
      productId: productId ? Number(productId) : null,
      productSku: productSku ?? null,
      productName: productName ?? null,
    })
    .returning();

  return res.status(201).json(row);
});

router.get("/calc-requests", async (req, res) => {
  const rows = await db
    .select()
    .from(calcRequestsTable)
    .orderBy(desc(calcRequestsTable.createdAt));

  return res.json(rows);
});

router.patch("/calc-requests/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body ?? {};

  if (!status || typeof status !== "string") {
    return res.status(400).json({ ok: false, message: "Укажите статус" });
  }

  const [row] = await db
    .update(calcRequestsTable)
    .set({ status })
    .where(eq(calcRequestsTable.id, id))
    .returning();

  if (!row) return res.status(404).json({ ok: false, message: "Не найдено" });
  return res.json(row);
});

export default router;
