// ChatoDM Backend Server
// Ye server Instagram se aane wale events (comments, DMs, story mentions) receive karta hai
// aur automatic reply bhejta hai.

require('dotenv').config();
const express = require('express');
const { handleWebhookEvent } = require('./handlers/webhookHandler');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ─────────────────────────────────────────────────────────
// 1) WEBHOOK VERIFICATION (GET request)
// Jab aap Meta Dashboard mein "Verify and save" click karenge,
// Meta ye endpoint call karega ye check karne ke liye ki
// aapka server sahi se set up hai.
// ─────────────────────────────────────────────────────────
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed. Token mismatch.');
    res.sendStatus(403);
  }
});

// ─────────────────────────────────────────────────────────
// 2) WEBHOOK EVENTS (POST request)
// Jab bhi koi comment, DM, ya story mention aata hai,
// Instagram ye endpoint par event bhejta hai.
// ─────────────────────────────────────────────────────────
app.post('/webhook', async (req, res) => {
  // Meta ko turant 200 OK bhejna zaroori hai (5 second ke andar),
  // warna Meta events dobara-dobara bhejta rahega.
  res.status(200).send('EVENT_RECEIVED');

  try {
    await handleWebhookEvent(req.body);
  } catch (err) {
    console.error('Webhook event process karne mein error:', err.message);
  }
});

// Simple health-check route — server chal raha hai ya nahi check karne ke liye
app.get('/', (req, res) => {
  res.send('ChatoDM backend zinda hai ✅');
});

app.listen(PORT, () => {
  console.log(`🚀 ChatoDM server chal raha hai: http://localhost:${PORT}`);
});
