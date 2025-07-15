import { asyncHandler } from "../utils/asyncHandler.js";
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
  const createduserid = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createduserid) {
    throw new ApiError("User not created", 500);
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createduserid, "User registered successfully"));
});

const loginuser = asyncHandler(async (req, res, next) => {
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
});
const logoutUser = asyncHandler(async (req, res) => {
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
  };
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged Out"))
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken

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
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
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
    await user.save({validatebeforeSave : false})
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
    const { fullname, email, usn, year } = req.body;
    if (!fullname || !email || !usn || !year) {
        throw new ApiError("Please provide all required fields", 400);
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { fullname, email, usn, year },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details updated successfully"));
});
const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const getUserProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const profile = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
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
                        if: {$in: [req.user?._id, "$followers.follower"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                followersCount: 1,
                followingCount: 1,
                isfollower: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
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
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

export { registerUser, loginuser, logoutUser, refreshAccessToken, getcurrentUser, changeCurrrentPassword, updateAccountDetails, updateUserAvatar, getUserProfile };
