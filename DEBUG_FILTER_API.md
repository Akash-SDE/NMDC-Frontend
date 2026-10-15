# Debug: Why Filter API Isn't Showing to Both Departments

## The Problem

The update API is creating PENDING steps correctly, but the filter API isn't showing the approval to both Commercial and C&W simultaneously.

## Step 1: Verify Steps Are Created

First, check if PENDING steps are actually being created:

```python
# After Operations approves, check database:
>>> from rake_management.models import RailwayApprovalStep, RailwayApproval
>>> approval = RailwayApproval.objects.get(id=17)  # Your approval ID
>>> approval.steps.all().values('department', 'step_status')

# Should see:
# [
#   {'department': 5, 'step_status': 10},   # Operations - APPROVED
#   {'department': 10, 'step_status': 5},   # Commercial - PENDING
#   {'department': 15, 'step_status': 5},   # C&W - PENDING
# ]
```

If you DON'T see both departments with PENDING steps, the update API isn't working correctly.

If you DO see them, then the filter API logic is wrong.

## Step 2: Check Your Filter API Logic

Your `RailwayApprovalFilterApi` should have this code. **Verify it's exactly like this:**

```python
# In your post() method, after the prefetch line:
approvals = RailwayApproval.objects.filter(**dict_).select_related(
    'rake', 'loading'
).prefetch_related(
    'steps__wagons', 'wagons__flags', 'history'
)

# ADD THIS:
from django.db.models import Q

user_department = self._get_user_department(request.user)
print(f"🔍 DEBUG: User department = {user_department}")  # Add this debug line

if user_department and 'status' not in data:
    print(f"🔍 DEBUG: Applying multi-department filter")  # Add this
    
    # Status filter (sequential)
    if user_department == 10:  # Commercial
        status_filter = Q(status=15)
    elif user_department == 15:  # C&W
        status_filter = Q(status=20)
    elif user_department == 5:  # Operations
        status_filter = Q(status=10)
    else:
        status_filter = Q()
    
    # Step filter (parallel)
    step_filter = Q(
        steps__department=user_department,
        steps__step_status=5  # PENDING
    )
    
    print(f"🔍 DEBUG: Status filter = {status_filter}")
    print(f"🔍 DEBUG: Step filter = {step_filter}")
    
    # Apply combined filter
    approvals = approvals.filter(status_filter | step_filter).distinct()
    
    print(f"🔍 DEBUG: Approvals count = {approvals.count()}")

approvals = apply_date_time_range_filters(approvals, data)
```

## Step 3: Test with Debug Logs

### As Commercial User:

Make a request and check Django logs. You should see:

```
🔍 DEBUG: User department = 10
🔍 DEBUG: Applying multi-department filter
🔍 DEBUG: Status filter = Q(status=15)
🔍 DEBUG: Step filter = Q(steps__department=10, steps__step_status=5)
🔍 DEBUG: Approvals count = 1
```

### As C&W User:

Make a request and check Django logs. You should see:

```
🔍 DEBUG: User department = 15
🔍 DEBUG: Applying multi-department filter
🔍 DEBUG: Status filter = Q(status=20)
🔍 DEBUG: Step filter = Q(steps__department=15, steps__step_status=5)
🔍 DEBUG: Approvals count = 1
```

## Common Issues

### Issue 1: User Department Not Detected

**Symptom:** `User department = None`

**Fix:** Update `_get_user_department()` to match your user model:

```python
def _get_user_department(self, user):
    """Get user's department code"""
    print(f"🔍 DEBUG: User = {user}")
    print(f"🔍 DEBUG: User attributes = {dir(user)}")
    
    # Try different ways based on your model
    
    # Option 1: User has a role field
    if hasattr(user, 'role'):
        role = user.role
        print(f"🔍 DEBUG: User role = {role}")
        role_name = getattr(role, 'name', '').lower()
        if 'commercial' in role_name:
            return 10
        elif 'c&w' in role_name or 'cw' in role_name:
            return 15
        elif 'operation' in role_name:
            return 5
    
    # Option 2: User has groups
    if hasattr(user, 'groups'):
        groups = user.groups.values_list('name', flat=True)
        print(f"🔍 DEBUG: User groups = {list(groups)}")
        if 'Commercial' in groups:
            return 10
        elif 'C&W' in groups or 'CW' in groups:
            return 15
        elif 'Operations' in groups:
            return 5
    
    # Option 3: User has direct department field
    if hasattr(user, 'department'):
        dept = user.department
        print(f"🔍 DEBUG: User department field = {dept}")
        return dept
    
    return None
```

### Issue 2: Filter Not Being Applied

**Symptom:** Debug logs don't show "Applying multi-department filter"

**Reason:** `'status' in data` is True, so filter is skipped

**Fix:** Check if your frontend is sending `status` in the filter request. If yes, remove it or modify the condition:

```python
# Change this:
if user_department and 'status' not in data:

# To this (apply unless explicitly filtered):
if user_department:
    # Only skip our filter if user explicitly requested a specific status
    explicit_status = data.get('status')
    if explicit_status is None:
        # Apply our multi-department filter
        # ... filter logic
```

### Issue 3: Wrong Enum Values

**Symptom:** Filter matches nothing

**Fix:** Verify your enum codes:

```python
# Check your actual enum values
>>> from rake_management.models import ApprovalStepStatusEnum
>>> ApprovalStepStatusEnum.PENDING.CODE
5  # Make sure this matches what you use in the filter

>>> from rake_management.models import RailwayStatusEnum
>>> RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE
15  # Make sure this matches

>>> RailwayStatusEnum.AWAITINGCW.CODE
20  # Make sure this matches
```

### Issue 4: Steps Not Prefetched

**Symptom:** Query works but is slow, or returns wrong results

**Fix:** Make sure `steps` is prefetched:

```python
approvals = RailwayApproval.objects.filter(**dict_).select_related(
    'rake', 'loading'
).prefetch_related(
    'steps__wagons',  # ← Make sure this is here
    'wagons__flags',
    'history'
)
```

## Step 4: Manual Query Test

Test the query directly in Django shell:

```python
from django.db.models import Q
from rake_management.models import RailwayApproval

# Test Commercial query
commercial_filter = Q(status=15) | Q(steps__department=10, steps__step_status=5)
commercial_approvals = RailwayApproval.objects.filter(commercial_filter).distinct()
print(f"Commercial sees: {commercial_approvals.count()} approvals")
print(f"IDs: {list(commercial_approvals.values_list('id', flat=True))}")

# Test C&W query
cw_filter = Q(status=20) | Q(steps__department=15, steps__step_status=5)
cw_approvals = RailwayApproval.objects.filter(cw_filter).distinct()
print(f"C&W sees: {cw_approvals.count()} approvals")
print(f"IDs: {list(cw_approvals.values_list('id', flat=True))}")

# Both should include approval ID 17 (or whatever your ID is)
```

## Step 5: Verify Complete Flow

```python
# 1. Check steps exist
>>> approval = RailwayApproval.objects.get(id=17)
>>> approval.steps.filter(step_status=5).values('department')
# Should show: [{'department': 10}, {'department': 15}]

# 2. Test queries
>>> # Commercial query
>>> RailwayApproval.objects.filter(
...     Q(status=15) | Q(steps__department=10, steps__step_status=5)
... ).distinct().filter(id=17).exists()
True  # ✓ Commercial should see it

>>> # C&W query
>>> RailwayApproval.objects.filter(
...     Q(status=20) | Q(steps__department=15, steps__step_status=5)
... ).distinct().filter(id=17).exists()
True  # ✓ C&W should see it
```

## Quick Fix Checklist

- [ ] PENDING steps are created (check database)
- [ ] `_get_user_department()` returns correct value (10, 15, or 5)
- [ ] Filter logic is in the right place (after prefetch, before date filters)
- [ ] `.distinct()` is called after filter
- [ ] Enum codes match (PENDING=5, COMMERCIAL=10, CW=15)
- [ ] `'status' not in data` condition is correct
- [ ] Debug logs show filter is being applied

## If It Still Doesn't Work

Add this comprehensive debug block:

```python
# Right before returning response in your post() method:
print("=" * 50)
print(f"User: {request.user}")
print(f"User Department: {user_department}")
print(f"Filter Data: {data}")
print(f"Approvals Query: {approvals.query}")
print(f"Approvals Count: {approvals.count()}")
print(f"Approval IDs: {list(approvals.values_list('id', flat=True))}")
for approval in approvals:
    print(f"  Approval {approval.id}:")
    print(f"    Status: {approval.status}")
    print(f"    Steps: {list(approval.steps.values('department', 'step_status'))}")
print("=" * 50)
```

This will show you exactly what's happening!
