# Visual User Guide - Multi-Department Railway Approvals

## For Operations Users

### Opening an Approval

When you click **"Review"** on a railway approval:

```
┌───────────────────────────────────────────────────────────┐
│ Review RAKE-12345                                    [Close]│
├───────────────────────────────────────────────────────────┤
│ Customer ABC Industries · Siding XYZ                      │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Loading Summary                                     │ │
│ │                                                     │ │
│ │ Rake Number: RAKE-12345                             │ │
│ │ Tonnage: 4500                                       │ │
│ │ Completion: 2024-03-20 10:30                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Railway Operations Wagon Inspection                 │ │
│ │                                                     │ │
│ │ [Inspection fields here...]                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Railway Operations Decision                         │ │
│ │                                                     │ │
│ │ Remarks:                                            │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ [Enter your remarks here...]                    │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ Send Approval To: *                                 │ │
│ │                                                     │ │
│ │ ☑ Railway Commercial    <-- ALREADY CHECKED        │ │
│ │ ☑ Railway C&W           <-- ALREADY CHECKED        │ │
│ │                                                     │ │
│ │ Default: Both departments are selected.             │ │
│ │ Uncheck if you want to send to only one            │ │
│ │ department. At least one department must be         │ │
│ │ selected.                                           │ │
│ │                                                     │ │
│ │                            [Reject]    [Approve]    │ │
│ └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### Scenario 1: Send to Both (Recommended - Default)

**Action:** Simply click **[Approve]** with both boxes checked

```
┌───────────────────────────────────────────┐
│ ⚠️ Confirm Approval                       │
├───────────────────────────────────────────┤
│                                           │
│ Are you sure you want to approve this     │
│ railway step? This will send the          │
│ approval to Railway Commercial and        │
│ Railway C&W.                              │
│                                           │
│ Rake Number: RAKE-12345                   │
│                                           │
│                  [Cancel]    [Approve]    │
└───────────────────────────────────────────┘
```

**Result:**
```
✓ Success Message:
"Approved and sent to Railway Commercial and Railway C&W."

Both departments can now review and approve simultaneously!
```

### Scenario 2: Send to Commercial Only

**Action:** 
1. **Uncheck** ☐ Railway C&W
2. Keep ☑ Railway Commercial checked
3. Click **[Approve]**

```
Before:                      After:
☑ Railway Commercial    →    ☑ Railway Commercial
☑ Railway C&W           →    ☐ Railway C&W
                             
              [Approve]
```

**Confirmation:**
```
┌───────────────────────────────────────────┐
│ ⚠️ Confirm Approval                       │
├───────────────────────────────────────────┤
│                                           │
│ Are you sure you want to approve this     │
│ railway step? This will send the          │
│ approval to Railway Commercial.           │
│                                           │
│ Rake Number: RAKE-12345                   │
│                                           │
│                  [Cancel]    [Approve]    │
└───────────────────────────────────────────┘
```

**Result:**
```
✓ Success Message:
"Approved and sent to Railway Commercial."

Only Commercial will review first, then it flows to C&W.
```

### Scenario 3: Send to C&W Only

**Action:**
1. **Uncheck** ☐ Railway Commercial
2. Keep ☑ Railway C&W checked
3. Click **[Approve]**

```
Before:                      After:
☑ Railway Commercial    →    ☐ Railway Commercial
☑ Railway C&W           →    ☑ Railway C&W
                             
              [Approve]
```

**Result:**
```
✓ Success Message:
"Approved and sent to Railway C&W."

Commercial is skipped. Only C&W will review.
```

### ❌ Error: Nothing Selected

**Action:** Uncheck both boxes and try to approve

```
☐ Railway Commercial
☐ Railway C&W
        
        [Approve]  <- Click this
```

**Result:**
```
❌ Error Message:
"Please select at least one department to send the 
approval to."

Cannot approve! You must select at least one department.
```

## For Commercial Users

### What You See

**When Operations sends to both departments:**
```
┌─────────────────────────────────────────────┐
│ Railway Approval Queue                      │
│ Review completed loading records            │
├─────────────────────────────────────────────┤
│                                             │
│ Rake Number  Customer       Current Step    │
│ ─────────────────────────────────────────── │
│ RAKE-12345   ABC Industries  Railway        │
│                               Commercial    │
│                                             │
│ ← YOU CAN REVIEW THIS NOW                   │
│                                             │
└─────────────────────────────────────────────┘
```

**If you approve first:**
```
After you approve:
- Approval disappears from YOUR queue ✓
- C&W still sees it (they haven't approved yet)
- Overall status: Still "Awaiting Commercial"
- When C&W approves → Status becomes "Approved"
```

**If C&W approves first:**
```
You still see the approval in your queue:
- C&W's approval is recorded ✓
- You can still approve independently
- After you approve → Status becomes "Approved"
```

## For C&W Users

### What You See

**When Operations sends to both departments:**
```
┌─────────────────────────────────────────────┐
│ Railway Approval Queue                      │
│ Review completed loading records            │
├─────────────────────────────────────────────┤
│                                             │
│ Rake Number  Customer       Current Step    │
│ ─────────────────────────────────────────── │
│ RAKE-12345   ABC Industries  Railway        │
│                               Commercial    │
│                                             │
│ ← YOU CAN ALSO REVIEW THIS NOW              │
│    (Even though it says "Commercial")       │
│                                             │
└─────────────────────────────────────────────┘
```

**Same behavior:**
- Either you or Commercial can approve first
- Both approvals are independent
- When both complete → Status = "Approved"

## Quick Reference

### Operations Decision Matrix

| Checkboxes Selected | Where It Goes | Typical Use Case |
|---------------------|---------------|------------------|
| ☑ Commercial + ☑ C&W | **Both simultaneously** | **Default - Fastest routing** |
| ☑ Commercial only | Commercial → C&W | When C&W review depends on Commercial |
| ☑ C&W only | C&W directly | When Commercial review not needed |
| ☐ Nothing | ❌ Error | Cannot submit |

### Key Benefits

✅ **Parallel Processing** - Both departments work simultaneously
✅ **Faster Approvals** - No waiting for sequential approval
✅ **Flexible Routing** - Choose the right path for each case
✅ **Order Independent** - Either department can approve first
✅ **Default Optimized** - Most efficient option is pre-selected

## Tips for Operations

💡 **Tip 1: Use Default for Most Cases**
The default (both checked) is usually the fastest option. Only uncheck if there's a specific reason.

💡 **Tip 2: Both Departments Are Independent**
When both are selected, they don't need to approve in any specific order. Either can go first.

💡 **Tip 3: Can't Change After Approval**
Once you approve and send to departments, you can't change the routing. Double-check your selection before clicking "Approve".

💡 **Tip 4: Track Clearance Time Required**
Don't forget to set the Track Clearance Time - it's mandatory for Operations approval.

## Common Questions

**Q: If I send to both, do they both have to approve?**
A: Yes, when you send to both, both departments must approve before the overall status becomes "Approved".

**Q: Does it matter who approves first?**
A: No, when sent to both departments, either can approve first. The order doesn't matter.

**Q: What if I only need Commercial approval?**
A: Select only Commercial. After they approve, it will automatically flow to C&W (unless you want to skip C&W entirely).

**Q: Can I skip both departments?**
A: No, at least one department must review and approve.

**Q: What happens if one department rejects?**
A: If any department rejects, the entire approval is rejected, regardless of whether other departments approved.
