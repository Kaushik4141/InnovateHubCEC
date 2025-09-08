import { Team } from "../models/team.model.js";
import { Competition } from "../models/competition.model.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import crypto from "crypto";

export const createTeam = async (req, res, next) => {
  try {
    const { teamName, maxMembers } = req.body;
    const competitionId = req.params.competitionId;
    const userId = req.user._id;  

    if (!competitionId || !teamName) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Competition ID and team name are required"));
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Competition not found"));
    }

    if (!competition.isTeamEvent) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "This competition is not a team event"));
    }

    const existingTeam = await Team.findOne({
      competition: competitionId,
      $or: [{ leader: userId }, { members: userId }]
    });

    if (existingTeam) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "You are already part of a team for this competition"));
    }

    const teamNameExists = await Team.findOne({
      competition: competitionId,
      name: teamName
    });

    if (teamNameExists) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Team name already exists for this competition"));
    }

    const invitationCode = crypto.randomBytes(8).toString('hex');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); 

    const team = new Team({
      name: teamName,
      competition: competitionId,
      leader: userId,
      members: [userId], 
      invitationLinks: [{
        code: invitationCode,
        expiresAt: expiryDate,
        isActive: true
      }],
      maxMembers: maxMembers || 4 
    });
    if(!team){
      throw new ApiError(400,"fuck off",e.message)
    }

    await team.save();

   
    if (!competition.aplliedBy.includes(userId)) {
      competition.aplliedBy.push(userId);
      competition.applicationCount += 1;
      await competition.save();
    }

    return res
      .status(201)
      .json(new ApiResponse(201, team, "Team created successfully"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};
export const getTeamDetails = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    
    const team = await Team.findById(teamId)
      .populate('leader', 'fullname email')
      .populate('members', 'fullname email')
      .populate('competition', 'title description');
    
    if (!team) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Team not found"));
    }
    
    return res
      .status(200)
      .json(new ApiResponse(200, team, "Team details fetched successfully"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

export const generateInvitationLink = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Team not found"));
    }
    
    if (team.leader.toString() !== userId.toString()) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Only team leader can generate invitation links"));
    }
    
    const invitationCode = crypto.randomBytes(8).toString('hex');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); 
    
    team.invitationLinks.push({
      code: invitationCode,
      expiresAt: expiryDate,
      isActive: true
    });
    
    await team.save();
    
    return res
      .status(200)
      .json(new ApiResponse(200, { invitationCode }, "Invitation link generated successfully"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

export const joinTeamByInvitation = async (req, res, next) => {
  try {
    const { invitationCode } = req.body;
    const userId = req.user._id;
    const user = req.user;
    
    if (!invitationCode) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invitation code is required"));
    }
    
    const team = await Team.findOne({
      "invitationLinks.code": invitationCode,
      "invitationLinks.isActive": true,
      "invitationLinks.expiresAt": { $gt: new Date() }
    });
    
    if (!team) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Invalid or expired invitation code"));
    }
    
    const existingTeam = await Team.findOne({
      competition: team.competition,
      $or: [{ leader: userId }, { members: userId }]
    });
    
    if (existingTeam) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "You are already part of a team for this competition"));
    }
        if (team.members.length >= team.maxMembers) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Team is already full"));
    }
    
    const requestExists = team.pendingRequests.some(request => 
      request.user.toString() === userId.toString()
    );
    
    if (requestExists) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "You have already requested to join this team"));
    }
    
    team.pendingRequests.push({
      user: userId,
      requestedAt: new Date()
    });
    
    await team.save();
    
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Request to join team sent successfully"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

export const requestToJoinTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Team not found"));
    }
    
    const existingTeam = await Team.findOne({
      competition: team.competition,
      $or: [{ leader: userId }, { members: userId }]
    });
    
    if (existingTeam) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "You are already part of a team for this competition"));
    }
    
    if (team.members.length >= team.maxMembers) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Team is already full"));
    }
    
    const requestExists = team.pendingRequests.some(request => 
      request.user.toString() === userId.toString()
    );
    
    if (requestExists) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "You have already requested to join this team"));
    }
    
    team.pendingRequests.push({
      user: userId,
      requestedAt: new Date()
    });
    
    await team.save();
    
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Request to join team sent successfully"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

export const respondToJoinRequest = async (req, res, next) => {
  try {
    const { teamId, userId, accept } = req.body;
    const leaderId = req.user._id;
    
    if (!teamId || !userId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Team ID and User ID are required"));
    }
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Team not found"));
    }
    
    if (team.leader.toString() !== leaderId.toString()) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Only team leader can accept or reject requests"));
    }
    
    const requestIndex = team.pendingRequests.findIndex(request => 
      request.user.toString() === userId
    );
    
    if (requestIndex === -1) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Request not found"));
    }
    
    team.pendingRequests.splice(requestIndex, 1);
    
    if (accept) {
      if (team.members.length >= team.maxMembers) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Team is already full"));
      }
      
      team.members.push(userId);
      
      const competition = await Competition.findById(team.competition);
      if (!competition.aplliedBy.includes(userId)) {
        competition.aplliedBy.push(userId);
        competition.applicationCount += 1;
        await competition.save();
      }
    }
    
    await team.save();
    
    return res
      .status(200)
      .json(new ApiResponse(200, team, accept ? "Request accepted" : "Request rejected"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

export const searchTeams = async (req, res, next) => {
  try {
    const { competitionId, competition, query } = req.query;
    
    const competitionValue = competitionId || competition;
    
    if (!competitionValue) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Competition ID is required"));
    }
    
    const searchQuery = {
      competition: competitionValue
    };
    
    if (query) {
      searchQuery.name = { $regex: query, $options: 'i' };
    }
    
    const teams = await Team.find(searchQuery)
      .populate('leader', 'fullname email')
      .select('name leader members maxMembers');
    
    return res
      .status(200)
      .json(new ApiResponse(200, teams, "Teams fetched successfully"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

export const leaveTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Team not found"));
    }
    
    if (!team.members.includes(userId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "You are not a member of this team"));
    }
    
    if (team.leader.toString() === userId.toString()) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Team leader cannot leave the team. Transfer leadership or delete the team"));
    }
    
    team.members = team.members.filter(member => member.toString() !== userId.toString());
    await team.save();
    
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Successfully left the team"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { memberId } = req.body;
    const leaderId = req.user._id;
    
    if (!teamId || !memberId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Team ID and Member ID are required"));
    }
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Team not found"));
    }
    
    if (team.leader.toString() !== leaderId.toString()) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Only team leader can remove members"));
    }
    
    if (!team.members.includes(memberId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User is not a member of this team"));
    }
    
    if (memberId.toString() === leaderId.toString()) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Team leader cannot be removed. Transfer leadership first"));
    }
    
    team.members = team.members.filter(member => member.toString() !== memberId.toString());
    await team.save();
    
    return res
      .status(200)
      .json(new ApiResponse(200, team, "Member removed successfully"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};