# Simple Fix Without New Models - Checklist

## What We're Using

✅ Existing `RailwayApprovalStep` model - just add PENDING steps for both departments
✅ Existing `RailwayApproval` model - optionally add 1 JSONField
✅ Filter by step status instead of just approval status

## 3 Simple Steps

### ☐ Step 1: Add One Field (Optional - 2 min)

In `models.py`:

```python
class RailwayApproval(BaseUserModel):
    # ... existing fields ...
    
    # ADD THIS (optional but helpful):
    approval_targets = models.JSONField(null=True, blank=True)
```

Then run:
```bash
python manage.py makemigrations
python manage.py migrate
```

**Or skip this if you cannot modify models at all.**

### ☐ Step 2: Update perform_update() (15 min)

In your `RailwayApprovalUpdateApi` class, replace `perform_update`:

```python
def perform_update(self, serializer):
    approval_targets = serializer.validated_data.pop('approval_targets', None)
    
    approval = serializer.save(
        modified_by=self.request.user.id,
        modified_on=timezone.now().astimezone(timezone.timezone.utc)
    )
    
    # NEW: If approval_targets sent, create PENDING steps for those departments
    if approval_targets:
        for dept_code in approval_targets:
            RailwayApprovalStep.objects.get_or_create(
                approval=approval,
                department=dept_code,
                defaults={'step_status': ApprovalStepStatusEnum.PENDING.CODE}
            )
    
    # Process step updates (existing logic)
    steps_data = serializer.validated_data.get('steps', [])
    for step_data in steps_data:
        self._update_step(approval, step_data, approval_targets)

def _update_step(self, approval, step_data, approval_targets=None):
    """Update a step and check if should advance status"""
    department = step_data.get('department')
    step, created = RailwayApprovalStep.objects.get_or_create(
        approval=approval,
        department=department,
        defaults=step_data
    )
    
    if not created:
        for key, value in step_data.items():
            setattr(step, key, value)
        step.save()
    
    # If approved, check if all target departments done
    if step_data.get('step_status') == ApprovalStepStatusEnum.APPROVED.CODE:
        if approval_targets:
            # Check if ALL target departments approved
            all_done = all(
                RailwayApprovalStep.objects.filter(
                    approval=approval,
                    department=d,
                    step_status=ApprovalStepStatusEnum.APPROVED.CODE
                ).exists()
                for d in approval_targets
            )
            if all_done:
                self._advance_status(approval, department)
        else:
            # No targets, advance immediately (sequential)
            self._advance_status(approval, department)

def _advance_status(self, approval, department):
    """Advance approval status"""
    if department == ApprovalDepartmentEnum.OPERATIONS.CODE:
        approval.status = RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE
    elif department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
        approval.status = RailwayStatusEnum.AWAITINGCW.CODE
    elif department == ApprovalDepartmentEnum.CW.CODE:
        approval.status = RailwayStatusEnum.APPROVED.CODE
    approval.save()
```

### ☐ Step 3: Update List Query (5 min)

In your list view, update `get_queryset()`:

```python
from django.db.models import Q

def get_queryset(self):
    user_dept = self._get_user_department()
    
    queryset = RailwayApproval.objects.select_related('rake', 'loading')
    
    # OLD filter: by status (sequential)
    status_filter = Q()
    if user_dept == ApprovalDepartmentEnum.COMMERCIAL.CODE:
        status_filter = Q(status=RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE)
    elif user_dept == ApprovalDepartmentEnum.CW.CODE:
        status_filter = Q(status=RailwayStatusEnum.AWAITINGCW.CODE)
    
    # NEW filter: by step status (parallel)
    step_filter = Q(
        steps__department=user_dept,
        steps__step_status=ApprovalStepStatusEnum.PENDING.CODE
    )
    
    # Show if EITHER filter matches
    return queryset.filter(status_filter | step_filter).distinct()
```

## That's It! 

### How It Works

**When Operations approves with both departments [10, 15]:**

1. Backend creates 2 PENDING steps:
   ```
   Step(approval=123, department=10, status=PENDING)
   Step(approval=123, department=15, status=PENDING)
   ```

2. Commercial queries → sees it (has PENDING step for dept 10) ✓
3. C&W queries → sees it (has PENDING step for dept 15) ✓

4. Commercial approves → changes dept 10 step to APPROVED
5. Check if all targets approved: 
   - Dept 10: APPROVED ✓
   - Dept 15: PENDING ✗
   - Don't advance status yet

6. C&W still sees it (still has PENDING step) ✓

7. C&W approves → changes dept 15 step to APPROVED
8. Check if all targets approved:
   - Dept 10: APPROVED ✓
   - Dept 15: APPROVED ✓
   - All done! Advance status to APPROVED ✓

## Test After Implementation

```python
# 1. Operations approves with [10, 15]
>>> approval = RailwayApproval.objects.get(id=123)
>>> approval.steps.filter(step_status=5).count()
2  # Both departments have PENDING steps ✓

# 2. Commercial sees it
>>> RailwayApproval.objects.filter(
...     steps__department=10, 
...     steps__step_status=5
... ).count()
1  # ✓

# 3. C&W sees it too
>>> RailwayApproval.objects.filter(
...     steps__department=15,
...     steps__step_status=5
... ).count()
1  # ✓

# 4. Commercial approves
>>> step = RailwayApprovalStep.objects.get(approval_id=123, department=10)
>>> step.step_status = 10  # APPROVED
>>> step.save()

# 5. C&W still sees it
>>> RailwayApproval.objects.filter(
...     steps__department=15,
...     steps__step_status=5
... ).count()
1  # ✓ Still pending for C&W

# 6. C&W approves
>>> step = RailwayApprovalStep.objects.get(approval_id=123, department=15)
>>> step.step_status = 10
>>> step.save()

# 7. Status advanced
>>> RailwayApproval.objects.get(id=123).status
5  # APPROVED ✓
```

## Comparison

| Approach | New Models | New Tables | Migration | Complexity |
|----------|------------|------------|-----------|------------|
| **This One** | 0 (or 1 field) | 0 | Optional | ⭐ Simple |
| Previous | 1 new model | 1 new table | Required | ⭐⭐⭐ Complex |

## Time to Implement

- Step 1 (optional field): 5 min
- Step 2 (update logic): 15 min  
- Step 3 (query filter): 5 min
- **Total: ~25 minutes**

## Key Insight

Instead of creating a new table, we're just **marking steps as PENDING** for both departments. The list query then shows approvals where the user's department has a PENDING step.

**Simple and uses existing structure!** 🎉
