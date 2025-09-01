import mongoose from "mongoose";

const sampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    output: { type: String, default: "" }
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    output: { type: String, default: "" },
    isHidden: { type: Boolean, default: true }
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    statement: { type: String, required: true },
    inputFormat: { type: String },
    outputFormat: { type: String },
    constraints: { type: String },
    samples: [sampleSchema],
    testCases: [testCaseSchema],
    allowedLangs: [{ type: Number }], 
    timeLimit: { type: Number, default: 2.0 }, 
    memoryLimit: { type: Number, default: 128000 } 
  },
  { timestamps: true }
);

export const Problem = mongoose.model("Problem", problemSchema);
