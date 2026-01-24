# 🚀 Deployment Guide - PackageCompass

Complete step-by-step guide to deploy PackageCompass for **FREE**.

## 📦 What You'll Deploy

- **Frontend**: React + Vite → Vercel (Free)
- **Backend**: Express + Prisma → Render (Free)
- **Database**: PostgreSQL + pgvector → Supabase (Free)
- **Search**: Optional Meilisearch → Render (Free)

---

## 🔥 Step 1: Setup Firebase Authentication (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"** → Name it (e.g., "package-compass")
3. Disable Google Analytics (optional) → Create project
4. Click **"Web"** icon (</>) to add a web app
5. Register app → Copy the config values:
   ```javascript
   apiKey: "...",
   authDomain: "...",
   projectId: "...",
   // etc.
   ```
6. Go to **Authentication** → Get Started → Enable:
   - ✅ **Google** (Add your email as test user)
   - ✅ **Email/Password**
7. Add authorized domains (after deploying):
   - Go to Authentication → Settings → Authorized domains
   - Add your Vercel domain: `your-app.vercel.app`

**Save these Firebase config values** - you'll need them later!

---

## 🐘 Step 2: Setup Supabase Database (10 minutes)

### 2.1 Create Supabase Project

1. Go to [Supabase](https://supabase.com/) → Sign up/Login
2. Click **"New Project"**
   - Name: `package-compass`
   - Database Password: **Generate a strong password** (save it!)
   - Region: Choose closest to you
   - Plan: Free (500MB, 2GB transfer/month)
   - Click **"Create new project"** (takes 2 minutes)

### 2.2 Enable pgvector Extension

1. In your Supabase project → Click **"SQL Editor"** (left sidebar)
2. Click **"New Query"** → Paste this:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Click **"Run"** (bottom right)
4. You should see: ✅ Success

### 2.3 Get Database URL

1. Go to **"Settings"** (gear icon) → **"Database"**
2. Scroll to **"Connection string"** → Select **"URI"**
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. **Save this DATABASE_URL** - you'll need it!

---

## 🔧 Step 3: Setup Backend on Render (15 minutes)

### 3.1 Create Render Account

1. Go to [Render](https://render.com/) → Sign up with GitHub
2. Authorize Render to access your repositories

### 3.2 Push Code to GitHub

```powershell
# Initialize git (if not already)
cd "c:\Users\syedt\OneDrive\Documents\Project- Git\package-compass"
git init
git add .
git commit -m "Initial commit for deployment"

# Create GitHub repo and push
# Go to github.com → New Repository → package-compass
git remote add origin https://github.com/YOUR-USERNAME/package-compass.git
git branch -M main
git push -u origin main
```

### 3.3 Create Web Service on Render

1. In Render Dashboard → Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `package-compass`
3. Configure (EXACT VALUES):
   - **Name**: `Packhunt-api` (or your choice)
   - **Language**: `Node`
   - **Region**: `Oregon (US West)` (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Click **"Advanced"** → Add Environment Variables:
   ```
   DATABASE_URL = postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   FRONTEND_URL = https://package-compass.vercel.app (will update later)
   NODE_ENV = production
   PORT = 10000
   ```

5. Click **"Create Web Service"**
6. Wait 5-10 minutes for deployment
7. **Copy your backend URL**: `https://package-compass-api.onrender.com`

### 3.4 Initialize Database

1. In Render Dashboard → Go to your service → Click **"Shell"** tab
2. Run these commands:
   ```bash
   npm run prisma:migrate
   npm run seed
   ```
3. Wait for seed to complete (adds initial packages)

**Note**: Render free tier sleeps after 15 min of inactivity. First request after sleep takes ~30 seconds.

---

## 🌐 Step 4: Deploy Frontend on Vercel (10 minutes)

### 4.1 Create Vercel Account

1. Go to [Vercel](https://vercel.com/) → Sign up with GitHub
2. Authorize Vercel to access repositories

### 4.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Import `package-compass` repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave blank or root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.3 Add Environment Variables

Click **"Environment Variables"** → Add these:

```
VITE_API_URL = https://package-compass-api.onrender.com/api
VITE_FIREBASE_API_KEY = (your Firebase apiKey)
VITE_FIREBASE_AUTH_DOMAIN = (your Firebase authDomain)
VITE_FIREBASE_PROJECT_ID = (your Firebase projectId)
VITE_FIREBASE_STORAGE_BUCKET = (your Firebase storageBucket)
VITE_FIREBASE_MESSAGING_SENDER_ID = (your Firebase messagingSenderId)
VITE_FIREBASE_APP_ID = (your Firebase appId)
```

### 4.4 Deploy

1. Click **"Deploy"** → Wait 2-3 minutes
2. **Copy your URL**: `https://package-compass-xxx.vercel.app`
3. Visit your app! 🎉

---

## 🔄 Step 5: Update CORS & URLs (5 minutes)

### 5.1 Update Backend CORS

1. Go to Render Dashboard → Your service → **"Environment"**
2. Update `FRONTEND_URL` to your actual Vercel URL:
   ```
   FRONTEND_URL = https://package-compass-xxx.vercel.app
   ```
3. Click **"Save Changes"** → Service will redeploy

### 5.2 Update Firebase Authorized Domains

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Click **"Add domain"**
3. Add your Vercel domain: `package-compass-xxx.vercel.app`
4. Click **"Add"**

---

## ✅ Step 6: Test Your Deployment

1. Visit your Vercel URL: `https://package-compass-xxx.vercel.app`
2. Test features:
   - ✅ Homepage loads
   - ✅ Search works
   - ✅ Package details page works
   - ✅ Google Sign-in works
   - ✅ Star packages works (after login)
3. Check browser console for errors

---

## � Skip Meilisearch - You Don't Need It!

**Good news:** Your app already has **FREE AI-powered search** built-in! 

### What You Get Without Meilisearch:
- ✅ **Semantic Search** - AI understands meaning (searches by intent, not just keywords)
- ✅ **Hybrid Search** - Combines AI + keyword matching for best results
- ✅ **100% Free** - Uses local AI models (no API costs, no extra service)
- ✅ **No cold starts** - Runs on your existing backend
- ✅ **Works offline** - No external dependencies

### Your Built-in Search Features:
1. **Semantic**: `POST /api/search/semantic?q=web+framework` 
   - Finds packages by meaning (e.g., "database tool" finds PostgreSQL, MongoDB)
2. **Hybrid**: `POST /api/search/hybrid?q=fast+web+server`
   - Best of both worlds (60% AI + 40% keyword)
3. **Basic**: `GET /api/search?q=react`
   - Traditional keyword search

**You saved deploying an extra service!** Just use the 4 backend env variables and you're good to go.

---

## 🎯 What's Free Forever

| Service | Free Tier Limits | Good For |
|---------|------------------|----------|
| **Vercel** | 100GB bandwidth/month | ✅ Great |
| **Render** | 750 hours/month, sleeps after 15 min | ✅ Good (wakes in 30s) |
| **Supabase** | 500MB DB, 2GB transfer | ✅ Great for small projects |
| **Firebase Auth** | 10K/month phone auth (email unlimited) | ✅ Excellent |

---

## 🚨 Common Issues & Solutions

### Backend returns 500 error
- Check Render logs: Dashboard → Logs tab
- Verify DATABASE_URL is correct
- Run migrations: `npm run prisma:migrate`

### Frontend can't connect to backend
- Check VITE_API_URL in Vercel environment variables
- Verify CORS settings in backend (FRONTEND_URL)
- Check browser console for exact error

### Database connection fails
- Verify DATABASE_URL format
- Check Supabase isn't paused (free tier doesn't pause)
- Ensure `?sslmode=require` is in connection string

### Firebase auth fails
- Add Vercel domain to Firebase authorized domains
- Check Firebase config in Vercel env variables
- Verify Firebase project is in production mode

### Render service is slow
- This is normal on free tier (cold start ~30s)
- Consider keeping it warm with a cron ping service
- Or upgrade to paid tier ($7/month)

---

## 🔥 Next Steps After Deployment

1. **Custom Domain** (Optional):
   - Buy domain on Namecheap/Google Domains ($10/year)
   - Add to Vercel: Settings → Domains → Add
   - Update Firebase authorized domains

2. **Keep Render Warm** (Optional):
   - Use [Cron-Job.org](https://cron-job.org) to ping your API every 14 minutes
   - Prevents cold starts

3. **Analytics** (Optional):
   - Add Vercel Analytics (free)
   - Add Google Analytics

4. **Monitoring** (Optional):
   - Use Render's built-in metrics
   - Set up Supabase alerts

---

## 📝 Environment Variables Summary

### Frontend (.env in Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Backend (Environment in Render)
```env
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=10000
```

---

## 🎉 You're Done!

Your app is now live and accessible worldwide for **FREE**!

**Live URLs**:
- Frontend: `https://package-compass-xxx.vercel.app`
- Backend API: `https://package-compass-api.onrender.com`

---

## 💡 Cost Optimization Tips

1. ✅ **No Meilisearch needed**: Built-in AI search is better and free!
2. ✅ **Optimize Images**: Compress logo files (already done)
3. ✅ **Code Splitting**: Already done with Vite
4. ✅ **CDN**: Vercel CDN is automatic
5. ✅ **Database**: Supabase free tier is generous (500MB)

**Your app is already optimized for free deployment!**

---

## 🔗 Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)

Need help? Check the logs first, then review common issues above! 🚀
