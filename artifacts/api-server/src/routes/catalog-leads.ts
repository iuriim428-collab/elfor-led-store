import { Router } from "express";
import { db } from "@workspace/db";
import { catalogLeadsTable } from "@workspace/db/schema";

const router = Router();

router.post("/catalog-leads", async (req, res) => {
  const { phone, email } = req.body ?? {};

  if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
    return res.status(400).json({ ok: false, message: "Укажите телефон" });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ ok: false, message: "Укажите email" });
  }

  await db.insert(catalogLeadsTable).values({
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
  });

  return res.json({ ok: true });
});

export default router;
