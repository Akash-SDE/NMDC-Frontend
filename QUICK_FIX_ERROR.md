# Fix for: 'RailwayApprovalFilterApi' object has no attribute '_get_user_department'

## The Problem

You added the code that CALLS `_get_user_department()` but didn't add the METHOD itself.

## The Solution

Add this method to your `RailwayApprovalFilterApi` class BEFORE the `post()` method:

```python
class RailwayApprovalFilterApi(GenericAPIView):
    """This view class is used to return railway approval records with filter and pagination"""
    iron_ore_object_permissions = {'POST': (permission_railway_approval_list_view,)}
    permission_classes = (IRONOREPermission,)
    serializer_class = RailwayApprovalReadSerializer
    
    # ADD THIS METHOD HERE ↓↓↓
    def _get_user_department(self, user):
        """Get user's department code based on their role"""
        if hasattr(user, 'role'):
            role_name = getattr(user.role, 'name', '').lower()
            if 'commercial' in role_name:
                return 10  # ApprovalDepartmentEnum.COMMERCIAL.CODE
            elif 'c&w' in role_name or 'cw' in role_name:
                return 15  # ApprovalDepartmentEnum.CW.CODE
            elif 'operation' in role_name:
                return 5   # ApprovalDepartmentEnum.OPERATIONS.CODE
        return None
    # ADD THIS METHOD HERE ↑↑↑
    
    @extend_schema(request=RailwayApprovalFilterSerializer)
    def post(self, request):
        # ... your existing post code ...
```

## Complete Class Structure

Your class should look like this:

```python
class RailwayApprovalFilterApi(GenericAPIView):
    """This view class is used to return railway approval records with filter and pagination"""
    iron_ore_object_permissions = {'POST': (permission_railway_approval_list_view,)}
    permission_classes = (IRONOREPermission,)
    serializer_class = RailwayApprovalReadSerializer
    
    def _get_user_department(self, user):
        """Get user's department code based on their role"""
        if hasattr(user, 'role'):
            role_name = getattr(user.role, 'name', '').lower()
            if 'commercial' in role_name:
                return 10
            elif 'c&w' in role_name or 'cw' in role_name:
                return 15
            elif 'operation' in role_name:
                return 5
        return None
    
    @extend_schema(request=RailwayApprovalFilterSerializer)
    def post(self, request):
        """This method is used to make post request for pagination and filter and return the railway approval data."""
        serializer = RailwayApprovalFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.data
        
        try:
            # ... all your existing code ...
            
            approvals = RailwayApproval.objects.filter(**dict_).select_related(
                'rake', 'loading'
            ).prefetch_related(
                'steps__wagons', 'wagons__flags', 'history'
            )
            
            # NEW: Multi-department filter
            from django.db.models import Q
            user_department = self._get_user_department(request.user)  # ← Now this will work!
            
            if user_department and 'status' not in data:
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
            
            # ... rest of your code continues ...
```

## Alternative: If Your User Model is Different

If your users don't have a `role` attribute, or it's structured differently, modify the `_get_user_department()` method to match your setup:

### Option 1: If role is a string field on User

```python
def _get_user_department(self, user):
    """Get user's department code"""
    role = getattr(user, 'role', '').lower()
    if 'commercial' in role:
        return 10
    elif 'c&w' in role or 'cw' in role:
        return 15
    elif 'operation' in role:
        return 5
    return None
```

### Option 2: If you have a user_type or department field

```python
def _get_user_department(self, user):
    """Get user's department code"""
    dept = getattr(user, 'department', None)
    if dept:
        return dept  # Assuming department field already contains the code
    return None
```

### Option 3: If you have a groups-based system

```python
def _get_user_department(self, user):
    """Get user's department code"""
    groups = user.groups.values_list('name', flat=True)
    if 'Commercial' in groups:
        return 10
    elif 'C&W' in groups or 'CW' in groups:
        return 15
    elif 'Operations' in groups:
        return 5
    return None
```

### Option 4: If you have a custom permission or role model

```python
def _get_user_department(self, user):
    """Get user's department code"""
    if hasattr(user, 'user_role'):  # Adjust based on your model
        role_code = user.user_role.department_code
        return role_code
    return None
```

## Quick Debug

To check what your user object has, add this temporarily:

```python
def _get_user_department(self, user):
    """Get user's department code"""
    print(f"User: {user}")
    print(f"User attributes: {dir(user)}")
    print(f"User __dict__: {user.__dict__}")
    
    # Add your logic here based on what you see
    return None  # Change this after you see the output
```

Then check your Django logs to see what prints out.

## Checklist

✅ Step 1: Add `_get_user_department()` method to the class
✅ Step 2: Adjust the method to match your user model structure
✅ Step 3: Test again

That should fix the error! 🎉
