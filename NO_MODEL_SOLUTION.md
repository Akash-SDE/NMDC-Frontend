# Solution Without Creating New Models

## The Clever Trick

Instead of creating a new `PendingDepartments` table, we use the **existing `RailwayApprovalStep` model** and just create **PENDING steps for both departments upfront**.

## Visual Explanation

### Current Problem (Sequential)

```
Operations approves → status = 15 (AWAITING_COMMERCIAL)

Database:
RailwayApproval(id=123, status=15)
RailwayApprovalStep(approval=123, dept=5, status=APPROVED)  # Operations

Query Results:
Commercial: status=15? YES → Shows ✓
C&W:        status=20? NO  → Doesn't show ✗
```

### Solution (Parallel with Existing Model)

```
Operations approves with [10, 15] → Create PENDING steps for both

Database:
RailwayApproval(id=123, status=15)
RailwayApprovalStep(approval=123, dept=5,  status=APPROVED)  # Operations
RailwayApprovalStep(approval=123, dept=10, status=PENDING)   # Commercial
RailwayApprovalStep(approval=123, dept=15, status=PENDING)   # C&W

Query Results:
Commercial: Has step(dept=10, status=PENDING)? YES → Shows ✓
C&W:        Has step(dept=15, status=PENDING)? YES → Shows ✓
```

## Code Changes (Copy-Paste Ready)

### Change 1: Update perform_update() in RailwayApprovalUpdateApi

```python
def perform_update(self, serializer):
    # Get approval_targets from request
    approval_targets = serializer.validated_data.pop('approval_targets', None)
    
    # Save approval
    approval = serializer.save(
        modified_by=self.request.user.id,
        modified_on=timezone.now().astimezone(timezone.timezone.utc)
    )
    
    # NEW: Create PENDING steps for target departments
    if approval_targets:
        for dept_code in approval_targets:
            RailwayApprovalStep.objects.get_or_create(
                approval=approval,
                department=dept_code,
                defaults={'step_status': ApprovalStepStatusEnum.PENDING.CODE}
            )
    
    # Handle step updates from frontend
    steps_data = self.request.data.get('steps', [])
    for step_data in steps_data:
        department = step_data.get('department')
        if department:
            self._process_step(approval, department, step_data, approval_targets)
```

### Change 2: Add Helper Method _process_step()

```python
def _process_step(self, approval, department, step_data, approval_targets):
    """Process a department's approval step"""
    # Update or create the step
    step, created = RailwayApprovalStep.objects.get_or_create(
        approval=approval,
        department=department,
        defaults=step_data
    )
    
    if not created:
        for key, value in step_data.items():
            setattr(step, key, value)
        step.save()
    
    # If this is an approval, check if we should advance status
    if step_data.get('step_status') == ApprovalStepStatusEnum.APPROVED.CODE:
        if approval_targets:
            # Check if ALL target departments have approved
            all_approved = all(
                RailwayApprovalStep.objects.filter(
                    approval=approval,
                    department=dept,
                    step_status=ApprovalStepStatusEnum.APPROVED.CODE
                ).exists()
                for dept in approval_targets
            )
            
            if all_approved:
                # All done, advance status
                self._advance_status(approval, department)
        else:
            # Sequential mode, advance immediately
            self._advance_status(approval, department)

def _advance_status(self, approval, department):
    """Advance to next status"""
    if department == ApprovalDepartmentEnum.OPERATIONS.CODE:
        approval.status = RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE
    elif department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
        approval.status = RailwayStatusEnum.AWAITINGCW.CODE
    elif department == ApprovalDepartmentEnum.CW.CODE:
        approval.status = RailwayStatusEnum.APPROVED.CODE
    approval.save(update_fields=['status'])
```

### Change 3: Update List Query Filter

```python
from django.db.models import Q

class RailwayApprovalListApi(ListAPIView):
    # ... existing code ...
    
    def get_queryset(self):
        user_dept = self._get_user_department()  # Your existing method
        
        queryset = RailwayApproval.objects.select_related(
            'rake', 'loading'
        ).prefetch_related('steps')
        
        # Filter 1: Status matches (sequential approvals)
        if user_dept == ApprovalDepartmentEnum.COMMERCIAL.CODE:
            status_filter = Q(status=RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE)
        elif user_dept == ApprovalDepartmentEnum.CW.CODE:
            status_filter = Q(status=RailwayStatusEnum.AWAITINGCW.CODE)
        else:
            status_filter = Q(pk__isnull=True)
        
        # Filter 2: Has PENDING step for this department (parallel approvals)
        step_filter = Q(
            steps__department=user_dept,
            steps__step_status=ApprovalStepStatusEnum.PENDING.CODE
        )
        
        # Show if EITHER condition is true
        return queryset.filter(status_filter | step_filter).distinct()
```

## Flow Diagram

### When Operations Approves with [10, 15]

```
┌─────────────────────────────────────────────┐
│ Frontend Sends:                             │
│ {                                           │
│   approval_targets: [10, 15],               │
│   status: 15,                               │
│   steps: [...]                              │
│ }                                           │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Backend Creates Steps:                      │
│                                             │
│ Step(approval=123, dept=10, status=PENDING) │
│ Step(approval=123, dept=15, status=PENDING) │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Commercial    │   │     C&W       │
│ Queries       │   │   Queries     │
│               │   │               │
│ Filter:       │   │ Filter:       │
│ steps.dept=10 │   │ steps.dept=15 │
│ steps.status  │   │ steps.status  │
│   =PENDING    │   │   =PENDING    │
│               │   │               │
│ ✓ Shows it!   │   │ ✓ Shows it!   │
└───────┬───────┘   └───────┬───────┘
        │                   │
        │ Commercial        │ C&W still
        │ Approves          │ sees it
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Update Step:  │   │ Still PENDING │
│ dept=10       │   │ for C&W       │
│ status=       │   │               │
│   APPROVED    │   │ Query still   │
│               │   │ matches ✓     │
│ Check all     │   │               │
│ targets:      │   │               │
│ 10: APPROVED✓ │   │               │
│ 15: PENDING✗  │   │               │
│               │   │               │
│ Don't advance │   │               │
│ status yet    │   │               │
└───────────────┘   └───────┬───────┘
                            │
                            │ C&W Approves
                            │
                            ▼
                    ┌───────────────┐
                    │ Update Step:  │
                    │ dept=15       │
                    │ status=       │
                    │   APPROVED    │
                    │               │
                    │ Check all     │
                    │ targets:      │
                    │ 10: APPROVED✓ │
                    │ 15: APPROVED✓ │
                    │               │
                    │ All done!     │
                    │ Advance to    │
                    │ APPROVED      │
                    └───────────────┘
```

## Database State Through Process

### After Operations Approves

```sql
SELECT * FROM railway_approval WHERE id = 123;
-- id | status | ...
-- 123 | 15    | ...

SELECT * FROM railway_approval_step WHERE approval_id = 123;
-- approval_id | department | step_status
-- 123         | 5          | 10 (APPROVED - Operations)
-- 123         | 10         | 5  (PENDING - Commercial)
-- 123         | 15         | 5  (PENDING - C&W)
```

### After Commercial Approves

```sql
SELECT * FROM railway_approval_step WHERE approval_id = 123;
-- approval_id | department | step_status
-- 123         | 5          | 10 (APPROVED)
-- 123         | 10         | 10 (APPROVED - Commercial done)
-- 123         | 15         | 5  (PENDING - C&W still waiting)
```

### After C&W Approves

```sql
SELECT * FROM railway_approval WHERE id = 123;
-- id | status | ...
-- 123 | 5     | ... (APPROVED!)

SELECT * FROM railway_approval_step WHERE approval_id = 123;
-- approval_id | department | step_status
-- 123         | 5          | 10 (APPROVED)
-- 123         | 10         | 10 (APPROVED)
-- 123         | 15         | 10 (APPROVED - All done!)
```

## Why This Works

1. **No new tables** - Uses existing RailwayApprovalStep
2. **Simple logic** - Just create PENDING steps upfront
3. **Query is easy** - Show approvals where user's dept has PENDING step
4. **Status control** - Only advance when ALL target steps are APPROVED
5. **Backward compatible** - Sequential approvals still work

## Benefits

✅ No schema changes (except optional 1 field)
✅ Uses existing models
✅ Simple to understand
✅ Easy to test
✅ Quick to implement (~30 min)

## See Full Implementation

Check `DJANGO_NO_MODEL_FIX.md` for complete code with error handling and edge cases.
