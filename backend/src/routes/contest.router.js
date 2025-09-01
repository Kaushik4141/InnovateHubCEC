import { Router } from "express";
import { verifyJWT, requireAdmin } from "../middlewares/auth.middleware.js";
import {
  createContest,
  listContests,
  getContest,
  addProblem,
  getProblem,
  submitSolution,
  getLeaderboard
} from "../controllers/contest.controller.js";

const router = Router();

router.get("/", listContests);
router.post("/", verifyJWT, requireAdmin, createContest);
router.get("/:id", getContest);

router.post("/:contestId/problems", verifyJWT, requireAdmin, addProblem);
router.get("/:contestId/problems/:problemId", verifyJWT, getProblem);

router.post("/:contestId/problems/:problemId/submit", verifyJWT, submitSolution);
router.get("/:contestId/leaderboard", getLeaderboard);

export default router;
