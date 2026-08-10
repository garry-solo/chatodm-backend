// Ye file har user (Instagram-scoped ID) ki "conversation stage" track karti hai —
// yaani wo abhi kis step par hai: naya hai, follow-ask ho chuka hai, ya confirm kar chuka hai.
//
// ABHI: in-memory Map use ho raha hai (server restart hone par data reset ho jayega).
// PRODUCTION MEIN: isse database (MongoDB/Postgres) mein move karna hoga, taaki
// server restart ya multiple servers hone par bhi data safe rahe.

const userStages = new Map();

const STAGE = {
  NEW: 'NEW',
  ASKED_TO_FOLLOW: 'ASKED_TO_FOLLOW',
  CONFIRMED: 'CONFIRMED',
};

function getStage(userId) {
  return userStages.get(userId) || STAGE.NEW;
}

function setStage(userId, stage) {
  userStages.set(userId, stage);
}

module.exports = { getStage, setStage, STAGE };
