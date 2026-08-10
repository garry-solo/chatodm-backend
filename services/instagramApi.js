// Ye file Instagram Graph API ko call karke actual DM bhejne ka kaam karti hai.

const axios = require('axios');

const GRAPH_API_VERSION = 'v21.0';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const IG_BUSINESS_ACCOUNT_ID = process.env.IG_BUSINESS_ACCOUNT_ID;

/**
 * Kisi bhi Instagram user ko DM bhejta hai.
 * @param {string} recipientId - jisko DM bhejna hai uski Instagram-scoped ID
 * @param {string} messageText - jo message bhejna hai
 */
async function sendDirectMessage(recipientId, messageText) {
  const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/${IG_BUSINESS_ACCOUNT_ID}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        recipient: { id: recipientId },
        message: { text: messageText },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ DM bhej diya ${recipientId} ko:`, response.data);
    return response.data;
  } catch (err) {
    console.error(
      '❌ DM bhejte waqt error aaya:',
      err.response?.data || err.message
    );
    throw err;
  }
}

/**
 * Kisi comment ka public reply karta hai (comment ke neeche hi dikhega, sabko).
 * @param {string} commentId - jis comment ka reply karna hai
 * @param {string} replyText - jo reply likhna hai
 */
async function replyToComment(commentId, replyText) {
  const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/${commentId}/replies`;

  try {
    const response = await axios.post(
      url,
      { message: replyText },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Comment ka reply bhej diya (${commentId}):`, response.data);
    return response.data;
  } catch (err) {
    console.error(
      '❌ Comment reply bhejte waqt error aaya:',
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { sendDirectMessage, replyToComment };
