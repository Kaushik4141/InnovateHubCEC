import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router= Router()
import {getGithubLeaderboard  } from "../controllers/githubleaderboard.controller.js";
import { getLeetcodeLeaderboard} from "../controllers/leetcodeleaderboard.controller.js";

router.route("/github").get(verifyJWT, getGithubLeaderboard);
router.route("/leetcode").get(verifyJWT, getLeetcodeLeaderboard);

export default router;
