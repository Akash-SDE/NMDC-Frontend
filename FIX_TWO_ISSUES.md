# Fix Two Issues

## Issue 1: User Department Returns None

Your `_get_user_department()` method isn't finding the user's department. Let's fix it:

### Step 1: Find Out Your User Model Structure

Add this debug code temporarily:

```python
def _get_user_department(self, user):
    """Get user's department code"""
    print(f"🔍 DEBUG User: {user}")
    print(f"🔍 DEBUG User type: {type(user)}")
    print(f"🔍 DEBUG User __dict__: {user.__dict__}")
    print(f"🔍 DEBUG Has role: {hasattr(user, 'role')}")
    print(f"🔍 DEBUG Has groups: {hasattr(user, 'groups')}")
    print(f"🔍 DEBUG Has department: {hasattr(user, 'department')}")
    
    # Try to access role
    if hasattr(user, 'role'):
        print(f"🔍 DEBUG User.role: {user.role}")
        print(f"🔍 DEBUG User.role type: {type(user.role)}")
        if hasattr(user.role, 'name'):
            print(f"🔍 DEBUG User.role.name: {user.role.name}")
    
    # Try to access groups
    if hasattr(user, 'groups'):
        groups = list(user.groups.values_list('name', flat=True))
        print(f"🔍 DEBUG User.groups: {groups}")
    
    return None  # Will fix after seeing debug output
```

Make a request and check what prints in your Django logs. Then share that output with me.

### Common User Model Patterns

Based on what you see, use one of these:

#### Pattern 1: User has `role` as a string field
```python
def _get_user_department(self, user):
    role = getattr(user, 'role', '').lower()
    if 'commercial' in role:
        return 10
    elif 'c&w' in role or 'cw' in role:
        return 15
    elif 'operation' in role:
        return 5
    return None
```

#### Pattern 2: User has `role` as ForeignKey to Role model
```python
def _get_user_department(self, user):
    if hasattr(user, 'role') and user.role:
        role_name = getattr(user.role, 'name', '').lower()
        if 'commercial' in role_name:
            return 10
        elif 'c&w' in role_name or 'cw' in role_name:
            return 15
        elif 'operation' in role_name:
            return 5
    return None
```

#### Pattern 3: User has Django groups
```python
def _get_user_department(self, user):
    groups = user.groups.values_list('name', flat=True)
    if 'Commercial' in groups or 'COMMERCIAL' in groups:
        return 10
    elif 'C&W' in groups or 'CW' in groups:
        return 15
    elif 'Operations' in groups or 'OPERATIONS' in groups:
        return 5
    return None
```

#### Pattern 4: User has `department` field directly
```python
def _get_user_department(self, user):
    return getattr(user, 'department', None)
```

## Issue 2: Status is Always in Data

The frontend is sending `status` in every request, so the filter never applies.

### Quick Fix: Remove the Status Check

Change this:
```python
if user_department and 'status' not in data:
```

To this:
```python
if user_department:
```

### Better Fix: Apply Filter Unless User Explicitly Filtered by Status

```python
# Check if user explicitly requested a specific status
explicit_status_filter = data.get('status')

if user_department and not explicit_status_filter:
    # User didn't filter by status, apply our multi-department filter
    if user_department == 10:
        status_filter = Q(status=15)
    elif user_department == 15:
        status_filter = Q(status=20)
    elif user_department == 5:
        status_filter = Q(status=10)
    else:
        status_filter = Q()
    
    step_filter = Q(
        steps__department=user_department,
        steps__step_status=5
    )
    
    approvals = approvals.filter(status_filter | step_filter).distinct()
```

### Or: Always Apply Step Filter

If you want the filter to work even when status is specified:

```python
if user_department:
    # Always add step filter for parallel approvals
    step_filter = Q(
        steps__department=user_department,
        steps__step_status=5
    )
    
    # If no explicit status filter, add status filter too
    if 'status' not in data:
        if user_department == 10:
            status_filter = Q(status=15)
        elif user_department == 15:
            status_filter = Q(status=20)
        elif user_department == 5:
            status_filter = Q(status=10)
        else:
            status_filter = Q()
        
        approvals = approvals.filter(status_filter | step_filter).distinct()
    else:
        # User filtered by status, but still add step filter
        approvals = approvals.filter(step_filter).distinct()
```

## Complete Fixed Code

Here's the complete section with both fixes:

```python
@extend_schema(request=RailwayApprovalFilterSerializer)
def post(self, request):
    """This method is used to make post request for pagination and filter and return the railway approval data."""
    serializer = RailwayApprovalFilterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.data
    
    try:
        # ... your existing code for page_size, page, etc ...
        
        approvals = RailwayApproval.objects.filter(**dict_).select_related(
            'rake', 'loading'
        ).prefetch_related(
            'steps__wagons', 'wagons__flags', 'history'
        )
        
        # NEW: Multi-department filter (FIXED)
        from django.db.models import Q
        
        user_department = self._get_user_department(request.user)
        print(f"🔍 User department: {user_department}")
        
        # FIX: Apply filter regardless of status in data
        if user_department:
            # Status filter for sequential approvals
            if user_department == 10:  # Commercial
                status_filter = Q(status=15)
            elif user_department == 15:  # C&W
                status_filter = Q(status=20)
            elif user_department == 5:  # Operations
                status_filter = Q(status=10)
            else:
                status_filter = Q()
            
            # Step filter for parallel approvals
            step_filter = Q(
                steps__department=user_department,
                steps__step_status=5  # PENDING
            )
            
            print(f"🔍 Applying combined filter")
            approvals = approvals.filter(status_filter | step_filter).distinct()
            print(f"🔍 Approvals after filter: {approvals.count()}")
        
        # Continue with your existing code
        approvals = apply_date_time_range_filters(approvals, data)
        # ... rest of your code ...
```

## Testing Steps

### Step 1: Fix User Department Detection

Add the debug code above, make a request, and share the output. Then I'll tell you exactly which pattern to use.

### Step 2: Fix Status Check

Remove the `'status' not in data` condition or use one of the alternatives above.

### Step 3: Test

After both fixes, you should see:
```
🔍 User department: 10
🔍 Applying combined filter
🔍 Approvals after filter: 1
```

And both Commercial and C&W users should see the same approval simultaneously!
