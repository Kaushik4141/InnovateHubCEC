import express from 'express';
import cors from 'cors';
import  cookieParser from 'cookie-parser';
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
import { startLeetcodeStatsScheduler } from './utils/leetcodeScheduler.js';

//routes declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/leaderboard', leaderboardRouter);
app.use('/api/v1/chat', chatRouter);

startLeetcodeStatsScheduler();

app
export { app }