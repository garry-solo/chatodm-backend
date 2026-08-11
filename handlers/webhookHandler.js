// Ye file decide karti hai ki jo event Instagram se aaya hai,
// uska type kya hai (comment / DM / story mention) aur uspar
// kya action lena hai.

const { sendDirectMessage, replyToComment, sendPrivateReplyToComment } = require('../services/instagramApi');
const { getAutomationRules } = require('../services/rulesEngine');
const { getStage, setStage, STAGE } = require('../services/conversationState');

// Hamara khud ka business account ID — isse aane wale ya isko bheje gaye
// "echo" events ko ignore karne ke liye use karenge, taaki bot khud ke
// messages/comments ko dobara process na kare (infinite loop se bachne ke liye).
const IG_BUSINESS_ACCOUNT_ID = process.env.IG_BUSINESS_ACCOUNT_ID;

/**
 * Instagram se aane wala poora webhook payload yahan process hota hai.
 * Payload structure Meta ke docs ke hisaab se hota hai:
 * { object: "instagram", entry: [ { messaging: [...], changes: [...] } ] }
 */
async function handleWebhookEvent(body) {
  if (body.object !== 'instagram') {
    console.log('Ignoring non-Instagram event');
    return;
  }

  for (const entry of body.entry || []) {
    // ── CASE 1: Direct Message aaya ──
    if (entry.messaging) {
      for (const messagingEvent of entry.messaging) {
        await handleDirectMessage(messagingEvent);
      }
    }

    // ── CASE 2: Comment ya story mention aaya (changes array mein aata hai) ──
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field === 'comments') {
          await handleComment(change.value);
        }
      }
    }
  }
}

/**
 * Jab koi user aapko directly DM kare.
 * Follow-gate flow: keyword (LINK/PRICE) aane par pehle follow karne ko kaha jata hai,
 * "DONE" likhne par hi asli link/reply bheja jata hai.
 */
async function handleDirectMessage(messagingEvent) {
  const senderId = messagingEvent.sender?.id;
  const messageText = messagingEvent.message?.text;
  const isEcho = messagingEvent.message?.is_echo;

  if (!senderId || !messageText) return;

  // Ye humara khud ka bheja hua message hai (echo) — ignore karein,
  // warna bot khud ke messages ko process karke ulta-seedha react karega.
  if (isEcho || senderId === IG_BUSINESS_ACCOUNT_ID) {
    console.log(`↩️ Apna khud ka message (echo) ignore kiya: "${messageText}"`);
    return;
  }

  console.log(`📩 New DM from ${senderId}: "${messageText}"`);

  const rules = await getAutomationRules();
  const currentStage = getStage(senderId);
  const textLower = messageText.toLowerCase();

  // ── Stage 1: User ne "DONE" likha aur pehle follow-ask ho chuka tha ──
  if (currentStage === STAGE.ASKED_TO_FOLLOW) {
    const confirmRule = rules.find(
      (rule) => rule.confirmKeyword && textLower.includes(rule.confirmKeyword.toLowerCase())
    );
    if (confirmRule) {
      setStage(senderId, STAGE.CONFIRMED);
      await sendDirectMessage(senderId, confirmRule.replyMessage);
      return;
    }
  }

  // ── Stage 0: Naya trigger keyword (LINK/PRICE) dhundo ──
  const matchedRule = rules.find(
    (rule) => rule.keyword && textLower.includes(rule.keyword.toLowerCase())
  );

  if (matchedRule) {
    if (matchedRule.followGated) {
      setStage(senderId, STAGE.ASKED_TO_FOLLOW);
    }
    await sendDirectMessage(senderId, matchedRule.replyMessage);
    return;
  }

  // ── Koi bhi rule match nahi hua to default reply ──
  const defaultReply = rules.find((r) => r.isDefault)?.replyMessage;
  if (defaultReply) {
    await sendDirectMessage(senderId, defaultReply);
  }
}

/**
 * Jab koi user aapke post/reel par comment kare.
 * Flow: comment par ek chhota public reply + saath mein private DM (follow-gate ke saath)
 * (Ye SendDM/ManyChat wala "comment → DM" core feature hai)
 */
async function handleComment(commentData) {
  const commentId = commentData.id;
  const commenterId = commentData.from?.id;
  const commentText = commentData.text;

  if (!commenterId || !commentText) return;

  // Ye humara khud ka bheja hua public reply hai, jo Instagram naye comment
  // ki tarah wapas bhej deta hai — ignore karein, warna infinite loop bane sakta hai.
  if (commenterId === IG_BUSINESS_ACCOUNT_ID) {
    console.log(`↩️ Apna khud ka comment (echo) ignore kiya: "${commentText}"`);
    return;
  }

  console.log(`💬 New comment from ${commenterId}: "${commentText}"`);

  const rules = await getAutomationRules();
  const matchedRule = rules.find(
    (rule) => rule.keyword && commentText.toLowerCase().includes(rule.keyword.toLowerCase())
  );

  if (!matchedRule) return;

  // Comment par public reply (chhota sa, taaki dusre users ko bhi pata chale)
  if (commentId) {
    await replyToComment(commentId, "Check kiya DM! 📩");
  }

  // Private DM follow-gate ke saath (LINK ka jawab seedha nahi, pehle follow-ask)
  // Comment id use kar rahe hain (normal user id nahi) taaki messaging window
  // restriction bypass ho — Instagram ka "Private Reply" feature.
  if (matchedRule.followGated) {
    setStage(commenterId, STAGE.ASKED_TO_FOLLOW);
  }
  await sendPrivateReplyToComment(commentId, matchedRule.replyMessage);
}

module.exports = { handleWebhookEvent };
