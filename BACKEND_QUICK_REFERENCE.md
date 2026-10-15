# Backend Quick Reference - Multi-Department Railway Approvals

## TL;DR

**Frontend now sends `approval_targets` array when Operations approves.** Backend must make the approval visible to ALL specified departments simultaneously.

## What Changed?

### New Field in API Request

**Endpoint:** `PATCH /rake-management/v1/railway_approval/{id}`

**New Field:** `approval_targets` (array of integers)

```json
{
  "status": 15,
  "approval_targets": [10, 15],  // <- NEW FIELD
  "steps": [...],
  "history_entry": {...}
}
```

## What `approval_targets` Means

| Value | Meaning | Backend Action Required |
|-------|---------|------------------------|
| `[10, 15]` | **Send to BOTH** Commercial and C&W | Make approval visible to BOTH departments. Either can approve first. Wait for BOTH to approve before marking as APPROVED. |
| `[10]` | Send to Commercial only | Only Commercial sees it. After approval, send to C&W (sequential). |
| `[15]` | Send to C&W only | Skip Commercial entirely. Only C&W sees it. After approval, mark as APPROVED. |
| `null` or missing | Legacy sequential flow | Commercial → C&W (existing behavior) |

## Critical Backend Changes

### 1. List Endpoint Must Show to Multiple Departments

**When approval has `approval_targets: [10, 15]`:**
- ✅ Commercial user lists approvals → This approval appears in their queue
- ✅ C&W user lists approvals → This approval ALSO appears in their queue
- ✅ Both can see and act on it simultaneously

### 2. Track Each Department's Completion

**When Commercial approves (and `approval_targets` was `[10, 15]`):**
- ✅ Mark Commercial as completed
- ✅ Keep approval visible to C&W
- ❌ Do NOT mark overall approval as complete yet
- ❌ Do NOT progress to next status yet

**When C&W then approves:**
- ✅ Mark C&W as completed
- ✅ Check if all departments in `approval_targets` are completed
- ✅ If yes, mark overall approval as APPROVED
- ✅ Remove from both queues

### 3. Order Doesn't Matter

With `approval_targets: [10, 15]`, either department can approve first:
- ✅ Commercial first, then C&W = APPROVED
- ✅ C&W first, then Commercial = APPROVED
- ✅ Both are independent until both complete

## Implementation Options

### Option A: Track with Status Flags (Simpler)

Add columns to `railway_approval` table:
```sql
ALTER TABLE railway_approval
ADD COLUMN commercial_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN cw_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN approval_targets JSON;
```

When department approves:
```python
if department == 10:  # Commercial
    approval.commercial_completed = True
if department == 15:  # C&W
    approval.cw_completed = True

# Check if all targets completed
targets = approval.approval_targets or []
all_completed = True
if 10 in targets and not approval.commercial_completed:
    all_completed = False
if 15 in targets and not approval.cw_completed:
    all_completed = False

if all_completed:
    approval.status = 5  # APPROVED
```

### Option B: Separate Tracking Table (More Flexible)

Create new table:
```sql
CREATE TABLE railway_approval_pending_departments (
    approval_id INT,
    department INT,
    is_completed BOOLEAN,
    completed_at TIMESTAMP,
    PRIMARY KEY (approval_id, department)
);
```

When Operations approves with targets `[10, 15]`:
```python
for dept in approval_targets:
    insert_pending_department(approval_id, dept, is_completed=False)
```

When department approves:
```python
mark_department_completed(approval_id, department_code)

pending_count = count_pending_departments(approval_id)
if pending_count == 0:
    approval.status = 5  # APPROVED
```

## List Query Logic

### Current (Sequential Only)
```sql
SELECT * FROM railway_approval 
WHERE status = 15  -- AWAITING_COMMERCIAL
```

### New (Multi-Department)
```sql
-- Option A: Using flags
SELECT * FROM railway_approval
WHERE (status = 15 AND commercial_completed = FALSE)
   OR (status = 15 AND JSON_CONTAINS(approval_targets, '10'))

-- Option B: Using tracking table
SELECT DISTINCT a.* FROM railway_approval a
LEFT JOIN railway_approval_pending_departments p 
  ON a.id = p.approval_id
WHERE (a.status = 15)  -- Sequential flow
   OR (p.department = 10 AND p.is_completed = FALSE)  -- Multi-dept flow
```

## Testing Scenarios

### Scenario 1: Default (Both Departments)
```
1. Operations approves with approval_targets: [10, 15]
   → Commercial queries: sees approval ✓
   → C&W queries: sees approval ✓

2. Commercial approves
   → approval.commercial_completed = true
   → Status stays AWAITING_COMMERCIAL
   → Commercial queries: approval removed
   → C&W queries: still sees approval ✓

3. C&W approves
   → approval.cw_completed = true
   → All targets complete → status = APPROVED ✓
   → Both queries: approval removed
```

### Scenario 2: Commercial Only
```
1. Operations approves with approval_targets: [10]
   → Only Commercial sees it ✓

2. Commercial approves
   → All targets complete
   → Status changes to AWAITING_CW (20)
   → Now C&W sees it ✓

3. C&W approves
   → Status = APPROVED ✓
```

### Scenario 3: C&W Only
```
1. Operations approves with approval_targets: [15]
   → Commercial does NOT see it ✓
   → Only C&W sees it ✓

2. C&W approves
   → All targets complete
   → Status = APPROVED ✓
```

## Response Format

Include pending status in GET response:

```json
{
  "id": 123,
  "status": 15,
  "approval_targets": [10, 15],
  "commercial_completed": true,
  "cw_completed": false,
  "steps": [
    {
      "department": 10,
      "step_status": 10,
      "actor_name": "Commercial User",
      "approved_at": "2024-03-20T10:00:00Z"
    }
  ]
}
```

## Common Mistakes to Avoid

❌ **Mistake 1:** Advancing status when first department approves
```python
# WRONG
if department == 10:
    approval.status = 20  # Move to C&W
```
✅ **Correct:** Check if ALL targets are complete first

❌ **Mistake 2:** Not showing to both departments
```python
# WRONG
if approval.status == 15:
    return approval  # Only Commercial sees it
```
✅ **Correct:** Also check `approval_targets` contains department code

❌ **Mistake 3:** Rejecting if order is wrong
```python
# WRONG
if department == 15 and not approval.commercial_completed:
    raise Exception("Commercial must approve first")
```
✅ **Correct:** Allow any order when both are in targets

## Questions?

See full implementation guide: `BACKEND_IMPLEMENTATION_GUIDE.md`
