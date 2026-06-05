import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const CATALOG_PATH_KEY = "catalog_object_path";
const CATALOG_FILENAME_KEY = "catalog_filename";
const CATALOG_UPDATED_KEY = "catalog_updated_at";

router.get("/catalog", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(siteSettingsTable)
    .where(
      eq(siteSettingsTable.key, CATALOG_PATH_KEY)
    );

  if (rows.length === 0 || !rows[0].value) {
    res.json({ objectPath: null, filename: null, updatedAt: null });
    return;
  }

  const filenameRows = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, CATALOG_FILENAME_KEY));

  const updatedRows = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, CATALOG_UPDATED_KEY));

  res.json({
    objectPath: rows[0].value,
    filename: filenameRows[0]?.value ?? null,
    updatedAt: updatedRows[0]?.value ?? rows[0].updatedAt.toISOString(),
  });
});

router.post("/catalog", async (req, res): Promise<void> => {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "elfor2024";
  const authHeader = req.headers["x-admin-password"] as string | undefined;
  if (authHeader !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { objectPath, filename } = req.body as { objectPath: string; filename?: string };
  if (!objectPath || typeof objectPath !== "string") {
    res.status(400).json({ error: "objectPath is required" });
    return;
  }

  const now = new Date().toISOString();

  await db
    .insert(siteSettingsTable)
    .values({ key: CATALOG_PATH_KEY, value: objectPath, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: objectPath, updatedAt: new Date() } });

  if (filename) {
    await db
      .insert(siteSettingsTable)
      .values({ key: CATALOG_FILENAME_KEY, value: filename, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: filename, updatedAt: new Date() } });
  }

  await db
    .insert(siteSettingsTable)
    .values({ key: CATALOG_UPDATED_KEY, value: now, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: now, updatedAt: new Date() } });

  res.json({ objectPath, filename: filename ?? null, updatedAt: now });
});

export default router;
