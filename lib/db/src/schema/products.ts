import { pgTable, text, serial, timestamp, integer, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  series: text("series"),
  categoryId: integer("category_id").notNull(),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  oldPrice: numeric("old_price", { precision: 12, scale: 2 }),
  priceTiers: jsonb("price_tiers").notNull().default("[]"),
  specs: jsonb("specs").notNull().default("[]"),
  imageUrl: text("image_url"),
  passportUrl: text("passport_url"),
  images: jsonb("images").notNull().default("[]"),
  power: text("power"),
  lumens: integer("lumens"),
  colorTemp: text("color_temp"),
  ipRating: text("ip_rating"),
  warranty: text("warranty"),
  colorTemps: jsonb("color_temps").notNull().default("[]"),
  beamAngles: jsonb("beam_angles").notNull().default("[]"),
  variantStocks: jsonb("variant_stocks").notNull().default("[]"),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  inStock: boolean("in_stock").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
