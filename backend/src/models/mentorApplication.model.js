import mongoose from 'mongoose';

const mentorApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String },
  linkedin: { type: String },
  github: { type: String },
  portfolio: { type: String },
  specialization: { type: String, required: true },
  expertise: [{ type: String }],
  experienceYears: { type: String },
  availability: { type: String },
  whySuitable: { type: String, required: true },
  page: { type: String },
  sent_at: { type: Date },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

export const MentorApplication = mongoose.model('MentorApplication', mentorApplicationSchema);
