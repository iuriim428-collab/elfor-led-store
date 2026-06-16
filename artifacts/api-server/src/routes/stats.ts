import { Router, type IRouter } from "express";
import { count, sum, eq, desc, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, productsTable, ordersTable, articlesTable, categoriesTable, chatSessionsTable } from "@workspace/db";
import { GetDashboardStatsResponse } from "@workspace/api-zod";

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

router.get("/stats/dashboard", async (req, res): Promise<void> => {
  // Moscow today start (UTC+3)
  const nowMsk = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const todayMskStart = new Date(Date.UTC(nowMsk.getUTCFullYear(), nowMsk.getUTCMonth(), nowMsk.getUTCDate()) - 3 * 60 * 60 * 1000);

  const [
    [productCount],
    [orderCount],
    [revenue],
    [newOrders],
    [catCount],
    [artCount],
    [todayOrderCount],
    [todayRev],
    [openChatsCount],
    recentOrderRows,
    statusRows,
    last7DaysRows,
  ] = await Promise.all([
    db.select({ count: count() }).from(productsTable),
    db.select({ count: count() }).from(ordersTable),
    db.select({ total: sum(ordersTable.totalAmount) }).from(ordersTable),
    db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "new")),
    db.select({ count: count() }).from(categoriesTable),
    db.select({ count: count() }).from(articlesTable),
    db.select({ count: count() }).from(ordersTable).where(gte(ordersTable.createdAt, todayMskStart)),
    db.select({ total: sum(ordersTable.totalAmount) }).from(ordersTable).where(gte(ordersTable.createdAt, todayMskStart)),
    db.select({ count: count() }).from(chatSessionsTable).where(eq(chatSessionsTable.status, "open")),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10),
    db.select({ status: ordersTable.status, count: count() }).from(ordersTable).groupBy(ordersTable.status),
    db.execute(sql`
      SELECT
        to_char(d::date, 'YYYY-MM-DD')  AS date,
        to_char(d::date AT TIME ZONE 'Europe/Moscow', 'DD.MM')  AS label,
        COUNT(o.id)::int                AS count,
        COALESCE(SUM(o.total_amount), 0)::numeric AS revenue
      FROM generate_series(
        (NOW() AT TIME ZONE 'Europe/Moscow')::date - 6,
        (NOW() AT TIME ZONE 'Europe/Moscow')::date,
        '1 day'::interval
      ) AS d
      LEFT JOIN orders o ON o.created_at::date = d::date
      GROUP BY d
      ORDER BY d
    `),
  ]);

  const stats = {
    totalProducts: productCount.count,
    totalOrders: orderCount.count,
    totalRevenue: Number(revenue.total ?? 0),
    newOrdersCount: newOrders.count,
    totalCategories: catCount.count,
    totalArticles: artCount.count,
    todayOrders: todayOrderCount.count,
    todayRevenue: Number(todayRev.total ?? 0),
    openChats: openChatsCount.count,
    ordersLast7Days: (last7DaysRows.rows as Array<{ date: string; label: string; count: number; revenue: string }>).map(r => ({
      date: r.date,
      label: r.label,
      count: Number(r.count),
      revenue: Number(r.revenue),
    })),
    recentOrders: recentOrderRows.map(toOrderJson),
    ordersByStatus: statusRows.map(r => ({ status: r.status, count: r.count })),
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

export default router;
