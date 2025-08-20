import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validatebeforeSave: false });
    return { accessToken, refreshToken, newRefreshToken: refreshToken };
  } catch (error) {
    throw new ApiError("Error generating tokens", 500);
  }
};

const googleAuth = asyncHandler(async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      throw new ApiError(400, "Missing Google ID token");
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const emailVerified = payload.email_verified;
    const name = payload.name || payload.given_name || email?.split("@")[0];
    const picture = payload.picture;

    if (!email) {
      throw new ApiError(400, "Google account missing email");
    }

    if (emailVerified === false) {
      throw new ApiError(400, "Google email not verified");
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      let fullname = (name || email.split("@")[0]).trim();
      if (!fullname) fullname = email.split("@")[0];
      let suffix = 0;
      while (true) {
        const exists = await User.findOne({ fullname });
        if (!exists) break;
        suffix += 1;
        fullname = `${name}-${suffix}`;
      }

      user = await User.create({
        fullname,
        email,
        provider: 'google',
        googleId,
        isVerified: true,
        onboardingCompleted: false,
        ...(picture ? { avatar: picture } : {})
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      user.provider = 'google';
      user.isVerified = true;
      if (picture && (!user.avatar || user.avatar.includes('default_avatar'))) {
        user.avatar = picture;
      }
      await user.save({ validatebeforeSave: false });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const safeUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, { user: safeUser, accessToken, refreshToken }, "Google auth successful"));
  } catch (e) {
    throw new ApiError(400, e.message || "Google auth failed");
  }
});

const completeOnboarding = asyncHandler(async (req, res) => {
  const { usn, year, fullname } = req.body || {};
  if (!usn || !year) {
    throw new ApiError(400, "USN and year are required to complete onboarding");
  }
  const u = await User.findById(req.user._id);
  if (!u) throw new ApiError(404, "User not found");
  if (fullname) u.fullname = fullname;
  u.usn = usn;
  u.year = Number(year);
  u.onboardingCompleted = true;
  await u.save();
  const safeUser = await User.findById(u._id).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, safeUser, "Onboarding completed"));
});

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    //data from frontend
    //validation
    //check if user already exists:usn,email
    //check for avatar image
    //upload avatar for cloudinary
    //create user object - create user in db
    //remove password and refresh token from response
    //check if user is created successfully
    //return response

    const { fullname, email, usn, password, year } = req.body;

    if (!fullname || !email || !usn || !password || !year) {
      throw new ApiError("Please provide all required fields", 400);
    }
    const existeduser = await User.findOne({
      $or: [{ email }, { usn }],
    });
    if (existeduser) {
      throw new ApiError("User already exists", 409);
    }
    const avatarLocalPath =
      req.files && req.files.avatar && req.files.avatar[0]
        ? req.files.avatar[0].path
        : null;
    const coverimageLocalPath =
      req.files && req.files.coverimage && req.files.coverimage[0]
        ? req.files.coverimage[0].path
        : null;
    let avatarUrl, coverimageUrl;

    if (avatarLocalPath) {
      const avatar = await uploadOnCloudinary(avatarLocalPath);
      avatarUrl = avatar?.secure_url;
    }
    if (coverimageLocalPath) {
      const coverimage = await uploadOnCloudinary(coverimageLocalPath);
      coverimageUrl = coverimage?.secure_url;
    }

    const user = await User.create({
      fullname,
      email,
      usn,
      year,
      password,
      ...(avatarUrl && { avatar: avatarUrl }),
      ...(coverimageUrl && { coverimage: coverimageUrl }),
    });
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    const createduserid = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createduserid) {
      throw new ApiError("User not created", 500);
    }
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };
    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, {
        user: createduserid,
        accessToken,
        refreshToken
      }, "User registered successfully"));
  }

  catch (e) {
    throw new ApiError(400, e.message || "User registration failed");
  }
});

const loginuser = asyncHandler(async (req, res, next) => {
  try {
    //data from frontend
    //validation by email
    //check if user exists email
    //check password
    //access and refresh token
    //send cokiees
    //return response
    const { email, password } = req.body;
    if (!email) {
      throw new ApiError("Please provide email", 400);
    }
    if (!password) {
      throw new ApiError("Please provide password", 400);
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    const isPasswordMatched = await user.isPasswordCorrect(password);
    if (!isPasswordMatched) {
      throw new ApiError("Invalid password", 401);
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    const loginuser = await User.findByIdAndUpdate(user._id).select(
      "-password -refreshToken"
    );
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            user: loginuser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully"
        )
      );
  }
  catch (e) {
    throw new ApiError(400, e.message || "User login failed");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true }
    );
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/'
    };
    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, {}, "User logged Out"))
  } catch (e) {
    throw new ApiError(500, e.message || "User logout failed");
  }
})

const refreshAccessToken = asyncHandler(async (req, res) => {

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")

    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})

const changeCurrrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Please provide current and new password")
  }
  const user = await User.findById(req.user._id)
  if (!user) {
    throw new ApiError(404, "User not found")
  }
  const isPasswordMatched = await user.isPasswordCorrect(currentPassword)
  if (!isPasswordMatched) {
    throw new ApiError(401, "Current password is incorrect")
  }
  user.password = newPassword
  await user.save({ validatebeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getcurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email, usn, year, skills, linkedin, github, leetcode, certifications, projects, bio, achievements, otherLinks } = req.body;
  if (!fullname || !email || !usn || !year) {
    throw new ApiError("Please provide all required fields", 400);
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { fullname, email, usn, year, skills, linkedin, github, leetcode, certifications, projects, bio, achievements, otherLinks },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar")

  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const getUserProfile = asyncHandler(async (req, res) => {
  const { fullname } = req.params

  if (!fullname?.trim()) {
    throw new ApiError(400, "username is missing")
  }

  const profile = await User.aggregate([
    {
      $match: {
        fullname: fullname.trim()
      }
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "following",
        as: "followers"
      }
    },
    {
      $lookup: {
        from: "followings",
        localField: "_id",
        foreignField: "follower",
        as: "followings"
      }
    },
    {
      $addFields: {
        followersCount: {
          $size: "$followers"
        },
        followingCount: {
          $size: "$followings"
        },
        isfollower: {
          $cond: {
            if: { $in: [req.user?._id, "$followers.follower"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullname: 1,
        followersCount: 1,
        followingCount: 1,
        isfollower: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        usn: 1,
        year: 1,
        skills: 1,
        linkedin: 1,
        github: 1,
        leetcode: 1,
        certifications: 1,
        projects: 1,
        bio: 1,
        achievements: 1,
        otherLinks: 1,
        createdAt: 1,
        updatedAt: 1,


        //still fields are to be added

      }
    }
  ])

  if (!profile?.length) {
    throw new ApiError(404, "channel does not exists")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, profile[0], "User channel fetched successfully")
    )
})

const requestFollow = asyncHandler(async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.id;

    if (fromUserId.equals(toUserId))
      return res
        .status(400)
        .json(new ApiError(400, { error: "You can't follow yourself." }, "You can't follow yourself."));

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res
        .status(404)
        .json(new ApiError(404, { error: "User not found." }, "User not found."));
    }

    if (toUser.followRequests.includes(fromUserId) || toUser.followers.includes(fromUserId)) {
      return res
        .status(400)
        .json(new ApiError(400, { error: "Already requested or following." }, "Already requested or following."));
    }

    toUser.followRequests.push(fromUserId);
    toUser.notifications.push({ type: 'follow-request', from: fromUserId });
    await toUser.save();

    res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Follow request sent successfully"));
  } catch (e) {
    throw new ApiError(500, e.message || "Failed to follow user");
  }
});

const acceptFollow = asyncHandler(async (req, res) => {
  try {
    const myUserId = req.user._id;
    const fromUserId = req.params.id;

    const me = await User.findById(myUserId);
    const fromUser = await User.findById(fromUserId);

    if (!me || !fromUser)
      return res
        .status(404)
        .json(new ApiError(404, { error: "User not found." }, "User not found."));

    me.followRequests = me.followRequests.filter(id => !id.equals(fromUserId));
    if (!me.followers.includes(fromUserId)) me.followers.push(fromUserId);
    if (!fromUser.following.includes(myUserId)) fromUser.following.push(myUserId);

    await me.save();
    await fromUser.save();

    res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Follow request accepted successfully"));
  } catch (e) {
    throw new ApiError(500, e.message || "Failed to accept follow request");
  }
});

const rejectFollow = asyncHandler(async (req, res) => {
  try {
    const myUserId = req.user._id;
    const fromUserId = req.params.id;

    const me = await User.findById(myUserId);
    const fromUser = await User.findById(fromUserId);

    if (!me || !fromUser)
      return res
        .status(404)
        .json(new ApiError(404, { error: "User not found." }, "User not found."));

    me.followRequests = me.followRequests.filter(id => !id.equals(fromUserId));
    await me.save();

    res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Follow request rejected successfully"));
  } catch (e) {
    throw new ApiError(500, e.message || "Failed to reject follow request");
  }
});

const getNotifications = asyncHandler(async (req, res) => {
  try {
    const me = await User
      .findById(req.user._id)
      .populate('notifications.from', 'fullname avatar');
    res
      .status(200)
      .json(new ApiResponse(200, { notifications: me.notifications }, "Notifications fetched successfully"));
  } catch (e) {
    throw new ApiError(500, e.message || "Failed to fetch notifications");
  }
});

const alive = asyncHandler(async (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is alive!' });
});

const searchUsers = asyncHandler(async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.status(200).json(new ApiResponse(200, [], "OK"));
    }
    const meId = req.user?._id;
    const regex = new RegExp(q, "i");
    const users = await User.find({
      $and: [
        { _id: { $ne: meId } },
        { $or: [{ fullname: regex }, { email: regex }, { usn: regex }] },
      ],
    })
      .select("_id fullname avatar")
      .limit(20);
    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users fetched successfully"));
  } catch (e) {
    throw new ApiError(500, e.message || "Failed to search users");
  }
});
const getUserMin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const u = await User.findById(id).select("_id fullname avatar");
    if (!u) {
      return res
        .status(404)
        .json(new ApiError(404, { error: "User not found." }, "User not found."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, u, "User fetched successfully"));
  } catch (e) {
    throw new ApiError(500, e.message || "Failed to fetch user");
  }
});
const getNetworkStats = asyncHandler(async (req, res) => {
  try{
  const userId = req.user._id;
  
  const user = await User.findById(userId)
    .populate('followers', 'fullname')
    .populate('following', 'fullname')
    .populate('followRequests', 'fullname');

  const stats = {
    connections: user.followers.length + user.following.length,
    pendingInvitations: user.followRequests.length,
    followers: user.followers.length,
    following: user.following.length
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Network stats retrieved successfully")
  );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch network stats");
  }
});


const getConnections = asyncHandler(async (req, res) => {
  try{
  const userId = req.user._id;
  const { search } = req.query;

  const user = await User.findById(userId)
    .populate({
      path: 'followers following',
      select: 'fullname email year avatar skills bio linkedin github leetcode',
      match: search ? { fullname: { $regex: search, $options: 'i' } } : {}
    });
    //followers and following issues
  const connectionsMap = new Map();
  
  [...user.followers, ...user.following].forEach(connection => {
    if (connection && !connectionsMap.has(connection._id.toString())) {
      connectionsMap.set(connection._id.toString(), {
        ...connection.toObject(),
        isOnline: Math.random() > 0.5, // Mock online status for now
        lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    }
  });

  const connections = Array.from(connectionsMap.values());

  return res.status(200).json(
    new ApiResponse(200, connections, "Connections retrieved successfully")
  );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch connections");
  }
});

const getConnectionSuggestions = asyncHandler(async (req, res) => {
  try{
  const userId = req.user._id;
  const { search, limit = 10 } = req.query;

  const user = await User.findById(userId);
  const connectedUserIds = [...user.followers, ...user.following, userId];

  const matchQuery = {
    _id: { $nin: connectedUserIds },
    ...(search && { fullname: { $regex: search, $options: 'i' } })
  };

  const suggestions = await User.find(matchQuery)
    .select('fullname email year avatar skills bio linkedin github leetcode')
    .limit(parseInt(limit));

  
  const enrichedSuggestions = await Promise.all(
    suggestions.map(async (suggestion) => {
      const mutualConnections = await User.findById(suggestion._id)
        .populate({
          path: 'followers following',
          match: { _id: { $in: [...user.followers, ...user.following] } }
        });

      const mutualCount = new Set([
        ...mutualConnections.followers.map(f => f._id.toString()),
        ...mutualConnections.following.map(f => f._id.toString())
      ]).size;

      return {
        ...suggestion.toObject(),
        mutualConnections: mutualCount,
        reason: getSuggestionReason(suggestion, user)
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(200, enrichedSuggestions, "Connection suggestions retrieved successfully")
  );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch connection suggestions");
  }
});



const getPendingRequests = asyncHandler(async (req, res) => {
  try{
  const userId = req.user._id;

  const user = await User.findById(userId)
    .populate({
      path: 'notifications.from',
      select: 'fullname email year avatar skills bio'
    });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const requests = user.notifications
    .filter(notification => 
      notification.type === 'follow-request' && 
      !notification.read &&
      notification.from
    )
    .map(notification => ({
      _id: notification._id,
      from: notification.from,
      date: notification.date,
      type: notification.type,
      read: notification.read
    }));

  return res.status(200).json(
    new ApiResponse(200, requests, "Pending requests retrieved successfully")
  );
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    throw new ApiError(500, "Failed to fetch pending requests");
  }
});


const getSuggestionReason = (suggestion, currentUser) => {
  if (suggestion.skills && currentUser.skills) {
    const commonSkills = suggestion.skills.filter(skill => 
      currentUser.skills.includes(skill)
    );
    if (commonSkills.length > 0) {
      return `Similar skills: ${commonSkills.slice(0, 2).join(', ')}`;
    }
  }

  if (suggestion.year === currentUser.year) {
    return `Same year student`;
  }

  if (suggestion.github && currentUser.github) {
    return `Active on GitHub`;
  }

  return `Suggested for you`;
};

export { registerUser, loginuser, logoutUser, refreshAccessToken, getcurrentUser, changeCurrrentPassword, updateAccountDetails, updateUserAvatar, getUserProfile, requestFollow, acceptFollow, rejectFollow, alive, getNotifications, searchUsers, getUserMin, getNetworkStats, getConnections, getConnectionSuggestions, getPendingRequests, googleAuth, completeOnboarding };