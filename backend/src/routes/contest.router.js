import { Router } from "express";
import { verifyJWT, requireAdmin } from "../middlewares/auth.middleware.js";
import {
  createContest,
  listContests,
  getContest,
  addProblem,
  getProblem,
  submitSolution,
  getLeaderboard,
  listProblems,
  attachExistingProblem,
  attachExistingProblemsBulk,
  runCustomTest,
  getMyProblemStatus,
  getUserSubmissions
} from "../controllers/contest.controller.js";

const router = Router();

router.get("/", listContests);
router.post("/", verifyJWT, requireAdmin, createContest);
router.get("/problems", verifyJWT, requireAdmin, listProblems);
router.get("/:id", getContest);

router.post("/:contestId/problems", verifyJWT, requireAdmin, addProblem);
router.get("/:contestId/problems/:problemId", verifyJWT, getProblem);
router.post("/:contestId/problems/:problemId/attach", verifyJWT, requireAdmin, attachExistingProblem);
router.post("/:contestId/problems/attach-bulk", verifyJWT, requireAdmin, attachExistingProblemsBulk);
router.post("/:contestId/problems/:problemId/run", verifyJWT, runCustomTest);
router.get("/:contestId/problems/:problemId/my-status", verifyJWT, getMyProblemStatus);

router.post("/:contestId/problems/:problemId/submit", verifyJWT, submitSolution);
router.get("/:contestId/leaderboard", getLeaderboard);
router.get("/:contestId/users/:userId/submissions", verifyJWT, getUserSubmissions);

export default router;
