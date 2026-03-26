Iron Ore Rake Dispatch Management System (RDMS)
Step-by-Step Page & Form Creation Guide
STEP 0: Authentication Pages
Page 0.1 — Login Page
Screen Name: Login

Purpose: Authenticate users before accessing the system.

Form Fields:

#	Field	Type	Required	Validation
1	Username	Text Input	Yes	Cannot be empty
2	Password	Password Input	Yes	Cannot be empty
3	OTP (future)	Text Input	No	6-digit numeric
Buttons:

Login — Validates credentials and redirects based on role
Forgot Password — Opens password recovery flow
Behaviour:

On successful login → Redirect to Dashboard page
On failure → Show error "Invalid credentials"
After 3 failed attempts → Lock account for 15 minutes
System assigns role-based menu: Admin, Operator, or Viewer
Page 0.2 — User Management (Admin Only)
Screen Name: Manage Users

Purpose: Admin creates and manages user accounts.

Form Fields:

#	Field	Type	Required	Validation
1	Full Name	Text Input	Yes	Min 2 characters
2	Username	Text Input	Yes	Unique, alphanumeric
3	Password	Password Input	Yes	Min 8 characters
4	Email	Email Input	Yes	Valid email format
5	Role	Dropdown	Yes	Admin / Operator / Viewer
6	Status	Toggle	Yes	Active / Inactive
Buttons:

Save — Creates/updates user
Reset — Clears the form
Deactivate — Disables user account
List View Columns: Full Name, Username, Role, Status, Created Date, Actions (Edit/Deactivate)

STEP 1: Master Data Management Pages (Admin)
Page 1.1 — Wagon Type Master
Screen Name: Master > Wagon Type

Purpose: Manage wagon type reference data.

Form Fields:

#	Field	Type	Required	Validation
1	Wagon Type Code	Text Input	Yes	Unique (e.g., BOXN, NS, MIX)
2	Description	Text Input	No	Max 100 chars
3	Capacity (Wagons)	Number Input	Yes	> 0 (e.g., 58, 59)
4	Max Weight Per Wagon (tons)	Number Input	Yes	> 0
5	Status	Toggle	Yes	Active / Inactive
Buttons: Save, Clear, Edit, Delete

List View Columns: Wagon Type Code, Description, Capacity, Max Weight, Status, Actions

Example Data:

text

BOXN  — 58 wagons
NS    — 58 wagons
MIX   — 59 wagons
Page 1.2 — Siding Master
Screen Name: Master > Siding

Purpose: Manage siding (loading location) reference data.

Form Fields:

#	Field	Type	Required	Validation
1	Siding ID	Text Input	Yes	Unique (e.g., D10/11A)
2	Siding Name	Text Input	Yes	e.g., "New Siding"
3	Location Description	Text Area	No	Max 200 chars
4	Status	Toggle	Yes	Active / Inactive
Buttons: Save, Clear, Edit, Delete

Example Data:

text

D10/11A — New Siding
D5      — Lump Siding
Page 1.3 — Ore Type Master
Screen Name: Master > Ore Type

Form Fields:

#	Field	Type	Required	Validation
1	Ore Type Code	Text Input	Yes	Unique
2	Ore Type Name	Text Input	Yes	e.g., Lumps, Fines, ROM
3	Status	Toggle	Yes	Active / Inactive
Buttons: Save, Clear, Edit, Delete

Page 1.4 — Customer Master
Screen Name: Master > Customer

Form Fields:

#	Field	Type	Required	Validation
1	Customer Code	Text Input	Yes	Unique
2	Customer Name	Text Input	Yes	e.g., JSPL Barbil, NMDC Steel, Welspun
3	Contact Person	Text Input	No	
4	Contact Number	Text Input	No	Valid phone format
5	Address	Text Area	No	
6	Status	Toggle	Yes	Active / Inactive
Buttons: Save, Clear, Edit, Delete

Page 1.5 — Destination Master
Screen Name: Master > Destination

Form Fields:

#	Field	Type	Required	Validation
1	Destination Code	Text Input	Yes	Unique (e.g., JSLK, JDB, ANGUL)
2	Destination Name	Text Input	Yes	
3	State	Text Input	No	
4	Status	Toggle	Yes	Active / Inactive
Buttons: Save, Clear, Edit, Delete

Page 1.6 — Route Master
Screen Name: Master > Route

Form Fields:

#	Field	Type	Required	Validation
1	Route ID	Text Input	Yes	Unique
2	Route Description	Text Input	No	
3	Status	Toggle	Yes	Active / Inactive
Buttons: Save, Clear, Edit, Delete

Page 1.7 — Stockpile Master
Screen Name: Master > Stockpile

Form Fields:

#	Field	Type	Required	Validation
1	Stockpile Code	Text Input	Yes	Unique
2	Stockpile Name	Text Input	Yes	e.g., Stockpile A, Stockpile B
3	Ore Type	Dropdown	Yes	From Ore Type Master
4	Location	Text Input	No	
5	Status	Toggle	Yes	Active / Inactive
Buttons: Save, Clear, Edit, Delete

Page 1.8 — Delay Category Master
Screen Name: Master > Delay Category

Form Fields:

#	Field	Type	Required	Validation
1	Category Code	Text Input	Yes	Unique
2	Category Name	Text Input	Yes	e.g., Mechanical, Railway Delay, Power Failure, Labor Delay, Weather, Operational Issue
3	Status	Toggle	Yes	Active / Inactive
Buttons: Save, Clear, Edit, Delete

STEP 2: Create Rake Offering (Operator)
Page 2.1 — Rake Offering Details Form
Screen Name: Railway > Rake Offering Details

Purpose: Record a new rake that has been physically placed at a siding by the railway authority and offer it for loading.

Layout: Form with header "Rake Offering Details", section "Rake Details"

Form Fields:

#	Field	Type	Required	Validation	Source
1	Rake ID	Text Input	No	Auto-generated or manual	—
2	Rake Number	Text Input	Yes	Must be unique in system	—
3	Wagon Type	Dropdown	Yes	Must select	Wagon Type Master
4	No of Wagons	Dropdown/Number	Yes	Must be > 0	Based on Wagon Type
5	Siding	Dropdown	Yes	Must select	Siding Master
6	Route	Dropdown	Yes	Must select	Route Master
7	Ore Type	Dropdown	Yes	Must select	Ore Type Master
8	Customer	Dropdown	Yes	Must select	Customer Master
9	Destination	Dropdown	Yes	Must select	Destination Master
10	FNote	Text Input	Yes	Dispatch/Financial note	—
11	Placement Time	DateTime Picker	Yes	Cannot be future date	—
12	Offer Time	DateTime Picker	Yes	Must be >= Placement Time	—
Buttons:

Submit — Validates all fields and creates the rake offering record
Clear — Resets all fields
System Validations (on Submit):

Rake Number must not already exist → Error: "Rake number already exists"
Wagon Count must be > 0 → Error: "Wagon count must be greater than zero"
Offer Time >= Placement Time → Error: "Offer time cannot be before placement time"
All mandatory fields filled → Error: "Please fill all required fields"
System Processing (after successful submit):

New rake transaction record created in database
Rake status set to OFFERED
Rake appears in the Offered Rakes / Rake Listing page
Audit log entry: User, Action: CREATE_RAKE, Rake Number, Timestamp
STEP 3: Rake Listing & Actions
Page 3.1 — Offered Rakes List (Rake Listing)
Screen Name: Offered Rakes / Update Loading Status

Purpose: Display all offered rakes as a consolidated operational workbench. Operators use this to identify rakes waiting for loading, currently loading, or completed.

List/Table Columns:

#	Column	Description
1	SNo	Serial Number
2	Mon/SNo	Monthly Serial Number
3	Rake Number	Unique train ID
4	Wagon Supply	Wagon type & count (e.g., NHL/55)
5	Siding	Loading location
6	Route	Route number
7	Customer	Buyer name
8	Destination	Delivery point
9	FNote	Dispatch/Financial note
10	Placement Time	When wagon arrived
11	Offer Time	When offered for loading
12	Loading Start Time	When loading began
13	Delay (if any)	Dropdown to select delay
14	Actions	Buttons: Edit, Start Loading
Functional Features:

Sorting: By siding, placement time, or rake number
Filtering: By operational status (Offered / Loading / Completed / Dispatched)
Status Indicator: Color-coded badge per row (Green=Offered, Yellow=Loading, Blue=Completed, Grey=Dispatched)
Actions per row:

Edit (pencil icon) — Opens Rake Offering form in edit mode. Only allowed when status = OFFERED (before loading begins)
Start Loading / Update Loading — Opens the Update Rake Status page (Step 4)
Behaviour:

Once loading update is recorded, the Edit button is disabled and rake master details are locked
Delay dropdown allows selecting a pre-loading delay category
STEP 4: Update Rake Loading Status (Operator)
Page 4.1 — Update Rake Status Form
Screen Name: Update Rake Status

Purpose: Track the actual loading operation. This is the most critical operational form. The operator enters loading details during the loading process.

Layout:

Section A — Rake Details (Read-Only Header)

#	Field	Display
1	Rake No	e.g., OK99
2	Wagon	e.g., NHL/55
3	Siding	e.g., D10/11A
4	Route	e.g., 2
5	Customer	e.g., F/AMBA RIVER COKE LTD
6	F-Note	e.g., 1515
7	Offer Time	e.g., 10/03/2026 09:20
Section B — Loading Details (Editable Form)

#	Field	Type	Required	Validation
1	Operator 1	Text Input	Yes	Name of first operator (e.g., BHAGAT)
2	Operator 2	Text Input	No	Name of second operator (e.g., RAM)
3	Is Wagon Sick?	Radio Button	Yes	Options: No / Yes. If Yes → wagon must be removed from loading
4	FTP Details	Text Input	Yes	Operational reference number (e.g., 1234/56)
5	Tonnage 1	Number Input	Yes	Weight loaded from Stockpile 1 (e.g., 4000)
6	Stockpile 1	Dropdown	Yes	Select stockpile source (e.g., D10/11A FINE) — from Stockpile Master
7	Tonnage 2	Number Input	No	Weight loaded from Stockpile 2 (e.g., 1000)
8	Stockpile 2	Dropdown	No	Select second stockpile source
9	Completion Time	DateTime Picker	Yes (at completion)	Must be >= Offer Time
10	Track Clearance Time	DateTime Picker	Yes (at clearance)	Must be >= Completion Time
Calculated Fields (auto by system):

Total Loaded Tonnage = Tonnage 1 + Tonnage 2
Loading Duration = Completion Time – Placement Time
Net Loading Time = Loading Duration – Total Delay Duration
Buttons:

Back — Returns to Rake Listing without saving
Save — Saves current data (allows partial saves during loading progress)
Final Submit — Finalizes loading record, locks the rake for editing
Add Delay Reason — Opens the Delay Entry modal/form (Step 5)
System Validations:

At least one operator name is required
Tonnage 1 is required and must be > 0
If Tonnage 2 is entered, Stockpile 2 must also be selected
Total Tonnage should not exceed expected rake capacity → Show warning if exceeded
Completion Time must be >= Placement Time
Track Clearance Time must be >= Completion Time
If Wagon Sick = Yes → system may reduce effective wagon count
System Processing:

On first Save → Rake status transitions to LOADING
Rake details (customer, destination, wagon type etc.) become locked for editing
Progressive tonnage updates allowed during loading
On recording Completion Time → Status transitions to COMPLETED
On recording Track Clearance Time → Status transitions to TRACK_CLEARED (Ready for Dispatch)
Each save generates an audit log entry
STEP 5: Delay Management
Page 5.1 — Add Delay Reason (Modal/Sub-Form)
Screen Name: Update Reason for Delay

Purpose: Capture any interruption or constraint during loading operations. Multiple delay entries can exist per rake.

Accessed From: Add Delay Reason button on the Update Rake Status page

Form Fields:

#	Field	Type	Required	Validation
1	Delay Category	Dropdown	Yes	From Delay Category Master (Mechanical, Railway Delay, Power Failure, Labor Delay, Weather, Operational Issue)
2	Start Time	DateTime Picker	Yes	Must be within loading period (>= Offer Time)
3	End Time	DateTime Picker	Yes	Must be > Start Time
4	Reason Description	Text Area	Yes	Detailed explanation (e.g., "Wagon brake failure")
Calculated Field:

Delay Duration = End Time – Start Time (auto-calculated, displayed as HH:MM)
Buttons:

Add — Saves the delay entry and adds to the delay list
Cancel — Closes without saving
Delay List (below the form or in a table):

#	Category	Start Time	End Time	Duration	Reason	Actions
1	Mechanical	04:50	06:20	1h 30m	Wagon brake failure	Edit / Delete
System Validations:

Delay Start Time must be within the loading period
Delay End Time must be > Delay Start Time
Delay entries are blocked once Track Clearance Time is recorded
Overlapping delay periods should generate a warning
Example:

text

Delay 1: Mechanical    | 04:50 – 05:30 | 40 min
Delay 2: Power Failure | 05:30 – 06:00 | 30 min
Total Delay = 1 hr 10 min
STEP 6: Load Adjustment
Page 6.1 — Adjustment Rakes
Screen Name: Adjustment Rakes

Purpose: Record corrective loading actions when wagons are overloaded or unevenly loaded. Railway wagons have strict weight limits.

Form Fields:

#	Field	Type	Required	Validation
1	Rake Number	Dropdown/Search	Yes	Select from active rakes (must be in LOADING or COMPLETED status)
2	Adjustment Reason	Dropdown/Text	Yes	e.g., Load Adjustment, Uneven Loading, Overloading
3	Number of Overloaded Wagons	Number Input	Yes	Must be > 0, must be <= total wagons in rake
4	Weight Removed (tons)	Number Input	Yes	Must be > 0
5	Adjustment Clearance Time	DateTime Picker	Yes	Must be valid datetime
6	Remarks	Text Area	No	Additional notes
Buttons:

Save — Records the adjustment
Clear — Resets the form
System Validations:

Adjustment is blocked once rake is marked as DISPATCHED
Weight Removed must be a positive number
Number of overloaded wagons cannot exceed total wagon count
System Processing:

Adjustment history maintained for audit and compliance reporting
Total tonnage is adjusted: New Tonnage = Original Tonnage – Weight Removed
Audit log entry created
Example Data:

text

Rake: VK17
Reason: Load Adjustment
Overloaded Wagons: 2
Weight Removed: 4 tons
STEP 7: E-Demand Management
Page 7.1 — Add E-Demands
Screen Name: NMDC > Add E-Demands

Purpose: Record customer ore demand requests for dispatch planning.

Form Layout: Table-style entry allowing multiple demands at once.

Table Columns (per row):

#	Field	Type	Required	Validation
1	SNo	Auto	—	Serial number
2	FNote	Text Input	Yes	Dispatch reference
3	Date	Date Picker	Yes	Default: today
4	Customer	Dropdown	Yes	From Customer Master
5	Destination	Dropdown	Yes	From Destination Master
6	Ore Type	Dropdown	Yes	From Ore Type Master
7	Quantity (tons)	Number Input	Yes	> 0
Buttons:

View — Shows existing demands
Save — Saves all entered demand rows
The form should support adding 3+ rows at a time (as shown in the screenshot).

Page 7.2 — View Pending Demands
Screen Name: NMDC > View Pending Demand

Purpose: Display unfulfilled demand entries.

List Columns:

#	Column	Description
1	SNo	Serial
2	FNote	Reference
3	Date	Demand date
4	Customer	Buyer
5	Destination	Delivery point
6	Ore Type	Type of ore
7	Quantity	Requested tons
8	Fulfilled Quantity	Dispatched tons
9	Pending Quantity	Remaining tons
10	Status	Pending / Partially Fulfilled / Fulfilled
STEP 8: Permit Management
Page 8.1 — Update E-Permit
Screen Name: NMDC > Update EPermit

Purpose: Record electronic transport permit required for railway movement.

Form Fields:

#	Field	Type	Required	Validation
1	Rake Number	Dropdown/Search	Yes	Select from active rakes
2	E-Permit Number	Text Input	Yes	Unique
3	Issue Date	Date Picker	Yes	
4	Valid Till	Date Picker	Yes	Must be >= Issue Date
5	Status	Dropdown	Yes	Active / Expired
Buttons: Save, Clear

Page 8.2 — Update RTP
Screen Name: NMDC > Update RTP

Purpose: Record Railway Transport Permit details.

Form Fields:

#	Field	Type	Required	Validation
1	Rake Number	Dropdown/Search	Yes	
2	RTP Reference	Text Input	Yes	
3	Issue Date	Date Picker	Yes	
4	Validity Period	Date Picker	Yes	
5	Railway Approval Status	Dropdown	Yes	Pending / Approved / Rejected
Buttons: Save, Clear

STEP 9: Reporting Module
Page 9.1 — Daily Dispatch Report
Screen Name: Reports > Daily Dispatch

Filter Fields:

#	Field	Type
1	Date	Date Picker
2	Siding	Dropdown (optional)
Report Columns: Date, Rake Number, Customer, Destination, Ore Type, Wagon Count, Total Tonnage, Loading Duration, Delay Duration, Status

Buttons: Generate, Export to Excel, Print

Page 9.2 — Monthly Dispatch Summary
Filter Fields: Month, Year

Report Columns: Date, Total Rakes, Total Tonnage, Avg Loading Time, Total Delays

Page 9.3 — Customer-wise Dispatch Report
Filter Fields: Date Range, Customer (optional)

Report Columns: Customer, No. of Rakes, Total Tonnage, Avg Tonnage per Rake

Page 9.4 — Delay Analysis Report
Filter Fields: Date Range, Delay Category (optional)

Report Columns: Delay Category, Occurrence Count, Total Delay Duration, Avg Delay Duration, Percentage Share

Page 9.5 — Wagon Utilization Report
Filter Fields: Date Range

Report Columns: Wagon Type, Total Wagons Used, Avg Load per Wagon, Sick Wagons Count

STEP 10: Dashboard
Page 10.1 — Operational Dashboard
Screen Name: Home (Landing page after login)

Purpose: Provide real-time operational overview of yard activities.

Dashboard Cards (KPI Metrics):

#	Metric	Display	Color
1	Rakes Today	Count (e.g., 12)	Blue
2	Loading In Progress	Count (e.g., 3)	Yellow
3	Completed Today	Count	Green
4	Delayed Rakes	Count (e.g., 2)	Red
5	Total Tonnage Today	Tons (e.g., 14,500)	Purple
Charts:

Dispatch Trend — Bar/Line chart showing daily rakes dispatched (last 7/30 days)
Delay Breakdown — Pie chart showing delay distribution by category
Customer Shipment Share — Pie chart showing tonnage by customer
Live Rake Status Table (bottom section):

Rake	Customer	Siding	Status	Delay	Tonnage
OK14	JSPL	D10/11A	Loading	None	2400
VK17	Welspun	D5	Completed	30 min	3600
Auto-Refresh: Dashboard refreshes every 30–60 seconds for real-time monitoring.

Summary: Complete Page Inventory
Step	Page	Screen Name	User Role
0.1	Login	Login	All
0.2	User Management	Admin > Manage Users	Admin
1.1	Wagon Type Master	Master > Wagon Type	Admin
1.2	Siding Master	Master > Siding	Admin
1.3	Ore Type Master	Master > Ore Type	Admin
1.4	Customer Master	Master > Customer	Admin
1.5	Destination Master	Master > Destination	Admin
1.6	Route Master	Master > Route	Admin
1.7	Stockpile Master	Master > Stockpile	Admin
1.8	Delay Category Master	Master > Delay Category	Admin
2.1	Create Rake Offering	Railway > Rake Offering Details	Operator
3.1	Rake Listing	Offered Rakes	Operator/Viewer
4.1	Update Rake Status	Update Rake Status	Operator
5.1	Add Delay Reason	Update Reason for Delay	Operator
6.1	Load Adjustment	Adjustment Rakes	Operator
7.1	Add E-Demands	NMDC > Add E-Demands	Operator
7.2	View Pending Demands	NMDC > View Pending Demand	Operator/Viewer
8.1	Update E-Permit	NMDC > Update EPermit	Operator
8.2	Update RTP	NMDC > Update RTP	Operator
9.1–9.5	Reports (5 pages)	Reports > Various	Admin/Viewer
10.1	Dashboard	Home	All
Total Pages: ~22 screens

Navigation Menu Structure
text

┌─ Home (Dashboard)
├─ Railway
│   └─ Rake Offering Details (Create)
│   └─ Offered Rakes (Listing)
│   └─ Adjustment Rakes
├─ NMDC
│   └─ Add E-Demands
│   └─ View Pending Demand
│   └─ Update EPermit
│   └─ Update RTP
├─ Master
│   └─ Wagon Type
│   └─ Siding
│   └─ Ore Type
│   └─ Customer
│   └─ Destination
│   └─ Route
│   └─ Stockpile
│   └─ Delay Category
├─ Reports
│   └─ Daily Dispatch
│   └─ Monthly Summary
│   └─ Customer Dispatch
│   └─ Delay Analysis
│   └─ Wagon Utilization
├─ Admin
│   └─ Manage Users
│   └─ Audit Logs
└─ [Username] (top-right)
    └─ Profile
    └─ Logout
Rake Lifecycle State Transitions
text

OFFERED ──→ LOADING ──→ COMPLETED ──→ TRACK_CLEARED ──→ DISPATCHED
   │           │            │               │                │
   │           │            │               │                └─ All read-only
   │           │            │               └─ No delays/adjustments
   │           │            └─ No tonnage changes, rake locked
   │           └─ Delays & adjustments allowed
   └─ Rake editable