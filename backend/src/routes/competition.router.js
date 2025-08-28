import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCompetition, listCompetitions, getCompetitionDetails, deleteCompetition } from "../controllers/competition.controller.js";

const router = Router();

router.post("/create", verifyJWT, createCompetition);
router.get("/", listCompetitions);

router.patch("/:id/details", verifyJWT, getCompetitionDetails);
router.delete("/:id/delete", verifyJWT, deleteCompetition);

export default router;