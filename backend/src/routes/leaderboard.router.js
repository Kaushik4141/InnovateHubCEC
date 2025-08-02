import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router= Router()
import { githubdata } from "../controllers/github.controller.js";
router.route("/github").get(verifyJWT, githubdata);
export default router;
