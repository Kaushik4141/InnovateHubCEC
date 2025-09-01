import { Router } from "express";
import { verifyJWT, requireAdmin } from "../middlewares/auth.middleware.js";
import { createCompetition, listCompetitions, getCompetitionDetails, deleteCompetition, applyToCompetition } from "../controllers/competition.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/create").post(
    upload.fields([
        { name: "coverImage", maxCount: 1 }
    ]),
    verifyJWT, requireAdmin, createCompetition);
router.get("/", listCompetitions);

router.patch("/:id/details", verifyJWT, getCompetitionDetails);
router.delete("/:id/delete", verifyJWT, requireAdmin, deleteCompetition);
router.post("/:id/apply", verifyJWT, applyToCompetition);

export default router;