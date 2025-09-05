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
    const timeoutMs = parseInt(process.env.CHATBOT_TIMEOUT_MS || '60000', 10);
    const maxAttempts = parseInt(process.env.CHATBOT_MAX_ATTEMPTS || '2', 10);
    const backoffMs = parseInt(process.env.CHATBOT_BACKOFF_MS || '3000', 10);

    let lastErr = null;
    for (let attempt = 1; attempt <= Math.max(1, maxAttempts); attempt++) {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[ChatbotProxy] Attempt ${attempt}/${maxAttempts} -> ${target}`);
        }
        const response = await axios.post(
          target,
          { message },
          { timeout: timeoutMs, headers: { 'Content-Type': 'application/json' } }
        );
        if (response && response.data) {
          return res.json(response.data);
        }
        lastErr = new Error('Invalid response body');
      } catch (e) {
        lastErr = e;
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, backoffMs * attempt));
          continue;
        }
      }
    }

    return res.status(502).json({ success: false, message: 'Invalid response from chatbot service', detail: lastErr?.message || lastErr });
  } catch (err) {
    const status = err?.response?.status || 502;
    const detail = err?.response?.data || err?.message || 'Chatbot service error';
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ChatbotProxy]', detail);
    }
    return res.status(status).json({ success: false, message: 'Chatbot service unavailable', detail });
  }
});

// Simple health check that posts a lightweight ping to the chatbot service.
router.get('/health', async (req, res) => {
  try {
    const target = process.env.CHATBOT_URL || 'http://127.0.0.1:5000/chat';
    const timeoutMs = parseInt(process.env.CHATBOT_HEALTH_TIMEOUT_MS || '8000', 10);
    const resp = await axios.post(target, { message: 'ping' }, { timeout: timeoutMs });
    return res.json({ ok: true, reply: resp?.data?.reply ?? null });
  } catch (e) {
    return res.status(502).json({ ok: false, error: e?.message || e });
  }
});

export default router;
