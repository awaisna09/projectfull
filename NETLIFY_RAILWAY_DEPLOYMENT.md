# 🚀 Complete Netlify + Railway Deployment Guide
## Imtehaan AI EdTech Platform

**Perfect Integration: Frontend (Netlify) + Backend (Railway)**

---

## 📦 What You Have

- ✅ `netlify-deployment/` - Complete frontend (157 files + media)
- ✅ `railway-backend/` - Complete backend (8 files + agents)

---

## 🎯 Deployment Order (IMPORTANT!)

**Deploy in this order for smooth integration:**

```
1️⃣ Deploy Backend to Railway FIRST
2️⃣ Get Railway URL
3️⃣ Deploy Frontend to Netlify
4️⃣ Get Netlify URL
5️⃣ Update Railway CORS with Netlify URL
6️⃣ Update Netlify with Railway URL
7️⃣ Redeploy both
8️⃣ Test integration
```

---

## 🚂 PART 1: Deploy Backend to Railway

### **Step 1.1: Create Railway Account**

1. Visit: https://railway.app
2. Click: **"Login"** or **"Start a New Project"**
3. Sign up with GitHub (recommended) or email

### **Step 1.2: Create New Project**

1. Click: **"New Project"**
2. Select: **"Empty Project"**
3. Name it: "imtehaan-backend" (or any name)

### **Step 1.3: Upload Backend Files**

**Option A: GitHub (Recommended)**
```bash
# Create new GitHub repo for backend
cd railway-backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/yourusername/imtehaan-backend.git
git push -u origin main

# Then in Railway:
# Click "+ New" → "GitHub Repo" → Select your backend repo
```

**Option B: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Navigate to backend folder
cd railway-backend

# Login
railway login

# Deploy
railway init
railway up
```

**Option C: Manual Upload (via GitHub Desktop)**
- Drag `railway-backend/` files to GitHub repo
- Railway connects and auto-deploys

### **Step 1.4: Set Environment Variables**

In Railway Dashboard → Your Service → Variables:

**Click "+ New Variable" and add each:**

```bash
OPENAI_API_KEY = sk-proj-YOUR_ACTUAL_KEY_HERE
ALLOWED_ORIGINS = *
HOST = 0.0.0.0
PORT = 8000
ENVIRONMENT = production
TUTOR_MODEL = gpt-4
GRADING_MODEL = gpt-4
TUTOR_TEMPERATURE = 0.7
GRADING_TEMPERATURE = 0.1
LOG_LEVEL = INFO
ENABLE_DEBUG = false
REQUEST_TIMEOUT = 30
MAX_CONCURRENT_REQUESTS = 10
```

**Optional (LangSmith monitoring):**
```bash
LANGSMITH_TRACING = true
LANGSMITH_API_KEY = your_key_here
LANGSMITH_PROJECT = imtehaan-ai-tutor
```

### **Step 1.5: Deploy and Get URL**

1. **Deploy:** Railway auto-deploys when you add variables
2. **Wait:** ~2-3 minutes for build
3. **Get URL:** Railway dashboard shows: `https://imtehaan-backend-production.up.railway.app`
4. **Copy URL:** You'll need this for Netlify!

### **Step 1.6: Test Backend**

```bash
# Replace with your actual Railway URL
curl https://your-backend-production.up.railway.app/health

# Expected Response:
{"status": "healthy", "message": "Unified backend is running"}
```

**✅ If you get this response, backend is working!**

---

## 🌐 PART 2: Deploy Frontend to Netlify

### **Step 2.1: Update netlify.toml with Railway URL**

**Edit:** `netlify-deployment/netlify.toml`

**Find this section:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.railway.app/:splat"
```

**Update to:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://imtehaan-backend-production.up.railway.app/:splat"
  # ↑ Use your ACTUAL Railway URL from Step 1.5
  status = 200
  force = true
  headers = {X-From = "Netlify"}
```

**Also update** `netlify-deployment/_redirects`:
```
/api/*  https://your-actual-railway-url.up.railway.app/:splat  200
```

### **Step 2.2: Upload to Netlify**

1. **Go to:** https://app.netlify.com
2. **Click:** "Add new site" → "Deploy manually"
3. **Drag:** The entire `netlify-deployment` folder
4. **Wait:** 3-5 minutes for build

### **Step 2.3: Get Netlify URL**

After build completes:
```
Your site is live at: https://random-name-123.netlify.app
```

**Copy this URL** - you'll need it for Railway CORS!

### **Step 2.4: Set Netlify Environment Variables**

**Go to:** Site settings → Environment variables

**Add these:**
```
VITE_SUPABASE_URL = https://bgenvwieabtxwzapgeee.supabase.co
VITE_SUPABASE_ANON_KEY = YOUR_SUPABASE_ANON_KEY_HERE
VITE_API_BASE_URL = /api
```

### **Step 2.5: Trigger Redeploy**

- Go to: Deploys tab
- Click: **"Trigger deploy"** → **"Deploy site"**
- Wait: ~3 minutes

---

## 🔄 PART 3: Connect Frontend & Backend

### **Step 3.1: Update Railway CORS**

**In Railway:** Variables tab

**Update ALLOWED_ORIGINS:**
```bash
# Change from:
ALLOWED_ORIGINS = *

# To your actual Netlify URL:
ALLOWED_ORIGINS = https://random-name-123.netlify.app
```

**Save** - Railway will auto-redeploy.

### **Step 3.2: Test Integration**

**Visit your Netlify site:**
```
https://your-site.netlify.app
```

**Test these features:**
- ✅ Login/Signup works (Supabase)
- ✅ Dashboard loads (frontend)
- ✅ AI Tutor responds (Railway backend)
- ✅ Practice questions can be graded (Railway backend)
- ✅ Mock exams work (Railway backend)

---

## 🧪 Complete Integration Tests

### **Test 1: Frontend Loads**
```
Visit: https://your-site.netlify.app
Expected: Landing page appears ✅
```

### **Test 2: Authentication Works**
```
Action: Sign up with email
Expected: Creates account in Supabase ✅
```

### **Test 3: Backend Connection**
```
Action: Go to AI Tutor, ask a question
Expected: AI responds via Railway backend ✅
```

### **Test 4: Grading Works**
```
Action: Go to Practice, submit answer
Expected: Gets graded by Railway backend ✅
```

### **Test 5: Analytics Work**
```
Action: Check dashboard analytics
Expected: Shows study time, streak ✅
```

---

## 📋 Final Configuration Summary

### **Railway Backend:**

**URL:** `https://your-backend.up.railway.app`

**Environment Variables:**
```bash
OPENAI_API_KEY=sk-proj-...
ALLOWED_ORIGINS=https://your-site.netlify.app
PORT=8000
ENVIRONMENT=production
```

**Start Command:** `python unified_backend.py`

---

### **Netlify Frontend:**

**URL:** `https://your-site.netlify.app`

**Environment Variables:**
```bash
VITE_SUPABASE_URL=https://bgenvwieabtxwzapgeee.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_API_BASE_URL=/api
```

**netlify.toml Redirect:**
```toml
/api/* → https://your-backend.up.railway.app/*
```

---

### **Supabase Database:**

**URL:** `https://bgenvwieabtxwzapgeee.supabase.co`

**Configuration:**
- ✅ RLS policies enabled
- ✅ Authentication enabled
- ✅ Auto-backup enabled

---

## 🎊 Complete URL Configuration

After both deployments:

| Service | URL | Environment Variable |
|---------|-----|---------------------|
| **Netlify** | `https://your-site.netlify.app` | Set in Railway `ALLOWED_ORIGINS` |
| **Railway** | `https://your-backend.up.railway.app` | Set in Netlify `netlify.toml` |
| **Supabase** | `https://bgenvwieabtxwzapgeee.supabase.co` | Set in Netlify `VITE_SUPABASE_URL` |

---

## 🔧 Troubleshooting Common Issues

### **Issue: CORS Error**

**Error Message:**
```
Access-Control-Allow-Origin header is missing
```

**Solution:**
```bash
# 1. Check Railway ALLOWED_ORIGINS includes Netlify URL
# 2. Ensure no trailing slash in URL
# 3. Match protocol (https://)
# 4. Redeploy Railway after changing
```

---

### **Issue: 404 on /api/* calls**

**Error Message:**
```
GET /api/health 404 (Not Found)
```

**Solution:**
```bash
# 1. Check netlify.toml redirect is correct
# 2. Ensure Railway URL is accurate
# 3. Test Railway URL directly in browser
# 4. Redeploy Netlify after changing netlify.toml
```

---

### **Issue: Railway backend not responding**

**Error Message:**
```
Gateway Timeout or Connection Refused
```

**Solution:**
```bash
# 1. Check Railway logs for errors
# 2. Verify OPENAI_API_KEY is set
# 3. Check Railway service is running (not paused)
# 4. Wait for cold start (30 seconds on free tier)
```

---

### **Issue: OpenAI API errors**

**Error Message:**
```
OpenAI API key invalid or expired
```

**Solution:**
```bash
# 1. Verify key in Railway variables
# 2. Check key has credits: https://platform.openai.com/usage
# 3. Regenerate key if needed
# 4. Update in Railway and redeploy
```

---

## ⚡ Performance Tips

### **Reduce Cold Starts (Railway Free Tier):**

**Option 1:** Upgrade to Railway Pro ($5/month)
- No cold starts
- Always warm

**Option 2:** Keep backend warm with pings
```bash
# Set up free monitoring service to ping every 5 minutes:
# - UptimeRobot (free)
# - Ping URL: https://your-backend.up.railway.app/health
```

**Option 3:** Accept cold starts
- First request: ~30 seconds
- Subsequent requests: < 2 seconds
- Warm for 30 minutes

---

## 📊 Expected Costs

### **Minimal Setup (Testing):**
```
Netlify:  Free tier (100 GB bandwidth/month)
Railway:  Free tier ($5 credit/month)
Supabase: Free tier (500 MB database)
OpenAI:   Pay per use (~$5-10/month for testing)

Total: ~$5-10/month (just OpenAI)
```

### **Production (Recommended):**
```
Netlify Pro:   $19/month (optional)
Railway Pro:   $5/month (recommended)
Supabase:      Free tier is enough for most
OpenAI:        ~$20-50/month (depending on users)

Total: ~$25-75/month
```

---

## ✅ Integration Verification Checklist

After completing all steps:

- [ ] Railway backend deployed and running
- [ ] Railway health check returns 200
- [ ] Netlify frontend deployed and live
- [ ] Can access Netlify site in browser
- [ ] CORS configured (Railway → Netlify URL)
- [ ] API proxy configured (Netlify → Railway URL)
- [ ] Login works (Supabase auth)
- [ ] AI Tutor responds (Railway backend)
- [ ] Practice grading works (Railway backend)
- [ ] Mock exams can be graded (Railway backend)
- [ ] Analytics display correctly (Supabase data)
- [ ] No console errors in browser
- [ ] No CORS errors
- [ ] All media files load (images + videos)

---

## 🎯 Quick Reference

### **Railway Backend:**
```bash
Folder: railway-backend/
Files: 8 + agents/
URL: https://your-backend.up.railway.app
Command: python unified_backend.py
```

### **Netlify Frontend:**
```bash
Folder: netlify-deployment/
Files: 157 + media
URL: https://your-site.netlify.app
Build: npm run build
```

### **Integration:**
```bash
Netlify /api/* → Railway backend
Frontend calls → Backend processes → Supabase stores
```

---

## 🎉 Success!

When done, you'll have:

✅ **Live website** at: `https://your-site.netlify.app`  
✅ **AI backend** at: `https://your-backend.up.railway.app`  
✅ **Database** at: Supabase (managed)  
✅ **All features working** - AI Tutor, Grading, Analytics  
✅ **Global performance** - Netlify CDN + Railway  
✅ **Secure** - HTTPS everywhere, proper CORS  

---

## 📞 Need Help?

**Guides in netlify-deployment/:**
- `START_HERE.md` - Quick start
- `DEPLOYMENT_INSTRUCTIONS.md` - Detailed frontend guide
- `RAILWAY_BACKEND_INTEGRATION.md` - Integration details

**Guides in railway-backend/:**
- `README.md` - Railway deployment
- `ENV_VARIABLES.md` - All environment variables

---

**Total Time:** ~15 minutes  
**Difficulty:** ⭐⭐ Easy  
**Cost:** Free (or ~$5/month for Railway Pro)  

🚀 **Ready to Deploy!**

