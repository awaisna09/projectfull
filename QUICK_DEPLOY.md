# 🚀 Quick Deployment Guide
## Imtehaan AI EdTech Platform

**For:** Production deployment with maximum security  
**Time:** ~15 minutes

---

## ⚡ Quick Start (Production)

### **Prerequisites:**
- Docker and Docker Compose installed
- Domain name pointed to your server
- Supabase account (free tier works)
- OpenAI API key

---

## 📝 Step-by-Step Deployment

### **Step 1: Clone Repository** (2 min)

```bash
# On your server
git clone https://github.com/your-username/imtehaan-ai.git
cd imtehaan-ai
```

### **Step 2: Configure Environment** (5 min)

```bash
# Create production environment file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Required values:**
```bash
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
ALLOWED_ORIGINS=https://yourdomain.com
VITE_API_BASE_URL=/api
ENVIRONMENT=production
```

### **Step 3: Deploy** (5 min)

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Deploy with secure production config
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for containers to start
docker-compose -f docker-compose.prod.yml ps
```

### **Step 4: Verify Security** (2 min)

```bash
# ✅ Frontend should work
curl http://your-domain.com/
# Expected: HTML content

# ✅ API should work via proxy
curl http://your-domain.com/api/health
# Expected: {"status": "healthy"}

# ✅ Backend should NOT be accessible directly
curl http://your-domain.com:8000/health
# Expected: Connection refused (THIS IS GOOD!)

# ✅ Check exposed ports
docker ps | grep imtehaan
# Expected: Only port 80 exposed for frontend
```

### **Step 5: Set Up SSL (Optional but Recommended)** (3 min)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically:
# - Get SSL certificate (free)
# - Configure nginx for HTTPS
# - Set up auto-renewal
```

---

## ✅ Deployment Complete!

Your app is now live at:
- 🌐 **HTTP:** `http://yourdomain.com`
- 🔒 **HTTPS:** `https://yourdomain.com` (if SSL configured)

---

## 🔧 Management Commands

### **View Logs:**
```bash
# All logs
docker-compose -f docker-compose.prod.yml logs -f

# Frontend only
docker-compose -f docker-compose.prod.yml logs -f frontend

# Backend only
docker-compose -f docker-compose.prod.yml logs -f backend
```

### **Restart Services:**
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart backend only
docker-compose -f docker-compose.prod.yml restart backend

# Restart frontend only
docker-compose -f docker-compose.prod.yml restart frontend
```

### **Update Deployment:**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### **Stop Services:**
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.prod.yml down -v
```

---

## 🛡️ Security Verification

After deployment, verify:

```bash
# 1. Check no backend port exposed
docker ps
# Look for: frontend -> 0.0.0.0:80->80/tcp  ✅
# NOT:      backend  -> 0.0.0.0:8000->8000/tcp  ❌

# 2. Check internal network communication
docker exec -it imtehaan_frontend curl http://backend:8000/health
# Expected: {"status": "healthy"}  ✅

# 3. Check external backend access blocked
curl http://your-domain.com:8000/health
# Expected: Connection refused  ✅

# 4. Check API proxy works
curl http://your-domain.com/api/health
# Expected: {"status": "healthy"}  ✅
```

**All tests passed? You're secure! 🔒**

---

## 🆘 Troubleshooting

### **Problem: Can't access website**
```bash
# Check containers are running
docker-compose -f docker-compose.prod.yml ps

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs frontend

# Check firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### **Problem: API calls failing**
```bash
# Check backend is running
docker-compose -f docker-compose.prod.yml logs backend

# Check nginx proxy configuration
docker exec -it imtehaan_frontend cat /etc/nginx/nginx.conf

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec backend env | grep API_KEY
```

### **Problem: CORS errors**
```bash
# Check ALLOWED_ORIGINS in .env.production
cat .env.production | grep ALLOWED_ORIGINS

# Should match your domain:
ALLOWED_ORIGINS=https://yourdomain.com

# Restart backend with correct env
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 📚 Additional Resources

- **Full Security Guide:** `DEPLOYMENT_SECURITY_GUIDE.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Security Fixes:** `SECURITY_FIXES_APPLIED.md`
- **Audit Report:** `SECURITY_AUDIT_COMPLETE.md`

---

## 🎉 Success Indicators

Your deployment is successful if:

✅ Website loads at `http://yourdomain.com`  
✅ Users can sign up and log in  
✅ AI Tutor responds to questions  
✅ Practice questions can be graded  
✅ Mock exams can be submitted  
✅ Analytics display correctly  
✅ No security warnings in browser console  
✅ Backend port 8000 is NOT accessible externally  

**Congratulations! Your platform is now live and secure! 🎓🔒**

---

**Last Updated:** November 2, 2025  
**Deployment Status:** ✅ Production Ready

