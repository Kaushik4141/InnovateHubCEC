import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router= Router()
import {getGithubLeaderboard  } from "../controllers/githubleaderboard.controller.js";
import { getLeetcodeLeaderboard} from "../controllers/leetcodeleaderboard.controller.js";
import { privateCache } from "../middlewares/cache.middleware.js";

router.route("/github").get(verifyJWT, privateCache(60), getGithubLeaderboard);
router.route("/leetcode").get(verifyJWT, privateCache(60), getLeetcodeLeaderboard);

export default router;
