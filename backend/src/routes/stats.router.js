import { Router } from "express";
import { getLandingStats } from "../controllers/stats.controller.js";
import { publicCache } from "../middlewares/cache.middleware.js";

const router = Router();
router.route("/landing").get(publicCache(60), getLandingStats);

export default router;
