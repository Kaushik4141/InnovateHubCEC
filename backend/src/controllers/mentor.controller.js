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
const listMentorApplications = asyncHandler(async (req, res) => {
  const { status = 'pending' } = req.query;
  const match = {};
  if (status && status !== 'all') match.status = status;
  const apps = await MentorApplication.find(match).sort({ createdAt: -1 }).limit(200);
  return res.status(200).json(new ApiResponse(200, apps, 'Applications fetched'));
});


const approveMentorApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appDoc = await MentorApplication.findById(id);
  if (!appDoc) {
    throw new ApiError(404, 'Application not found');
  }
  if (appDoc.status === 'approved') {
    return res.status(200).json(new ApiResponse(200, { id: appDoc._id }, 'Already approved'));
  }
  appDoc.status = 'approved';
  await appDoc.save();

  const exists = await Mentor.findOne({ name: appDoc.fullName, specialization: appDoc.specialization });
  if (!exists) {
    await Mentor.create({
      name: appDoc.fullName,
      specialization: appDoc.specialization,
      expertise: appDoc.expertise || [],
      available: true,
      bio: appDoc.whySuitable,
    });
  }

  return res.status(200).json(new ApiResponse(200, { id: appDoc._id }, 'Application approved'));
});
const rejectMentorApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appDoc = await MentorApplication.findById(id);
  if (!appDoc) {
    throw new ApiError(404, 'Application not found');
  }
  if (appDoc.status === 'rejected') {
    return res.status(200).json(new ApiResponse(200, { id: appDoc._id }, 'Already rejected'));
  }
  appDoc.status = 'rejected';
  await appDoc.save();
  return res.status(200).json(new ApiResponse(200, { id: appDoc._id }, 'Application rejected'));
});

export { getMentors, applyForMentor, listMentorApplications, approveMentorApplication, rejectMentorApplication };
