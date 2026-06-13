import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const chatSessionsTable = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  visitorName: text("visitor_name"),
  visitorEmail: text("visitor_email"),
  visitorPhone: text("visitor_phone"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessionsTable.id, { onDelete: "cascade" }),
  sender: text("sender").notNull(), // 'visitor' | 'admin'
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
