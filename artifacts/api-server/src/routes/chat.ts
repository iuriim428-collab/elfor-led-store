import { Router, type IRouter } from "express";
import { eq, desc, asc } from "drizzle-orm";
import { db, chatSessionsTable, chatMessagesTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// Visitor: start or resume session by token
router.post("/chat/sessions", async (req, res): Promise<void> => {
  const { visitorName, visitorEmail, visitorPhone } = req.body as Record<string, string>;
  const token = randomUUID();
  const [session] = await db
    .insert(chatSessionsTable)
    .values({ token, visitorName, visitorEmail, visitorPhone })
    .returning();
  res.status(201).json(session);
});

// Visitor: get session by token
router.get("/chat/sessions/by-token/:token", async (req, res): Promise<void> => {
  const [session] = await db
    .select()
    .from(chatSessionsTable)
    .where(eq(chatSessionsTable.token, req.params.token))
    .limit(1);
  if (!session) { res.status(404).json({ error: "Not found" }); return; }
  res.json(session);
});

// Visitor: get messages for session
router.get("/chat/sessions/by-token/:token/messages", async (req, res): Promise<void> => {
  const [session] = await db
    .select()
    .from(chatSessionsTable)
    .where(eq(chatSessionsTable.token, req.params.token))
    .limit(1);
  if (!session) { res.status(404).json({ error: "Not found" }); return; }
  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.sessionId, session.id))
    .orderBy(asc(chatMessagesTable.createdAt));
  res.json(messages);
});

// Visitor: send message
router.post("/chat/sessions/by-token/:token/messages", async (req, res): Promise<void> => {
  const { text } = req.body as { text: string };
  if (!text?.trim()) { res.status(400).json({ error: "Text required" }); return; }
  const [session] = await db
    .select()
    .from(chatSessionsTable)
    .where(eq(chatSessionsTable.token, req.params.token))
    .limit(1);
  if (!session) { res.status(404).json({ error: "Not found" }); return; }
  const [msg] = await db
    .insert(chatMessagesTable)
    .values({ sessionId: session.id, sender: "visitor", text: text.trim() })
    .returning();
  await db
    .update(chatSessionsTable)
    .set({ lastMessageAt: new Date() })
    .where(eq(chatSessionsTable.id, session.id));
  res.status(201).json(msg);
});

// Admin: list all sessions
router.get("/chat/sessions", async (req, res): Promise<void> => {
  const sessions = await db
    .select()
    .from(chatSessionsTable)
    .orderBy(desc(chatSessionsTable.lastMessageAt));
  res.json(sessions);
});

// Admin: get messages for session by id
router.get("/chat/sessions/:id/messages", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.sessionId, id))
    .orderBy(asc(chatMessagesTable.createdAt));
  res.json(messages);
});

// Admin: reply to session
router.post("/chat/sessions/:id/messages", async (req, res): Promise<void> => {
  const { text } = req.body as { text: string };
  if (!text?.trim()) { res.status(400).json({ error: "Text required" }); return; }
  const id = parseInt(req.params.id);
  const [msg] = await db
    .insert(chatMessagesTable)
    .values({ sessionId: id, sender: "admin", text: text.trim() })
    .returning();
  await db
    .update(chatSessionsTable)
    .set({ lastMessageAt: new Date(), status: "open" })
    .where(eq(chatSessionsTable.id, id));
  res.status(201).json(msg);
});

// Admin: close session
router.put("/chat/sessions/:id/status", async (req, res): Promise<void> => {
  const { status } = req.body as { status: string };
  const [session] = await db
    .update(chatSessionsTable)
    .set({ status })
    .where(eq(chatSessionsTable.id, parseInt(req.params.id)))
    .returning();
  res.json(session);
});

export default router;
