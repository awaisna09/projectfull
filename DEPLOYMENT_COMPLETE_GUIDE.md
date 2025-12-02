# 🎯 COMPLETE DEPLOYMENT GUIDE
## Netlify Frontend + Railway Backend
### Imtehaan AI EdTech Platform

**Everything you need in one place!**

---

## 📦 What You Have Now

### **1. netlify-deployment/** (Frontend)
- ✅ 157 source files
- ✅ 7 media files (4 images + 3 videos)
- ✅ All dependencies
- ✅ Complete documentation
- ✅ Ready for Netlify upload

### **2. railway-backend/** (Backend)
- ✅ 3 Python files (unified_backend.py, grading_api.py, requirements.txt)
- ✅ agents/ folder (3 AI agents)
- ✅ Railway configuration
- ✅ Environment variables guide
- ✅ Ready for Railway deployment

---

## 🚀 DEPLOYMENT STEPS (In Order!)

### **🚂 STEP 1: Deploy Backend to Railway** (5 min)

#### **1.1 Go to Railway**
```
https://railway.app
```
- Sign up or login

#### **1.2 Create New Project**
- Click: **"New Project"** → **"Empty Service"**

#### **1.3 Upload Backend**

**Option A: GitHub (Recommended)**
```bash
# Create GitHub repo for backend
cd railway-backend
# Push to GitHub
# Then connect to Railway
```

**Option B: Railway CLI**
```bash
npm install -g @railway/cli
cd railway-backend
railway login
railway init
railway up
```

#### **1.4 Set Environment Variables in Railway**

**Go to:** Variables tab

**Add these (CRITICAL):**
```bash
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

ALLOWED_ORIGINS=*

HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production

TUTOR_MODEL=gpt-4
GRADING_MODEL=gpt-4
TUTOR_TEMPERATURE=0.7
GRADING_TEMPERATURE=0.1

LOG_LEVEL=INFO
ENABLE_DEBUG=false
REQUEST_TIMEOUT=30
MAX_CONCURRENT_REQUESTS=10
```

**Optional (LangSmith monitoring):**
```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=YOUR_LANGSMITH_API_KEY_HERE
LANGSMITH_PROJECT=imtehaan-ai-tutor
```

#### **1.5 Deploy and Copy URL**

Railway auto-deploys. You'll get:
```
https://imtehaan-backend-production.up.railway.app
```

**📋 COPY THIS URL - You need it for Step 2!**

#### **1.6 Test Backend**
```bash
curl https://your-railway-url.up.railway.app/health
# Expected: {"status": "healthy", "message": "Unified backend is running"}
```

✅ **Backend deployed successfully!**

---

### **🌐 STEP 2: Update Netlify Configuration** (2 min)

#### **2.1 Update netlify.toml**

**Edit:** `netlify-deployment/netlify.toml`

**Line 23-26, change from:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.railway.app/:splat"
```

**To (use YOUR actual Railway URL):**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://imtehaan-backend-production.up.railway.app/:splat"
```

#### **2.2 Update _redirects**

**Edit:** `netlify-deployment/_redirects`

**Line 4, change from:**
```
/api/*  https://your-backend-production.up.railway.app/:splat  200
```

**To (use YOUR actual Railway URL):**
```
/api/*  https://imtehaan-backend-production.up.railway.app/:splat  200
```

✅ **Configuration updated!**

---

### **📤 STEP 3: Deploy Frontend to Netlify** (5 min)

#### **3.1 Go to Netlify**
```
https://app.netlify.com
```
- Sign up or login

#### **3.2 Deploy Site**
- Click: **"Add new site"** → **"Deploy manually"**
- **Drag the `netlify-deployment` folder** into upload area
- Wait ~5 minutes for build

#### **3.3 Get Netlify URL**

After build:
```
Your site is live at: https://wonderful-name-123.netlify.app
```

**📋 COPY THIS URL - You need it for Step 4!**

#### **3.4 Set Environment Variables in Netlify**

**Go to:** Site settings → Environment variables

**Add these 3 variables:**

```
Key: VITE_SUPABASE_URL
Value: https://bgenvwieabtxwzapgeee.supabase.co

Key: VITE_SUPABASE_ANON_KEY
Value: YOUR_SUPABASE_ANON_KEY_HERE

Key: VITE_API_BASE_URL
Value: /api
```

#### **3.5 Trigger Redeploy**

- Go to: Deploys tab
- Click: **"Trigger deploy"** → **"Deploy site"**
- Wait ~3 minutes

✅ **Frontend deployed successfully!**

---

### **🔄 STEP 4: Connect Frontend & Backend** (2 min)

#### **4.1 Update Railway CORS**

**In Railway Dashboard:**
1. Go to: Variables tab
2. Find: `ALLOWED_ORIGINS`
3. Change from: `*`
4. Change to: `https://wonderful-name-123.netlify.app`
   *(use your actual Netlify URL)*
5. Save - Railway auto-redeploys

✅ **CORS configured for security!**

---

### **🧪 STEP 5: Test Everything** (3 min)

#### **5.1 Visit Your Site**
```
https://your-site.netlify.app
```

#### **5.2 Test Features:**

**Test 1: Landing Page**
- ✅ Page loads
- ✅ Video plays
- ✅ Images display

**Test 2: Authentication**
- ✅ Can sign up
- ✅ Can log in
- ✅ Dashboard appears

**Test 3: AI Tutor** (Tests Railway backend)
- Go to: AI Tutor
- Ask: "What is marketing?"
- ✅ AI responds (proves backend works!)

**Test 4: Practice** (Tests Railway grading)
- Go to: Practice Mode
- Select topic
- Answer question
- Submit
- ✅ Gets graded (proves Railway API works!)

**Test 5: Mock Exam** (Tests Railway grading)
- Go to: Mock Exams (P1 or P2)
- Answer questions
- Submit exam
- ✅ Gets graded and shows results

**Test 6: Analytics** (Tests Supabase)
- Go to: Dashboard
- ✅ Study time shows
- ✅ Analytics display
- ✅ Streak updates

---

## ✅ ALL TESTS PASS?

**Congratulations! Your platform is LIVE! 🎉**

---

## 🔗 Your Live URLs

After deployment:

| Service | URL | What It Does |
|---------|-----|--------------|
| **Netlify** | `https://your-site.netlify.app` | Serves frontend |
| **Railway** | `https://your-backend.up.railway.app` | AI & grading |
| **Supabase** | `https://bgenvwieabtxwzapgeee.supabase.co` | Database |

**How they connect:**
```
User → Netlify Frontend → /api/* → Railway Backend → Supabase DB
```

---

## 🆘 Troubleshooting

### **Problem: Can't ask AI Tutor questions**

**Error:** Network error or timeout

**Solution:**
```bash
# 1. Check Railway backend is running
curl https://your-railway-url.up.railway.app/health

# 2. Check netlify.toml has correct Railway URL
# 3. Check Railway ALLOWED_ORIGINS has Netlify URL
# 4. Redeploy both services
```

---

### **Problem: CORS error in browser console**

**Error:** `Access-Control-Allow-Origin header is missing`

**Solution:**
```bash
# In Railway Variables tab:
ALLOWED_ORIGINS=https://your-exact-netlify-url.netlify.app

# Make sure:
# - No trailing slash
# - Exact URL match
# - https:// included

# Then redeploy Railway
```

---

### **Problem: 404 on API calls**

**Error:** `POST /api/grade-answer 404`

**Solution:**
```bash
# 1. Check netlify.toml redirect
# 2. Verify Railway URL is correct
# 3. Test Railway directly:
curl https://your-railway-url.up.railway.app/grade-answer
# 4. Redeploy Netlify
```

---

## 💡 Pro Tips

### **Tip 1: Use Railway Pro**
- $5/month eliminates cold starts
- Backend always warm and fast
- Better user experience

### **Tip 2: Monitor Costs**
- OpenAI dashboard: https://platform.openai.com/usage
- Set spending limits
- Most apps cost $10-30/month

### **Tip 3: Custom Domain**
- Add in Netlify: Site settings → Domain management
- Free SSL included
- Professional look

### **Tip 4: Keep Services Warm**
- Use UptimeRobot (free) to ping Railway health check
- Prevents cold starts
- Better performance

---

## 📊 Final Checklist

Before going live:

### **Railway:**
- [x] Backend deployed
- [x] Environment variables set (14 vars)
- [x] Health check returns 200
- [x] Logs show no errors
- [ ] ALLOWED_ORIGINS updated with Netlify URL

### **Netlify:**
- [x] Frontend deployed
- [x] Environment variables set (3 vars)
- [x] netlify.toml updated with Railway URL
- [x] _redirects updated with Railway URL
- [x] Site loads in browser
- [x] All media files display

### **Integration:**
- [ ] AI Tutor responds to questions
- [ ] Practice grading works
- [ ] Mock exams can be graded
- [ ] Analytics display correctly
- [ ] No CORS errors
- [ ] No 404 errors on API calls

---

## 🎉 Deployment Complete!

**Your Imtehaan AI EdTech Platform is LIVE!**

- ✅ Frontend: Netlify (global CDN, fast)
- ✅ Backend: Railway (AI-powered, scalable)
- ✅ Database: Supabase (secure, managed)
- ✅ All features working
- ✅ HTTPS everywhere
- ✅ Production-ready

**Share your live URL:**
```
https://your-site.netlify.app
```

---

**Total Deployment Time:** ~15 minutes  
**Total Cost:** $5-20/month (mostly OpenAI API)  
**Uptime:** 99.9%+  
**Performance:** Global CDN + Fast backend  

🚀 **Congratulations on deploying your AI EdTech Platform!** 🎓

