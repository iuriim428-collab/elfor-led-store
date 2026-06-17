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
import analyticsRouter from "./analytics";
import chatRouter from "./chat";
import calcRequestsRouter from "./calc-requests";

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
router.use(analyticsRouter);
router.use(chatRouter);
router.use(calcRequestsRouter);

export default router;
