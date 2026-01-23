# 🚀 PackHunt Deployment Guide

Complete guide to deploy PackHunt to production.

---

## 📋 Prerequisites

- GitHub account (for code hosting)
- Vercel account (frontend hosting)
- Railway account (backend + database)
- Meilisearch Cloud account (search engine)
- Firebase project (already configured)

---

## 🗄️ Step 1: Deploy Database & Backend (Railway)

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub

### 1.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your `package-compass` repository
4. Railway will detect it's a monorepo

### 1.3 Add PostgreSQL Database
1. In your project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a PostgreSQL instance
4. Copy the `DATABASE_URL` (you'll need this)

### 1.4 Configure Backend Service
1. Click **"+ New"** → **"Service"** → **"GitHub Repo"**
2. Select your repo
3. Set **Root Directory** to `server`
4. Add environment variables:
   ```
   DATABASE_URL=${PostgreSQL.DATABASE_URL}
   MEILISEARCH_URL=https://your-meilisearch-instance.meilisearch.io
   MEILISEARCH_API_KEY=your_api_key
   NODE_ENV=production
   PORT=3001
   ```

### 1.5 Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Railway will provide a public URL like: `https://your-app.up.railway.app`
4. **Save this URL** - you'll need it for frontend

---

## 🔍 Step 2: Setup Meilisearch Cloud

### 2.1 Create Account
1. Go to [cloud.meilisearch.com](https://cloud.meilisearch.com)
2. Sign up (free tier available)

### 2.2 Create Index
1. Create new project
2. Create an index named `packages`
3. Copy your:
   - **Host URL** (e.g., `https://ms-xxx.meilisearch.io`)
   - **Master Key** (from Settings)

### 2.3 Update Railway Environment
Go back to Railway and update:
```
MEILISEARCH_URL=<your-host-url>
MEILISEARCH_API_KEY=<your-master-key>
```

### 2.4 Sync Data
Once backend is deployed, run:
```bash
# SSH into Railway or use local terminal
curl https://your-backend.railway.app/api/packages
# Then run sync script via Railway CLI or redeploy
```

---

## 🎨 Step 3: Deploy Frontend (Vercel)

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub

### 3.2 Import Project
1. Click **"Add New Project"**
2. Import your `package-compass` GitHub repo
3. Vercel will auto-detect Vite

### 3.3 Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `.` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.4 Environment Variables
Add these in Vercel:
```
VITE_API_URL=https://your-backend.railway.app
VITE_FIREBASE_API_KEY=<from Firebase Console>
VITE_FIREBASE_AUTH_DOMAIN=<from Firebase Console>
VITE_FIREBASE_PROJECT_ID=<from Firebase Console>
VITE_FIREBASE_STORAGE_BUCKET=<from Firebase Console>
VITE_FIREBASE_MESSAGING_SENDER_ID=<from Firebase Console>
VITE_FIREBASE_APP_ID=<from Firebase Console>
```

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Vercel will provide your live URL: `https://packhunt.vercel.app`

---

## 🔧 Step 4: Configure Firebase for Production

### 4.1 Add Production Domain
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings**
4. Under **Authorized domains**, add:
   - Your Vercel domain (e.g., `packhunt.vercel.app`)

---

## 📊 Step 5: Populate Database (One-time)

### 5.1 Connect to Railway via CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Run discovery script
railway run npm run auto-update
```

**OR** use Railway's built-in shell in their dashboard.

---

## ✅ Step 6: Verify Deployment

Test your deployment:

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Visit `https://your-backend.railway.app/api/packages`
3. **Search**: Try searching for packages
4. **Auth**: Try logging in

---

## 🔄 Continuous Deployment

Both Vercel and Railway are now connected to your GitHub repo:

- **Push to main branch** → Auto-deploys frontend & backend
- **No manual deployment needed**

---

## 💰 Costs

- **Frontend (Vercel)**: Free (Hobby plan)
- **Backend (Railway)**: $5/month (500 hours free trial)
- **PostgreSQL (Railway)**: Included with backend
- **Meilisearch Cloud**: Free tier (10k docs) or $29/month
- **Firebase**: Free tier (generous limits)

**Total**: ~$5-34/month depending on usage

---

## 🎯 Quick Commands Reference

### Local Development
```bash
npm run dev              # Start frontend
cd server && npm run dev # Start backend
```

### Deploy Updates
```bash
git add .
git commit -m "Update"
git push origin main     # Auto-deploys everything!
```

### Backend Commands (Railway CLI)
```bash
railway run npm run discover          # Discover packages
railway run npm run import-discovered # Import packages
railway run npm run meilisearch:sync  # Sync search
railway logs                          # View logs
```

---

## 🐛 Troubleshooting

### Frontend won't connect to backend
- Check `VITE_API_URL` in Vercel env vars
- Ensure Railway backend is running
- Check CORS settings in backend

### Database connection issues
- Verify `DATABASE_URL` in Railway
- Run `railway run npx prisma migrate deploy`

### Meilisearch not working
- Check `MEILISEARCH_URL` and `MEILISEARCH_API_KEY`
- Verify index name is `packages`
- Run sync script again

### Authentication failing
- Add Vercel domain to Firebase authorized domains
- Check all Firebase env vars in Vercel

---

## 🎉 You're Live!

Your PackHunt app is now deployed and accessible worldwide! 🌍

**Share your app**: `https://your-domain.vercel.app`

---

## 📚 Next Steps

1. **Custom Domain**: Add your own domain in Vercel settings
2. **Analytics**: Add Vercel Analytics or Google Analytics
3. **Monitoring**: Use Railway's metrics dashboard
4. **Backups**: Setup automated database backups in Railway
5. **CDN**: Vercel already uses CDN globally
6. **SEO**: Add meta tags and sitemap

---

**Need help?** Check Railway/Vercel documentation or reach out to their support!
