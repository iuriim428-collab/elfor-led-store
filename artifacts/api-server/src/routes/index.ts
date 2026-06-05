import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import articlesRouter from "./articles";
import ordersRouter from "./orders";
import statsRouter from "./stats";
import adminAuthRouter from "./admin-auth";
import storageRouter from "./storage";
import catalogRouter from "./catalog";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(articlesRouter);
router.use(ordersRouter);
router.use(statsRouter);
router.use(adminAuthRouter);
router.use(storageRouter);
router.use(catalogRouter);

export default router;
