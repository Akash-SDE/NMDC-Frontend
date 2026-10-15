# Copy-Paste Ready Fix for Your Code

## Change 1: Add This Helper Method to Your Class

Add this at the beginning of your `RailwayApprovalFilterApi` class:

```python
def _get_user_department(self, user):
    """Get user's department code"""
    if hasattr(user, 'role'):
        role_name = getattr(user.role, 'name', '').lower()
        if 'commercial' in role_name:
            return 10  # ApprovalDepartmentEnum.COMMERCIAL.CODE
        elif 'c&w' in role_name or 'cw' in role_name:
            return 15  # ApprovalDepartmentEnum.CW.CODE
        elif 'operation' in role_name:
            return 5   # ApprovalDepartmentEnum.OPERATIONS.CODE
    return None
```

## Change 2: Add This Code After Your Prefetch Line

Find this line in your `post()` method:

```python
approvals = RailwayApproval.objects.filter(**dict_).select_related('rake', 'loading').prefetch_related('steps__wagons', 'wagons__flags', 'history')
```

**Add this code RIGHT AFTER it:**

```python
# NEW: Multi-department filter support
from django.db.models import Q

user_department = self._get_user_department(request.user)

if user_department and 'status' not in data:
    # Filter 1: Status matches (sequential approvals)
    if user_department == 10:  # Commercial
        status_filter = Q(status=15)  # AWAITING_COMMERCIAL
    elif user_department == 15:  # C&W
        status_filter = Q(status=20)  # AWAITING_CW
    elif user_department == 5:  # Operations
        status_filter = Q(status=10)  # AWAITING_OPERATIONS
    else:
        status_filter = Q()
    
    # Filter 2: Has PENDING step for this department (parallel approvals)
    step_filter = Q(
        steps__department=user_department,
        steps__step_status=5  # PENDING
    )
    
    # Apply combined filter
    approvals = approvals.filter(status_filter | step_filter).distinct()
```

## That's All!

Your complete code section should look like this:

```python
approvals = RailwayApproval.objects.filter(**dict_).select_related(
    'rake', 'loading'
).prefetch_related(
    'steps__wagons', 'wagons__flags', 'history'
)

# NEW: Multi-department filter support
from django.db.models import Q

user_department = self._get_user_department(request.user)

if user_department and 'status' not in data:
    # Filter 1: Status matches (sequential approvals)
    if user_department == 10:  # Commercial
        status_filter = Q(status=15)  # AWAITING_COMMERCIAL
    elif user_department == 15:  # C&W
        status_filter = Q(status=20)  # AWAITING_CW
    elif user_department == 5:  # Operations
        status_filter = Q(status=10)  # AWAITING_OPERATIONS
    else:
        status_filter = Q()
    
    # Filter 2: Has PENDING step for this department (parallel approvals)
    step_filter = Q(
        steps__department=user_department,
        steps__step_status=5  # PENDING
    )
    
    # Apply combined filter
    approvals = approvals.filter(status_filter | step_filter).distinct()

approvals = apply_date_time_range_filters(approvals, data)
# ... rest of your code continues
```

## Status Code Reference

Update these numbers based on your actual enum values:

```python
# Department codes
OPERATIONS = 5
COMMERCIAL = 10
CW = 15

# Status codes
AWAITING_OPERATIONS = 10
AWAITING_COMMERCIAL = 15
AWAITING_CW = 20
APPROVED = 5

# Step status codes
PENDING = 5
APPROVED = 10
REJECTED = 15
```

## Visual Before/After

### Before
```python
approvals = RailwayApproval.objects.filter(**dict_).select_related(
    'rake', 'loading'
).prefetch_related('steps__wagons', 'wagons__flags', 'history')

approvals = apply_date_time_range_filters(approvals, data)
```

### After
```python
approvals = RailwayApproval.objects.filter(**dict_).select_related(
    'rake', 'loading'
).prefetch_related('steps__wagons', 'wagons__flags', 'history')

# NEW CODE STARTS HERE
from django.db.models import Q
user_department = self._get_user_department(request.user)
if user_department and 'status' not in data:
    if user_department == 10:
        status_filter = Q(status=15)
    elif user_department == 15:
        status_filter = Q(status=20)
    elif user_department == 5:
        status_filter = Q(status=10)
    else:
        status_filter = Q()
    
    step_filter = Q(steps__department=user_department, steps__step_status=5)
    approvals = approvals.filter(status_filter | step_filter).distinct()
# NEW CODE ENDS HERE

approvals = apply_date_time_range_filters(approvals, data)
```

Done! 🎉
