import { Router } from "express";
import { db } from "@workspace/db";
import { calcRequestsTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { sendCalcEmail } from "../services/email.js";

const router = Router();

router.post("/calc-requests", async (req, res) => {
  const { name, phone, email, productId, productSku, productName } = req.body ?? {};

  if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
    return res.status(400).json({ ok: false, message: "Укажите телефон" });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ ok: false, message: "Укажите email" });
  }

  const [row] = await db
    .insert(calcRequestsTable)
    .values({
      name: name?.trim() || null,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
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

router.patch("/calc-requests/:id/file", async (req, res) => {
  const id = parseInt(req.params.id);
  const { calcFileUrl } = req.body ?? {};

  const [row] = await db
    .update(calcRequestsTable)
    .set({ calcFileUrl: calcFileUrl ?? null })
    .where(eq(calcRequestsTable.id, id))
    .returning();

  if (!row) return res.status(404).json({ ok: false, message: "Не найдено" });
  return res.json(row);
});

router.post("/calc-requests/:id/send-file", async (req, res) => {
  const id = parseInt(req.params.id);

  const [row] = await db
    .select()
    .from(calcRequestsTable)
    .where(eq(calcRequestsTable.id, id))
    .limit(1);

  if (!row) return res.status(404).json({ ok: false, message: "Не найдено" });
  if (!row.email) return res.status(400).json({ ok: false, message: "Email не указан" });
  if (!row.calcFileUrl) return res.status(400).json({ ok: false, message: "Файл расчёта не загружен" });

  const result = await sendCalcEmail({
    to: row.email,
    name: row.name,
    phone: row.phone,
    productName: row.productName,
    calcFileUrl: row.calcFileUrl,
    requestId: row.id,
  });

  if (result.ok) {
    await db
      .update(calcRequestsTable)
      .set({ status: "done" })
      .where(eq(calcRequestsTable.id, id));
  }

  return res.json(result);
});

export default router;
