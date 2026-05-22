# 🔧 AI Generation Limit - Quick Fix Guide

## Current Issue
You've hit the **daily AI generation limit**: 5/5 generations used (FREE tier)

## Quick Solutions

### Option 1: Restart Backend (Easiest - For Development)
Since Redis is not running, the counter is in-memory and will reset when you restart the backend:

```bash
# Stop the backend (Ctrl+C)
# Then restart it:
cd backend
uvicorn app.main:app --reload --port 8000
```

This resets the in-memory counter to 0.

---

### Option 2: Increase FREE Tier Limit (For Testing)

Edit `backend/app/core/constants.py` and change the FREE tier limit:

```python
TIER_LIMITS: dict[SubscriptionTier, dict[str, int]] = {
    SubscriptionTier.FREE: {
        "max_workspaces": 1,
        "max_team_members": 1,
        "max_platforms": 2,
        "max_scheduled_posts": 10,
        "ai_generations_per_day": 50,  # Changed from 5 to 50 for testing
        "analytics_history_days": 7,
        "ab_testing_enabled": False,
    },
    # ... rest stays the same
}
```

Then restart the backend.

---

### Option 3: Install Redis (Production-Ready)

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Then check usage:
python3 reset_generation_limit.py --show

# Or reset counter:
python3 reset_generation_limit.py
```

---

### Option 4: Upgrade Tier (Simulate PRO/Business)

The backend currently uses `SubscriptionTier.FREE` by default. You can temporarily change it in the rate limiter:

Edit `backend/app/core/rate_limiter.py`, line 31:

```python
async def check_generation_limit(
    workspace_id: str,
    tier: SubscriptionTier = SubscriptionTier.PRO,  # Changed from FREE to PRO
) -> tuple[bool, int, int]:
```

This gives you **50 generations/day** instead of 5.

---

## Current Tier Limits

| Feature | FREE | PRO | BUSINESS |
|---------|------|-----|----------|
| AI Generations/Day | **5** | 50 | 500 |
| Workspaces | 1 | 3 | 10 |
| Team Members | 1 | 5 | 20 |
| Platforms | 2 | 5 | 15 |
| Scheduled Posts | 10 | 50 | 500 |
| Analytics History | 7 days | 90 days | 365 days |
| A/B Testing | ❌ | ✅ | ✅ |

---

## Recommended for Development

**For local testing**, increase the FREE tier limit to 50 or 100:

1. Open `backend/app/core/constants.py`
2. Find line 75: `"ai_generations_per_day": 5,`
3. Change to: `"ai_generations_per_day": 100,`
4. Restart backend

This way you won't hit the limit during testing, and it's easy to change back later.

---

## Monitor Usage

After generating content, check the usage counter shown on the page:
```
AI Usage: 3/5 generations today
```

Or check the API response:
```json
{
  "usage": {
    "used": 3,
    "limit": 5
  }
}
```

---

**Last Updated:** 2026-05-16
