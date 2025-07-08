import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  usn: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  avatar: {
    type: String,
    default: "https://www.gravatar.com/avatar/ "
  },
  coverimage: {
    type: String,
    default: "https://www.gravatar.com/avatar/ "
  },
  likehistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }],
  Commenthistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  linkedin: {
    type: String
  },
  github: {
    type: String
  },
  leetcode: {
    type: String
  },
  certifications: [{
    title: { type: String, required: true },
    issuer: { type: String },
    date: { type: Date, default: Date.now }
  }],
  projects: [{
    title: { type: String, required: true },
    description: { type: String },
    link: { type: String },
    date: { type: Date, default: Date.now }
  }],
  skills: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    trim: true
  },
  achievements: [{
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
  }],
  otherLinks: [{
    title: { type: String, required: true },
    url: { type: String, required: true }
  }],
  refreshToken: {
    type: String
  },


},
  {
    timestamps: true
  });
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
}
export const User = mongoose.model("User", userSchema)