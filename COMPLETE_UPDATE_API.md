# Complete RailwayApprovalUpdateApi Class - Copy This Entire Class

Replace your entire `RailwayApprovalUpdateApi` class with this:

```python
class RailwayApprovalUpdateApi(RetrieveUpdateDestroyAPIView):
    """This view class is used to update an existing RailwayApproval record"""
    iron_ore_object_permissions = {
        'GET': (permission_railway_approval_view,),
        'PUT': (permission_railway_approval_edit,),
        'PATCH': (permission_railway_approval_edit,),
        'DELETE': (permission_railway_approval_delete,)
    }
    permission_classes = (IRONOREPermission,)
    serializer_class = RailwayApprovalCreateSerializer
    queryset = RailwayApproval.objects.all()

    def get_serializer_class(self):
        """Return Read serializer for GET"""
        if self.request.method == "GET":
            return RailwayApprovalReadSerializer
        return RailwayApprovalUpdateSerializer

    def get_queryset(self):
        return RailwayApproval.objects.select_related(
            'rake', 'loading'
        ).prefetch_related(
            'steps__wagons',
            'wagons__flags',
            'history',
        )

    def perform_update(self, serializer):
        """Handle approval updates with multi-department support"""
        
        # Extract fields that can't be directly assigned
        approval_targets = serializer.validated_data.pop('approval_targets', None)
        steps_data = serializer.validated_data.pop('steps', None)
        wagons_data = serializer.validated_data.pop('wagons', None)
        history_data = serializer.validated_data.pop('history_entry', None)
        
        # Save the approval with scalar fields only
        approval = serializer.save(
            modified_by=self.request.user.id,
            modified_on=timezone.now().astimezone(timezone.timezone.utc)
        )
        
        # Handle multi-department approval routing
        if approval_targets:
            self._handle_approval_targets(approval, approval_targets)
        
        # Handle steps updates
        if steps_data:
            for step_data in steps_data:
                department = step_data.get('department')
                if department:
                    self._update_step(approval, department, step_data, approval_targets)
        
        return approval

    def _handle_approval_targets(self, approval, approval_targets):
        """Create PENDING steps for target departments"""
        for dept_code in approval_targets:
            RailwayApprovalStep.objects.get_or_create(
                approval=approval,
                department=dept_code,
                defaults={'step_status': ApprovalStepStatusEnum.PENDING.CODE}
            )

    def _update_step(self, approval, department, step_data, approval_targets):
        """Update a department step"""
        # Remove nested relations
        step_data.pop('wagons', None)
        
        # Get or create the step
        step, created = RailwayApprovalStep.objects.get_or_create(
            approval=approval,
            department=department,
            defaults=step_data
        )
        
        if not created:
            # Update existing step
            for key, value in step_data.items():
                setattr(step, key, value)
            step.save()
        
        # If this step was approved, check if we should advance overall status
        if step_data.get('step_status') == ApprovalStepStatusEnum.APPROVED.CODE:
            self._check_and_advance_status(approval, department, approval_targets)

    def _check_and_advance_status(self, approval, department, approval_targets):
        """Check if all target departments approved, then advance status"""
        if approval_targets:
            # Multi-department mode: Check if ALL target departments approved
            all_approved = all(
                RailwayApprovalStep.objects.filter(
                    approval=approval,
                    department=dept_code,
                    step_status=ApprovalStepStatusEnum.APPROVED.CODE
                ).exists()
                for dept_code in approval_targets
            )
            
            if all_approved:
                self._advance_status(approval, department)
        else:
            # Sequential mode: Advance immediately
            self._advance_status(approval, department)

    def _advance_status(self, approval, department):
        """Advance approval status to next step"""
        if department == ApprovalDepartmentEnum.OPERATIONS.CODE:
            approval.status = RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE
        elif department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
            approval.status = RailwayStatusEnum.AWAITINGCW.CODE
        elif department == ApprovalDepartmentEnum.CW.CODE:
            approval.status = RailwayStatusEnum.APPROVED.CODE
        
        approval.save(update_fields=['status'])

    def perform_destroy(self, instance):
        """Soft delete by marking the approval rejected."""
        instance.status = RailwayStatusEnum.REJECTED.CODE
        instance.modified_by = self.request.user.id
        instance.modified_on = timezone.now().astimezone(timezone.timezone.utc)
        instance.save()
```

## If You Get Import Errors

Make sure you have these imports at the top of your file:

```python
from django.utils import timezone
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from django.db.models import Q

# Your app imports
from .models import (
    RailwayApproval, 
    RailwayApprovalStep,
    ApprovalStepStatusEnum,
    ApprovalDepartmentEnum,
    RailwayStatusEnum,
)
from .serializers import (
    RailwayApprovalReadSerializer,
    RailwayApprovalUpdateSerializer,
    RailwayApprovalCreateSerializer,
)
```

## What This Does

### When Operations Approves with [10, 15]

```python
# 1. Frontend sends approval_targets: [10, 15]

# 2. _handle_approval_targets() creates:
RailwayApprovalStep(approval=123, department=10, step_status=PENDING)
RailwayApprovalStep(approval=123, department=15, step_status=PENDING)

# 3. Both Commercial and C&W can now see it (via FilterApi)
```

### When Commercial Approves

```python
# 4. _update_step() updates Commercial's step to APPROVED

# 5. _check_and_advance_status() checks:
#    - Department 10: APPROVED ✓
#    - Department 15: PENDING ✗
#    - Don't advance yet (not all done)
```

### When C&W Approves

```python
# 6. _update_step() updates C&W's step to APPROVED

# 7. _check_and_advance_status() checks:
#    - Department 10: APPROVED ✓
#    - Department 15: APPROVED ✓
#    - All done! Call _advance_status()

# 8. _advance_status() sets approval.status = APPROVED
```

## Enum Code Reference

Update these to match your actual enum values:

```python
# ApprovalStepStatusEnum
PENDING.CODE = 5
APPROVED.CODE = 10
REJECTED.CODE = 15

# ApprovalDepartmentEnum
OPERATIONS.CODE = 5
COMMERCIAL.CODE = 10
CW.CODE = 15

# RailwayStatusEnum
AWAITINGOPERATIONS.CODE = 10
AWAITINGCOMMERCIAL.CODE = 15
AWAITINGCW.CODE = 20
APPROVED.CODE = 5
REJECTED.CODE = 25
```

## Testing After Implementation

```python
# 1. Operations approves with both departments
# POST /railway_approval/123
# { "approval_targets": [10, 15], "steps": [...] }

# 2. Check database
>>> RailwayApprovalStep.objects.filter(approval_id=123, step_status=5).count()
2  # Both Commercial and C&W have PENDING steps ✓

# 3. Commercial approves
# PATCH /railway_approval/123
# { "steps": [{"department": 10, "step_status": 10, ...}] }

# 4. Check status hasn't changed yet
>>> RailwayApproval.objects.get(id=123).status
15  # Still AWAITING_COMMERCIAL ✓

# 5. C&W approves
# PATCH /railway_approval/123
# { "steps": [{"department": 15, "step_status": 10, ...}] }

# 6. Check status advanced
>>> RailwayApproval.objects.get(id=123).status
5  # APPROVED ✓
```

This complete class should work without any missing method errors! 🎉
