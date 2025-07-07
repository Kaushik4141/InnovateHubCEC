import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  FullName: { type: String, required: true },
  USN: { type: String, required: true },
  year: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true }
});

export const User = mongoose.model("User", userSchema);