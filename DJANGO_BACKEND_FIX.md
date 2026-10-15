# Django Backend Fix - Multi-Department Railway Approvals

## Step 1: Create New Model for Pending Departments

Add this model to your `models.py`:

```python
class RailwayApprovalPendingDepartment(models.Model):
    """
    Tracks which departments need to approve when multiple departments
    are selected for parallel approval.
    """
    approval = models.ForeignKey(
        RailwayApproval,
        on_delete=models.CASCADE,
        related_name="pending_departments",
    )
    department = models.PositiveSmallIntegerField(
        choices=ApprovalDepartmentEnum.choices
    )
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "railway_approval_pending_departments"
        constraints = [
            models.UniqueConstraint(
                fields=["approval", "department"],
                name="uniq_pending_approval_department",
            )
        ]
        indexes = [
            models.Index(fields=["approval", "is_completed"]),
            models.Index(fields=["department", "is_completed"]),
        ]
    
    def __str__(self):
        return f"{self.get_department_display()} / approval {self.approval_id} / completed: {self.is_completed}"
```

## Step 2: Update RailwayApproval Model

Add a field to store approval_targets:

```python
class RailwayApproval(BaseUserModel):
    """Approval request created when a loading record is submitted."""
    loading = models.OneToOneField(
        LoadingManagement,
        on_delete=models.PROTECT,
        related_name="railway_approval",
    )
    rake = models.ForeignKey(
        "rake_management.RakeManagement",
        on_delete=models.PROTECT,
        related_name="railway_approvals",
    )
    status = models.PositiveSmallIntegerField(
        choices=RailwayStatusEnum.choices,
        default=RailwayStatusEnum.AWAITINGOPERATIONS.CODE,
    )
    
    # NEW: Store which departments were selected for parallel approval
    approval_targets = models.JSONField(
        null=True,
        blank=True,
        help_text="List of department codes for parallel approval"
    )
    
    class Meta:
        db_table = "railway_approval"
        ordering = ["-created_on"]
    
    def __str__(self):
        return f"Approval {self.pk} / loading {self.loading_id}"
```

## Step 3: Update Serializer to Accept approval_targets

```python
class RailwayApprovalUpdateSerializer(serializers.ModelSerializer):
    approval_targets = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_null=True,
        help_text="List of department codes for parallel approval [10, 15]"
    )
    
    class Meta:
        model = RailwayApproval
        fields = [
            'status',
            'approval_targets',  # NEW FIELD
            # ... other fields
        ]
```

## Step 4: Fix RailwayApprovalUpdateApi - Handle approval_targets

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
            'pending_departments',  # NEW: Prefetch pending departments
        )

    def perform_update(self, serializer):
        approval = serializer.save(
            modified_by=self.request.user.id,
            modified_on=timezone.now().astimezone(timezone.timezone.utc)
        )
        
        # NEW: Handle approval_targets for parallel approval
        approval_targets = serializer.validated_data.get('approval_targets')
        
        if approval_targets:
            # Clear existing pending departments for this approval
            RailwayApprovalPendingDepartment.objects.filter(
                approval=approval
            ).delete()
            
            # Create pending records for each target department
            pending_records = [
                RailwayApprovalPendingDepartment(
                    approval=approval,
                    department=dept_code,
                    is_completed=False
                )
                for dept_code in approval_targets
            ]
            RailwayApprovalPendingDepartment.objects.bulk_create(pending_records)
        
        # Handle step updates (existing logic)
        steps_data = serializer.validated_data.get('steps', [])
        for step_data in steps_data:
            department = step_data.get('department')
            if department:
                self._update_step(approval, department, step_data)

    def _update_step(self, approval, department, step_data):
        """Update or create a step for the given department"""
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
        
        # NEW: Mark pending department as completed if this is an approval
        if step_data.get('step_status') == ApprovalStepStatusEnum.APPROVED.CODE:
            pending = RailwayApprovalPendingDepartment.objects.filter(
                approval=approval,
                department=department
            ).first()
            
            if pending:
                pending.is_completed = True
                pending.completed_at = timezone.now()
                pending.completed_by = step_data.get('actor_name', '')
                pending.save()
                
                # Check if all pending departments are completed
                remaining_pending = RailwayApprovalPendingDepartment.objects.filter(
                    approval=approval,
                    is_completed=False
                ).count()
                
                if remaining_pending == 0:
                    # All pending departments completed, advance status
                    self._advance_approval_status(approval, department)

    def _advance_approval_status(self, approval, last_department):
        """Advance approval status after all pending departments complete"""
        if last_department == ApprovalDepartmentEnum.OPERATIONS.CODE:
            approval.status = RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE
        elif last_department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
            approval.status = RailwayStatusEnum.AWAITINGCW.CODE
        elif last_department == ApprovalDepartmentEnum.CW.CODE:
            approval.status = RailwayStatusEnum.APPROVED.CODE
        
        approval.save()

    def perform_destroy(self, instance):
        """Soft delete by marking the approval rejected."""
        instance.status = RailwayStatusEnum.REJECTED.CODE
        instance.modified_by = self.request.user.id
        instance.modified_on = timezone.now().astimezone(timezone.timezone.utc)
        instance.save()
```

## Step 5: Update List API to Show to Multiple Departments

Create or update your list view:

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
        
        # Build query for approvals visible to this department
        queryset = RailwayApproval.objects.select_related(
            'rake', 'loading'
        ).prefetch_related(
            'steps',
            'pending_departments',
            'wagons__flags',
            'history',
        )
        
        # OLD: Status-based filter (sequential approvals)
        status_filter = self._get_status_filter(user_department)
        
        # NEW: Pending departments filter (parallel approvals)
        pending_filter = Q(
            pending_departments__department=user_department,
            pending_departments__is_completed=False
        )
        
        # Combine both filters
        return queryset.filter(status_filter | pending_filter).distinct()
    
    def _get_user_department(self, user):
        """Get user's department code"""
        # Implement based on your user-department relationship
        # Example:
        if hasattr(user, 'role'):
            role = user.role
            if 'commercial' in role.lower():
                return ApprovalDepartmentEnum.COMMERCIAL.CODE
            elif 'c&w' in role.lower() or 'cw' in role.lower():
                return ApprovalDepartmentEnum.CW.CODE
            elif 'operation' in role.lower():
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

## Step 6: Update Read Serializer to Include pending_departments

```python
class RailwayApprovalPendingDepartmentSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='get_department_display', read_only=True)
    
    class Meta:
        model = RailwayApprovalPendingDepartment
        fields = [
            'id',
            'department',
            'department_name',
            'is_completed',
            'completed_at',
            'completed_by',
            'created_at',
        ]


class RailwayApprovalReadSerializer(serializers.ModelSerializer):
    pending_departments = RailwayApprovalPendingDepartmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = RailwayApproval
        fields = [
            'id',
            'loading',
            'rake',
            'status',
            'approval_targets',
            'pending_departments',  # NEW
            # ... other fields
        ]
```

## Step 7: Create Migration

```bash
python manage.py makemigrations
python manage.py migrate
```

Or create manual migration:

```python
# Generated migration file
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('your_app', 'previous_migration'),
    ]

    operations = [
        # Add approval_targets field
        migrations.AddField(
            model_name='railwayapproval',
            name='approval_targets',
            field=models.JSONField(
                blank=True,
                help_text='List of department codes for parallel approval',
                null=True
            ),
        ),
        
        # Create pending_departments table
        migrations.CreateModel(
            name='RailwayApprovalPendingDepartment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('department', models.PositiveSmallIntegerField(choices=[...])),
                ('is_completed', models.BooleanField(default=False)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('completed_by', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('approval', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pending_departments', to='your_app.railwayapproval')),
            ],
            options={
                'db_table': 'railway_approval_pending_departments',
            },
        ),
        
        # Add constraints and indexes
        migrations.AddConstraint(
            model_name='railwayapprovalpendingdepartment',
            constraint=models.UniqueConstraint(fields=('approval', 'department'), name='uniq_pending_approval_department'),
        ),
        migrations.AddIndex(
            model_name='railwayapprovalpendingdepartment',
            index=models.Index(fields=['approval', 'is_completed'], name='idx_approval_pending'),
        ),
        migrations.AddIndex(
            model_name='railwayapprovalpendingdepartment',
            index=models.Index(fields=['department', 'is_completed'], name='idx_dept_pending'),
        ),
    ]
```

## Step 8: Testing

### Test 1: Operations approves with both departments

```python
# Request payload from frontend
{
    "status": 15,  # AWAITINGCOMMERCIAL
    "approval_targets": [10, 15],  # Both Commercial and C&W
    "steps": [{...}],
    "history_entry": {...}
}

# Check database
>>> approval = RailwayApproval.objects.get(id=123)
>>> approval.approval_targets
[10, 15]
>>> approval.pending_departments.all()
<QuerySet [
    <PendingDepartment: Commercial / approval 123 / completed: False>,
    <PendingDepartment: C&W / approval 123 / completed: False>
]>
```

### Test 2: Check both queues

```python
# Commercial user queries
>>> commercial_approvals = RailwayApproval.objects.filter(
...     Q(status=15) | 
...     Q(pending_departments__department=10, pending_departments__is_completed=False)
... ).distinct()
>>> 123 in [a.id for a in commercial_approvals]
True

# C&W user queries
>>> cw_approvals = RailwayApproval.objects.filter(
...     Q(status=20) |
...     Q(pending_departments__department=15, pending_departments__is_completed=False)
... ).distinct()
>>> 123 in [a.id for a in cw_approvals]
True  # Both see it!
```

### Test 3: Commercial approves first

```python
>>> pending = RailwayApprovalPendingDepartment.objects.get(approval_id=123, department=10)
>>> pending.is_completed = True
>>> pending.save()

>>> # C&W should still see it
>>> RailwayApprovalPendingDepartment.objects.filter(
...     approval_id=123,
...     is_completed=False
... ).count()
1  # C&W still pending
```

## Summary of Changes

1. ✅ Created `RailwayApprovalPendingDepartment` model
2. ✅ Added `approval_targets` field to `RailwayApproval`
3. ✅ Updated `RailwayApprovalUpdateApi.perform_update()` to create pending records
4. ✅ Updated `_update_step()` to mark departments complete and check if all done
5. ✅ Updated list API to show approvals to multiple departments
6. ✅ Updated serializers to include pending_departments in response

## URLs Configuration

Make sure your URLs are configured:

```python
# urls.py
urlpatterns = [
    path('railway_approval/list', RailwayApprovalListApi.as_view()),
    path('railway_approval/<int:pk>', RailwayApprovalUpdateApi.as_view()),
    # ... other patterns
]
```

Now the backend will support parallel approvals! 🎉
