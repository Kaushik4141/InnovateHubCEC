import { Router } from 'express';
import { getMentors, applyForMentor } from '../controllers/mentor.controller.js';

const router = Router();

router.get('/', getMentors);
router.post('/apply', applyForMentor);

export default router;
