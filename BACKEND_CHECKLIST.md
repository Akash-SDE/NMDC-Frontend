# Backend Implementation Checklist

## Quick Start - 8 Steps to Fix

### ☐ Step 1: Add New Model (5 min)

Add to `models.py`:

```python
class RailwayApprovalPendingDepartment(models.Model):
    approval = models.ForeignKey(RailwayApproval, on_delete=models.CASCADE, related_name="pending_departments")
    department = models.PositiveSmallIntegerField(choices=ApprovalDepartmentEnum.choices)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "railway_approval_pending_departments"
        constraints = [
            models.UniqueConstraint(fields=["approval", "department"], name="uniq_pending_dept")
        ]
```

### ☐ Step 2: Add Field to RailwayApproval (2 min)

```python
class RailwayApproval(BaseUserModel):
    # ... existing fields ...
    
    # ADD THIS:
    approval_targets = models.JSONField(null=True, blank=True)
```

### ☐ Step 3: Create Migration (1 min)

```bash
python manage.py makemigrations
python manage.py migrate
```

### ☐ Step 4: Update Serializer (3 min)

```python
class RailwayApprovalUpdateSerializer(serializers.ModelSerializer):
    approval_targets = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_null=True
    )
```

### ☐ Step 5: Update perform_update() (10 min)

In `RailwayApprovalUpdateApi` class, modify `perform_update`:

```python
def perform_update(self, serializer):
    approval = serializer.save(
        modified_by=self.request.user.id,
        modified_on=timezone.now().astimezone(timezone.timezone.utc)
    )
    
    # NEW: Handle approval_targets
    approval_targets = serializer.validated_data.get('approval_targets')
    if approval_targets:
        # Delete existing
        RailwayApprovalPendingDepartment.objects.filter(approval=approval).delete()
        
        # Create new
        RailwayApprovalPendingDepartment.objects.bulk_create([
            RailwayApprovalPendingDepartment(
                approval=approval,
                department=dept_code,
                is_completed=False
            )
            for dept_code in approval_targets
        ])
```

### ☐ Step 6: Add Method to Mark Complete (5 min)

Add this method to `RailwayApprovalUpdateApi`:

```python
def _mark_department_complete(self, approval, department, actor_name):
    """Mark a department as completed in pending_departments"""
    pending = RailwayApprovalPendingDepartment.objects.filter(
        approval=approval,
        department=department
    ).first()
    
    if pending:
        pending.is_completed = True
        pending.completed_at = timezone.now()
        pending.completed_by = actor_name
        pending.save()
        
        # Check if all pending are done
        remaining = RailwayApprovalPendingDepartment.objects.filter(
            approval=approval,
            is_completed=False
        ).count()
        
        return remaining == 0  # True if all completed
    
    return True  # No pending record, proceed normally
```

### ☐ Step 7: Update List API Filter (10 min)

Update your list view's `get_queryset()`:

```python
from django.db.models import Q

def get_queryset(self):
    user_dept = self._get_user_department()
    
    # OLD: Status-based (sequential)
    if user_dept == ApprovalDepartmentEnum.COMMERCIAL.CODE:
        status_filter = Q(status=RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE)
    elif user_dept == ApprovalDepartmentEnum.CW.CODE:
        status_filter = Q(status=RailwayStatusEnum.AWAITINGCW.CODE)
    else:
        status_filter = Q(pk__isnull=True)
    
    # NEW: Pending departments (parallel)
    pending_filter = Q(
        pending_departments__department=user_dept,
        pending_departments__is_completed=False
    )
    
    # Combine both
    return RailwayApproval.objects.filter(
        status_filter | pending_filter
    ).distinct()
```

### ☐ Step 8: Test (5 min)

```python
# After Operations approves with [10, 15]:
>>> approval = RailwayApproval.objects.get(id=123)
>>> approval.pending_departments.all()
# Should return 2 records (Commercial and C&W)

>>> approval.pending_departments.filter(is_completed=False).count()
# Should be 2 (both pending)
```

## Expected Results After Fix

| Action | Before Fix | After Fix |
|--------|-----------|-----------|
| Operations approves with both | Only Commercial sees it | ✅ Both Commercial AND C&W see it |
| Commercial approves | Moves to C&W queue | ✅ C&W still sees it (no change) |
| C&W approves (after Commercial) | - | ✅ Status = APPROVED |
| Order reversed (C&W first) | Not possible | ✅ Commercial still sees it |

## Files to Modify

1. `models.py` - Add RailwayApprovalPendingDepartment model + approval_targets field
2. `serializers.py` - Add approval_targets to serializer
3. `views.py` - Update perform_update() and list queryset
4. Create migration

## Full Code Reference

See `DJANGO_BACKEND_FIX.md` for complete code with all details.

## Time Estimate

- **Total Time:** ~45 minutes
- **Testing:** ~15 minutes
- **Total:** ~1 hour

## Priority

🔴 **HIGH** - Frontend is already sending the data, just needs backend to handle it.
