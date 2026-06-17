import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const catalogLeadsTable = pgTable("catalog_leads", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CatalogLead = typeof catalogLeadsTable.$inferSelect;

export const calcRequestsTable = pgTable("calc_requests", {
  id: serial("id").primaryKey(),
  name: text("name"),
  phone: text("phone").notNull(),
  email: text("email"),
  productId: integer("product_id"),
  productSku: text("product_sku"),
  productName: text("product_name"),
  status: text("status").notNull().default("new"),
  calcFileUrl: text("calc_file_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CalcRequest = typeof calcRequestsTable.$inferSelect;
