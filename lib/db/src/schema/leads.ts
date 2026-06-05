import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const catalogLeadsTable = pgTable("catalog_leads", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CatalogLead = typeof catalogLeadsTable.$inferSelect;
