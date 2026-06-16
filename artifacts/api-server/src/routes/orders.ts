import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  ListOrdersResponse,
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderParams,
  UpdateOrderBody,
  UpdateOrderResponse,
} from "@workspace/api-zod";
import { sendStatusEmail, sendInvoiceEmail } from "../services/email.js";

const router: IRouter = Router();

function toOrderJson(row: typeof ordersTable.$inferSelect) {
  return {
    ...row,
    totalAmount: Number(row.totalAmount),
    items: Array.isArray(row.items) ? row.items : [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.status) conditions.push(eq(ordersTable.status, filters.status));

  const rows = await db
    .select()
    .from(ordersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(ordersTable.createdAt))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);

  res.json(ListOrdersResponse.parse(rows.map(toOrderJson)));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const items = parsed.data.items;
  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const [row] = await db
    .insert(ordersTable)
    .values({
      ...parsed.data,
      totalAmount: totalAmount.toFixed(2),
      items: parsed.data.items as unknown as string,
    })
    .returning();
  res.status(201).json(GetOrderResponse.parse(toOrderJson(row)));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(toOrderJson(row)));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(ordersTable)
    .set(parsed.data)
    .where(eq(ordersTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // Send status change email (non-blocking) — skip for archive status
  if (parsed.data.status && parsed.data.status !== "archive" && row.customerEmail) {
    sendStatusEmail({
      id: row.id,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      status: row.status,
      totalAmount: Number(row.totalAmount),
    }).catch((err) => req.log.warn({ err }, "Status email failed"));
  }

  res.json(UpdateOrderResponse.parse(toOrderJson(row)));
});

router.post("/orders/:id/send-invoice", async (req, res): Promise<void> => {
  const idNum = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  if (!idNum || isNaN(idNum)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db.select().from(ordersTable).where(eq(ordersTable.id, idNum));
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const order = toOrderJson(row);
  const result = await sendInvoiceEmail({
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerCompany: order.customerCompany,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    totalAmount: order.totalAmount,
    invoiceFilePath: order.invoiceFilePath,
    items: order.items as any[],
  });
  if (!result.ok) {
    res.status(500).json(result);
    return;
  }
  res.json(result);
});

export default router;
