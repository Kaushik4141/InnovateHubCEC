import { Mentor } from '../models/mentor.model.js';
import { MentorApplication } from '../models/mentorApplication.model.js';
import { ApiError } from '../utils/apierrorhandler.js';
import { ApiResponse } from '../utils/apiresponsehandler.js';
import { asyncHandler } from '../utils/asynchandler.js';

const getMentors = asyncHandler(async (req, res) => {
  const { specialization, availability, q } = req.query;
  const match = {};
  if (specialization && specialization !== 'all') {
    match.specialization = { $regex: specialization, $options: 'i' };
  }
  if (availability === 'available') match.available = true;
  if (availability === 'unavailable') match.available = false;
  if (q) {
    match.$or = [
      { name: { $regex: q, $options: 'i' } },
      { specialization: { $regex: q, $options: 'i' } },
      { skills: { $in: [new RegExp(q, 'i')] } }
    ];
  }
  const mentors = await Mentor.find(match).sort({ rating: -1, sessionsCompleted: -1 }).limit(100);
  return res.status(200).json(new ApiResponse(200, mentors, 'Mentors fetched'));
});

const applyForMentor = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    linkedin,
    github,
    portfolio,
    specialization,
    expertise,
    experienceYears,
    availability,
    whySuitable,
    page,
    sent_at
  } = req.body || {};

  if (!fullName || !email || !specialization || !whySuitable) {
    throw new ApiError(400, 'fullName, email, specialization and whySuitable are required');
  }

  const expertiseArray = Array.isArray(expertise)
    ? expertise
    : (typeof expertise === 'string' ? expertise.split(',').map(s => s.trim()).filter(Boolean) : []);

  const doc = await MentorApplication.create({
    fullName,
    email,
    phone,
    linkedin,
    github,
    portfolio,
    specialization,
    expertise: expertiseArray,
    experienceYears,
    availability,
    whySuitable,
    page,
    sent_at: sent_at ? new Date(sent_at) : new Date()
  });

  return res.status(201).json(new ApiResponse(201, { id: doc._id }, 'Application received'));
});

export { getMentors, applyForMentor };

