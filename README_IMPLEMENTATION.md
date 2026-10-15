# Multi-Department Railway Approvals - Implementation Guide

## Problem Statement

**User Issue:** "When I select both Commercial and C&W checkboxes, the approval only shows in Commercial first. After Commercial approves, it then shows in C&W."

**Root Cause:** Frontend is correctly sending `approval_targets: [10, 15]`, but Django backend is not handling this field.

## Solution Overview

The backend needs to:
1. Create a new table to track which departments are pending
2. When Operations approves, insert records for each selected department
3. Show approvals to ALL departments in the `approval_targets` array
4. Mark departments as complete independently
5. Advance status only when ALL selected departments complete

## Quick Start

### For Backend Developers

1. **Read This First:** `BACKEND_CHECKLIST.md` (8 steps, ~1 hour)
2. **Full Implementation:** `DJANGO_BACKEND_FIX.md` (complete code)
3. **Test Your Changes:** Run the test scenarios in the checklist

### For Frontend Developers

✅ **Frontend is complete!** No changes needed.

The frontend is already:
- Showing both checkboxes checked by default ✓
- Sending `approval_targets: [10, 15]` to backend ✓
- Validating at least one department is selected ✓

## What Frontend Is Sending

When Operations approves with both departments:

```json
PATCH /rake-management/v1/railway_approval/123
{
  "status": 15,
  "approval_targets": [10, 15],
  "steps": [...],
  "history_entry": {...},
  "clearance_time": "..."
}
```

## What Backend Needs to Do

### Database Changes

**New Table:**
```sql
CREATE TABLE railway_approval_pending_departments (
    id BIGINT PRIMARY KEY,
    approval_id BIGINT NOT NULL,
    department SMALLINT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(approval_id, department)
);
```

**New Field:**
```sql
ALTER TABLE railway_approval
ADD COLUMN approval_targets JSON NULL;
```

### Code Changes

**1. When Operations Approves:**
```python
# Receive approval_targets = [10, 15]
# Create 2 records in pending_departments table
# Both Commercial and C&W can now see it
```

**2. When Department Approves:**
```python
# Mark that department as is_completed = True
# Check if other departments are still pending
# Only advance status if all pending = True
```

**3. List Endpoint:**
```python
# Show approvals where:
#   - status matches department (old sequential logic) OR
#   - department is in pending_departments AND is_completed = False (new parallel logic)
```

## Implementation Files

### Backend Team - Start Here

1. 📋 **BACKEND_CHECKLIST.md** - Step-by-step checklist (START HERE)
2. 📝 **DJANGO_BACKEND_FIX.md** - Complete Django code
3. 🔍 **DEBUG_PAYLOAD.md** - How to verify what frontend sends
4. ⚡ **FOR_BACKEND_TEAM.md** - Problem explanation

### Reference Documentation

5. 📚 **BACKEND_IMPLEMENTATION_GUIDE.md** - Detailed specifications
6. 📖 **BACKEND_QUICK_REFERENCE.md** - Quick reference
7. 🚨 **URGENT_BACKEND_FIX.md** - Urgent explanation

### User & Testing

8. 👥 **VISUAL_USER_GUIDE.md** - End-user guide
9. 📊 **APPROVAL_FLOW_DIAGRAM.md** - Visual flows
10. 📄 **IMPLEMENTATION_SUMMARY.md** - Overall summary

## Expected Behavior After Fix

### Scenario 1: Both Departments (Default)

```
1. Operations approves with both checked
   → Frontend sends: approval_targets: [10, 15]
   
2. Backend creates:
   - pending_department(approval=123, dept=10, completed=False)
   - pending_department(approval=123, dept=15, completed=False)
   
3. Commercial queries list:
   → Sees approval #123 ✓
   
4. C&W queries list:
   → Sees approval #123 ✓ (simultaneously!)
   
5. Commercial approves:
   → Mark dept 10 as completed=True
   → Check other pending: dept 15 still False
   → Keep status = 15 (don't advance yet)
   
6. C&W queries list:
   → Still sees approval #123 ✓
   
7. C&W approves:
   → Mark dept 15 as completed=True
   → Check other pending: all completed!
   → Advance status = 5 (APPROVED) ✓
```

### Scenario 2: Only Commercial

```
1. Operations approves with only Commercial checked
   → Frontend sends: approval_targets: [10]
   
2. Backend creates:
   - pending_department(approval=123, dept=10, completed=False)
   
3. Only Commercial sees it
   
4. Commercial approves:
   → All pending complete (only 1 pending)
   → Advance to status = 20 (AWAITING_CW)
   → Now C&W sees it (sequential flow)
```

### Scenario 3: Only C&W

```
1. Operations approves with only C&W checked
   → Frontend sends: approval_targets: [15]
   
2. Backend creates:
   - pending_department(approval=123, dept=15, completed=False)
   
3. Only C&W sees it (Commercial skipped)
   
4. C&W approves:
   → All pending complete
   → Status = 5 (APPROVED) directly
```

## Django Models Summary

### Current Models (Existing)

```python
RailwayApproval
├── id
├── loading (FK)
├── rake (FK)
├── status
└── approval_targets (NEW)

RailwayApprovalStep
├── approval (FK)
├── department
├── step_status
└── ... (inspection fields)
```

### New Model (To Add)

```python
RailwayApprovalPendingDepartment (NEW)
├── approval (FK)
├── department
├── is_completed
├── completed_at
├── completed_by
└── created_at
```

## Testing Checklist

### Backend Tests

After implementing changes, verify:

- [ ] Operations approves with [10, 15]
- [ ] Database shows 2 pending_departments records
- [ ] Commercial API returns the approval
- [ ] C&W API returns the same approval (simultaneously)
- [ ] Commercial approves first
- [ ] Database shows dept 10 = completed, dept 15 = pending
- [ ] C&W API still returns the approval
- [ ] C&W approves
- [ ] Status changes to APPROVED
- [ ] Reverse order: C&W first, then Commercial (same result)
- [ ] Only Commercial: works with sequential flow
- [ ] Only C&W: works with Commercial skipped

### Integration Tests

- [ ] Frontend default (both checked) shows in both queues
- [ ] Frontend uncheck one works correctly
- [ ] Cannot submit with nothing selected (validation)
- [ ] Success messages match actual routing

## Time Estimate

### Backend Implementation
- Database changes: 10 min
- Code changes: 30 min
- Testing: 15 min
- **Total: ~1 hour**

### Frontend (Already Done)
- ✅ Complete

### Integration Testing
- End-to-end testing: 30 min

## Support

### Questions About:

- **Frontend code:** Check `src/features/railway/pages/RailwayApprovalsPage.jsx`
- **Backend code:** See `DJANGO_BACKEND_FIX.md`
- **Debugging:** See `DEBUG_PAYLOAD.md`
- **User flow:** See `VISUAL_USER_GUIDE.md`

## Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend | ✅ Complete | Sending approval_targets correctly |
| Backend | ⚠️ Pending | Needs implementation per BACKEND_CHECKLIST.md |
| Database | ⚠️ Pending | Needs migration |
| Testing | ⏳ Waiting | After backend complete |
| Documentation | ✅ Complete | All docs ready |

## Next Steps

1. Backend team: Follow `BACKEND_CHECKLIST.md`
2. Create migration: `python manage.py makemigrations`
3. Run migration: `python manage.py migrate`
4. Deploy backend changes
5. Test end-to-end with frontend
6. Verify all scenarios work

## Success Criteria

✅ Operations selects both departments → Both see approval simultaneously
✅ Either department can approve first
✅ Both must approve before status = APPROVED
✅ Operations can select one department → Works with sequential flow
✅ Validation prevents submission with no departments selected

---

**Ready to implement?** Start with `BACKEND_CHECKLIST.md`! 🚀
