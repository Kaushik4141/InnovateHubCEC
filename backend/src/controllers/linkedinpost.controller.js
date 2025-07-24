
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import axios from "axios";



const DailyRequest = mongoose.model('DailyRequest', new mongoose.Schema({
  userId: String,
  date: String 
}));
const linkpostUpload = asyncHandler(async (req, res) => {
    try {
  const { userId } = req.body;

  const today = new Date().toISOString().split('T')[0];
  const existing = await DailyRequest.findOne({ userId, date: today });

  
    
  if (existing) {
    return res.status(400).json({ message: 'AI automation already triggered today.' });
  }
  await DailyRequest.create({ userId, date: today });

await axios.post('https://hook.us2.make.com/6t0w6jqtrcuwqpo4jitcc192r40u8p7b', { userId });

  res.json({ message: 'AI automation triggered successfully.' });
  } catch (e) {
    throw new ApiError(500, e.message || 'Internal server error.' );
  }
});

export { linkpostUpload };



