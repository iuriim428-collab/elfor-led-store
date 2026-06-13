import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

function extractCity(address: string | null): string {
  if (!address) return "Не указан";
  // "г. Москва, ..." or "г Москва" or "392030, Тамбов"
  const match = address.match(/г\.?\s+([А-ЯЁа-яё][А-ЯЁа-яё\- ]+?)(?:[,\s]|$)/);
  if (match) return match[1].trim();
  // fallback: second token after index code
  const parts = address.split(",").map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    const w = part.replace(/^\d+\s*/, "").trim();
    if (w.length > 2) return w;
  }
  return "Другой";
}

router.get("/analytics", async (req, res): Promise<void> => {
  // Summary
  const summaryRows = await db.execute(sql`
    SELECT
      COUNT(*)::int                                                         AS total_orders,
      COALESCE(SUM(total_amount), 0)::numeric                              AS total_revenue,
      COALESCE(AVG(total_amount), 0)::numeric                              AS avg_order,
      COUNT(CASE WHEN status = 'new'       THEN 1 END)::int                AS cnt_new,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::int                AS cnt_confirmed,
      COUNT(CASE WHEN status = 'shipped'   THEN 1 END)::int                AS cnt_shipped,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END)::int                AS cnt_delivered,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::int                AS cnt_cancelled
    FROM orders
  `);
  const s = summaryRows.rows[0] as Record<string, unknown>;

  // Top products by qty and revenue
  const prodRows = await db.execute(sql`
    SELECT
      item->>'productSku'                                    AS sku,
      item->>'productName'                                   AS name,
      SUM((item->>'quantity')::int)::int                     AS total_qty,
      SUM((item->>'quantity')::int * (item->>'unitPrice')::numeric)::numeric AS total_revenue,
      COUNT(DISTINCT orders.id)::int                         AS orders_count
    FROM orders,
         jsonb_array_elements(items) AS item
    GROUP BY sku, name
    ORDER BY total_qty DESC
    LIMIT 15
  `);

  // Monthly trend (last 12 months)
  const monthRows = await db.execute(sql`
    SELECT
      to_char(created_at AT TIME ZONE 'Europe/Moscow', 'YYYY-MM') AS month,
      to_char(created_at AT TIME ZONE 'Europe/Moscow', 'Mon YYYY') AS label,
      COUNT(*)::int                                                AS orders,
      SUM(total_amount)::numeric                                   AS revenue
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY month, label
    ORDER BY month
  `);

  // All orders for city extraction
  const orderRows = await db.execute(sql`
    SELECT delivery_address, total_amount, status FROM orders
  `);

  const cityMap = new Map<string, { count: number; revenue: number }>();
  for (const row of orderRows.rows as { delivery_address: string | null; total_amount: string; status: string }[]) {
    const city = extractCity(row.delivery_address);
    const prev = cityMap.get(city) ?? { count: 0, revenue: 0 };
    cityMap.set(city, {
      count: prev.count + 1,
      revenue: prev.revenue + Number(row.total_amount),
    });
  }
  const cities = Array.from(cityMap.entries())
    .map(([city, v]) => ({ city, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.count - a.count);

  res.json({
    summary: {
      totalOrders: Number(s.total_orders),
      totalRevenue: Number(s.total_revenue),
      avgOrderValue: Math.round(Number(s.avg_order)),
      statusCounts: {
        new:       Number(s.cnt_new),
        confirmed: Number(s.cnt_confirmed),
        shipped:   Number(s.cnt_shipped),
        delivered: Number(s.cnt_delivered),
        cancelled: Number(s.cnt_cancelled),
      },
    },
    topProducts: prodRows.rows,
    monthly: monthRows.rows,
    cities,
  });
});

export default router;
