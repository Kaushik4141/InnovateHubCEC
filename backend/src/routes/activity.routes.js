import express from 'express';
import { getGithubActivity, getLeetcodeActivity } from '../controllers/activity.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);

router.get('/github/:userId', getGithubActivity);
router.get('/leetcode/:userId', getLeetcodeActivity);

export default router;