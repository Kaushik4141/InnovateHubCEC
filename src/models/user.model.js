import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  FullName: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  USN: {
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
  confirmPassword: {
    type: String,
    required: true
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


}
  , {
    timestamps: true
  });

export const User = mongoose.model("User", userSchema);