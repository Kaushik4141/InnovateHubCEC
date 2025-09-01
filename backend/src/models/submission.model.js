import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true, index: true },
    languageId: { type: Number, required: true },
    sourceCode: { type: String, required: true },
    verdict: { type: String, enum: ["AC", "WA", "TLE", "RE", "CE", "IE"], default: "IE", index: true },
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    execTimeMs: { type: Number, default: 0 },
    stderr: { type: String },
    stdout: { type: String }
  },
  { timestamps: true }
);

submissionSchema.index({ contest: 1, user: 1, problem: 1, createdAt: 1 });

export const Submission = mongoose.model("Submission", submissionSchema);
