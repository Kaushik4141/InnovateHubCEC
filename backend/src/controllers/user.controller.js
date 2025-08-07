import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validatebeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError("Error generating tokens", 500);
  }
};

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
    )
    const createduserid = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createduserid) {
      throw new ApiError("User not created", 500);
    }
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
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
      secure: true, // Set to true if using HTTPS
      sameSite: 'None', // Adjust based on your requirements
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
      secure: true,
      sameSite: 'None',
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
      secure: true
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
    if (!toUser) return
    res
    .status(404)
    .json(new ApiError(404, { error: "User not found." }, "User not found."));

    if (toUser.followRequests.includes(fromUserId) || toUser.followers.includes(fromUserId))
      return res  
        .status(400)
        .json(new ApiError(400, { error: "Already requested or following." }, "Already requested or following."));

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
}});

const alive = asyncHandler(async (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is alive!' });
});
export { registerUser, loginuser, logoutUser, refreshAccessToken, getcurrentUser, changeCurrrentPassword, updateAccountDetails, updateUserAvatar, getUserProfile, requestFollow, acceptFollow, rejectFollow, alive, getNotifications };