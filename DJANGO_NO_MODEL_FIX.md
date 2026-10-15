# Django Backend Fix - WITHOUT New Models

## Solution: Use Existing RailwayApprovalStep Model

Instead of creating a new table, we'll use the existing `RailwayApprovalStep` model to track which departments need to approve.

## Key Insight

When `approval_targets: [10, 15]` is sent:
1. Mark BOTH Commercial and C&W steps as "active/pending"
2. Show approval to departments that have "pending" steps
3. When a department approves, mark their step as "approved"
4. Only advance status when ALL target departments have approved

## Step 1: Add Field to RailwayApproval (Optional - can use JSONField)

If you can add just ONE field to existing model:

```python
class RailwayApproval(BaseUserModel):
    # ... existing fields ...
    
    # ADD THIS SINGLE FIELD (optional but helpful)
    approval_targets = models.JSONField(
        null=True, 
        blank=True,
        help_text="Departments selected for parallel approval: [10, 15]"
    )
```

**Migration:**
```bash
python manage.py makemigrations
python manage.py migrate
```

If you **absolutely cannot add any field**, skip this and use logic only in views.

## Step 2: Update Serializer

```python
class RailwayApprovalUpdateSerializer(serializers.ModelSerializer):
    approval_targets = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_null=True,
        write_only=True  # Only for input, not in response
    )
    
    class Meta:
        model = RailwayApproval
        fields = ['status', 'approval_targets', 'steps', 'history_entry', ...]
```

## Step 3: Fix RailwayApprovalUpdateApi - The Core Logic

Replace your `RailwayApprovalUpdateApi` class with this:

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
        approval_targets = serializer.validated_data.pop('approval_targets', None)
        
        approval = serializer.save(
            modified_by=self.request.user.id,
            modified_on=timezone.now().astimezone(timezone.timezone.utc)
        )
        
        # Handle multi-department approval routing
        if approval_targets:
            self._handle_multi_department_approval(approval, approval_targets)
        
        # Handle step updates from frontend
        steps_data = serializer.validated_data.get('steps', [])
        for step_data in steps_data:
            department = step_data.get('department')
            if department:
                self._process_department_step(approval, department, step_data, approval_targets)

    def _handle_multi_department_approval(self, approval, approval_targets):
        """
        When Operations sends approval_targets, mark those department steps as PENDING
        so they become "active" and visible to those departments.
        """
        # Store targets if field exists
        if hasattr(approval, 'approval_targets'):
            approval.approval_targets = approval_targets
            approval.save(update_fields=['approval_targets'])
        
        # Mark all target department steps as PENDING (makes them active)
        for dept_code in approval_targets:
            step, created = RailwayApprovalStep.objects.get_or_create(
                approval=approval,
                department=dept_code,
                defaults={
                    'step_status': ApprovalStepStatusEnum.PENDING.CODE,
                }
            )
            if not created and step.step_status == ApprovalStepStatusEnum.PENDING.CODE:
                # Already pending, keep it that way
                pass

    def _process_department_step(self, approval, department, step_data, approval_targets=None):
        """Process a single department's approval step"""
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
        
        # If this is an approval, check if we should advance overall status
        if step_data.get('step_status') == ApprovalStepStatusEnum.APPROVED.CODE:
            self._check_and_advance_status(approval, department, approval_targets)

    def _check_and_advance_status(self, approval, department, approval_targets=None):
        """
        Check if all required departments have approved, then advance status.
        """
        # Get approval_targets from database if not passed
        if approval_targets is None and hasattr(approval, 'approval_targets'):
            approval_targets = approval.approval_targets
        
        if approval_targets:
            # Multi-department mode: Check if ALL target departments approved
            all_approved = True
            for dept_code in approval_targets:
                step = RailwayApprovalStep.objects.filter(
                    approval=approval,
                    department=dept_code
                ).first()
                
                if not step or step.step_status != ApprovalStepStatusEnum.APPROVED.CODE:
                    all_approved = False
                    break
            
            if all_approved:
                # All target departments approved, advance status
                self._advance_status(approval, department)
        else:
            # Sequential mode: Advance immediately
            self._advance_status(approval, department)

    def _advance_status(self, approval, last_department):
        """Advance approval status based on last department that approved"""
        if last_department == ApprovalDepartmentEnum.OPERATIONS.CODE:
            approval.status = RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE
        elif last_department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
            approval.status = RailwayStatusEnum.AWAITINGCW.CODE
        elif last_department == ApprovalDepartmentEnum.CW.CODE:
            approval.status = RailwayStatusEnum.APPROVED.CODE
        
        approval.save(update_fields=['status'])

    def perform_destroy(self, instance):
        """Soft delete by marking the approval rejected."""
        instance.status = RailwayStatusEnum.REJECTED.CODE
        instance.modified_by = self.request.user.id
        instance.modified_on = timezone.now().astimezone(timezone.timezone.utc)
        instance.save()
```

## Step 4: Fix List API - Show to Multiple Departments

Update your list view to check steps instead of just status:

```python
from django.db.models import Q

class RailwayApprovalListApi(ListAPIView):
    """List railway approvals for the current user's department"""
    iron_ore_object_permissions = {'GET': (permission_railway_approval_view,)}
    permission_classes = (IRONOREPermission,)
    serializer_class = RailwayApprovalReadSerializer
    
    def get_queryset(self):
        user = self.request.user
        user_department = self._get_user_department(user)
        
        if not user_department:
            return RailwayApproval.objects.none()
        
        queryset = RailwayApproval.objects.select_related(
            'rake', 'loading'
        ).prefetch_related(
            'steps',
            'wagons__flags',
            'history',
        )
        
        # Method 1: Status-based filter (existing sequential logic)
        status_filter = self._get_status_filter(user_department)
        
        # Method 2: Step-based filter (NEW - for parallel approvals)
        # Show if this department has a PENDING step
        step_filter = Q(
            steps__department=user_department,
            steps__step_status=ApprovalStepStatusEnum.PENDING.CODE
        )
        
        # Combine both: Show if EITHER condition is true
        return queryset.filter(status_filter | step_filter).distinct()
    
    def _get_user_department(self, user):
        """Get user's department code based on role"""
        # Adjust this based on your user-role model
        if hasattr(user, 'role'):
            role_name = getattr(user.role, 'name', '').lower()
            if 'commercial' in role_name:
                return ApprovalDepartmentEnum.COMMERCIAL.CODE
            elif 'c&w' in role_name or 'cw' in role_name:
                return ApprovalDepartmentEnum.CW.CODE
            elif 'operation' in role_name:
                return ApprovalDepartmentEnum.OPERATIONS.CODE
        return None
    
    def _get_status_filter(self, department):
        """Get status filter for sequential approvals"""
        if department == ApprovalDepartmentEnum.OPERATIONS.CODE:
            return Q(status=RailwayStatusEnum.AWAITINGOPERATIONS.CODE)
        elif department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
            return Q(status=RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE)
        elif department == ApprovalDepartmentEnum.CW.CODE:
            return Q(status=RailwayStatusEnum.AWAITINGCW.CODE)
        return Q(pk__isnull=True)  # No match
```

## How It Works

### Scenario: Operations Approves with Both [10, 15]

**Step 1: Frontend sends**
```json
{
  "status": 15,
  "approval_targets": [10, 15],
  "steps": [...]
}
```

**Step 2: Backend creates/updates steps**
```python
# Create or ensure PENDING steps for both departments
RailwayApprovalStep(approval=123, department=10, step_status=PENDING)
RailwayApprovalStep(approval=123, department=15, step_status=PENDING)
```

**Step 3: List queries**
```python
# Commercial user queries
queryset.filter(
    Q(status=15) |  # Status matches
    Q(steps__department=10, steps__step_status=PENDING)  # Has pending step
)
# Returns approval #123 ✓

# C&W user queries  
queryset.filter(
    Q(status=20) |  # Status doesn't match (status=15)
    Q(steps__department=15, steps__step_status=PENDING)  # Has pending step ✓
)
# Returns approval #123 ✓ (because has pending step!)
```

**Step 4: Commercial approves first**
```python
# Update Commercial's step
step = RailwayApprovalStep.objects.get(approval=123, department=10)
step.step_status = APPROVED
step.save()

# Check if all targets approved
commercial_step = APPROVED ✓
cw_step = PENDING (still waiting)

# Don't advance status yet
```

**Step 5: C&W queries again**
```python
# C&W still has a PENDING step
queryset.filter(steps__department=15, steps__step_status=PENDING)
# Still returns approval #123 ✓
```

**Step 6: C&W approves**
```python
# Update C&W's step
step = RailwayApprovalStep.objects.get(approval=123, department=15)
step.step_status = APPROVED
step.save()

# Check if all targets approved
commercial_step = APPROVED ✓
cw_step = APPROVED ✓

# All approved! Advance status to APPROVED
approval.status = RailwayStatusEnum.APPROVED.CODE
approval.save()
```

## Alternative: Without approval_targets Field

If you **cannot add the approval_targets field**, store it in remarks or use step logic only:

```python
def _handle_multi_department_approval(self, approval, approval_targets):
    """Store targets in a step's remarks field temporarily"""
    # Mark all target department steps as PENDING
    for dept_code in approval_targets:
        step, created = RailwayApprovalStep.objects.get_or_create(
            approval=approval,
            department=dept_code,
            defaults={
                'step_status': ApprovalStepStatusEnum.PENDING.CODE,
                'remarks': f'approval_targets:{approval_targets}'  # Store here
            }
        )

def _check_and_advance_status(self, approval, department, approval_targets=None):
    """Get targets from step remarks if needed"""
    if approval_targets is None:
        # Try to get from any step's remarks
        first_step = approval.steps.first()
        if first_step and first_step.remarks.startswith('approval_targets:'):
            import json
            targets_str = first_step.remarks.replace('approval_targets:', '')
            approval_targets = json.loads(targets_str)
    
    # Rest of logic same...
```

## Testing

### Test 1: Verify steps are created

```python
# After Operations approves with [10, 15]
>>> approval = RailwayApproval.objects.get(id=123)
>>> approval.steps.filter(step_status=ApprovalStepStatusEnum.PENDING.CODE).values('department')
[{'department': 10}, {'department': 15}]  # Both pending ✓
```

### Test 2: Check both departments see it

```python
# Commercial query
>>> RailwayApproval.objects.filter(
...     Q(status=15) | 
...     Q(steps__department=10, steps__step_status=5)
... ).distinct()
[<Approval 123>]  # Commercial sees it ✓

# C&W query
>>> RailwayApproval.objects.filter(
...     Q(status=20) |
...     Q(steps__department=15, steps__step_status=5)
... ).distinct()
[<Approval 123>]  # C&W also sees it ✓
```

### Test 3: Commercial approves, C&W still sees it

```python
>>> step = RailwayApprovalStep.objects.get(approval_id=123, department=10)
>>> step.step_status = ApprovalStepStatusEnum.APPROVED.CODE
>>> step.save()

>>> # C&W query again
>>> RailwayApproval.objects.filter(
...     steps__department=15, 
...     steps__step_status=5
... )
[<Approval 123>]  # Still visible ✓
```

## Summary

**Without creating new models, we use:**

1. ✅ `approval_targets` field on RailwayApproval (optional - just one JSONField)
2. ✅ Existing `RailwayApprovalStep` model to track pending departments
3. ✅ Step status PENDING = department needs to review
4. ✅ List query checks both status AND step status
5. ✅ Advance status only when all target steps are APPROVED

**Total changes:**
- 1 optional field (or can skip)
- Update perform_update() method
- Update list query filter

**No new tables, minimal changes!** 🎉
