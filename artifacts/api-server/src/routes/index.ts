import { Router, type IRouter } from "express";
import healthRouter from "./health";
import applicationsRouter from "./applications";
import adminRouter from "./admin";
import visitorsRouter from "./visitors";
import leadsRouter from "./leads";
import pageviewsRouter from "./pageviews";
import announcementsRouter from "./announcements";
import extractUrlRouter from "./extract-url";
import khaataRouter from "./khaata";
import cametiRouter from "./cameti";

const router: IRouter = Router();

router.use(healthRouter);
router.use(applicationsRouter);
router.use(adminRouter);
router.use(visitorsRouter);
router.use(leadsRouter);
router.use(pageviewsRouter);
router.use(announcementsRouter);
router.use(extractUrlRouter);
router.use(khaataRouter);
router.use(cametiRouter);

export default router;
