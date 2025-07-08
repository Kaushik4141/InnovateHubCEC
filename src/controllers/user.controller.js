import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/apierrorhandler.js";
import { User } from "../models/user.model.js";  
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
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

   const {fullname, email, usn, password,year }=req.body; 
   console.log("email",email);
   if(!fullname || !email || !usn || !password || !year){
         throw new ApiError("Please provide all required fields", 400);
   }
   const existeduser=await User.findOne({ 
    $or:[{email },{usn}]
   })
    if(existeduser){
        throw new ApiError("User already exists", 409);
    }
    const avatarLocalPath = req.files && req.files.avatar && req.files.avatar[0] ? req.files.avatar[0].path : null;
const coverimageLocalPath = req.files && req.files.coverimage && req.files.coverimage[0] ? req.files.coverimage[0].path : null;
    console.log("avatarLocalPath",avatarLocalPath);

    console.log("coverimageLocalPath",coverimageLocalPath);

    if (!avatarLocalPath || !coverimageLocalPath){
       throw new ApiError("Please upload avatar and cover image", 400);
    }
const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverimage = await uploadOnCloudinary(coverimageLocalPath)
if(!avatar || !coverimage){
    throw new ApiError("Error uploading images", 400);
}
const user=await User.create({
    fullname,
    email,
    usn,
    year,
    password,
    avatar:avatar.secure_url,
    coverimage:coverimage.secure_url
})
const createduserid=await User.findById(user._id).select("-password -refreshToken");
if(!createduserid){
    throw new ApiError("User not created", 500);
}
return res.status(201).json(
    new ApiResponse(200, createduserid, "User registered successfully")
 );
})

export { registerUser }
