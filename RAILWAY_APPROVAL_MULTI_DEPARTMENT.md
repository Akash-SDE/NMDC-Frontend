# Railway Approval Multi-Department Feature

## Overview
Added functionality for Operations department to send railway approvals to both Commercial and C&W departments simultaneously or separately. **By default, both departments are selected** when Operations reviews an approval.

## Changes Made

### 1. Railway Approvals Page UI (`src/features/railway/pages/RailwayApprovalsPage.jsx`)

#### State Management
- Added `approvalTargets` state to track which departments Operations wants to send approval to
- **Default value: Both Commercial and C&W are selected** when Operations opens an approval
- Initialized as `[APPROVAL_DEPARTMENTS.COMMERCIAL, APPROVAL_DEPARTMENTS.CW]` for Operations

#### UI Enhancements
- Added a new section "Send Approval To" that appears only when Operations department is reviewing
- Two checkboxes **checked by default**:
  - ☑ Railway Commercial
  - ☑ Railway C&W
- Helper text explains: **"Default: Both departments are selected. Uncheck if you want to send to only one department. At least one department must be selected."**
- Validation: Prevents approval submission if no departments are selected

#### Logic Updates
- `openApproval()`: Sets default targets to both Commercial and C&W when Operations is reviewing
- `requestDecision()`: Validates at least one department is selected before allowing approval
- `confirmDecision()`: Always passes `approvalTargets` to the Redux action for Operations
- `closeApproval()`: Clears `approvalTargets` when modal is closed
- Confirmation dialog shows which departments the approval will be sent to

#### Success Messages
- Dynamic success messages based on selected targets:
  - If both selected (default): "Approved and sent to Railway Commercial and Railway C&W."
  - If one selected: "Approved and sent to Railway Commercial." (or C&W)

### 2. Railway Approval Service (`src/services/railwayApprovalService.js`)

#### API Integration
- Updated `submitRailwayDecision()` to accept `targets` parameter (required for Operations)
- **Default behavior: Send to both departments** when Operations approves
- Logic to route based on selected targets:
  - **Both Commercial and C&W** (default): Sets status to `AWAITING_COMMERCIAL` with targets `[10, 15]`
  - **Only Commercial**: Sets status to `AWAITING_COMMERCIAL` with targets `[10]`
  - **Only C&W**: Sets status to `AWAITING_CW` with targets `[15]`
- Added `approval_targets` field to API payload containing department codes

### 3. Redux Store (`src/store/slices/approvalSlice.js`)

#### Action Update
- Updated `submitApprovalDecision` async thunk to accept and pass `targets` parameter to service

## User Flow

### Default Flow (Both Departments - Most Common)
1. Operations reviews the approval
2. **Both "Railway Commercial" and "Railway C&W" are already checked**
3. Clicks "Approve"
4. Confirmation shows: "This will send the approval to Railway Commercial and Railway C&W."
5. **Both departments receive the approval simultaneously**
6. Either department can approve first
7. Once both approve, status changes to APPROVED

### Custom Flow: Send to One Department Only

#### Scenario 1: Only Commercial
1. Operations reviews the approval
2. **Unchecks "Railway C&W"** (leaving only Commercial checked)
3. Clicks "Approve"
4. Confirmation shows: "This will send the approval to Railway Commercial."
5. Only Commercial receives the approval
6. After Commercial approves, it flows to C&W (sequential)

#### Scenario 2: Only C&W
1. Operations reviews the approval
2. **Unchecks "Railway Commercial"** (leaving only C&W checked)
3. Clicks "Approve"
4. Confirmation shows: "This will send the approval to Railway C&W."
5. Commercial is skipped entirely
6. Only C&W receives the approval
7. After C&W approves, status becomes APPROVED

## Benefits

1. **Parallel Processing by Default**: Most efficient routing is the default behavior
2. **Faster Approvals**: Both departments can review simultaneously
3. **Flexibility**: Can still route to single department when needed
4. **User Control**: Operations decides the best route per case
5. **Validation**: Prevents submission without selecting at least one department
6. **Clear Communication**: UI provides clear feedback on routing

## Technical Details

### Department Codes
- Operations: 5
- Commercial: 10
- C&W: 15

### Status Codes
- Awaiting Operations: 10
- Awaiting Commercial: 15
- Awaiting C&W: 20
- Approved: 5

### Default Behavior
When Operations opens an approval:
```javascript
setApprovalTargets([
  APPROVAL_DEPARTMENTS.COMMERCIAL,  // 'commercial'
  APPROVAL_DEPARTMENTS.CW           // 'cw'
]);
```

### API Payload
Default payload sent to backend:
```javascript
{
  status: 15,  // AWAITING_COMMERCIAL
  approval_targets: [10, 15],  // Both departments
  steps: [...],
  history_entry: {...},
  clearance_time: "..."
}
```

## Backend Requirements

### Critical Backend Changes Required:

1. **Accept `approval_targets` array** in the PATCH endpoint
2. **Make approval visible to multiple departments simultaneously** when array contains multiple values
3. **Track each department's completion status independently**
4. **Progress to next status only when ALL selected departments complete**

### Example Backend Logic:

```python
if approval_targets contains [10, 15]:
    # Make visible to BOTH Commercial and C&W
    # Either can approve first
    # When Commercial approves: keep status, wait for C&W
    # When C&W approves: if Commercial done, set APPROVED
    # When both approve: set status to APPROVED
```

**See `BACKEND_IMPLEMENTATION_GUIDE.md` for complete backend specifications.**

## Files Modified

Frontend:
- ✅ `src/features/railway/pages/RailwayApprovalsPage.jsx`
- ✅ `src/services/railwayApprovalService.js`
- ✅ `src/store/slices/approvalSlice.js`

Backend (Required):
- ⚠️ Railway approval PATCH endpoint - handle `approval_targets`
- ⚠️ Railway approval LIST endpoint - show approvals to multiple departments
- ⚠️ Database schema - track pending departments
- ⚠️ Approval completion logic - wait for all selected departments

## Testing Recommendations

### Frontend Testing:
- [x] Both checkboxes checked by default when Operations opens approval
- [x] Can uncheck one checkbox
- [x] Cannot uncheck both (validation prevents submission)
- [x] Confirmation message shows selected departments
- [x] Success message reflects actual routing

### Backend Testing:
- [ ] Operations sends to both - both Commercial and C&W see it
- [ ] Commercial approves first - C&W still sees it as pending
- [ ] C&W approves second - status changes to APPROVED
- [ ] Works in reverse order (C&W first, then Commercial)
- [ ] Operations sends to one department - only that department sees it
- [ ] Rejection by any department rejects the entire approval
- [ ] Status codes are correct for each scenario
