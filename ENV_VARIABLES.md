# 🔐 Environment Variables Checklist

Complete list of ALL environment variables you need to configure.

---

## 📋 BACKEND Environment Variables (Render)

Add these in Render Dashboard → Your Service → Environment tab:

### 1. DATABASE_URL (REQUIRED)
```
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
**How to get:**
1. Go to Supabase Dashboard → Project Settings (gear icon) → Database
2. Scroll to "Connection string" section
3. Select "URI" tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual Supabase database password

**Example:**
```
DATABASE_URL=postgresql://postgres.abc123xyz:MyPassword123!@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

### 2. FRONTEND_URL (REQUIRED)
```
FRONTEND_URL=https://your-app-name.vercel.app
```
**How to get:**
- You'll get this AFTER deploying frontend to Vercel
- Initial value: Use `http://localhost:8080` for now
- Update later with your actual Vercel URL

**Example:**
```
FRONTEND_URL=https://package-compass-xyz123.vercel.app
```

---

### 3. NODE_ENV (REQUIRED)
```
NODE_ENV=production
```
**Just copy this exactly** ✅

---

### 4. PORT (REQUIRED)
```
PORT=10000
```
**Just copy this exactly** ✅ (Render uses port 10000 internally)

---

### 5. ~~MEILISEARCH_HOST~~ (NOT NEEDED - SKIP THIS)
**✅ Your app already has FREE AI-powered search built-in!**

You don't need Meilisearch because your backend already includes:
- ✅ **Semantic Search** - AI understands meaning (e.g., "web server" finds Express, Flask)
- ✅ **Hybrid Search** - Combines AI + keyword matching (best results)
- ✅ **100% Free** - Uses local AI models (@xenova/transformers)
- ✅ **No extra service needed** - Runs on PostgreSQL with pgvector

**Don't add this variable** - save yourself the hassle of deploying another service!

---

### 6. ~~MEILISEARCH_MASTER_KEY~~ (NOT NEEDED - SKIP THIS)
**Don't add this variable either** - see above ⬆️

---

## 🎨 FRONTEND Environment Variables (Vercel)

Add these in Vercel → Project Settings → Environment Variables:

### 1. VITE_API_URL (REQUIRED)
```
VITE_API_URL=https://your-backend.onrender.com/api
```
**How to get:**
- Deploy backend to Render first
- Copy the URL from Render dashboard (at the top)
- Add `/api` at the end

**Example:**
```
VITE_API_URL=https://packhunt-api.onrender.com/api
```

---

### 2. VITE_FIREBASE_API_KEY (REQUIRED)
```
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
**How to get:**
1. Go to Firebase Console → Your Project
2. Click gear icon ⚙️ → Project Settings
3. Scroll to "Your apps" section
4. If no web app exists, click "Web" icon (</>) to add one
5. Copy the `apiKey` value from the config

**Example:**
```
VITE_FIREBASE_API_KEY=AIzaSyC9X1234567890abcdefghijklmnopqr
```

---

### 3. VITE_FIREBASE_AUTH_DOMAIN (REQUIRED)
```
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
```
**How to get:**
- Same place as apiKey
- Copy the `authDomain` value

**Example:**
```
VITE_FIREBASE_AUTH_DOMAIN=package-compass-abc123.firebaseapp.com
```

---

### 4. VITE_FIREBASE_PROJECT_ID (REQUIRED)
```
VITE_FIREBASE_PROJECT_ID=your-project-id
```
**How to get:**
- Same place as apiKey
- Copy the `projectId` value

**Example:**
```
VITE_FIREBASE_PROJECT_ID=package-compass-abc123
```

---

### 5. VITE_FIREBASE_STORAGE_BUCKET (REQUIRED)
```
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```
**How to get:**
- Same place as apiKey
- Copy the `storageBucket` value

**Example:**
```
VITE_FIREBASE_STORAGE_BUCKET=package-compass-abc123.appspot.com
```

---

### 6. VITE_FIREBASE_MESSAGING_SENDER_ID (REQUIRED)
```
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
```
**How to get:**
- Same place as apiKey
- Copy the `messagingSenderId` value

**Example:**
```
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321098
```

---

### 7. VITE_FIREBASE_APP_ID (REQUIRED)
```
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```
**How to get:**
- Same place as apiKey
- Copy the `appId` value

**Example:**
```
VITE_FIREBASE_APP_ID=1:987654321098:web:7a8b9c0d1e2f3a4b
```

---

## 📝 Quick Copy Templates

### BACKEND (Render) - All You Need (4 Variables)
```
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
FRONTEND_URL=http://localhost:8080
NODE_ENV=production
PORT=10000
```

**That's it!** No Meilisearch needed - your app has built-in AI search! 🚀

### FRONTEND (Vercel) - All Required
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

---

## ✅ Deployment Order

Follow this exact order:

1. **Setup Firebase** (5 min)
   - Get all 6 Firebase values above
   - Save them in a notepad

2. **Setup Supabase** (10 min)
   - Get DATABASE_URL
   - Enable pgvector extension

3. **Deploy Backend to Render** (15 min)
   - Add 4 backend env variables (skip Meilisearch for now)
   - Copy the Render URL you get

4. **Deploy Frontend to Vercel** (10 min)
   - Add 7 frontend env variables
   - Use the Render URL from step 3 for VITE_API_URL

5. **Update Backend FRONTEND_URL** (2 min)
   - Go back to Render
   - Update FRONTEND_URL with your Vercel URL
   - Service will auto-redeploy

6. **Update Firebase Authorized Domains** (2 min)
   - Add your Vercel domain to Firebase
   - Now authentication will work

---

## 🔍 How to Find Your Values Later

### Supabase DATABASE_URL
- Dashboard → Settings (gear) → Database → Connection string → URI

### Render Backend URL
- Dashboard → Your Service → URL shown at top

### Vercel Frontend URL  
- Dashboard → Your Project → Domains section

### Firebase Config
- Console → Project Settings → Your apps → SDK setup & config

---

## ⚠️ Important Notes

1. **Never commit .env files to Git!** (Already in .gitignore)
2. **Always use HTTPS** in production URLs
3. **Update FRONTEND_URL** after getting Vercel URL
4. **Add Vercel domain** to Firebase authorized domains
5. **DATABASE_URL must have** `?pgbouncer=true` at the end for Supabase

---

## 🎯 Next Steps

1. ✅ Save this file
2. ✅ Create Firebase project → Get 6 values
3. ✅ Create Supabase project → Get DATABASE_URL
4. ✅ Have all values ready before deploying
5. ✅ Follow deployment guide step by step

Need help getting any specific value? Check the detailed guide above! 🚀
