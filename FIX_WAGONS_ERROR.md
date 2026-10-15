# Fix for: Direct assignment to the reverse side of a related set is prohibited

## The Problem

When you update the approval, the serializer is trying to directly assign to the `wagons` field, which is a reverse ForeignKey relationship. Django doesn't allow direct assignment to these.

## The Solution

Update your `RailwayApprovalUpdateApi.perform_update()` method to handle related fields properly:

```python
def perform_update(self, serializer):
    """Handle approval updates with multi-department support"""
    
    # Extract approval_targets before saving
    approval_targets = serializer.validated_data.pop('approval_targets', None)
    
    # Extract nested related fields that can't be directly assigned
    steps_data = serializer.validated_data.pop('steps', None)
    wagons_data = serializer.validated_data.pop('wagons', None)
    history_data = serializer.validated_data.pop('history_entry', None)
    
    # Save the approval with remaining fields
    approval = serializer.save(
        modified_by=self.request.user.id,
        modified_on=timezone.now().astimezone(timezone.timezone.utc)
    )
    
    # Handle multi-department approval routing
    if approval_targets:
        self._handle_multi_department_approval(approval, approval_targets)
    
    # Handle steps updates
    if steps_data:
        for step_data in steps_data:
            department = step_data.get('department')
            if department:
                self._process_step(approval, department, step_data, approval_targets)
    
    # Handle wagons if provided
    if wagons_data:
        self._update_wagons(approval, wagons_data)
    
    # Handle history if provided
    if history_data:
        self._create_history_entry(approval, history_data)
    
    return approval

def _handle_multi_department_approval(self, approval, approval_targets):
    """
    When Operations sends approval_targets, mark those department steps as PENDING
    """
    for dept_code in approval_targets:
        RailwayApprovalStep.objects.get_or_create(
            approval=approval,
            department=dept_code,
            defaults={'step_status': ApprovalStepStatusEnum.PENDING.CODE}
        )

def _process_step(self, approval, department, step_data, approval_targets=None):
    """Process a single department's approval step"""
    step, created = RailwayApprovalStep.objects.get_or_create(
        approval=approval,
        department=department,
        defaults=step_data
    )
    
    if not created:
        # Update existing step
        for key, value in step_data.items():
            if key != 'wagons':  # Skip nested relations
                setattr(step, key, value)
        step.save()
    
    # If this is an approval, check if we should advance status
    if step_data.get('step_status') == ApprovalStepStatusEnum.APPROVED.CODE:
        self._check_and_advance_status(approval, department, approval_targets)

def _check_and_advance_status(self, approval, department, approval_targets):
    """Check if all required departments have approved, then advance status"""
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

def _advance_status(self, approval, last_department):
    """Advance approval status based on last department"""
    if last_department == ApprovalDepartmentEnum.OPERATIONS.CODE:
        approval.status = RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE
    elif last_department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
        approval.status = RailwayStatusEnum.AWAITINGCW.CODE
    elif last_department == ApprovalDepartmentEnum.CW.CODE:
        approval.status = RailwayStatusEnum.APPROVED.CODE
    
    approval.save(update_fields=['status'])

def _update_wagons(self, approval, wagons_data):
    """Update wagon information"""
    # Clear existing wagons
    approval.wagons.all().delete()
    
    # Create new wagons
    for wagon_data in wagons_data:
        wagon_flags = wagon_data.pop('flags', [])
        wagon = RailwayApprovalWagon.objects.create(
            approval=approval,
            **wagon_data
        )
        if wagon_flags:
            wagon.flags.set(wagon_flags)

def _create_history_entry(self, approval, history_data):
    """Create a history entry"""
    RailwayApprovalHistory.objects.create(
        approval=approval,
        **history_data
    )
```

## Simpler Version (If you're not handling wagons/history in update)

If your update doesn't need to handle wagons or history, use this simpler version:

```python
def perform_update(self, serializer):
    """Handle approval updates with multi-department support"""
    
    # Extract approval_targets and steps before saving
    approval_targets = serializer.validated_data.pop('approval_targets', None)
    steps_data = serializer.validated_data.pop('steps', None)
    
    # Save the approval (this will handle all scalar fields)
    approval = serializer.save(
        modified_by=self.request.user.id,
        modified_on=timezone.now().astimezone(timezone.timezone.utc)
    )
    
    # Handle multi-department approval routing
    if approval_targets:
        for dept_code in approval_targets:
            RailwayApprovalStep.objects.get_or_create(
                approval=approval,
                department=dept_code,
                defaults={'step_status': ApprovalStepStatusEnum.PENDING.CODE}
            )
    
    # Handle steps updates
    if steps_data:
        for step_data in steps_data:
            department = step_data.get('department')
            if department:
                self._update_step(approval, department, step_data, approval_targets)
    
    return approval

def _update_step(self, approval, department, step_data, approval_targets):
    """Update a department step"""
    # Remove nested relations before saving
    wagons_data = step_data.pop('wagons', None)
    
    step, created = RailwayApprovalStep.objects.get_or_create(
        approval=approval,
        department=department,
        defaults=step_data
    )
    
    if not created:
        for key, value in step_data.items():
            setattr(step, key, value)
        step.save()
    
    # Handle wagons for this step if needed
    if wagons_data:
        # Handle wagon updates here if needed
        pass
    
    # Check if should advance status
    if step_data.get('step_status') == ApprovalStepStatusEnum.APPROVED.CODE:
        if approval_targets:
            all_approved = all(
                RailwayApprovalStep.objects.filter(
                    approval=approval,
                    department=d,
                    step_status=ApprovalStepStatusEnum.APPROVED.CODE
                ).exists()
                for d in approval_targets
            )
            if all_approved:
                self._advance_status(approval, department)
        else:
            self._advance_status(approval, department)

def _advance_status(self, approval, department):
    """Advance status"""
    if department == ApprovalDepartmentEnum.OPERATIONS.CODE:
        approval.status = RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE
    elif department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
        approval.status = RailwayStatusEnum.AWAITINGCW.CODE
    elif department == ApprovalDepartmentEnum.CW.CODE:
        approval.status = RailwayStatusEnum.APPROVED.CODE
    approval.save(update_fields=['status'])
```

## Alternative: Use Serializer Fields Properly

Update your serializer to make nested fields read-only or handle them differently:

```python
class RailwayApprovalUpdateSerializer(serializers.ModelSerializer):
    approval_targets = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )
    
    # Make these read_only if you don't update them via API
    wagons = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    history = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        model = RailwayApproval
        fields = [
            'status',
            'approval_targets',
            'steps',
            'wagons',  # read_only
            'history',  # read_only
        ]
```

## Quick Debug

To see exactly what's in `validated_data`, add this at the start of `perform_update`:

```python
def perform_update(self, serializer):
    print(f"Validated data keys: {serializer.validated_data.keys()}")
    print(f"Full validated data: {serializer.validated_data}")
    
    # Then continue with the fix above
```

## The Root Cause

Django is complaining because your serializer is trying to do something like:

```python
approval.wagons = [wagon1, wagon2, wagon3]  # ❌ This doesn't work
```

Instead, you need to do:

```python
approval.wagons.set([wagon1, wagon2, wagon3])  # ✅ This works
# OR
approval.wagons.all().delete()  # Clear first
# Then create new ones
```

## Summary

1. **Pop nested relations** from `validated_data` before saving
2. **Save the approval** with scalar fields only
3. **Handle nested relations** separately with proper methods
4. **Use `.set()`, `.add()`, `.create()`** for related objects, not direct assignment

Try the simpler version first - it should fix your immediate error! 🎉
