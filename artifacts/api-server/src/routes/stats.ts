import { Router, type IRouter } from "express";
import { count, sum, eq, desc } from "drizzle-orm";
import { db, productsTable, ordersTable, articlesTable, categoriesTable } from "@workspace/db";
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
  const [productCount] = await db.select({ count: count() }).from(productsTable);
  const [orderCount] = await db.select({ count: count() }).from(ordersTable);
  const [revenue] = await db.select({ total: sum(ordersTable.totalAmount) }).from(ordersTable);
  const [newOrders] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "new"));
  const [catCount] = await db.select({ count: count() }).from(categoriesTable);
  const [artCount] = await db.select({ count: count() }).from(articlesTable);

  const recentOrderRows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  const statusRows = await db
    .select({ status: ordersTable.status, count: count() })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  const stats = {
    totalProducts: productCount.count,
    totalOrders: orderCount.count,
    totalRevenue: Number(revenue.total ?? 0),
    newOrdersCount: newOrders.count,
    totalCategories: catCount.count,
    totalArticles: artCount.count,
    recentOrders: recentOrderRows.map(toOrderJson),
    ordersByStatus: statusRows.map(r => ({ status: r.status, count: r.count })),
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

export default router;
