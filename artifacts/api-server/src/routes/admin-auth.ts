import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/admin/auth", (req, res): void => {
  const { password } = req.body ?? {};
  const adminPassword = process.env.ADMIN_PASSWORD ?? "elfor2024";

  if (!password || typeof password !== "string") {
    res.status(400).json({ ok: false, message: "Пароль не указан" });
    return;
  }

  if (password === adminPassword) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, message: "Неверный пароль" });
  }
});

export default router;
