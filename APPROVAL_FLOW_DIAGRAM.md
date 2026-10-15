# Railway Approval Flow Diagram

## Default Behavior (Both Departments - Recommended)

```
┌─────────────┐
│  Operations │
│   Approves  │
│             │
│ ☑ Commercial│  <- CHECKED BY DEFAULT
│ ☑ C&W       │  <- CHECKED BY DEFAULT
└──────┬──────┘
       │
       │ Sends to BOTH simultaneously (default)
       ├────────────┬────────────┐
       │            │            │
       ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│Commercial│  │   C&W    │  │  Status  │
│(Receives)│  │(Receives)│  │ Awaiting │
│          │  │          │  │Commercial│
│ Either   │  │ Either   │  └──────────┘
│ can      │  │ can      │
│ approve  │  │ approve  │
│ first    │  │ first    │
└────┬─────┘  └─────┬────┘
     │              │
     │  Both must   │
     │  approve     │
     └──────┬───────┘
            ▼
        ✓ APPROVED
```

## Custom Option 1: Send to Commercial Only

```
┌─────────────┐
│  Operations │
│   Approves  │
│             │
│ ☑ Commercial│  <- Keep checked
│ ☐ C&W       │  <- UNCHECK this
└──────┬──────┘
       │
       │ Sends only to Commercial
       ▼
┌─────────────┐
│ Commercial  │
│  (Receives) │
└──────┬──────┘
       │
       │ Then follows sequential to C&W
       ▼
┌─────────────┐
│    C&W      │
│   Approves  │
└──────┬──────┘
       │
       ▼
   ✓ APPROVED
```

## Custom Option 2: Send to C&W Only

```
┌─────────────┐
│  Operations │
│   Approves  │
│             │
│ ☐ Commercial│  <- UNCHECK this
│ ☑ C&W       │  <- Keep checked
└──────┬──────┘
       │
       │ Skips Commercial, goes directly to C&W
       ▼
┌─────────────┐
│    C&W      │
│  (Receives) │
└──────┬──────┘
       │
       ▼
   ✓ APPROVED
   (Commercial skipped)
```

## Validation: Cannot Submit with Nothing Selected

```
┌─────────────┐
│  Operations │
│   Tries to  │
│   Approve   │
│             │
│ ☐ Commercial│  <- Both unchecked
│ ☐ C&W       │
└──────┬──────┘
       │
       ▼
   ❌ ERROR MESSAGE
   "Please select at least
    one department to send
    the approval to."
```

## UI Screenshot Description

When Operations opens an approval for review, they will see:

```
┌────────────────────────────────────────────────────┐
│ Railway Operations Decision                        │
│────────────────────────────────────────────────────│
│                                                    │
│ Remarks:                                           │
│ ┌────────────────────────────────────────────────┐ │
│ │ [Approval remarks text area...]                │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ Send Approval To:                                  │
│ ☐ Railway Commercial                              │
│ ☐ Railway C&W                                     │
│                                                    │
│ Select one or both departments to send this       │
│ approval to. If none selected, it will follow     │
│ the default sequential approval flow.              │
│                                                    │
│                              [Reject]  [Approve]   │
└────────────────────────────────────────────────────┘
```

## Key Benefits

1. **Parallel Processing**: Both departments can review simultaneously
2. **Flexible Routing**: Can skip departments when appropriate
3. **Time Savings**: Reduces sequential wait times
4. **Backward Compatible**: Default behavior unchanged
5. **User Control**: Operations decides the best route per case
