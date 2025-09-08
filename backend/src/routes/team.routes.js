import { Router } from "express";
import {
  createTeam,
  getTeamDetails,
  generateInvitationLink,
  joinTeamByInvitation,
  requestToJoinTeam,
  respondToJoinRequest,
  searchTeams,
  leaveTeam,
  removeMember
} from "../controllers/team.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.post("/:competitionId/create", createTeam);
router.get("/details/:teamId", getTeamDetails);
router.post("/invite/:teamId", generateInvitationLink);
router.post("/join/invitation", joinTeamByInvitation);
router.post("/join/request/:teamId", requestToJoinTeam);
router.post("/request/respond", respondToJoinRequest);
router.get("/search", searchTeams);
router.post("/leave/:teamId", leaveTeam);
router.post("/remove-member/:teamId", removeMember);

export default router;