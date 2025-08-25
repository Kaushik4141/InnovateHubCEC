import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  year: { type: String },
  specialization: { type: String, required: true },
  bio: { type: String },
  skills: [{ type: String, trim: true }],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  mentees: { type: Number, default: 0 },
  projects: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
  responseTime: { type: String },
  avatar: { type: String },
  available: { type: Boolean, default: false },
  nextAvailable: { type: String },
  hourlyRate: { type: String, default: 'Free' },
  languages: [{ type: String, trim: true }],
  achievements: [{ type: String }],
  experience: { type: String },
  company: { type: String },
  location: { type: String },
  joinedDate: { type: Date, default: Date.now },
  sessionTypes: [{ type: String }],
  expertise: [{ type: String }],
}, { timestamps: true });

export const Mentor = mongoose.model('Mentor', mentorSchema);
