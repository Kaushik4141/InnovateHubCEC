import { Router } from "express";
import { verifyJWT, requireAdmin } from "../middlewares/auth.middleware.js";
import { createCompetition, listCompetitions, getCompetitionDetails, deleteCompetition, applyToCompetition, verifyParticipant } from "../controllers/competition.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/create").post(
    upload.fields([
        { name: "coverImage", maxCount: 1 }
    ]),
    verifyJWT, requireAdmin, createCompetition);
router.get("/", listCompetitions);

router.get("/:id/details", verifyJWT, getCompetitionDetails);
router.delete("/:id/delete", verifyJWT, requireAdmin, deleteCompetition);
router.post("/:id/apply", verifyJWT, applyToCompetition);
router.post("/verify-participant", verifyJWT, requireAdmin, verifyParticipant);

export default router;