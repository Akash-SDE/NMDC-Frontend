# Backend Implementation Guide for Multi-Department Railway Approvals

## Overview
This document explains how the backend needs to handle the new multi-department approval routing feature where Operations can send approvals to both Commercial and C&W departments simultaneously.

## API Changes Required

### 1. Railway Approval Update Endpoint

**Endpoint:** `PATCH /rake-management/v1/railway_approval/{id}`

#### New Field: `approval_targets`

The payload now includes an optional `approval_targets` array that specifies which departments should receive the approval.

**Example Payload:**
```json
{
  "status": 15,
  "steps": [
    {
      "department": 5,
      "step_status": 10,
      "actor_name": "Operations User",
      "approved_at": "2024-03-20T10:30:00Z",
      "remarks": "Approved for dispatch",
      "track_clearance_time": "2024-03-20T11:00:00Z",
      "wagons": [...]
    }
  ],
  "approval_targets": [10, 15],
  "history_entry": {
    "department": 5,
    "action": 10,
    "actor_name": "Operations User",
    "acted_on": "2024-03-20T10:30:00Z",
    "remarks": "Approved for dispatch"
  },
  "clearance_time": "2024-03-20T11:00:00Z"
}
```

## Field Specifications

### `approval_targets` (Array of Integers, Optional)

This field contains department codes indicating which departments should receive the approval.

**Possible Values:**
- `[10, 15]` - Send to both Commercial (10) and C&W (15)
- `[10]` - Send only to Commercial
- `[15]` - Send only to C&W
- `[]` or `null` - Sequential flow (default behavior)

**Important:** This field is ONLY sent when:
- The approving department is Operations (department code: 5)
- The action is "approve" (not reject)
- The user has selected specific target departments

## Backend Logic Requirements

### 1. Approval Visibility

When `approval_targets` contains multiple departments, the approval should be **visible and actionable by ALL specified departments simultaneously**.

#### Database Schema Consideration

You may need to track which departments are pending separately. Consider adding a table like:

```sql
CREATE TABLE railway_approval_pending_departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    approval_id INT NOT NULL,
    department INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by VARCHAR(255) NULL,
    FOREIGN KEY (approval_id) REFERENCES railway_approval(id),
    UNIQUE KEY (approval_id, department)
);
```

### 2. Status Management

#### Current Status Codes:
- `5` - APPROVED (all departments approved)
- `10` - AWAITING_OPERATIONS
- `15` - AWAITING_COMMERCIAL
- `20` - AWAITING_CW
- `25` - REJECTED

#### New Behavior:

**Scenario A: Both Commercial and C&W Selected** (`approval_targets: [10, 15]`)
- Set `status = 15` (AWAITING_COMMERCIAL) as the primary status
- Create pending records for BOTH departments:
  ```sql
  INSERT INTO railway_approval_pending_departments (approval_id, department)
  VALUES 
      ({approval_id}, 10), -- Commercial
      ({approval_id}, 15); -- C&W
  ```
- Both Commercial and C&W users should see this approval in their queue
- Either department can approve independently

**Scenario B: Only Commercial Selected** (`approval_targets: [10]`)
- Set `status = 15` (AWAITING_COMMERCIAL)
- Create pending record for Commercial only:
  ```sql
  INSERT INTO railway_approval_pending_departments (approval_id, department)
  VALUES ({approval_id}, 10);
  ```
- Only Commercial sees it, then flows to C&W after Commercial approves

**Scenario C: Only C&W Selected** (`approval_targets: [15]`)
- Set `status = 20` (AWAITING_CW)
- Create pending record for C&W only:
  ```sql
  INSERT INTO railway_approval_pending_departments (approval_id, department)
  VALUES ({approval_id}, 15);
  ```
- Skip Commercial entirely, only C&W sees it

### 3. List/Filter Endpoint Logic

**Endpoint:** `POST /rake-management/v1/railway_approval/list`

The list endpoint needs to be modified to show approvals based on `approval_targets`.

#### Current Logic (Sequential):
```python
def get_approvals_for_department(department_code):
    return RailwayApproval.query.filter(
        RailwayApproval.status == get_status_for_department(department_code)
    ).all()
```

#### New Logic (Multi-Department):
```python
def get_approvals_for_department(department_code):
    # Get approvals where status matches (sequential flow)
    sequential = RailwayApproval.query.filter(
        RailwayApproval.status == get_status_for_department(department_code)
    )
    
    # ALSO get approvals where this department is in pending_departments
    multi = db.session.query(RailwayApproval).join(
        RailwayApprovalPendingDepartment
    ).filter(
        RailwayApprovalPendingDepartment.department == department_code,
        RailwayApprovalPendingDepartment.is_completed == False
    )
    
    # Combine both queries
    return sequential.union(multi).all()
```

### 4. Department Approval Processing

When a department approves, check if there are other pending departments:

```python
def process_department_approval(approval_id, department_code, decision_data):
    # Mark this department as completed
    pending = RailwayApprovalPendingDepartment.query.filter_by(
        approval_id=approval_id,
        department=department_code
    ).first()
    
    if pending:
        pending.is_completed = True
        pending.completed_at = datetime.now()
        pending.completed_by = decision_data['actor_name']
        db.session.add(pending)
    
    # Check if there are other pending departments
    other_pending = RailwayApprovalPendingDepartment.query.filter_by(
        approval_id=approval_id,
        is_completed=False
    ).count()
    
    if other_pending > 0:
        # Other departments still need to approve
        # Don't change the overall status yet
        return approval
    else:
        # All specified departments have approved
        # Move to next step in sequential flow
        approval.status = get_next_status(department_code)
        db.session.add(approval)
        return approval
```

## Example Workflows

### Workflow 1: Both Departments (Default)

**Frontend sends:**
```json
{
  "status": 15,
  "approval_targets": [10, 15],
  ...
}
```

**Backend processing:**
1. Set approval status to 15 (AWAITING_COMMERCIAL)
2. Create pending records for departments 10 and 15
3. **Commercial user sees it** in their queue
4. **C&W user sees it** in their queue simultaneously
5. Commercial approves first:
   - Mark department 10 as completed
   - Check other pending: department 15 still pending
   - Keep status at 15 (AWAITING_COMMERCIAL)
6. C&W approves:
   - Mark department 15 as completed
   - Check other pending: all completed
   - Change status to 5 (APPROVED)

### Workflow 2: Only Commercial

**Frontend sends:**
```json
{
  "status": 15,
  "approval_targets": [10],
  ...
}
```

**Backend processing:**
1. Set approval status to 15 (AWAITING_COMMERCIAL)
2. Create pending record for department 10 only
3. Commercial sees it and approves
4. Mark department 10 as completed
5. All pending departments completed
6. Move to next sequential step: status = 20 (AWAITING_CW)
7. C&W now sees it

### Workflow 3: Only C&W

**Frontend sends:**
```json
{
  "status": 20,
  "approval_targets": [15],
  ...
}
```

**Backend processing:**
1. Set approval status to 20 (AWAITING_CW)
2. Create pending record for department 15 only
3. C&W sees it and approves
4. Mark department 15 as completed
5. All pending departments completed
6. Change status to 5 (APPROVED)

## Response Format

The GET endpoint should return pending departments information:

```json
{
  "id": 123,
  "rake_number": "RAKE-001",
  "status": 15,
  "pending_departments": [
    {
      "department": 10,
      "department_name": "Railway Commercial",
      "is_completed": false,
      "completed_at": null,
      "completed_by": null
    },
    {
      "department": 15,
      "department_name": "Railway C&W",
      "is_completed": false,
      "completed_at": null,
      "completed_by": null
    }
  ],
  "steps": [...],
  ...
}
```

## Migration Script

If you need to add the new table:

```sql
-- Add pending_departments table
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
    INDEX idx_approval_pending (approval_id, is_completed),
    INDEX idx_department_pending (department, is_completed)
);

-- Optionally: Add approval_targets to track original selection
ALTER TABLE railway_approval 
ADD COLUMN approval_targets JSON NULL COMMENT 'Departments selected for parallel approval';
```

## Testing Checklist

- [ ] Operations sends to both departments - both see it
- [ ] Commercial approves first - C&W still sees it as pending
- [ ] C&W approves second - status changes to APPROVED
- [ ] C&W approves first - Commercial still sees it as pending
- [ ] Commercial approves second - status changes to APPROVED
- [ ] Operations sends to Commercial only - only Commercial sees it
- [ ] Commercial approves - then C&W sees it (sequential)
- [ ] Operations sends to C&W only - Commercial is skipped, only C&W sees it
- [ ] C&W approves - status becomes APPROVED
- [ ] Rejection by any department - entire approval is rejected
- [ ] Multiple approvals don't interfere with each other

## API Contract Summary

### Required Changes:
1. ✅ Accept `approval_targets` array in PATCH request
2. ✅ Store pending departments information
3. ✅ Modify list endpoint to check both status and pending_departments
4. ✅ Track completion of each pending department independently
5. ✅ Progress to next status only when all pending departments complete
6. ✅ Return pending_departments info in GET response

### Optional Enhancements:
- Store original `approval_targets` in database for audit trail
- Add API endpoint to get pending approvals count per department
- Add webhooks/notifications when approval becomes available
- Add analytics on approval routing patterns
