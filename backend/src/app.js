import express from 'express';
import cors from 'cors';
import  cookieParser from 'cookie-parser';
import { ApiError } from './utils/apierrorhandler.js';
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}))
app.use(express.json({
    limit: '20kb'
}))
app.use(express.urlencoded({
    extended: true,
    limit: '20kb'
}))
app.use(express.static('public'));
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  next();
});
 
//routes
import userRouter from './routes/user.router.js';
import postRouter from './routes/post.router.js';
import leaderboardRouter from './routes/leaderboard.router.js';
import chatRouter from './routes/chat.router.js';
import mentorRouter from './routes/mentor.router.js';
//import opportunityRouter from './routes/opportunity.router.js';
import statsRouter from './routes/stats.router.js';
import { startLeetcodeStatsScheduler } from './utils/leetcodeScheduler.js';

//routes declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/leaderboard', leaderboardRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/mentors', mentorRouter);
//app.use('/api/v1/opportunities', opportunityRouter);
app.use('/api/v1/stats', statsRouter);

startLeetcodeStatsScheduler();

//global error handler
app.use((err, req, res, next) => {
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', status, message);
  }
  if (err instanceof ApiError) {
    return res.status(status).json({ success: false, message, data: err?.data || null });
  }
  return res.status(status).json({ success: false, message });
});

app
export { app }