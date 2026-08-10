// Ye file automation rules manage karti hai — yaani "agar comment mein ye
// keyword aaye, to ye reply bhejo" jaisi logic.
//
// ABHI: rules yahin file mein hardcoded hain, testing ke liye.
// BAAD MEIN: jab dashboard UI banega, tab ye rules database (MongoDB/Postgres)
// se aayenge, taaki har user apne khud ke rules bana sake.

const rules = [
  {
    keyword: 'LINK',
    // Ye trigger keyword follow-gate flow shuru karta hai — link seedha nahi bheja jayega
    followGated: true,
    replyMessage:
      'Hey! 👋 Ye pane ke liye pehle humein follow kar lein, phir yahan "DONE" likh dein aur aapko link mil jayega! 🔗',
  },
  {
    keyword: 'PRICE',
    followGated: true,
    replyMessage:
      'Pricing details pane ke liye pehle humein follow kar lein, phir yahan "DONE" likh dein! 💰',
  },
  {
    // Follow confirm karne ke baad ye final message + link bheja jata hai
    confirmKeyword: 'DONE',
    replyMessage:
      'Shukriya follow karne ke liye! 🎉 Yahan hai aapka link: https://example.com',
  },
  {
    isDefault: true,
    replyMessage:
      'Dhanyavaad message karne ke liye! Hum jaldi hi reply karenge. 😊',
  },
];

async function getAutomationRules() {
  // Future mein: return await db.collection('rules').find({ userId }).toArray();
  return rules;
}

module.exports = { getAutomationRules };
