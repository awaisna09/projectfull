# 🔒 Deployment Security Guide
## Imtehaan AI EdTech Platform

This guide ensures your deployment is secure and no sensitive data or ports are exposed.

---

## 🚨 Critical Security Checklist

### ✅ **Before Deployment**

- [ ] Remove or secure all API keys from version control
- [ ] Update CORS to allow only your frontend domain
- [ ] Use production Docker Compose (no exposed backend ports)
- [ ] Set up HTTPS/SSL certificates
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Review and rotate all API keys
- [ ] Set strong environment-specific passwords

---

## 🔐 1. Environment Variables Security

### **Never Commit These Files:**
```
❌ config.env
❌ grading_config.env
❌ .env
❌ .env.production
```

### **What's Safe to Commit:**
```
✅ config.env.example (template only, no real keys)
✅ .gitignore (keeps sensitive files out)
✅ docker-compose.prod.yml (references env vars, not values)
```

### **Production Environment Variables:**

Create a `.env.production` file on your server (NEVER commit this):

```bash
# OpenAI API
OPENAI_API_KEY=your_real_openai_key_here

# LangSmith (optional)
LANGSMITH_API_KEY=your_langsmith_key_here
LANGSMITH_PROJECT=imtehaan-ai-tutor
LANGSMITH_TRACING=true

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Frontend Domain (for CORS)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# API Base URL (internal - via nginx proxy)
VITE_API_BASE_URL=/api

# Environment
ENVIRONMENT=production
LOG_LEVEL=WARNING
ENABLE_DEBUG=false
```

---

## 🐳 2. Docker Deployment (Production)

### **Use Production Docker Compose:**

```bash
# Production deployment (SECURE - no exposed backend)
docker-compose -f docker-compose.prod.yml up -d

# Development only (INSECURE - exposes all ports)
docker-compose -f docker-compose.dev.yml up -d
```

### **Production Architecture:**

```
Internet
    ↓
┌─────────────────────────────────────┐
│  Port 80 (HTTP) or 443 (HTTPS)     │
│  ↓                                   │
│  NGINX (Frontend)                   │
│  ├── Serves React App               │
│  └── /api/* → Backend (internal)    │
└─────────────────────────────────────┘
         ↓ (internal network only)
┌─────────────────────────────────────┐
│  Backend (Port 8000)                │
│  ❌ NOT EXPOSED to internet         │
│  ✅ Only accessible via nginx       │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Supabase (hosted service)          │
│  ✅ Managed security & RLS           │
└─────────────────────────────────────┘
```

**Key Points:**
- ✅ Only port 80 (or 443 for HTTPS) is exposed
- ✅ Backend port 8000 is INTERNAL only
- ✅ All API calls go through nginx proxy (`/api/*`)
- ✅ Direct backend access is impossible from internet

---

## 🌐 3. CORS (Cross-Origin Resource Sharing)

### **Development (Permissive):**
```bash
ALLOWED_ORIGINS=*  # Allows all origins (dev only!)
```

### **Production (Secure):**
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**The backend will:**
- ✅ Only accept requests from specified domains
- ✅ Reject requests from unknown origins
- ✅ Warn if using `*` in production

---

## 🔒 4. API Endpoints Security

### **Production API Access:**

All API calls go through nginx proxy:
```typescript
// ✅ CORRECT - Uses proxy
fetch('/api/grade-answer', { ... })

// ❌ WRONG - Direct backend access (blocked in production)
fetch('http://backend:8000/grade-answer', { ... })
```

### **Environment-Based URLs:**

The app automatically uses the correct URL:
```typescript
// Development: http://localhost:8000
// Production:  /api (proxied by nginx)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

---

## 🗄️ 5. Database Security (Supabase)

### **Row Level Security (RLS) Policies:**

Ensure these are enabled in Supabase dashboard:

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON daily_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert own data" ON daily_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Apply to all tables:
-- ✅ daily_analytics
-- ✅ learning_activities
-- ✅ page_sessions
-- ✅ study_plans
-- ✅ mock_exam_attempts
```

### **Public Anon Key:**

The `VITE_SUPABASE_ANON_KEY` in your code is **safe to expose** because:
- ✅ It's designed for client-side use
- ✅ RLS policies enforce data security
- ✅ Users can only access their own data
- ✅ No admin privileges

**Never expose:**
- ❌ Service role key
- ❌ Database password
- ❌ JWT secret

---

## 🔑 6. API Keys Management

### **OpenAI API Key:**

**Security measures:**
- ✅ Stored in `.env` file (not committed)
- ✅ Only accessible by backend (never exposed to client)
- ✅ Used server-side only
- ✅ Set usage limits in OpenAI dashboard

### **LangSmith API Key:**

**Security measures:**
- ✅ Stored in `.env` file (not committed)
- ✅ Only for tracing/monitoring
- ✅ Can be disabled (`LANGSMITH_TRACING=false`)

---

## 🛡️ 7. Network Security

### **Exposed Ports (Production):**

```yaml
Frontend:  80 (HTTP) or 443 (HTTPS) ✅ EXPOSED
Backend:   8000                       ❌ NOT EXPOSED
Database:  5432                       ❌ NOT EXPOSED (use hosted Supabase)
```

### **Internal Communication:**

All services communicate via Docker internal network:
```
Frontend → Backend:  via nginx proxy (/api/*)
Backend → Database:  via Supabase hosted service
```

---

## 📝 8. Deployment Steps (Production)

### **Step 1: Prepare Environment**

On your server, create `.env.production`:
```bash
cp config.env.example .env.production
nano .env.production  # Edit with real values
```

### **Step 2: Build and Deploy**

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Deploy with production config
docker-compose -f docker-compose.prod.yml up -d --build

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### **Step 3: Verify Security**

```bash
# Check exposed ports (should only see 80)
docker ps

# Check backend is NOT accessible externally
curl http://your-server-ip:8000/health  # Should fail ✅

# Check frontend is accessible
curl http://your-server-ip/  # Should work ✅

# Check API proxy works
curl http://your-server-ip/api/health  # Should work ✅
```

---

## 🔒 9. HTTPS/SSL Setup (Recommended)

### **Using Let's Encrypt (Free SSL):**

1. **Install Certbot:**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Get SSL Certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Update nginx.conf:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

4. **Update Docker Compose:**
```yaml
frontend:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

---

## 🚨 10. Security Checklist Summary

### **✅ What's Secure:**

- [x] Backend port 8000 NOT exposed to internet
- [x] API calls proxied through nginx (`/api/*`)
- [x] Environment variables in `.env` files (gitignored)
- [x] CORS restricted to specific domains (production)
- [x] Supabase RLS policies active
- [x] No hardcoded API keys in code
- [x] Public anon key safe to expose (RLS protected)
- [x] HTTPS/SSL recommended and configurable
- [x] Security headers in nginx (X-Frame-Options, etc.)
- [x] Docker containers run as non-root (production)

### **❌ What to Avoid:**

- [ ] Don't expose backend port 8000 to internet
- [ ] Don't commit `.env` or `config.env` files
- [ ] Don't use `ALLOWED_ORIGINS=*` in production
- [ ] Don't expose Supabase service role key
- [ ] Don't hardcode API keys in code
- [ ] Don't disable Supabase RLS policies
- [ ] Don't use HTTP in production (use HTTPS)
- [ ] Don't run containers as root

---

## 🧪 11. Testing Security

### **Penetration Testing:**

```bash
# 1. Check backend is not accessible
curl http://your-domain.com:8000/health
# Expected: Connection refused or timeout ✅

# 2. Check API proxy works
curl http://your-domain.com/api/health
# Expected: {"status": "healthy"} ✅

# 3. Check CORS
curl -H "Origin: http://evil-site.com" http://your-domain.com/api/health
# Expected: CORS error (if properly configured) ✅

# 4. Check frontend is served
curl http://your-domain.com/
# Expected: HTML content ✅
```

---

## 📊 12. Monitoring & Logging

### **Check Logs:**

```bash
# Frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Watch for security warnings
docker-compose -f docker-compose.prod.yml logs | grep "WARNING\|ERROR"
```

### **Monitor for Security Issues:**

- ✅ Check for failed authentication attempts
- ✅ Monitor for unusual API usage patterns
- ✅ Review LangSmith traces for anomalies
- ✅ Set up OpenAI usage alerts

---

## 🔄 13. Updates & Maintenance

### **Update Dependencies:**

```bash
# Update Python packages
pip list --outdated
pip install --upgrade package-name

# Update npm packages
npm outdated
npm update
```

### **Rotate API Keys (Every 90 days):**

1. Generate new OpenAI API key
2. Update `.env.production` on server
3. Restart backend: `docker-compose -f docker-compose.prod.yml restart backend`
4. Delete old key from OpenAI dashboard

---

## 📞 14. Emergency Response

### **If API Key is Compromised:**

```bash
# 1. Immediately revoke the key in OpenAI dashboard
# 2. Generate new key
# 3. Update environment variables
nano .env.production  # Update OPENAI_API_KEY

# 4. Restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# 5. Review logs for unauthorized usage
docker-compose -f docker-compose.prod.yml logs backend | grep "ERROR\|WARNING"
```

---

## 🎯 15. Production Deployment Command

**Single Command for Secure Deployment:**

```bash
# Set environment to production
export ENVIRONMENT=production

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d --build

# Verify security
echo "✅ Checking exposed ports..."
docker ps | grep "8000"  # Should show NO external port mapping for backend

echo "✅ Checking frontend access..."
curl http://your-domain.com/  # Should work

echo "✅ Checking backend is internal only..."
curl http://your-domain.com:8000/  # Should fail (connection refused)

echo "✅ Checking API proxy works..."
curl http://your-domain.com/api/health  # Should work via nginx proxy

echo "🎉 Deployment is secure!"
```

---

## 📋 16. Quick Reference

### **File Security Status:**

| File | Status | Action |
|------|--------|--------|
| `config.env` | 🔴 SENSITIVE | Never commit, gitignored |
| `grading_config.env` | 🔴 SENSITIVE | Never commit, gitignored |
| `config.env.example` | 🟢 SAFE | Template only, can commit |
| `docker-compose.prod.yml` | 🟢 SAFE | Uses env vars, can commit |
| `docker-compose.dev.yml` | 🟡 DEV ONLY | Exposes ports, dev only |
| `.gitignore` | 🟢 SAFE | Critical for security |
| `utils/supabase/info.tsx` | 🟢 SAFE | Public anon key (RLS protected) |

### **Port Security:**

| Port | Service | Production | Development |
|------|---------|------------|-------------|
| 80 | Frontend (nginx) | ✅ EXPOSED | ✅ EXPOSED |
| 443 | Frontend (HTTPS) | ✅ EXPOSED | ❌ Not needed |
| 8000 | Backend API | ❌ INTERNAL ONLY | ⚠️ Exposed (dev) |
| 5432 | Database | ❌ Use hosted | ⚠️ Exposed (dev) |
| 5173 | Vite dev server | ❌ Not used | ⚠️ Exposed (dev) |

### **CORS Configuration:**

| Environment | Setting | Security |
|-------------|---------|----------|
| Development | `ALLOWED_ORIGINS=*` | ⚠️ Permissive |
| Production | `ALLOWED_ORIGINS=https://yourdomain.com` | ✅ Secure |

---

## 🎓 17. Best Practices

### **DO:**

✅ Use environment variables for all secrets  
✅ Enable HTTPS with SSL certificates  
✅ Set up Supabase RLS policies  
✅ Use production Docker Compose in production  
✅ Monitor logs for security issues  
✅ Rotate API keys regularly  
✅ Keep dependencies updated  
✅ Use strong, unique passwords  
✅ Enable 2FA on all accounts (Supabase, OpenAI, etc.)  
✅ Set up rate limiting on API endpoints  

### **DON'T:**

❌ Expose backend port 8000 to internet  
❌ Commit `.env` or `config.env` files  
❌ Use `ALLOWED_ORIGINS=*` in production  
❌ Hardcode API keys in source code  
❌ Disable Supabase RLS  
❌ Use HTTP in production (use HTTPS)  
❌ Share API keys via email or chat  
❌ Reuse passwords across services  
❌ Run Docker containers as root  
❌ Ignore security warnings in logs  

---

## 🚀 18. Deployment Platforms

### **Recommended Platforms:**

| Platform | Frontend | Backend | Database | Difficulty |
|----------|----------|---------|----------|------------|
| **Vercel + Railway** | Vercel | Railway | Supabase | ⭐⭐ Easy |
| **Netlify + Render** | Netlify | Render | Supabase | ⭐⭐ Easy |
| **AWS (ECS/Fargate)** | S3+CloudFront | ECS | Supabase | ⭐⭐⭐⭐ Advanced |
| **Google Cloud Run** | Cloud Run | Cloud Run | Supabase | ⭐⭐⭐ Medium |
| **DigitalOcean** | App Platform | App Platform | Supabase | ⭐⭐⭐ Medium |
| **Self-hosted (VPS)** | Docker | Docker | Supabase | ⭐⭐⭐⭐ Advanced |

**All options use Supabase (hosted) for database - RLS handles security automatically.**

---

## 🎯 19. Quick Setup Guide

### **Option 1: Railway + Vercel (Recommended for beginners)**

**Backend on Railway:**
```bash
# 1. Connect GitHub repo to Railway
# 2. Add environment variables in Railway dashboard
# 3. Deploy - Railway handles everything
```

**Frontend on Vercel:**
```bash
# 1. Connect GitHub repo to Vercel
# 2. Set environment variables:
#    VITE_SUPABASE_URL=your_supabase_url
#    VITE_SUPABASE_ANON_KEY=your_anon_key
#    VITE_API_BASE_URL=https://your-backend.railway.app
# 3. Deploy - Vercel builds automatically
```

### **Option 2: Self-hosted VPS**

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone repository
git clone https://github.com/your-username/imtehaan-ai.git
cd imtehaan-ai

# 3. Create production .env
nano .env.production  # Add all secrets

# 4. Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Set up domain and SSL
sudo certbot --nginx -d yourdomain.com
```

---

## ✅ 20. Security Verification

After deployment, verify:

```bash
# 1. Check no sensitive data in repository
git log --all --full-history --source -- config.env
# Expected: Nothing found ✅

# 2. Check backend port is not exposed
nmap your-server-ip -p 8000
# Expected: Closed or filtered ✅

# 3. Check frontend works
curl -I http://your-domain.com/
# Expected: 200 OK ✅

# 4. Check API proxy works
curl http://your-domain.com/api/health
# Expected: {"status": "healthy"} ✅

# 5. Verify CORS
curl -H "Origin: http://evil-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://your-domain.com/api/grade-answer
# Expected: No CORS headers (blocked) ✅
```

---

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OpenAI API Security](https://platform.openai.com/docs/guides/safety-best-practices)

---

## 🆘 Support

If you encounter security issues:
1. Check logs: `docker-compose logs`
2. Review this guide
3. Verify environment variables
4. Test with curl commands above
5. Consult platform documentation

---

**Last Updated:** November 2, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready with Security Hardening

