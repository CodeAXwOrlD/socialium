# AI-Powered Auto-Scheduling System

## Overview

Socialium now features a **fully autonomous AI scheduling system** that analyzes multiple data layers to determine the **optimal time to post** on each social media platform.

---

## 🎯 How It Works

### AI Decision Engine

When you click **"AI Auto-Schedule"**, the system performs a comprehensive 4-step analysis:

```
1. Viral Potential Scoring (6 factors, 0-100)
   ↓
2. Audience Activity Analysis (5 data layers)
   ↓
3. Optimal Time Prediction
   ↓
4. Autonomous Scheduling Decision
```

---

## 📊 Step 1: Viral Potential Scoring

Every piece of content is scored across **6 weighted factors**:

| Factor | Weight | Method |
|--------|--------|--------|
| **Hook Strength** | 0-20 | GPT-4o-mini rates opening line effectiveness |
| **Emotional Triggers** | 0-20 | Pattern matching across 5 viral emotions (awe, anger, joy, surprise, trust) |
| **Trend Alignment** | 0-20 | Cross-reference with cached trending keywords |
| **Historical Performance** | 0-20 | Qdrant similarity search vs past successful posts |
| **Content Uniqueness** | 0-10 | Penalizes near-duplicate content |
| **Platform Algorithm Fit** | 0-10 | Character length, hashtag count, boost/penalty keywords |

**Total Score: 0-100**

### Viral Probability Tiers

| Score Range | Tier | Action |
|-------------|------|--------|
| 65-100 | 🟢 High Viral | **Auto-schedule** at peak time |
| 40-64 | 🟡 Medium | **Suggest times** for user confirmation |
| < 40 | 🔴 Low | **Flag for improvement** |

---

## 📈 Step 2: Audience Activity Analysis

The system analyzes **5 weighted data layers** to find when your audience is most active:

| Data Layer | Weight | Source |
|------------|--------|--------|
| **Workspace Historical Data** | 40% | Your past 90 days of engagement per hour/day |
| **Platform Benchmarks** | 25% | Research-backed best times per audience segment |
| **Day-of-Week Intelligence** | 20% | Which days perform best for your brand |
| **Competitor Quiet Windows** | 15% | Post when competition is low |
| **Viral Score Modifier** | Variable | Adjusts strategy (peak/pre-peak/off-peak) |

### Platform Benchmarks (Industry Standards)

**LinkedIn:**
- Best days: Tuesday, Wednesday, Thursday
- Best times: 8-10 AM, 12 PM, 5-6 PM
- Worst days: Saturday, Sunday

**Twitter:**
- Best days: Wednesday, Friday
- Best times: 8-10 AM, 6-9 PM
- Peak: Wednesday 9 AM

**Instagram:**
- Best days: Monday, Wednesday, Thursday
- Best times: 11 AM - 1 PM, 7-9 PM
- Peak: Wednesday 11 AM

**Facebook:**
- Best days: Thursday, Friday
- Best times: 1-3 PM, 8-10 PM
- Peak: Friday 1 PM

---

## 🤖 Step 3: AI Scheduling Decision Rules

The AI orchestrator uses these rules to make autonomous decisions:

| Viral Score | Data Confidence | AI Action |
|-------------|----------------|-----------|
| ≥ 65 | Any | ✅ **Auto-schedule** at peak time |
| 30-64 | ≥ 50% | 💬 **Suggest times** - user confirms |
| 30-64 | < 50% | 🕐 **Show options** - user picks |
| < 30 | Any | ❌ **Flag for improvement** |

---

## ⚡ Step 4: Conflict Prevention

When scheduling multiple posts:

- **Minimum 2-hour gap** between posts on same platform
- Prevents audience fatigue
- Avoids algorithm penalties for spam-like behavior
- Distributes content throughout the week

---

## 🎨 User Interface

### Content Detail Page (`/content/[id]`)

**For Approved Content:**
- **"AI Auto-Schedule"** button (purple)
- Click to trigger full AI analysis
- Content automatically scheduled if viral score ≥ 65
- Redirects to Scheduling page if review needed

### Scheduling Page (`/scheduling`)

**Left Panel - Drafts List:**
- Shows all drafts and approved content
- Click any draft to analyze
- **"AI Schedule"** button on each draft
- **"AI Schedule All"** button for bulk scheduling

**Right Panel - AI Analysis:**
- **Viral Score Breakdown** (6 factors with scores)
- **Best Time to Post** (with reasoning)
- **Alternative Times** (top 3 slots)
- **Confidence Level** (High/Medium/Low)
- **AI Auto-Schedule** button

---

## 🔧 API Endpoints

### 1. Get Optimal Time
```
POST /api/v1/scheduling/{content_id}/optimal-time
Params: target_audience (optional)

Response:
{
  "content_id": "...",
  "platform": "linkedin",
  "viral_score": {
    "total_score": 72,
    "hook_strength": 16,
    "emotional_triggers": 14,
    "trend_alignment": 18,
    "historical_performance": 12,
    "content_uniqueness": 8,
    "platform_algorithm_fit": 4,
    "viral_probability": "high",
    "recommendation": "Strong content with good hook..."
  },
  "optimal_time": {
    "best_slot": {
      "day_of_week": 2,
      "hour": 9,
      "avg_engagement": 85.3,
      "score": 92.5,
      "scheduled_at": "2025-02-11T09:00:00Z",
      "data_source": "historical"
    },
    "alternative_slots": [...],
    "confidence": 0.85,
    "confidence_label": "High — based on your historical data",
    "reasoning": "Tuesday 9 AM shows highest engagement..."
  }
}
```

### 2. Auto-Schedule Content
```
POST /api/v1/scheduling/{content_id}/auto-schedule
Params: target_audience (optional)

Response:
{
  "content_id": "...",
  "viral_score": {...},
  "optimal_times": {...},
  "decision": {
    "should_auto_schedule": true,
    "reason": "High viral potential (72/100). Auto-scheduled at peak time...",
    "action": "auto_scheduled",
    "scheduled_time": "2025-02-11T09:00:00Z"
  },
  "scheduled_at": "2025-02-11T09:00:00Z"
}
```

### 3. Bulk Auto-Schedule
```
POST /api/v1/scheduling/bulk-auto-schedule
Body: {
  "workspace_id": "...",
  "content_ids": ["...", "...", "..."],
  "target_audience": "tech professionals"
}

Response:
{
  "total": 3,
  "auto_scheduled": 2,
  "needs_confirmation": 1,
  "needs_improvement": 0,
  "results": [...]
}
```

---

## 📝 Caching Strategy

### Redis Caching

| Cache Type | TTL | Purpose |
|------------|-----|---------|
| **Audience Activity** | 4 hours | Avoid re-computing expensive historical queries |
| **Viral Scores** | 30 minutes | Cache scoring results for unchanged content |

### Cache Keys

```
activity:{workspace_id}:{platform}:{audience}:{viral_score}
viral:{workspace_id}:{platform}:{content_hash}
```

---

## 🎯 Example Workflow

### Scenario: User approves LinkedIn post

1. **User approves content** on `/approvals` page
   → Status changes to `approved`

2. **User clicks "AI Auto-Schedule"** on content detail page
   → POST to `/scheduling/{id}/auto-schedule`

3. **AI analyzes content:**
   - Viral score: 78/100 (High)
   - Best time: Tuesday 9 AM
   - Confidence: 85% (based on 90 days of data)

4. **AI decision:** Auto-schedule (viral score ≥ 65)
   → Sets `scheduled_at = next Tuesday 9 AM UTC`
   → Sets `status = scheduled`
   → Sets `auto_scheduled = true`
   → Sets `scheduling_confidence = 0.85`

5. **User sees success message:**
   "✅ AI auto-scheduled for Tuesday, Feb 11 at 9:00 AM"

6. **Scheduler worker picks up post** at scheduled time
   → Publishes to LinkedIn API
   → Updates status to `published`

---

## 📊 Data Persistence

All scheduling decisions are stored in PostgreSQL:

```sql
-- Content table fields
scheduled_at: TIMESTAMPTZ          -- When to publish
auto_scheduled: BOOLEAN            -- AI vs manual
viral_score: INTEGER               -- 0-100
viral_probability: VARCHAR         -- high/medium/low
scheduling_confidence: FLOAT       -- 0-1
scheduling_reason: TEXT            -- AI reasoning
```

Activity snapshots persisted to:
```sql
-- Audience activity snapshots table
workspace_id, platform, calculated_at, snapshot_data (JSON)
```

---

## 🚀 Benefits

### For Users:
✅ **Zero manual scheduling** - AI does the work  
✅ **Data-driven decisions** - based on YOUR analytics  
✅ **Trend-aware** - considers trending posting times  
✅ **Conflict-free** - prevents scheduling overlaps  
✅ **Improves over time** - more data = better predictions  

### For Platform:
✅ **Higher engagement** - posts at optimal times  
✅ **Better reach** - aligns with algorithm preferences  
✅ **Reduced churn** - users see results without effort  
✅ **Competitive advantage** - most scheduling tools require manual input  

---

## 🔮 Future Enhancements

1. **Real-time trend integration** - adjust schedule based on breaking trends
2. **Competitor analysis** - avoid posting when competitors are most active
3. **A/B test timing** - test different times to improve predictions
4. **Timezone optimization** - target multiple timezones for global audience
5. **Event-based scheduling** - avoid holidays, major events, or news cycles
6. **Performance feedback loop** - learn from actual engagement vs predicted

---

## 🛠️ Troubleshooting

### "Not enough historical data"

**Problem:** Confidence is low (< 50%)

**Solution:**
- Post more content to build historical data
- AI will use industry benchmarks as fallback
- Confidence improves after ~30 posts

### "Content needs improvement"

**Problem:** Viral score < 30

**Solution:**
- Review AI's improvement suggestion
- Strengthen the hook (first line)
- Add emotional triggers or trending keywords
- Check platform algorithm fit (length, hashtags)

### "Scheduling failed"

**Problem:** API error during auto-schedule

**Common causes:**
- No LinkedIn account connected
- Token expired
- Database connection issue

**Solution:**
- Check `/platforms` for connected accounts
- Reconnect platform if token expired
- Check backend logs for errors

---

## 📚 Related Documentation

- [Content Workflow Guide](./CONTENT_WORKFLOW.md)
- [Viral Scoring Engine](./VIRAL_SCORING.md)
- [Audience Activity Analyzer](./AUDIENCE_ANALYTICS.md)
- [Publishing Service](./PUBLISHING.md)

---

**Last Updated:** May 18, 2026  
**Version:** 2.0 (AI Auto-Scheduling)
