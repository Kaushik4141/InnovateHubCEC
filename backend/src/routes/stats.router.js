import { Router } from "express";
import { getLandingStats } from "../controllers/stats.controller.js";

const router = Router();
router.route("/landing").get(getLandingStats);

export default router;
