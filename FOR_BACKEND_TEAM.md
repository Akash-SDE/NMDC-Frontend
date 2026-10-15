# For Backend Team: Multi-Department Approval Implementation

## Current Problem

**User reports:** "When I select both checkboxes, it only shows in Commercial first, then after Commercial approves, it moves to C&W"

**Root cause:** Backend is **ignoring** the `approval_targets` field that frontend is sending.

## What Frontend Is Sending

When Operations approves with both departments checked:

```json
POST /rake-management/v1/railway_approval/{id}
{
  "status": 15,
  "approval_targets": [10, 15],    ← NEW FIELD YOU NEED TO HANDLE
  "steps": [...],
  "history_entry": {...}
}
```

## What Backend Needs to Do

### The Core Issue

Your current code probably looks like this:

```python
# Current implementation (WRONG)
def update_railway_approval(approval_id, data):
    approval = get_approval(approval_id)
    approval.status = data['status']  # Sets to 15 (AWAITING_COMMERCIAL)
    save(approval)
    
    # Result: Only Commercial sees it
    # approval_targets is ignored!
```

### What It Should Be

```python
# Fixed implementation (CORRECT)
def update_railway_approval(approval_id, data):
    approval = get_approval(approval_id)
    approval.status = data['status']  # Sets to 15
    
    # NEW: Handle approval_targets
    approval_targets = data.get('approval_targets', [])
    
    if approval_targets:
        for department_code in approval_targets:
            create_pending_department(
                approval_id=approval_id,
                department=department_code,
                is_completed=False
            )
    
    save(approval)
    
    # Result: ALL departments in approval_targets can see it
```

## Required Database Changes

### New Table Needed

```sql
CREATE TABLE railway_approval_pending_departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    approval_id INT NOT NULL,
    department INT NOT NULL COMMENT '10=Commercial, 15=C&W',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (approval_id) 
        REFERENCES railway_approval(id) 
        ON DELETE CASCADE,
    
    UNIQUE KEY (approval_id, department),
    INDEX idx_pending (approval_id, is_completed),
    INDEX idx_department (department, is_completed)
);
```

## Three Critical Endpoint Changes

### 1. PATCH /railway_approval/{id} - When Operations Approves

**Current (Sequential):**
```python
@app.route('/railway_approval/<int:id>', methods=['PATCH'])
def update_approval(id):
    data = request.get_json()
    approval = RailwayApproval.query.get(id)
    approval.status = data['status']
    db.session.commit()
    return serialize(approval)
```

**Fixed (Parallel):**
```python
@app.route('/railway_approval/<int:id>', methods=['PATCH'])
def update_approval(id):
    data = request.get_json()
    approval = RailwayApproval.query.get(id)
    approval.status = data['status']
    
    # NEW: Create pending records
    approval_targets = data.get('approval_targets', [])
    if approval_targets:
        for dept in approval_targets:
            pending = RailwayApprovalPendingDepartment(
                approval_id=id,
                department=dept,
                is_completed=False
            )
            db.session.add(pending)
    
    db.session.commit()
    return serialize(approval)
```

### 2. POST /railway_approval/list - Show to Multiple Departments

**Current (Sequential):**
```python
@app.route('/railway_approval/list', methods=['POST'])
def list_approvals():
    user_dept = get_user_department()  # 10 or 15
    
    # Only status-based filter
    if user_dept == 10:
        approvals = RailwayApproval.query.filter_by(status=15).all()
    else:
        approvals = RailwayApproval.query.filter_by(status=20).all()
    
    return jsonify({'results': [serialize(a) for a in approvals]})
```

**Fixed (Parallel):**
```python
@app.route('/railway_approval/list', methods=['POST'])
def list_approvals():
    user_dept = get_user_department()  # 10 or 15
    
    # OLD: Status-based filter (sequential approvals)
    status_based = []
    if user_dept == 10:
        status_based = RailwayApproval.query.filter_by(status=15).all()
    else:
        status_based = RailwayApproval.query.filter_by(status=20).all()
    
    # NEW: Pending departments filter (parallel approvals)
    pending_based = db.session.query(RailwayApproval)\
        .join(RailwayApprovalPendingDepartment)\
        .filter(
            RailwayApprovalPendingDepartment.department == user_dept,
            RailwayApprovalPendingDepartment.is_completed == False
        ).all()
    
    # Combine both (deduplicate with set)
    all_approvals = list(set(status_based + pending_based))
    
    return jsonify({'results': [serialize(a) for a in all_approvals]})
```

### 3. PATCH /railway_approval/{id} - When Department Approves

**Current (Sequential):**
```python
def process_department_approval(approval_id, department, data):
    approval = RailwayApproval.query.get(approval_id)
    
    # Update step
    update_step(approval, department, data)
    
    # Immediately advance status
    if department == 10:
        approval.status = 20  # Move to C&W
    elif department == 15:
        approval.status = 5   # APPROVED
    
    db.session.commit()
```

**Fixed (Parallel):**
```python
def process_department_approval(approval_id, department, data):
    approval = RailwayApproval.query.get(approval_id)
    
    # Update step
    update_step(approval, department, data)
    
    # NEW: Mark this department as completed
    pending = RailwayApprovalPendingDepartment.query.filter_by(
        approval_id=approval_id,
        department=department
    ).first()
    
    if pending:
        pending.is_completed = True
        pending.completed_at = datetime.now()
        pending.completed_by = data.get('actor_name')
        db.session.add(pending)
    
    # NEW: Check if OTHER departments are still pending
    other_pending_count = RailwayApprovalPendingDepartment.query.filter_by(
        approval_id=approval_id,
        is_completed=False
    ).count()
    
    if other_pending_count > 0:
        # Don't advance status yet - other departments still need to approve
        pass
    else:
        # ALL pending departments completed - advance status
        if department == 10:
            approval.status = 20  # Move to C&W
        elif department == 15:
            approval.status = 5   # APPROVED
    
    db.session.commit()
```

## Testing Steps

### Test 1: Verify approval_targets is received

Add logging to your PATCH endpoint:

```python
@app.route('/railway_approval/<int:id>', methods=['PATCH'])
def update_approval(id):
    data = request.get_json()
    
    # ADD THIS LINE
    print(f"🔍 Received approval_targets: {data.get('approval_targets')}")
    
    # ... rest of code
```

**Expected output when Operations approves with both checked:**
```
🔍 Received approval_targets: [10, 15]
```

### Test 2: Check database after Operations approves

```sql
-- Should see both departments as pending
SELECT * FROM railway_approval_pending_departments 
WHERE approval_id = 123;

-- Expected:
-- | approval_id | department | is_completed |
-- |-------------|------------|--------------|
-- | 123         | 10         | false        |
-- | 123         | 15         | false        |
```

### Test 3: Check both queues

```bash
# Commercial user should see it
curl -X POST /railway_approval/list \
  -H "Authorization: Bearer <commercial_token>"
# Should include approval_id 123

# C&W user should ALSO see it
curl -X POST /railway_approval/list \
  -H "Authorization: Bearer <cw_token>"
# Should include approval_id 123 (same approval!)
```

### Test 4: Commercial approves first

```bash
# Commercial approves
curl -X PATCH /railway_approval/123 \
  -H "Authorization: Bearer <commercial_token>" \
  -d '{"department": 10, "action": "approve"}'

# Check database
SELECT * FROM railway_approval_pending_departments 
WHERE approval_id = 123;

-- Expected: Commercial completed, C&W still pending
-- | approval_id | department | is_completed |
-- |-------------|------------|--------------|
-- | 123         | 10         | true         | <-- Changed
-- | 123         | 15         | false        | <-- Still false
```

### Test 5: C&W still sees it

```bash
# C&W queries their queue
curl -X POST /railway_approval/list \
  -H "Authorization: Bearer <cw_token>"
# Should STILL include approval_id 123
```

### Test 6: C&W approves second

```bash
# C&W approves
curl -X PATCH /railway_approval/123 \
  -H "Authorization: Bearer <cw_token>" \
  -d '{"department": 15, "action": "approve"}'

# Check status
SELECT status FROM railway_approval WHERE id = 123;
-- Expected: status = 5 (APPROVED)
```

## Expected Behavior Summary

| Scenario | Current (Wrong) | After Fix (Correct) |
|----------|----------------|---------------------|
| Operations approves with [10, 15] | Only Commercial sees it | BOTH Commercial AND C&W see it |
| Commercial approves first | Moves to C&W queue | C&W still sees it (no change) |
| C&W approves second | - | Status = APPROVED |
| Reverse order (C&W first) | Not possible | Commercial still sees it |
| Commercial approves second | - | Status = APPROVED |

## Quick Fix Checklist

- [ ] Create `railway_approval_pending_departments` table
- [ ] Modify PATCH endpoint to insert pending records from `approval_targets`
- [ ] Modify LIST endpoint to check pending_departments table
- [ ] Modify approval processing to mark department as completed
- [ ] Modify approval processing to check if all pending complete
- [ ] Test: Both departments see approval simultaneously
- [ ] Test: Either can approve first
- [ ] Test: Both must approve before status = APPROVED

## Code References

See these detailed guides:
- `URGENT_BACKEND_FIX.md` - Detailed implementation
- `BACKEND_IMPLEMENTATION_GUIDE.md` - Complete specifications
- `DEBUG_PAYLOAD.md` - How to verify what frontend is sending

## Questions?

The frontend is working correctly and sending `approval_targets: [10, 15]`. The backend just needs to **use this field** instead of ignoring it.

Contact frontend team if you need clarification on the payload format.
