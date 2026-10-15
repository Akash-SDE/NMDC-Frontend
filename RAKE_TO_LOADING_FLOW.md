# How Rakes Move from Rake Management to Loading Management

## Overview

Rakes don't automatically "move" to Loading Management. Instead, **Loading Management references rakes** that are available in Rake Management. Here's the complete flow:

## The Flow

### Step 1: Rake is Created in Rake Management

**Location:** Rake Management Page (Offered Rakes section)

**What happens:**
```javascript
// Frontend: src/features/rake/hooks/useOfferedRakes.js
await createRake(payload);  // Creates a rake record

// Backend API: POST /rake-management/v1/rake_management
// Creates a RakeManagement record with:
// - rake_number
// - customer
// - siding
// - route
// - destination
// - wagon_type
// - wagon_count
// - placement_time
// - offer_time
// etc.
```

### Step 2: Rake Appears in Loading Management Dropdown

**Location:** Loading Management Page

**What happens:**
```javascript
// Frontend: src/pages/admin/loading/LoadingManagementPage.jsx
const [rakeOptions, setRakeOptions] = useState([]);

// Loads all available rakes
useEffect(() => {
  listRakes({ page_size: 1000 }).then((response) => {
    const rakes = asResults(response).map(mapRake);
    setRakeOptions(rakes);
  });
}, []);

// User sees dropdown with all rakes from Rake Management
<select value={inlineForm.rakeId} onChange={(event) => {
  const match = rakeOptions.find(
    (item) => String(item.id) === String(event.target.value)
  );
  applyRakeSelection(match || null);
}}>
  {rakeOptions.map(rake => (
    <option key={rake.id} value={rake.id}>
      {rake.rakeNumber} - {rake.customer}
    </option>
  ))}
</select>
```

### Step 3: User Selects Rake and Creates Loading Record

**Location:** Loading Management Page (inline form)

**What happens:**
```javascript
// User fills in loading details:
// - Selects rake from dropdown
// - Enters operator FTP
// - Enters tonnage
// - Selects stockpile
// - Fills other loading details

// When user saves:
await createLoadingRecord({
  rake: Number(inlineForm.rakeId),  // ← Reference to rake ID
  operator_ftp: inlineForm.operatorFtp,
  tonnage: inlineForm.tonnage,
  stockpile: inlineForm.stockpile,
  // ... other fields
  status: LOADING_STATUS_CODE.IN_PROGRESS,
  is_submitted: false,
});

// Backend API: POST /rake-management/v1/loading_management
// Creates a LoadingManagement record with FK to RakeManagement
```

### Step 4: Loading Record References the Rake

**Database relationship:**
```python
# Backend Django models
class LoadingManagement(models.Model):
    rake = models.ForeignKey(
        RakeManagement,  # ← References the rake
        on_delete=models.PROTECT,
        related_name="loading_records"
    )
    operator_ftp = models.CharField(...)
    tonnage = models.DecimalField(...)
    stockpile = models.ForeignKey(...)
    status = models.PositiveSmallIntegerField(...)
    # ... other fields
```

### Step 5: After Loading Completes → Railway Approval

**What happens:**
```javascript
// When loading is complete, user submits for approval:
await createRailwayApproval({
  loading: loadingRecord.id,  // ← References loading record
  rake: loadingRecord.rake,   // ← Also references the rake
  status: AWAITING_OPERATIONS,
});

// Backend API: POST /rake-management/v1/railway_approval
// Creates a RailwayApproval record
```

## Data Relationships

```
RakeManagement (Rake Management Page)
    ↓ (Referenced by FK)
LoadingManagement (Loading Management Page)
    ↓ (Referenced by FK)
RailwayApproval (Railway Approvals Page)
```

## Key Points

### 1. Rakes Stay in Rake Management
- Rakes are **NOT deleted** or "moved" from Rake Management
- They remain as master records
- Multiple loading records can reference the same rake

### 2. Loading Records Reference Rakes
- Loading Management creates a **new record** that references a rake
- The relationship is via Foreign Key: `LoadingManagement.rake → RakeManagement.id`

### 3. URL Parameters for Direct Creation
If you want to create a loading record directly from a rake:

```javascript
// From Rake Management, you can navigate to Loading with rake pre-selected:
navigate(`/loading-management?rakeId=${rake.id}`);

// Loading Management page detects this:
const rakeIdParam = searchParams.get("rakeId");
if (rakeIdParam) {
  // Auto-select the rake in the form
  const match = rakeOptions.find(item => String(item.id) === String(rakeIdParam));
  applyRakeSelection(match);
}
```

## Example Flow: From Rake Creation to Approval

```
1. User creates Rake in Rake Management
   ↓
   RakeManagement(id=1, rake_number="RAKE-001", ...)
   
2. User goes to Loading Management
   ↓
   Sees dropdown with all rakes including RAKE-001
   
3. User selects RAKE-001 and fills loading details
   ↓
   LoadingManagement(id=10, rake=1, operator_ftp="FTP-123", ...)
   
4. User completes loading and submits
   ↓
   RailwayApproval(id=100, loading=10, rake=1, status=AWAITING_OPERATIONS)
   
5. Operations, Commercial, C&W approve
   ↓
   RailwayApproval(id=100, status=APPROVED)
   
6. Rake is dispatched
   ↓
   LoadingManagement(id=10, status=DISPATCHED)
```

## Backend APIs Involved

### 1. Rake Management
- `POST /rake-management/v1/rake_management` - Create rake
- `POST /rake-management/v1/rake_management/list` - List rakes

### 2. Loading Management
- `POST /rake-management/v1/loading_management` - Create loading record
- `PATCH /rake-management/v1/loading_management/{id}` - Update loading
- `POST /rake-management/v1/loading_management/list` - List loading records

### 3. Railway Approval
- `POST /rake-management/v1/railway_approval` - Create approval request
- `PATCH /rake-management/v1/railway_approval/{id}` - Update/approve
- `POST /rake-management/v1/railway_approval/list` - List approvals

## Summary

**Rakes don't "move" - they are referenced:**

1. ✅ Rake is created in Rake Management (master record)
2. ✅ Loading record is created in Loading Management (references rake via FK)
3. ✅ Railway approval is created after loading (references both loading and rake)
4. ✅ Rake record stays in Rake Management throughout the process

This is a **relational database design** where:
- RakeManagement = Parent table (master data)
- LoadingManagement = Child table (operations data)
- RailwayApproval = Grandchild table (approval workflow)

The rake itself never moves - it's just referenced by other records! 🎯
