# 🔧 Workspace Creation - Troubleshooting Guide

## Issue
After entering workspace name and clicking "Create Workspace", the page doesn't proceed to the dashboard.

## What Was Fixed

### 1. React Query Cache Invalidation
**Problem:** After creating a workspace, the workspace list wasn't being refetched, so the UI still showed "no workspaces".

**Solution:** Added `queryClient.invalidateQueries()` to force a refetch after creation.

**File:** `frontend/src/components/WorkspaceSelector.tsx`

```typescript
// Before (broken)
const workspace = await createWorkspace({ name });
setCurrentWorkspace(workspace);
router.refresh();  // This doesn't refetch React Query!

// After (fixed)
const workspace = await createWorkspace({ name });
await queryClient.invalidateQueries({ queryKey: ["workspaces"] });  // Force refetch!
setCurrentWorkspace(workspace);
router.refresh();
```

### 2. Better Error Handling
Added toast notifications to show success/error messages.

### 3. Console Logging
Added detailed console logs to help debug the flow.

---

## How to Test the Fix

### 1. Open Browser Console
- Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Go to the **Console** tab

### 2. Try Creating a Workspace
1. Go to http://localhost:3000
2. Login if needed
3. Enter a workspace name (e.g., "My Brand")
4. Click "Create Workspace"

### 3. Check Console Logs
You should see:
```
Creating workspace: My Brand
Workspace created successfully: {id: "...", name: "My Brand", ...}
Query cache invalidated
Workspace set as current: abc-123-def
Router refreshed, should now show dashboard
```

### 4. Expected Result
- Success toast appears: ✅ "Workspace 'My Brand' created!"
- Page transitions to dashboard
- Sidebar and header become visible
- You can now use the app!

---

## Common Issues & Solutions

### Issue 1: "Failed to create workspace" Error

**Check the console for the actual error.** Common causes:

#### A. Backend Not Running
```
Error: Network Error
```
**Solution:** Start the backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

#### B. Database Error
```
Error: (sqlite3.OperationalError) no such table: workspaces
```
**Solution:** The database tables need to be created
```bash
# The app uses SQLAlchemy, tables should auto-create
# Try restarting the backend
```

#### C. Authentication Error
```
Error: 401 Unauthorized
```
**Solution:** Make sure you're logged in
- Check if token exists: `localStorage.getItem('access_token')`
- If missing, login again

---

### Issue 2: Workspace Created But Still Shows Creation Screen

**Possible causes:**

#### A. React Query Not Invalidating
Check console for: `Query cache invalidated`

**If missing:** The invalidation didn't run. Check for errors above it.

#### B. localStorage Not Working
Check console for: `Workspace set as current: ...`

**If missing:** localStorage might be blocked (incognito mode, privacy settings).

**Solution:** 
- Disable browser privacy extensions temporarily
- Try in normal browsing mode (not incognito)

#### C. Router Refresh Not Triggering
Check console for: `Router refreshed, should now show dashboard`

**If missing:** There might be an error in the code before this line.

---

### Issue 3: Workspace List API Returns Empty

**Check Network Tab:**
1. Open DevTools → Network tab
2. Filter by "workspaces"
3. Look for: `GET /api/v1/workspaces`
4. Check the response

**If response is `[]` (empty array):**
- Workspace was created but not saved to database
- Check backend logs for database errors

**If response has workspaces but UI doesn't show them:**
- React Query cache issue
- Try hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

---

## Manual Debug Steps

### 1. Check if Workspace Was Created
Open browser console and run:
```javascript
// Check localStorage
localStorage.getItem('current_workspace')

// Should return something like:
// '{"id":"abc-123","name":"My Brand",...}'
```

### 2. Manually Call API
```javascript
// Get workspaces from API
fetch('http://localhost:8000/api/v1/workspaces', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Workspaces:', data))
```

### 3. Clear Everything and Start Fresh
```javascript
// Clear workspace data
localStorage.removeItem('current_workspace')

// Refresh page
location.reload()
```

---

## Backend Logs to Check

In the terminal where backend is running, look for:
```
INFO:     127.0.0.1:XXXXX - "POST /api/v1/workspaces HTTP/1.1" 201 Created
INFO:     127.0.0.1:XXXXX - "GET /api/v1/workspaces HTTP/1.1" 200 OK
```

**If you see 500 errors:**
- Check the error message in backend terminal
- Common issues: Database connection, missing tables, validation errors

---

## Quick Fix Commands

### Restart Everything
```bash
# Stop backend (Ctrl+C)

# Clear frontend cache
cd frontend
rm -rf .next

# Restart backend
cd ../backend
uvicorn app.main:app --reload --port 8000

# Restart frontend (new terminal)
cd frontend
npm run dev
```

### Clear Browser Data
1. Open DevTools → Application tab
2. Left panel: Storage → Local Storage
3. Right-click `http://localhost:3000` → Clear
4. Refresh page

---

## What the Fix Does

```typescript
const handleCreate = async () => {
  // 1. Validate input
  if (!newWorkspaceName.trim() || creating) return;
  
  // 2. Call API to create workspace
  const workspace = await createWorkspace({ name: newWorkspaceName.trim() });
  
  // 3. 🔥 CRITICAL: Invalidate React Query cache
  // This forces the workspaces list to refetch
  await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
  
  // 4. Save to localStorage
  setCurrentWorkspace(workspace);
  
  // 5. Hide the creation screen
  setShowSelector(false);
  
  // 6. Show success message
  toast.success(`Workspace "${workspace.name}" created!`);
  
  // 7. Trigger Next.js re-render
  router.refresh();
};
```

**Step 3 is the key fix!** Without it, React Query uses the cached empty list and doesn't refetch.

---

## Still Not Working?

1. **Check Console** - Look for error messages
2. **Check Network Tab** - Verify API calls succeed
3. **Check Backend Logs** - Look for database errors
4. **Try Hard Refresh** - `Cmd+Shift+R` / `Ctrl+Shift+R`
5. **Clear Browser Data** - Remove localStorage and retry
6. **Restart Servers** - Backend + Frontend

---

**Last Updated:** 2026-05-16
