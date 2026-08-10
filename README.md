# ChatoDM Backend

Instagram DM automation ka backend server — comments, DMs aur story mentions
receive karke automatic replies bhejta hai.

## Project Structure

```
chatodm-backend/
├── index.js                    → Main server (webhook receive karta hai)
├── handlers/
│   └── webhookHandler.js       → Event ka type decide karta hai (DM/comment)
├── services/
│   ├── instagramApi.js         → Instagram ko actual DM bhejta hai
│   └── rulesEngine.js          → "Keyword aaya to ye reply bhejo" wali logic
├── .env.example                → Environment variables ka template
└── package.json
```

## Setup Karne Ke Steps

### 1. Dependencies Install Karein
```bash
npm install
```

### 2. `.env` File Banayein
`.env.example` ko copy karke `.env` naam se save karein:
```bash
cp .env.example .env
```

Phir `.env` file kholke ye values bharein:
- **WEBHOOK_VERIFY_TOKEN** — koi bhi random secret string aap khud banayein (jaise `chatodm_secret_123`). Ye Meta Dashboard mein bhi same daalna hoga.
- **INSTAGRAM_ACCESS_TOKEN** — jo token Meta Dashboard se "Generate token" karke mila tha
- **IG_BUSINESS_ACCOUNT_ID** — aapke connected Instagram account ki ID (dashboard mein account naam ke neeche dikhi thi)

### 3. Server Local Mein Chalayein
```bash
node index.js
```
Agar sab sahi hai, terminal mein ye dikhega:
```
🚀 ChatoDM server chal raha hai: http://localhost:3000
```

### 4. Server Ko Internet Par Expose Karein (Testing Ke Liye)

Meta ke webhooks sirf **public HTTPS URL** par kaam karte hain — `localhost` par nahi.
Local testing ke liye **ngrok** use karein:

```bash
# ngrok install karein (agar nahi hai): https://ngrok.com/download
ngrok http 3000
```

Ye ek URL degा jaise: `https://abc123.ngrok-free.app`

### 5. Meta Dashboard Mein Webhook Configure Karein

1. Meta App Dashboard → Use case customize → **"3. Configure webhooks"**
2. **Callback URL** mein daalein: `https://abc123.ngrok-free.app/webhook`
   (apna asli ngrok URL use karein, aur `/webhook` zaroor add karein)
3. **Verify token** mein wahi daalein jo aapne `.env` mein `WEBHOOK_VERIFY_TOKEN` mein daala tha
4. **"Verify and save"** click karein — agar sab sahi hai to ye successfully verify ho jayega

### 6. Test Karein

Apne connected Instagram account (blackiabeauty) ko dusre account se DM karein
jisme "LINK" ya "PRICE" word ho — automatic reply aana chahiye, aur terminal mein
logs dikhenge.

## Automation Rules Kaise Add Karein

Abhi `services/rulesEngine.js` file mein rules hardcoded hain, testing ke liye:

```js
const rules = [
  { keyword: 'LINK', replyMessage: 'Yahan hai aapka link...' },
  { keyword: 'PRICE', replyMessage: 'Pricing details...' },
  { isDefault: true, replyMessage: 'Default reply...' },
];
```

Naya rule add karna ho to bas array mein ek naya object add kar dein.

**Agle steps mein** ye rules database (MongoDB) se aayenge, taaki dashboard UI se
bina code chhue naye rules add kiye ja sakein.

## Important Notes

- Ye abhi **development/test mode** mein hai — sirf Instagram Testers (jinhe aapne
  App Roles mein add kiya hai) ke saath kaam karega
- Production mein real users ke liye kaam karne ke liye Meta ka **App Review**
  process poora karna hoga
- Access token ko kabhi bhi GitHub ya kisi public jagah commit na karein — hamesha
  `.env` file mein rakhein (jo `.gitignore` mein already excluded hai)
