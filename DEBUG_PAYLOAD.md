# Debug: What Frontend Is Sending to Backend

## How to Check What's Being Sent

### Option 1: Browser DevTools (Easiest)

1. Open the application in Chrome/Firefox
2. Press **F12** to open DevTools
3. Go to **Network** tab
4. Click "Clear" to clear existing requests
5. In the app, go to Railway Approvals as Operations
6. Open an approval and click "Approve" (with both checkboxes checked)
7. In Network tab, look for request to `/railway_approval/`
8. Click on that request
9. Go to **Payload** or **Request** tab
10. You should see:

```json
{
  "status": 15,
  "approval_targets": [10, 15],
  "steps": [...],
  "history_entry": {...},
  "clearance_time": "..."
}
```

### Option 2: Add Console Log (Temporary)

Edit `src/services/railwayApprovalService.js` and add a console log:

```javascript
export async function submitRailwayDecision(approval, department, decision, targets = []) {
  const next = applyApprovalDecision(approval, department, decision);
  const historyEntry = next.history[next.history.length - 1];
  const payload = {
    status: RAILWAY_STATUS_CODE[next.status],
    steps: [stepToApi(next[department], department)],
    history_entry: {
      department: DEPARTMENT_CODE[department] ?? null,
      action: ACTION_CODE[historyEntry?.action] || ACTION_CODE.approved,
      actor_name: historyEntry?.actor || decision.actor || "",
      acted_on: historyEntry?.timestamp || new Date().toISOString(),
      remarks: historyEntry?.remarks || "",
    },
  };

  // ... rest of code ...

  if (
    department === APPROVAL_DEPARTMENTS.OPERATIONS &&
    decision.action === "approve" &&
    targets.length > 0
  ) {
    // ... approval_targets logic ...
  }
  
  // ADD THIS LINE TO DEBUG:
  console.log("🚀 SENDING TO BACKEND:", JSON.stringify(payload, null, 2));

  return saveRailwayApproval(approval.id, payload);
}
```

Then check browser console when you approve.

## What You Should See

### When Both Departments Selected (Default)

**Console should show:**
```json
🚀 SENDING TO BACKEND: {
  "status": 15,
  "approval_targets": [10, 15],
  "steps": [
    {
      "department": 5,
      "step_status": 10,
      "actor_name": "Your Name",
      "approved_at": "2024-03-20T10:30:00Z",
      "remarks": "Approved",
      "track_clearance_time": "2024-03-20T11:00:00Z",
      "wagons": [...]
    }
  ],
  "history_entry": {
    "department": 5,
    "action": 10,
    "actor_name": "Your Name",
    "acted_on": "2024-03-20T10:30:00Z",
    "remarks": "Approved"
  },
  "clearance_time": "2024-03-20T11:00:00Z"
}
```

**Key field:** `"approval_targets": [10, 15]` ← This should be present!

### When Only Commercial Selected

```json
{
  "status": 15,
  "approval_targets": [10],
  ...
}
```

### When Only C&W Selected

```json
{
  "status": 20,
  "approval_targets": [15],
  ...
}
```

## If `approval_targets` Is Missing

If you don't see `approval_targets` in the payload, check:

1. ✅ Are both checkboxes checked when you clicked Approve?
2. ✅ Is `approvalTargets` state populated? (Add `console.log(approvalTargets)` before submit)
3. ✅ Is `targets` parameter being passed to `submitRailwayDecision`?

## Backend Response Check

After the request is sent, check the **Response** tab in DevTools:

**If backend is NOT handling approval_targets:**
```json
{
  "id": 123,
  "status": 15,
  "steps": [...],
  // NO pending_departments field
}
```

**If backend IS handling approval_targets (correct):**
```json
{
  "id": 123,
  "status": 15,
  "steps": [...],
  "pending_departments": [
    {
      "department": 10,
      "is_completed": false
    },
    {
      "department": 15,
      "is_completed": false
    }
  ]
}
```

## Backend Database Check

Ask your backend team to run this SQL after Operations approves:

```sql
-- Check if approval_targets was saved
SELECT id, status, approval_targets 
FROM railway_approval 
WHERE id = <approval_id>;

-- Expected result:
-- | id  | status | approval_targets |
-- |-----|--------|------------------|
-- | 123 | 15     | [10, 15]         |

-- Check if pending records were created
SELECT * FROM railway_approval_pending_departments
WHERE approval_id = <approval_id>;

-- Expected result:
-- | approval_id | department | is_completed |
-- |-------------|------------|--------------|
-- | 123         | 10         | false        |
-- | 123         | 15         | false        |
```

If the `railway_approval_pending_departments` table doesn't exist, that's the problem!

## Common Issues

### Issue 1: Frontend Sending Correctly, Backend Ignoring

**Symptom:** Payload has `approval_targets: [10, 15]` but only Commercial sees it

**Cause:** Backend is not reading/using the `approval_targets` field

**Solution:** Backend needs to implement the logic in `URGENT_BACKEND_FIX.md`

### Issue 2: Frontend Not Sending approval_targets

**Symptom:** Payload doesn't have `approval_targets` field at all

**Cause:** 
- Checkboxes not checked
- State not being passed correctly
- Review department is not Operations

**Solution:** 
- Verify both checkboxes are checked
- Add console.log to debug state
- Ensure you're logged in as Operations role

### Issue 3: Backend Returns Error

**Symptom:** Error message like "Unknown field approval_targets"

**Cause:** Backend validation is rejecting the new field

**Solution:** Backend needs to add `approval_targets` to allowed fields

## Expected Behavior After Fix

1. ✅ Frontend sends `approval_targets: [10, 15]`
2. ✅ Backend creates pending records for departments 10 and 15
3. ✅ Commercial user sees approval in their queue
4. ✅ C&W user sees SAME approval in their queue (simultaneously)
5. ✅ Either approves first → other still sees it
6. ✅ Both approve → status becomes APPROVED

## Current Behavior (Before Fix)

1. ✅ Frontend sends `approval_targets: [10, 15]`
2. ❌ Backend ignores it
3. ✅ Commercial user sees approval
4. ❌ C&W user does NOT see it yet
5. ❌ Commercial approves → disappears from Commercial queue
6. ❌ THEN C&W sees it → sequential behavior

## Next Steps

1. Verify payload is being sent correctly (use DevTools)
2. Share `URGENT_BACKEND_FIX.md` with backend team
3. Backend team implements the fixes
4. Test again to verify both departments see it simultaneously
