import { Router } from 'express';
import { getMentors, applyForMentor, listMentorApplications, approveMentorApplication, rejectMentorApplication } from '../controllers/mentor.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getMentors);
router.post('/apply', applyForMentor);

// Admin routes
router.get('/applications', verifyJWT, requireAdmin, listMentorApplications);
router.post('/applications/:id/approve', verifyJWT, requireAdmin, approveMentorApplication);
router.post('/applications/:id/reject', verifyJWT, requireAdmin, rejectMentorApplication);

export default router;
