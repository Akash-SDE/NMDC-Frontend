# URGENT: Backend Not Supporting Multi-Department Approvals

## Problem

**Frontend is sending:** `approval_targets: [10, 15]` (both Commercial and C&W)

**Backend is doing:** Treating it as sequential - showing only to Commercial first

**Result:** Approval only appears in Commercial queue, not C&W queue simultaneously

## What's Happening Now (Wrong)

```
Frontend sends:
{
  "status": 15,
  "approval_targets": [10, 15],
  ...
}

Backend receives and IGNORES approval_targets:
- Sets status = 15 (AWAITING_COMMERCIAL)
- Only Commercial sees it
- After Commercial approves → moves to status = 20 (AWAITING_CW)
- Then C&W sees it

Result: Sequential approval (OLD BEHAVIOR)
```

## What Should Happen (Correct)

```
Frontend sends:
{
  "status": 15,
  "approval_targets": [10, 15],
  ...
}

Backend receives and USES approval_targets:
- Sets status = 15 (AWAITING_COMMERCIAL)
- Creates pending records for BOTH departments [10, 15]
- BOTH Commercial AND C&W see it simultaneously
- Either can approve first
- After BOTH approve → status = 5 (APPROVED)

Result: Parallel approval (NEW BEHAVIOR)
```

## Root Cause

Your backend is **ignoring the `approval_targets` field**. It needs to:

1. ✅ Accept the field (probably already working)
2. ❌ **Store which departments are pending** (NOT IMPLEMENTED)
3. ❌ **Show approval to ALL departments in approval_targets** (NOT IMPLEMENTED)
4. ❌ **Track each department's completion separately** (NOT IMPLEMENTED)

## Backend Code Changes Needed

### 1. Database Schema (Create New Table)

You need to track which departments are pending:

```sql
CREATE TABLE railway_approval_pending_departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    approval_id INT NOT NULL,
    department INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (approval_id) REFERENCES railway_approval(id) ON DELETE CASCADE,
    UNIQUE KEY unique_approval_department (approval_id, department),
    INDEX idx_pending (approval_id, is_completed),
    INDEX idx_dept (department, is_completed)
);
```

### 2. When Operations Approves (Create Endpoint Handler)

**Current code (WRONG):**
```python
def process_operations_approval(approval_id, data):
    approval = RailwayApproval.query.get(approval_id)
    approval.status = 15  # AWAITING_COMMERCIAL
    db.session.commit()
    # Only Commercial will see it
```

**Fixed code (CORRECT):**
```python
def process_operations_approval(approval_id, data):
    approval = RailwayApproval.query.get(approval_id)
    approval.status = data.get('status', 15)
    
    # NEW: Handle approval_targets
    approval_targets = data.get('approval_targets', [])
    
    if approval_targets:
        # Create pending records for each target department
        for dept_code in approval_targets:
            pending = RailwayApprovalPendingDepartment(
                approval_id=approval_id,
                department=dept_code,
                is_completed=False
            )
            db.session.add(pending)
    
    db.session.commit()
    # Now ALL departments in approval_targets will see it
```

### 3. List Approvals Endpoint (Filter by Department)

**Current code (WRONG):**
```python
@app.route('/railway_approval/list', methods=['POST'])
def list_approvals():
    department = get_user_department()
    
    # Only checks status
    if department == 10:  # Commercial
        approvals = RailwayApproval.query.filter_by(status=15).all()
    elif department == 15:  # C&W
        approvals = RailwayApproval.query.filter_by(status=20).all()
    
    return jsonify(approvals)
```

**Fixed code (CORRECT):**
```python
@app.route('/railway_approval/list', methods=['POST'])
def list_approvals():
    department = get_user_department()
    
    # Check BOTH status AND pending_departments
    status_match = []
    if department == 10:  # Commercial
        status_match = RailwayApproval.query.filter_by(status=15).all()
    elif department == 15:  # C&W
        status_match = RailwayApproval.query.filter_by(status=20).all()
    
    # ALSO check pending_departments table
    pending_match = db.session.query(RailwayApproval).join(
        RailwayApprovalPendingDepartment,
        RailwayApproval.id == RailwayApprovalPendingDepartment.approval_id
    ).filter(
        RailwayApprovalPendingDepartment.department == department,
        RailwayApprovalPendingDepartment.is_completed == False
    ).all()
    
    # Combine both (use set to deduplicate)
    all_approvals = list(set(status_match + pending_match))
    
    return jsonify(all_approvals)
```

### 4. When Department Approves

**Current code (WRONG):**
```python
def process_department_approval(approval_id, department, data):
    approval = RailwayApproval.query.get(approval_id)
    
    # Immediately move to next status
    if department == 10:  # Commercial
        approval.status = 20  # Move to C&W
    elif department == 15:  # C&W
        approval.status = 5  # APPROVED
    
    db.session.commit()
```

**Fixed code (CORRECT):**
```python
def process_department_approval(approval_id, department, data):
    approval = RailwayApproval.query.get(approval_id)
    
    # Mark this department as completed
    pending = RailwayApprovalPendingDepartment.query.filter_by(
        approval_id=approval_id,
        department=department
    ).first()
    
    if pending:
        pending.is_completed = True
        pending.completed_at = datetime.now()
        pending.completed_by = data.get('actor_name')
        db.session.add(pending)
    
    # Check if there are OTHER pending departments
    other_pending = RailwayApprovalPendingDepartment.query.filter_by(
        approval_id=approval_id,
        is_completed=False
    ).count()
    
    if other_pending > 0:
        # Other departments still need to approve
        # DON'T change status yet
        pass
    else:
        # ALL pending departments have approved
        # Now move to next status
        if department == 10:  # Commercial
            approval.status = 20  # C&W
        elif department == 15:  # C&W
            approval.status = 5  # APPROVED
    
    db.session.commit()
```

## Quick Test to Verify Backend Works

### Test 1: Create Pending Records

After Operations approves with both departments, check database:

```sql
SELECT * FROM railway_approval_pending_departments 
WHERE approval_id = <your_approval_id>;
```

**Should see:**
```
| approval_id | department | is_completed |
|-------------|------------|--------------|
| 123         | 10         | false        |
| 123         | 15         | false        |
```

### Test 2: Check Commercial Queue

Login as Commercial user, call list endpoint:

```bash
curl -X POST /railway_approval/list \
  -H "Authorization: Bearer <commercial_token>" \
  -H "Content-Type: application/json"
```

**Should return:** The approval with `approval_id = 123` ✓

### Test 3: Check C&W Queue

Login as C&W user, call list endpoint:

```bash
curl -X POST /railway_approval/list \
  -H "Authorization: Bearer <cw_token>" \
  -H "Content-Type: application/json"
```

**Should return:** The SAME approval with `approval_id = 123` ✓

### Test 4: Commercial Approves First

Commercial approves, check database:

```sql
SELECT * FROM railway_approval_pending_departments 
WHERE approval_id = 123;
```

**Should see:**
```
| approval_id | department | is_completed |
|-------------|------------|--------------|
| 123         | 10         | true         | <- Changed to true
| 123         | 15         | false        | <- Still false
```

**C&W should STILL see it in their queue** ✓

### Test 5: C&W Approves Second

C&W approves, check database:

```sql
SELECT status FROM railway_approval WHERE id = 123;
```

**Should see:**
```
| status |
|--------|
| 5      | <- APPROVED (both departments completed)
```

## Django/Flask Example

### Django Models

```python
class RailwayApprovalPendingDepartment(models.Model):
    approval = models.ForeignKey(
        'RailwayApproval', 
        on_delete=models.CASCADE,
        related_name='pending_departments'
    )
    department = models.IntegerField(
        choices=[(10, 'Commercial'), (15, 'C&W')]
    )
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['approval', 'department']
```

### Django View

```python
from django.db.models import Q

def list_approvals(request):
    department = request.user.department
    
    # Status-based match (existing sequential logic)
    status_filter = Q()
    if department == 10:
        status_filter = Q(status=15)
    elif department == 15:
        status_filter = Q(status=20)
    
    # Pending departments match (new parallel logic)
    pending_filter = Q(
        pending_departments__department=department,
        pending_departments__is_completed=False
    )
    
    # Combine both
    approvals = RailwayApproval.objects.filter(
        status_filter | pending_filter
    ).distinct()
    
    return JsonResponse({
        'results': [serialize_approval(a) for a in approvals]
    })
```

## Summary - What Backend MUST Do

1. ✅ **Accept `approval_targets` field** in PATCH request
2. ❌ **Create `railway_approval_pending_departments` table**
3. ❌ **Insert records for each department in `approval_targets`**
4. ❌ **Modify list endpoint to check pending_departments table**
5. ❌ **Mark department as completed when they approve**
6. ❌ **Only advance status when ALL pending departments complete**

## Current Status

- Frontend: ✅ Complete (sending approval_targets correctly)
- Backend: ❌ Not implemented (ignoring approval_targets)
- Result: ❌ Sequential behavior (old way)

## Action Required

Backend team needs to implement points 2-6 above. Without these changes, the multi-department feature WILL NOT WORK.

Please implement the database table and endpoint changes described in this document.
