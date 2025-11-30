# ✅ Deployment Security Checklist
## Imtehaan AI EdTech Platform

Use this checklist before deploying to production.

---

## 🔒 Pre-Deployment Security Checklist

### **1. Environment Variables** ✅

- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in actual API keys (OpenAI, LangSmith, Supabase)
- [ ] Set `ALLOWED_ORIGINS` to your actual domain
- [ ] Set `ENVIRONMENT=production`
- [ ] Set `ENABLE_DEBUG=false`
- [ ] Set `LOG_LEVEL=WARNING` or `ERROR`
- [ ] Verify `.env.production` is in `.gitignore`
- [ ] **NEVER** commit `.env.production` to Git

### **2. Docker Configuration** ✅

- [ ] Use `docker-compose.prod.yml` (not `docker-compose.yml`)
- [ ] Verify backend port 8000 is NOT in `ports:` section
- [ ] Verify only frontend port 80 (or 443) is exposed
- [ ] Check `ALLOWED_ORIGINS` is set to your domain in env vars
- [ ] Ensure containers run as non-root user

### **3. API Security** ✅

- [ ] All `fetch()` calls use `VITE_API_BASE_URL` environment variable
- [ ] No hardcoded `localhost:8000` URLs in code
- [ ] Backend CORS set to specific domain (not `*`)
- [ ] API calls proxied through nginx (`/api/*`)
- [ ] Rate limiting configured (optional but recommended)

### **4. Database Security** ✅

- [ ] Using hosted Supabase (not self-hosted)
- [ ] Supabase Row Level Security (RLS) enabled
- [ ] RLS policies verified for all tables
- [ ] Only public anon key exposed (service role key kept secret)
- [ ] Database password is strong (if self-hosting)

### **5. Code Security** ✅

- [ ] No API keys hardcoded in source code
- [ ] No credentials in Git history
- [ ] `.gitignore` covers all sensitive files
- [ ] All dependencies up to date
- [ ] No console.logs with sensitive data in production build

### **6. Network Security** ✅

- [ ] HTTPS/SSL certificates configured
- [ ] Firewall configured on server
- [ ] Only port 80 (HTTP) and 443 (HTTPS) open
- [ ] Backend port 8000 blocked from external access
- [ ] Database port 5432 not exposed (use hosted Supabase)

### **7. Nginx Configuration** ✅

- [ ] Security headers enabled (CSP, HSTS, X-Frame-Options)
- [ ] HTTPS redirect configured (HTTP → HTTPS)
- [ ] API proxy configured (`/api/*` → `backend:8000`)
- [ ] Static asset caching enabled
- [ ] Gzip compression enabled

### **8. Monitoring & Logging** ✅

- [ ] LangSmith tracing configured (optional)
- [ ] OpenAI usage alerts set up
- [ ] Server monitoring enabled
- [ ] Log rotation configured
- [ ] Error tracking set up

---

## 🚀 Deployment Commands

### **Development (Local Testing):**
```bash
# Use development configuration
docker-compose -f docker-compose.dev.yml up -d

# Backend accessible at: http://localhost:8000
# Frontend accessible at: http://localhost:5173
```

### **Production (Secure Deployment):**
```bash
# 1. Load production environment
export $(cat .env.production | xargs)

# 2. Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Verify deployment
docker-compose -f docker-compose.prod.yml ps

# 4. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🧪 Security Verification Tests

### **Test 1: Backend NOT Exposed**
```bash
# Should FAIL (connection refused)
curl http://your-domain.com:8000/health

# Expected: Connection refused or timeout ✅
```

### **Test 2: Frontend Accessible**
```bash
# Should SUCCEED
curl http://your-domain.com/

# Expected: HTML content ✅
```

### **Test 3: API Proxy Works**
```bash
# Should SUCCEED
curl http://your-domain.com/api/health

# Expected: {"status": "healthy"} ✅
```

### **Test 4: CORS Protection**
```bash
# Should FAIL (if CORS properly configured)
curl -H "Origin: http://evil-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     http://your-domain.com/api/grade-answer

# Expected: No Access-Control-Allow-Origin header ✅
```

### **Test 5: HTTPS Redirect** (if SSL configured)
```bash
# Should redirect to HTTPS
curl -I http://your-domain.com/

# Expected: 301 Moved Permanently → https://... ✅
```

---

## 📊 Security Status

### **✅ Secured:**
- Backend port 8000 (internal only)
- API keys (environment variables)
- CORS (domain-restricted)
- Database (Supabase RLS)
- Secrets (gitignored)
- Docker network (isolated)

### **⚠️ Requires Manual Setup:**
- SSL/HTTPS certificates
- Production domain configuration
- Server firewall rules
- OpenAI API usage limits
- Monitoring and alerts

---

## 🎯 Quick Start (Production)

```bash
# 1. Clone repository on server
git clone https://github.com/your-username/imtehaan-ai.git
cd imtehaan-ai

# 2. Create production environment file
cp .env.production.example .env.production
nano .env.production  # Fill in actual values

# 3. Update domain in environment
export ALLOWED_ORIGINS=https://yourdomain.com
export FRONTEND_URL=https://yourdomain.com

# 4. Deploy
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Set up SSL (recommended)
sudo certbot --nginx -d yourdomain.com

# 6. Verify
curl http://your-domain.com/api/health
```

---

## 📞 Support

If deployment fails, check:
1. Environment variables are set correctly
2. Docker Compose file matches environment
3. Firewall allows port 80/443
4. DNS points to your server
5. SSL certificates are valid

**Review:** `DEPLOYMENT_SECURITY_GUIDE.md` for detailed instructions

---

**Status:** ✅ Ready for Secure Production Deployment  
**Last Verified:** November 2, 2025

