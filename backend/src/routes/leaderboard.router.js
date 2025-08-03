import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router= Router()
import {getGithubLeaderboard  } from "../controllers/githubleaderboard.controller.js";
router.route("/github").get(verifyJWT, getGithubLeaderboard);
export default router;
