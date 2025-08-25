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
    required: function () { return this.onboardingCompleted === true || this.provider === 'local'; },
    unique: true,
    index: true,
    trim: true
  },
  year: {
    type: Number,
    required: function () { return this.onboardingCompleted === true || this.provider === 'local'; }
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
    required: function () { return this.provider === 'local'; }
  },
  avatar: {
    type: String,
    default: "/default_avatar.png"
  },
  coverimage: {
    type: String,
    default: "/default_coverimage.jpg"
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    index: true,
    sparse: true
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
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
  followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: [{
    type: { type: String, enum: ['follow-request', 'other'], default: 'follow-request' },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
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
  isAdmin: {
    type: Boolean,
    default: false
  },
  refreshToken: {
    type: String
  },


},
  {
    timestamps: true
  });
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
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