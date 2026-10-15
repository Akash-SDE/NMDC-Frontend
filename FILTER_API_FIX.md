# Fix for RailwayApprovalFilterApi - Multi-Department Support

## Add These Changes to Your Existing RailwayApprovalFilterApi

### Step 1: Add Helper Method to Get User Department

Add this method at the top of your class:

```python
class RailwayApprovalFilterApi(GenericAPIView):
    """This view class is used to return railway approval records with filter and pagination"""
    iron_ore_object_permissions = {'POST': (permission_railway_approval_list_view,)}
    permission_classes = (IRONOREPermission,)
    serializer_class = RailwayApprovalReadSerializer
    
    def _get_user_department(self, user):
        """Get user's department code"""
        # Adjust this based on your user role model
        if hasattr(user, 'role'):
            role_name = getattr(user.role, 'name', '').lower()
            if 'commercial' in role_name:
                return ApprovalDepartmentEnum.COMMERCIAL.CODE
            elif 'c&w' in role_name or 'cw' in role_name:
                return ApprovalDepartmentEnum.CW.CODE
            elif 'operation' in role_name:
                return ApprovalDepartmentEnum.OPERATIONS.CODE
        return None
```

### Step 2: Modify the post() Method

Find this section in your `post()` method:

```python
approvals = RailwayApproval.objects.filter(**dict_).select_related(
    'rake', 'loading'
).prefetch_related(
    'steps__wagons', 'wagons__flags', 'history'
)
```

**Replace it with:**

```python
from django.db.models import Q

approvals = RailwayApproval.objects.filter(**dict_).select_related(
    'rake', 'loading'
).prefetch_related(
    'steps__wagons', 'wagons__flags', 'history'
)

# NEW: Apply multi-department filter based on user's department
user_department = self._get_user_department(request.user)

if user_department:
    # Filter 1: Status-based (existing sequential logic)
    if user_department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
        status_filter = Q(status=RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE)
    elif user_department == ApprovalDepartmentEnum.CW.CODE:
        status_filter = Q(status=RailwayStatusEnum.AWAITINGCW.CODE)
    elif user_department == ApprovalDepartmentEnum.OPERATIONS.CODE:
        status_filter = Q(status=RailwayStatusEnum.AWAITINGOPERATIONS.CODE)
    else:
        status_filter = Q()
    
    # Filter 2: Step-based (NEW - for parallel approvals)
    step_filter = Q(
        steps__department=user_department,
        steps__step_status=ApprovalStepStatusEnum.PENDING.CODE
    )
    
    # Apply combined filter only if no status filter was explicitly provided
    if 'status' not in data:
        approvals = approvals.filter(status_filter | step_filter).distinct()
```

### Step 3: Complete Modified post() Method

Here's the complete modified method:

```python
@extend_schema(request=RailwayApprovalFilterSerializer)
def post(self, request):
    """This method is used to make post request for pagination and filter and return the railway approval data."""
    serializer = RailwayApprovalFilterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.data
    
    try:
        page_size = data.get("page_size", 50) if data.get("page_size") is not None else 50
        page = data.get("page", 1) if data.get("page") is not None else 1
        
        if page < 1 or page_size < 1:
            return Response(
                {"message": "page and page size should be positive integer"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order_by = data.get('order_by')
        order_type = data.get('order_type')
        
        filter_dict = {
            "loading": "loading",
            "rake": "rake",
            "rake_number": "rake__rake_number__icontains",
            "customer": "rake__customer",
            "siding": "rake__siding",
            "status": "status",
        }
        
        dict_ = {
            filter_dict.get(key, None): value 
            for key, value in data.items() 
            if value or isinstance(value, int)
        }
        dict_ = {key: value for key, value in dict_.items() if key}
        
        approvals = RailwayApproval.objects.filter(**dict_).select_related(
            'rake', 'loading'
        ).prefetch_related(
            'steps__wagons', 'wagons__flags', 'history'
        )
        
        # NEW: Apply multi-department filter
        user_department = self._get_user_department(request.user)
        
        if user_department and 'status' not in data:
            # Only apply if user didn't explicitly filter by status
            from django.db.models import Q
            
            # Status-based filter (sequential approvals)
            if user_department == ApprovalDepartmentEnum.COMMERCIAL.CODE:
                status_filter = Q(status=RailwayStatusEnum.AWAITINGCOMMERCIAL.CODE)
            elif user_department == ApprovalDepartmentEnum.CW.CODE:
                status_filter = Q(status=RailwayStatusEnum.AWAITINGCW.CODE)
            elif user_department == ApprovalDepartmentEnum.OPERATIONS.CODE:
                status_filter = Q(status=RailwayStatusEnum.AWAITINGOPERATIONS.CODE)
            else:
                status_filter = Q()
            
            # Step-based filter (parallel approvals)
            step_filter = Q(
                steps__department=user_department,
                steps__step_status=ApprovalStepStatusEnum.PENDING.CODE
            )
            
            # Apply combined filter
            approvals = approvals.filter(status_filter | step_filter).distinct()
        
        # Continue with existing logic
        approvals = apply_date_time_range_filters(approvals, data)
        
        created_by_name = data.get("created_by_name")
        modified_by_name = data.get("modified_by_name")
        
        if created_by_name:
            user_ids = return_user_id_by_name(created_by_name)
            approvals = approvals.filter(created_by__in=user_ids)
        
        if modified_by_name:
            user_ids = return_user_id_by_name(modified_by_name)
            approvals = approvals.filter(modified_by__in=user_ids)
        
        if order_by == "created_by":
            approvals = approvals.annotate(
                created_by_name=User.objects.filter(
                    id=OuterRef('created_by')
                ).values('first_name')[:1]
            )
        elif order_by == "modified_by":
            approvals = approvals.annotate(
                modified_by_name=User.objects.filter(
                    id=OuterRef('modified_by')
                ).values('first_name')[:1]
            )
        
        order_by_dict = {
            "loading": "loading",
            "rake": "rake",
            "rake_number": "rake__rake_number",
            "customer": "rake__customer",
            "siding": "rake__siding",
            "status": "status",
            "created_by": "created_by_name",
            "created_on": "created_on",
            "modified_on": "modified_on",
            "modified_by": "modified_by_name",
        }
        
        query_filter = order_by_dict.get(order_by, None)
        
        if order_type == "desc" and query_filter:
            query_filter = f"-{query_filter}"
        
        if query_filter:
            approvals = approvals.order_by(query_filter)
        
        paginator = Paginator(approvals, page_size)
        number_pages = paginator.num_pages
        
        if page > number_pages and page > 1:
            return Response(
                {"message": "Page not found"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        page_obj = paginator.get_page(page)
        results = RailwayApprovalReadSerializer(page_obj, many=True)
        
        return Response(
            {'count': approvals.count(), 'results': results.data}, 
            status=status.HTTP_200_OK
        )
    
    except serializers.ValidationError as ve:
        raise serializers.ValidationError(ve.detail)
    except Exception as ee:
        return Response(str(ee), status=status.HTTP_400_BAD_REQUEST)
```

## Alternative: Simpler Version (If you want minimal changes)

If you want the absolute minimal change, just add this RIGHT AFTER the prefetch line:

```python
approvals = RailwayApproval.objects.filter(**dict_).select_related(
    'rake', 'loading'
).prefetch_related(
    'steps__wagons', 'wagons__flags', 'history'
)

# ADD THIS BLOCK:
from django.db.models import Q
user_dept = self._get_user_department(request.user)
if user_dept and 'status' not in data:
    approvals = approvals.filter(
        Q(status__in=[10, 15, 20]) |  # Adjust based on your status codes
        Q(steps__department=user_dept, steps__step_status=5)  # PENDING code
    ).distinct()

# Rest of your code continues...
approvals = apply_date_time_range_filters(approvals, data)
```

## What This Does

### Before (Sequential Only)

```
Commercial user queries:
  → Filter: status = AWAITING_COMMERCIAL
  → Shows only approvals with that status

C&W user queries:
  → Filter: status = AWAITING_CW  
  → Shows only approvals with that status
```

### After (Parallel Support)

```
Commercial user queries:
  → Filter: status = AWAITING_COMMERCIAL OR
            (has PENDING step for Commercial)
  → Shows both sequential AND parallel approvals ✓

C&W user queries:
  → Filter: status = AWAITING_CW OR
            (has PENDING step for C&W)
  → Shows both sequential AND parallel approvals ✓
```

## Testing

### Test 1: Check user department is detected

```python
# In your view, add temporary print
user_dept = self._get_user_department(request.user)
print(f"User department: {user_dept}")
```

### Test 2: Verify query includes step filter

```python
# After applying filter
print(f"Query: {approvals.query}")
# Should see something like:
# ... WHERE (status = 15 OR (steps.department = 10 AND steps.step_status = 5))
```

### Test 3: Verify results

```python
# As Commercial user
# Should see approvals where:
# - status = 15 (AWAITING_COMMERCIAL) OR
# - has a PENDING step for department 10
```

## Status Code Reference

Make sure you use the correct codes from your enums:

```python
# Your ApprovalStepStatusEnum
PENDING = 5
APPROVED = 10
REJECTED = 15

# Your RailwayStatusEnum
AWAITING_OPERATIONS = 10
AWAITING_COMMERCIAL = 15
AWAITING_CW = 20
APPROVED = 5
REJECTED = 25
```

## Important Notes

1. **The `.distinct()` is critical** - Without it, you'll get duplicate results when joining with steps
2. **Only apply filter if status not explicitly requested** - This allows manual status filtering to still work
3. **User department detection** - Adjust `_get_user_department()` to match your user-role structure

## Complete File Example

See `DJANGO_NO_MODEL_FIX.md` for the full context of how this fits with the `perform_update()` changes.

## Summary of Changes

1. ✅ Add `_get_user_department()` helper method
2. ✅ Add Q filter after queryset creation
3. ✅ Add `.distinct()` to prevent duplicates
4. ✅ Only apply if user didn't explicitly filter by status

**That's it!** Now your filter API will support multi-department parallel approvals. 🎉
