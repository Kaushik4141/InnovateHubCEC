import { Competition } from "../models/competition.model.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createCompetition = async (req, res, next) => {
  if (!req.user.isAdmin) {
   return res
   .status(403)
   .json(new ApiResponse(403, null, "Forbidden: Admins only"))
  
  } else {
    try {
      const { title, description, startDate, endDate, link, teamsize, Prize, Tag, Reqirements, isTeamEvent } = req.body;

      if (!title || !description || !startDate || !endDate || !link || !Tag || !Reqirements) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              "All required fields must be provided"
            )
          );
      }

      const coverimageLocalPath =
        req.files && req.files.coverImage && req.files.coverImage[0]
          ? req.files.coverImage[0].path
          : null;
      let coverimageUrl;
      if (coverimageLocalPath) {
        const coverImage = await uploadOnCloudinary(coverimageLocalPath);
        coverimageUrl = coverImage?.secure_url;
      }
      const competition = new Competition({
        title,
        description,
        startDate,
        endDate,
        link,
        teamsize,
        Prize,
        Tag,
        Reqirements,
        isTeamEvent: isTeamEvent === 'true',
        ...(coverimageUrl && { coverImage: coverimageUrl }),
      });

      await competition.save();
      return res
        .status(200)
        .json(
          new ApiResponse(200, competition, "Competition created successfully")
        );
    } catch (err) {
      throw new ApiError(500, err.message, "bhai err");
    }
  }
};

export const listCompetitions = async (req, res, next) => {
  try {
    const competitions = await Competition.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json(
        new ApiResponse(200, competitions, "Competitions fetched successfully")
      );
  } catch (e) {
    throw new ApiError(500, e.message);
  }
};
export const applyToCompetition = async (req, res, next) => {
  try {
    const competitionId = req.params.id;
    const userId = req.user._id;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Competition not found"));
    }

    if (competition.aplliedBy.includes(userId)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "You have already applied to this competition"
          )
        );
    }

    competition.aplliedBy.push(userId);
    competition.applicationCount += 1;
    await competition.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, competition, "Applied to competition successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message);
  }
};

export const getCompetitionDetails = async (req, res, next) => {
  try {
    const competitionId = req.params.id;
    const competition = await Competition.findById(competitionId).populate(
      "aplliedBy",
      "fullname email"
    );
    if (!competition) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Competition not found"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          competition,
          "Competition details fetched successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, err.message);
  }
};
export const deleteCompetition = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Forbidden: Admins only"));
  } else {
    try {
      const competitionId = req.params.id;
      const competition = await Competition.findByIdAndDelete(competitionId);
      if (!competition) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Competition not found"));
      }
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Competition deleted successfully"));
    } catch (err) {
      throw new ApiError(500, err.message);
    }
  }
};

export const verifyParticipant = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Forbidden: Admins only"));
  }
  
  try {
    const { userId, competitionId } = req.body;
    
    if (!userId || !competitionId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User ID and Competition ID are required"));
    }
    
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Competition not found"));
    }
    
    const isRegistered = competition.aplliedBy.includes(userId);
    
    return res
      .status(200)
      .json(new ApiResponse(
        200, 
        { isRegistered, competitionTitle: competition.title }, 
        isRegistered ? "User is registered for this competition" : "User is not registered for this competition"
      ));
  } catch (err) {
    throw new ApiError(500, err.message);
  }
};
