import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const router: IRouter = Router();

const DOC_KEYS = {
  privacy: {
    path: "doc_privacy_path",
    filename: "doc_privacy_filename",
    updated: "doc_privacy_updated",
  },
  offer: {
    path: "doc_offer_path",
    filename: "doc_offer_filename",
    updated: "doc_offer_updated",
  },
};

async function getSetting(key: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, key));
  return rows[0]?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(siteSettingsTable)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettingsTable.key,
      set: { value, updatedAt: new Date() },
    });
}

router.get("/documents", async (req, res): Promise<void> => {
  const keys = [
    DOC_KEYS.privacy.path, DOC_KEYS.privacy.filename, DOC_KEYS.privacy.updated,
    DOC_KEYS.offer.path, DOC_KEYS.offer.filename, DOC_KEYS.offer.updated,
  ];

  const rows = await db
    .select()
    .from(siteSettingsTable)
    .where(inArray(siteSettingsTable.key, keys));

  const map: Record<string, string> = {};
  rows.forEach((r) => { if (r.value) map[r.key] = r.value; });

  res.json({
    privacy: {
      objectPath: map[DOC_KEYS.privacy.path] ?? null,
      filename: map[DOC_KEYS.privacy.filename] ?? null,
      updatedAt: map[DOC_KEYS.privacy.updated] ?? null,
    },
    offer: {
      objectPath: map[DOC_KEYS.offer.path] ?? null,
      filename: map[DOC_KEYS.offer.filename] ?? null,
      updatedAt: map[DOC_KEYS.offer.updated] ?? null,
    },
  });
});

router.post("/documents/:type", async (req, res): Promise<void> => {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "elfor2024";
  const authHeader = req.headers["x-admin-password"] as string | undefined;
  if (authHeader !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { type } = req.params as { type: string };
  const keys = DOC_KEYS[type as keyof typeof DOC_KEYS];
  if (!keys) {
    res.status(400).json({ error: "Invalid document type. Use 'privacy' or 'offer'." });
    return;
  }

  const { objectPath, filename } = req.body as { objectPath: string; filename?: string };
  if (typeof objectPath !== "string") {
    res.status(400).json({ error: "objectPath is required" });
    return;
  }

  const now = new Date().toISOString();
  await setSetting(keys.path, objectPath);
  if (filename) await setSetting(keys.filename, filename);
  await setSetting(keys.updated, now);

  res.json({ objectPath, filename: filename ?? null, updatedAt: now });
});

export default router;
