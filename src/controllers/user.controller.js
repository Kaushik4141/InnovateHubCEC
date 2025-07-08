import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(user._id);
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
  const loggedInUser = await User.findByIdAndUpdate(user._id).select(
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
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "undefined",
      },
    },
    { new: true }
  );
  const cookieOptions = {
    httpOnly: true,
    secure: true, // Set to true if using HTTPS
  };
  return res
    .status(200)
    .cookie("accessToken", cookieOptions)
    .cookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
export { registerUser, loginuser, logoutUser };
