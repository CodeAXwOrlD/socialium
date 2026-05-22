# 🔧 SOCIALIUM QUICK CONFIGURATION GUIDE

## Current Status: ✅ 82.5% INTEGRATED

---

## ✅ WHAT'S ALREADY WORKING

- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ Supabase authentication
- ✅ OpenAI GPT-4o content generation
- ✅ Qdrant vector database
- ✅ Redis caching
- ✅ WhatsApp notifications (WapiHub)
- ✅ Twilio SMS
- ✅ LinkedIn OAuth
- ✅ Langfuse monitoring
- ✅ PostHog analytics
- ✅ All 15 API routers registered
- ✅ All 8 frontend services connected
- ✅ JWT authentication configured
- ✅ OAuth token encryption configured
- ✅ Light/dark theme working
- ✅ All pages theme-consistent

---

## 🚨 WHAT NEEDS CONFIGURATION

### 1. Stripe (For Billing)
**File:** `backend/.env`
```bash
# Replace these with real keys from https://dashboard.stripe.com
STRIPE_SECRET_KEY=sk_test_YOUR_REAL_STRIPE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_REAL_WEBHOOK_SECRET
```

### 2. Twitter/X OAuth (For Twitter Posting)
**File:** `backend/.env`
```bash
# Get keys from https://developer.twitter.com
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

### 3. Instagram OAuth (For Instagram Posting)
**File:** `backend/.env`
```bash
# Get keys from https://developers.facebook.com
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
```

### 4. Facebook OAuth (For Facebook Posting)
**File:** `backend/.env`
```bash
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 5. Frontend Supabase (Optional - For Client-Side Auth)
**File:** `frontend/.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://wsmomseoogkecterxuxr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbW9tc2Vvb2drZWN0ZXJ4dXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDI3ODUsImV4cCI6MjA5MzcxODc4NX0.BaOeWm88l5FuaT9uFjmzky2Xs-iW__PM-YE4oXJOzv8
```

### 6. Frontend PostHog (Optional - For Product Analytics)
**File:** `frontend/.env.local`
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_nCjbHnWBZeYdBqsRAQg62xaL39idyVDeDmjrasmupMg
```

---

## 📋 ENVIRONMENT FILES SUMMARY

### Backend (.env) - 30 Variables
```
✅ Database URL
✅ Redis URL
✅ Supabase (4 vars)
✅ JWT (4 vars) ✅ NEW
✅ Encryption Key ✅ NEW
✅ OpenAI API
✅ Qdrant (2 vars)
✅ Langfuse (3 vars)
✅ PostHog (3 vars)
✅ WhatsApp/WapiHub (4 vars)
✅ Twilio (4 vars)
✅ LinkedIn (3 vars)
⚠️ Twitter (2 vars) - NEEDS SETUP
⚠️ Instagram (2 vars) - NEEDS SETUP
⚠️ Facebook (2 vars) - NEEDS SETUP
⚠️ Stripe (2 vars) - NEEDS REAL KEYS
✅ Frontend URL
✅ Secret Key
```

### Frontend (.env.local) - 5 Variables
```
✅ API URL
⚠️ Supabase URL - OPTIONAL
⚠️ Supabase Key - OPTIONAL
⚠️ PostHog Key - OPTIONAL
✅ PostHog Host
```

---

## 🔌 EXTERNAL SERVICES STATUS

| Service | Status | Notes |
|---------|--------|-------|
| Supabase | ✅ Connected | Auth working |
| OpenAI | ✅ Connected | GPT-4o live |
| Qdrant | ✅ Connected | Vector DB ready |
| Redis | ✅ Connected | Caching active |
| WhatsApp | ✅ Connected | WapiHub working |
| Twilio | ✅ Connected | SMS ready |
| LinkedIn | ✅ Connected | OAuth working |
| Langfuse | ✅ Connected | Monitoring active |
| PostHog | ✅ Connected | Analytics ready |
| Twitter | ❌ Not configured | Need dev app |
| Instagram | ❌ Not configured | Need dev app |
| Facebook | ❌ Not configured | Need dev app |
| Stripe | ⚠️ Test mode | Need real keys |

---

## 🚀 QUICK START

### Start Backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Test API:
```bash
curl http://localhost:8000/health
```

### View API Docs:
```
http://localhost:8000/docs
```

---

## 📊 WHAT YOU CAN DO RIGHT NOW

✅ Sign up / Log in
✅ Create workspaces
✅ Generate AI content
✅ Manage content drafts
✅ Approve/reject content
✅ Auto-reply to comments
✅ View trending topics
✅ Schedule posts
✅ View analytics
✅ Connect LinkedIn
✅ Receive WhatsApp notifications
✅ Get SMS alerts
✅ Use light/dark theme

⚠️ Can't do yet (needs config):
- Connect Twitter
- Connect Instagram
- Connect Facebook
- Process real payments

---

## 🔒 SECURITY NOTES

- JWT Secret: ✅ Configured
- OAuth Encryption: ✅ Configured
- CORS: ✅ Allows localhost:3000-3003
- Supabase JWT: ✅ Configured
- API Keys: ✅ All critical services connected

---

## 📚 DETAILED DOCUMENTATION

- **Full Integration Report:** `INTEGRATION_STATUS.md`
- **Audit Script:** `integration_audit.py`
- **Backend Config:** `backend/app/config.py`
- **Frontend Config:** `frontend/.env.local`
- **API Routers:** `backend/app/routers/`
- **Frontend Services:** `frontend/src/services/`

---

**Last Updated:** 2026-05-16
**Status:** Production ready for core features
