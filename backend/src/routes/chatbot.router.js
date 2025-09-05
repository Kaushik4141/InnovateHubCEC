import express from 'express';
import axios from 'axios';

const router = express.Router();


router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const target = process.env.CHATBOT_URL || 'http://127.0.0.1:5000/chat';

    const response = await axios.post(
      target,
      { message },
      { timeout: 15000, headers: { 'Content-Type': 'application/json' } }
    );

    if (response && response.data) {
      return res.json(response.data);
    }

    return res.status(502).json({ success: false, message: 'Invalid response from chatbot service' });
  } catch (err) {
    const status = err?.response?.status || 502;
    const detail = err?.response?.data || err?.message || 'Chatbot service error';
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ChatbotProxy]', detail);
    }
    return res.status(status).json({ success: false, message: 'Chatbot service unavailable', detail });
  }
});

export default router;
