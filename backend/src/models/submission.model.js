import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true, index: true },
    languageId: { type: Number, required: true },
    sourceCode: { type: String, required: true },
    verdict: { type: String, enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error(SIGSEGV)","Runtime Error(SIGXFSZ)","Runtime Error(SIGFPE)","Runtime Error(SIGABRT)", "Runtime Error(NZEC)","Runtime Error(Other)","Runtime Error(Exec format error)","Compilation Error", "Internal Error"], default: "IE", index: true },
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
