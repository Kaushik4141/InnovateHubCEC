import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCompetition, listCompetitions, getCompetitionDetails, deleteCompetition, applyToCompetition } from "../controllers/competition.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/create").post(
    upload.fields([
        { name: "coverImage", maxCount: 1 }
    ]),
    verifyJWT, createCompetition);
router.get("/", listCompetitions);

router.patch("/:id/details", verifyJWT, getCompetitionDetails);
router.delete("/:id/delete", verifyJWT, deleteCompetition);
router.post("/:id/apply", verifyJWT, applyToCompetition);

export default router;