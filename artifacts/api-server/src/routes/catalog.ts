import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const CATALOG_PATH_KEY = "catalog_object_path";
const CATALOG_FILENAME_KEY = "catalog_filename";
const CATALOG_UPDATED_KEY = "catalog_updated_at";
const CATALOG_VISIBLE_KEY = "catalog_is_visible";

async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
  return rows[0]?.value ?? null;
}

router.get("/catalog", async (req, res): Promise<void> => {
  const objectPath = await getSetting(CATALOG_PATH_KEY);

  if (!objectPath) {
    res.json({ objectPath: null, filename: null, updatedAt: null, isVisible: false });
    return;
  }

  const filename = await getSetting(CATALOG_FILENAME_KEY);
  const updatedAt = await getSetting(CATALOG_UPDATED_KEY);
  const visibilityValue = await getSetting(CATALOG_VISIBLE_KEY);

  res.json({
    objectPath,
    filename,
    updatedAt,
    isVisible: visibilityValue !== "false",
  });
});

router.post("/catalog", async (req, res): Promise<void> => {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "elfor2024";
  const authHeader = req.headers["x-admin-password"] as string | undefined;
  if (authHeader !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { objectPath, filename, isVisible } = req.body as {
    objectPath?: string;
    filename?: string;
    isVisible?: boolean;
  };

  if (typeof objectPath === "string" && objectPath.trim() === "") {
    await db
      .insert(siteSettingsTable)
      .values([
        { key: CATALOG_PATH_KEY, value: "", updatedAt: new Date() },
        { key: CATALOG_FILENAME_KEY, value: "", updatedAt: new Date() },
        { key: CATALOG_UPDATED_KEY, value: "", updatedAt: new Date() },
        { key: CATALOG_VISIBLE_KEY, value: "false", updatedAt: new Date() },
      ])
      .onConflictDoUpdate({
        target: siteSettingsTable.key,
        set: { value: "", updatedAt: new Date() },
      });

    res.json({ objectPath: null, filename: null, updatedAt: null, isVisible: false });
    return;
  }

  if (typeof objectPath === "string" && objectPath.trim() !== "") {
    const now = new Date().toISOString();

    await db
      .insert(siteSettingsTable)
      .values({ key: CATALOG_PATH_KEY, value: objectPath, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: objectPath, updatedAt: new Date() } });

    if (typeof filename === "string") {
      await db
        .insert(siteSettingsTable)
        .values({ key: CATALOG_FILENAME_KEY, value: filename, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: filename, updatedAt: new Date() } });
    }

    const nextVisible =
      typeof isVisible === "boolean"
        ? isVisible
        : (await getSetting(CATALOG_VISIBLE_KEY)) !== "false";

    await db
      .insert(siteSettingsTable)
      .values({ key: CATALOG_UPDATED_KEY, value: now, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: now, updatedAt: new Date() } });

    await db
      .insert(siteSettingsTable)
      .values({ key: CATALOG_VISIBLE_KEY, value: String(nextVisible), updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: String(nextVisible), updatedAt: new Date() } });

    res.json({ objectPath, filename: filename ?? (await getSetting(CATALOG_FILENAME_KEY)), updatedAt: now, isVisible: nextVisible });
    return;
  }

  if (typeof isVisible === "boolean") {
    const currentObjectPath = await getSetting(CATALOG_PATH_KEY);
    if (!currentObjectPath) {
      res.status(400).json({ error: "catalog file is required before changing visibility" });
      return;
    }

    await db
      .insert(siteSettingsTable)
      .values({ key: CATALOG_VISIBLE_KEY, value: String(isVisible), updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: String(isVisible), updatedAt: new Date() } });

    res.json({
      objectPath: currentObjectPath,
      filename: await getSetting(CATALOG_FILENAME_KEY),
      updatedAt: await getSetting(CATALOG_UPDATED_KEY),
      isVisible,
    });
    return;
  }

  res.status(400).json({ error: "objectPath or isVisible is required" });
});

export default router;
