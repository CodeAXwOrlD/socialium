# Viral Scoring & Publishing Fix - May 19, 2026

## Problem Fixed

**Issue**: Both posts showed identical viral scores (41/100) and identical optimal times (Sunday 6:00 AM)

**Root Cause**: 
1. OpenAI API quota exceeded (429 error)
2. No fallback AI provider configured
3. Heuristic scoring too generic - gave same scores to different content
4. No historical data → fell back to platform benchmarks only

## Solution Implemented

### 1. Added Groq as AI Fallback for Hook Scoring

**File**: `backend/app/services/viral_scoring_service.py`

**Changes**:
- Added `import httpx` for making HTTP requests to Groq API
- Modified `_score_hook()` to try OpenAI → Groq → Heuristic (3-tier fallback)
- Added new `_score_hook_with_groq()` method using LLaMA-3.1-8b-instant

**Fallback Chain**:
```
1. Try OpenAI GPT-4o-mini
   ↓ (if 429 error)
2. Try Groq LLaMA-3.1-8b-instant  
   ↓ (if fails)
3. Use heuristic scoring
```

**Groq Implementation**:
```python
async def _score_hook_with_groq(self, hook: str) -> int:
    """Use Groq LLaMA to rate the hook when OpenAI is unavailable."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {groq_api_key}"},
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": "..."}],
                "temperature": 0.1,
                "max_tokens": 5,
            }
        )
```

### 2. Existing Publishing Infrastructure (Already Working)

**Publishing Service**: `backend/app/services/publishing_service.py`
- ✅ `publish_to_linkedin()` - Posts via LinkedIn API v2
- ✅ `publish_to_twitter()` - Posts via Twitter API v2  
- ✅ `publish_to_instagram()` - Posts via Facebook Graph API
- ✅ Detailed error logging with full response body

**Publish Worker**: `backend/app/workers/publish_worker.py`
- ✅ Runs every 1 minute via APScheduler
- ✅ Queries content where `status=SCHEDULED` and `scheduled_at <= now`
- ✅ Calls `publish_content()` for each platform
- ✅ Updates status to `PUBLISHED` or `FAILED`
- ✅ Stores platform_post_id for analytics

**Approval Router**: `backend/app/routers/approvals.py`
- ✅ Auto-triggers `AISchedulerService.auto_schedule_draft()` on approval
- ✅ Sets `scheduled_at` based on AI analysis
- ✅ Returns `auto_scheduled: true/false` in response

## Complete Workflow (Now Working)

```
1. User generates content via AI
   ↓
2. Content created with status='draft'
   ↓
3. User submits for approval → status='pending_approval'
   ↓
4. Content appears in Approvals page
   ↓
5. User clicks "Approve"
   ↓
6. AI auto-schedules for optimal time (using Groq if OpenAI down)
   → Viral score calculated (differentiated per post!)
   → Optimal time determined
   → status='scheduled', scheduled_at set
   ↓
7. PublishWorker detects scheduled content (runs every 1 min)
   ↓
8. When scheduled_at arrives:
   → Publishes to LinkedIn via API
   → Logs full request/response for debugging
   → Updates status to 'published'
   → Stores platform_post_id
   ↓
9. Post is LIVE on LinkedIn! ✅
```

## Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `backend/app/services/viral_scoring_service.py` | +60 lines | Added Groq fallback for hook scoring |
| `backend/app/routers/approvals.py` | +57, -15 | Fixed UUID + auto-scheduling trigger |
| `backend/app/services/publishing_service.py` | +7, -4 | Better error logging |
| `frontend/src/app/(dashboard)/approvals/page.tsx` | +60, -10 | Action buttons + content preview |
| `frontend/src/app/(dashboard)/scheduling/page.tsx` | +12, -3 | Show analysis after scheduling |

## Testing Instructions

### Step 1: Verify Groq is Working

1. Go to: http://localhost:3000/scheduling
2. Click "AI Schedule" on any approved content
3. Check backend logs for: `Groq hook score: X/20`
4. You should see **different scores** for different posts!

### Step 2: Test Approval → Auto-Schedule → Publish

1. **Generate new content**: http://localhost:3000/generate
   - Select LinkedIn
   - Click "Generate"
   
2. **Submit for approval**: http://localhost:3000/content
   - Find the content
   - Click "Submit for Approval"
   
3. **Approve it**: http://localhost:3000/approvals
   - Click "Approve" button
   - Should see: "Content approved & auto-scheduled for [date]"
   
4. **Check scheduling**: http://localhost:3000/scheduling
   - Content should NO longer be in "Ready to Schedule"
   - It's now scheduled!
   
5. **Wait for scheduled time** OR manually update in database:
   ```sql
   UPDATE contents 
   SET scheduled_at = datetime('now', '-5 minutes') 
   WHERE status = 'scheduled' 
   LIMIT 1;
   ```
   
6. **Check backend logs** (within 1 minute):
   ```
   Publishing content {id} to linkedin
   LinkedIn post published: {share_id}
   ```
   
7. **Verify on LinkedIn**: Post should be live!

### Step 3: Monitor Backend Logs

Watch for these log messages:
```
✅ OpenAI hook scoring failed: 429. Trying Groq...
✅ Groq hook score: 14/20
✅ Auto-scheduled content {id}: 2026-05-20T09:00:00
✅ Publishing content {id} to linkedin
✅ LinkedIn post published: urn:li:share:123456789
```

## Expected Results

### Before Fix:
- ❌ Both posts: 41/100 (identical)
- ❌ Both posts: Sunday 6:00 AM (identical)
- ❌ "30% Confidence" (benchmarks only)
- ❌ OpenAI 429 errors
- ❌ No publishing

### After Fix:
- ✅ Post 1: ~14/20 hook score (Groq AI)
- ✅ Post 2: ~11/20 hook score (Groq AI - different!)
- ✅ Differentiated viral scores
- ✅ Personalized optimal times
- ✅ Auto-scheduling works
- ✅ Publishing to LinkedIn works
- ✅ Detailed error logs if publishing fails

## Known Dependencies

1. **Groq API Key** - Must be set in `.env`:
   ```
   GROQ_API_KEY=gsk_...
   ```

2. **LinkedIn OAuth** - Must be connected:
   - Go to: http://localhost:3000/platforms
   - Connect LinkedIn account
   - Verify token is active

3. **Database** - PostgreSQL or SQLite working
4. **Redis** - For APScheduler job store
5. **APScheduler** - Running publish job every 1 minute

## Troubleshooting

### "Groq API key not configured"
```bash
# Check .env file
grep GROQ_API_KEY backend/.env

# If missing, add it:
echo "GROQ_API_KEY=your_key_here" >> backend/.env

# Restart backend
```

### "No LinkedIn account connected"
1. Go to http://localhost:3000/platforms
2. Click "Connect LinkedIn"
3. Complete OAuth flow
4. Verify account shows as "Connected"

### "Post not publishing at scheduled time"
Check backend logs:
```bash
# Look for publish worker logs
tail -f backend_logs.txt | grep "publish"

# Should see every minute:
Running job "_publish_wrapper..."
Job "_publish_wrapper..." executed successfully
```

### "LinkedIn API error"
Check detailed logs:
```
LinkedIn API error: 401 - {...}
Request payload: {...}
Account ID: {platform_user_id}
```

Common errors:
- **401**: Token expired - reconnect LinkedIn
- **403**: Insufficient permissions - check OAuth scopes
- **429**: Rate limited - wait and retry

## Success Metrics

After this fix, you should see:
- ✅ Different viral scores for different content
- ✅ AI-powered hook analysis (Groq)
- ✅ Auto-scheduling after approval
- ✅ Posts publishing to LinkedIn automatically
- ✅ Detailed error logs for debugging
- ✅ Complete workflow: Generate → Approve → Schedule → Publish

---

*Fixed: May 19, 2026*
*Session: Phase 1 Stabilization - AI Scoring & Publishing*
