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
import documentsRouter from "./documents";
import catalogLeadsRouter from "./catalog-leads";
import settingsRouter from "./settings";

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
router.use(documentsRouter);
router.use(catalogLeadsRouter);
router.use(settingsRouter);

export default router;
