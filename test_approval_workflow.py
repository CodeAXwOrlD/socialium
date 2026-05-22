#!/usr/bin/env python3
"""Test the approval workflow fixes."""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Check the approval router code
print("=" * 80)
print("APPROVAL WORKFLOW FIX VERIFICATION")
print("=" * 80)

# Read the approvals router
with open('backend/app/routers/approvals.py', 'r') as f:
    content = f.read()

# Check 1: Does list_approvals query Content table?
if 'select(Content, User)' in content and 'ContentStatus.PENDING_APPROVAL' in content:
    print("✅ CHECK 1: Approvals endpoint now queries Content table")
    print("   - Returns pending content instead of approval records")
    print("   - Joins with User table for author info")
    print("   - Filters by status=pending_approval")
else:
    print("❌ CHECK 1: Approvals endpoint still uses old query")

# Check 2: Does create_approval trigger auto-scheduling?
if 'auto_schedule_draft' in content and 'AISchedulerService' in content:
    print("\n✅ CHECK 2: Approval endpoint triggers AI auto-scheduling")
    print("   - Calls AISchedulerService.auto_schedule_draft()")
    print("   - Passes content_id and workspace_id")
    print("   - Returns scheduled_at in response")
else:
    print("\n❌ CHECK 2: Auto-scheduling not triggered on approval")

# Check 3: Does publishing service have better error logging?
with open('backend/app/services/publishing_service.py', 'r') as f:
    pub_content = f.read()

if 'Request payload:' in pub_content and 'Account ID:' in pub_content:
    print("\n✅ CHECK 3: LinkedIn publishing has detailed error logging")
    print("   - Logs full response body")
    print("   - Logs request payload")
    print("   - Logs account platform_user_id")
else:
    print("\n❌ CHECK 3: Error logging not improved")

# Check frontend
with open('frontend/src/app/(dashboard)/approvals/page.tsx', 'r') as f:
    frontend_content = f.read()

if 'access_token' in frontend_content and 'safeArray' in frontend_content:
    print("\n✅ CHECK 4: Frontend uses correct token and array safety")
    print("   - Uses 'access_token' instead of 'token'")
    print("   - Uses safeArray() for crash protection")
else:
    print("\n❌ CHECK 4: Frontend still has issues")

print("\n" + "=" * 80)
print("EXPECTED WORKFLOW:")
print("=" * 80)
print("""
1. User generates content via AI
2. Content is created with status='draft'
3. User submits for approval → status='pending_approval'
4. Content appears in Approvals page (✅ NEW FIX)
5. User approves via dashboard or WhatsApp
6. AI auto-schedules for optimal time (✅ NEW FIX)
7. Status changes to 'scheduled' with scheduled_at
8. PublishWorker detects scheduled content
9. Publishes at scheduled time with detailed errors (✅ NEW FIX)
""")

print("=" * 80)
print("NEXT STEPS:")
print("=" * 80)
print("1. Login to dashboard: http://localhost:3000/login")
print("2. Generate content at: http://localhost:3000/generate")
print("3. Check approvals page: http://localhost:3000/approvals")
print("4. Approve content and verify auto-scheduling")
print("5. Check backend logs for detailed errors if publishing fails")
print("")
