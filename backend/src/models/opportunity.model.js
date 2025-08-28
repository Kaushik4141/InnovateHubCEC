import mongoose from "mongoose";

const OpportunitySchema = new mongoose.Schema(
  {
    job_id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    company: { type: String },
    location: { type: String },
    employment_type: { type: String },
    remote: { type: String },
    salary: { type: String },
    posted_on: { type: String },
    skills: [{ type: String }],
    good_to_have: [{ type: String }],
    topics: [{ type: String }],
    buzzwords: [{ type: String }],
    rounds: { type: String },
    cutoff: { type: String },
    apply_link: { type: String },
    description: { type: String },
    type: { type: String, enum: ["job", "internship"], index: true },
  },
  { timestamps: true }
);

export const Opportunity = mongoose.model("Opportunity", OpportunitySchema);
