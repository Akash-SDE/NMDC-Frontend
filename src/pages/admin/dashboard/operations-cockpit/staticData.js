/* ------------------------------------------------------------------ */
/*  Header / meta                                                      */
/* ------------------------------------------------------------------ */
export const DASHBOARD_META = {
  dateLabel: "Thu, 26 Oct 2026",
  time: "09:29:45",
  filterDate: "26/10/2026",
  nowHour: 9.5, // position of the "NOW" marker on the dispatch grid
  targetRatio: "81.25% Achieved Today",
  user: { initials: "BN", role: "Commercial Manager", unit: "Bacheli Control" },
  notifications: 3,
};

export const NAV_ITEMS = [
  { label: "Dashboard", active: true },
  { label: "Rake Monitoring" },
  { label: "Real-Time Dispatch Grid", dot: true },
  { label: "Rake Release" },
  { label: "Monthly Reports" },
  { label: "Analytics" },
  { label: "Master Data" },
  { label: "Settings" },
];

/* ------------------------------------------------------------------ */
/*  Active siding cards                                                */
/* ------------------------------------------------------------------ */
export const COCKPIT_SIDINGS = [
  {
    id: 1,
    name: "LUMP SIDING",
    code: "BOXN-59",
    progress: 62,
    rakeNo: "BHL25145",
    customer: "Tata Steel Ltd.",
    start: "05:20 (Today)",
    completeLabel: "Est. Compl:",
    estComplete: "13:00 (Today)",
    delayRowLabel: "Delay:",
    delayLabel: "0 min (On-Time)",
    delayTone: "ok",
    state: "LOADING",
    badgeTone: "green",
    barColor: "#16a34a",
  },
  {
    id: 2,
    name: "FINE SIDING",
    code: "BOBRN-58",
    progress: 37,
    rakeNo: "BHL25146",
    customer: "JSW Steel Ltd.",
    start: "01:00 (Today)",
    completeLabel: "Est. Compl:",
    estComplete: "12:30 (Today)",
    delayRowLabel: "Delay:",
    delayLabel: "+42 min (Chute Issue)",
    delayTone: "amber",
    state: "DELAYED",
    badgeTone: "amber",
    barColor: "#f59e0b",
  },
  {
    id: 3,
    name: "NEW SIDING",
    code: "BOXNHL-58",
    progress: 48,
    rakeNo: "BHL25147",
    customer: "Jindal Steel & Pwr",
    start: "00:45 (Today)",
    completeLabel: "Est. Compl:",
    estComplete: "13:00 (Today)",
    delayRowLabel: "Delay:",
    delayLabel: "+65 min (Demurrage)",
    delayTone: "danger",
    state: "DELAYED",
    badgeTone: "red",
    barColor: "#e11d48",
  },
  {
    id: 4,
    name: "RGBL / RYD-5",
    code: "BOXN-58",
    progress: 100,
    rakeNo: "BHL25148",
    customer: "SAIL",
    start: "03:10 (Today)",
    completeLabel: "Completion:",
    estComplete: "04:50 (Today)",
    delayRowLabel: "Post-loading:",
    delayLabel: "Awaiting Release",
    delayTone: "danger",
    state: "COMPLETED",
    badgeTone: "green",
    barColor: "#16a34a",
  },
  {
    id: 5,
    name: "SIDING 5",
    code: "BOXN-58",
    progress: 22,
    rakeNo: "BHL25149",
    customer: "NMDC (Domestic)",
    start: "04:30 (Today)",
    completeLabel: "Est. Compl:",
    estComplete: "14:00 (Today)",
    delayRowLabel: "Delay:",
    delayLabel: "0 min (Smooth)",
    delayTone: "ok",
    state: "LOADING",
    badgeTone: "blue",
    barColor: "#0b91cf",
  },
];

/* ------------------------------------------------------------------ */
/*  KPI cards                                                          */
/* ------------------------------------------------------------------ */
/** Demo fallback KPIs — keep in sync with `buildCockpitKpis` (4 cards). */
export const COCKPIT_KPIS = [
  {
    title: "Rakes Loaded (Today)",
    value: "13",
    sub: "Target : 16",
    subTone: "blue",
    progress: 81,
    tone: "blue",
    icon: "loaded",
    border: "#2563eb",
    ring: "#10b981",
  },
  {
    title: "Rakes in Loading",
    value: "5",
    sub: "2 Delayed",
    subTone: "danger",
    tone: "green",
    icon: "loading",
    border: "#16a34a",
  },
  {
    title: "Demurrage Hours",
    value: "1.8",
    sub: "Logged delay time today",
    subTone: "danger",
    tone: "red",
    shape: "circle",
    icon: "delay",
    border: "#dc2626",
  },
  {
    title: "Gross Loading Hours",
    value: "6.4",
    sub: "SLA: 7.0 hrs",
    subTone: "amber",
    tone: "amber",
    icon: "hours",
    border: "#d97706",
  },
];

export const COCKPIT_FOOTER_METRICS = [
  { label: "Load Adjustment:", value: "2 rakes", detail: "Fine/Slimes trim", tone: "orange" },
  { label: "Demurraged Duration:", value: "107 min", detail: "BHL25147 / BHL25146", tone: "red" },
  { label: "Gross Loading Time:", value: "6.4 hrs", detail: "SLA: 7.0 hrs", tone: "blue" },
  { label: "Railway Release Queue:", value: "10 rakes", detail: "2 FOIS Sync", tone: "indigo" },
];

/* ------------------------------------------------------------------ */
/*  Real-time dispatch grid (hours on a 0–24 scale)                    */
/* ------------------------------------------------------------------ */
export const DISPATCH_GRID_ROWS = [
  {
    siding: "SDG-BCH-1A",
    subtitle: "1. Lump • Rake BHL25145",
    bars: [
      { start: 4.8, end: 12.1, status: "completed", label: "BHL25145 (Tata Steel) - 62% Loaded", tag: "ETA 13:00" },
    ],
    notes: [
      { at: 1.7, text: "Track Idle" },
      { at: 12.5, text: "Scheduled: RINL Rake (14:30)" },
    ],
  },
  {
    siding: "SDG-BCH-2B",
    subtitle: "2. Fine • Rake BHL25146",
    bars: [
      { start: 1.0, end: 12.1, status: "delayed", label: "BHL25146 (JSW Steel) - 37% [Delayed +42m]", tag: "Chute Stoppage" },
    ],
    notes: [{ at: 12.5, text: "Awaiting Clearance" }],
  },
  {
    siding: "SDG-BCH-3",
    subtitle: "3. New • Rake BHL25147",
    bars: [
      { start: 0.1, end: 7.4, status: "demurrage", label: "BHL25147 (Jindal) - 48% [Demurraged +...", tag: "Conveyor Fix", tagWrap: true },
    ],
    notes: [{ at: 7.7, text: "Reserved for ESSAR Rake" }],
  },
  {
    siding: "SDG-BCH-4",
    subtitle: "4. RGBL/RYD-5 • BHL25148",
    bars: [
      { start: 2.8, end: 4.5, status: "completed", label: "BHL251..." },
      { start: 4.6, end: 9.5, status: "awaiting", label: "Awaiting Railway Release", tag: "Audit" },
    ],
    notes: [{ at: 9.6, text: "Track Ready for Next", wrap: true }],
  },
  {
    siding: "SDG-BCH-5",
    subtitle: "5. Siding 5 • BHL25149",
    bars: [
      { start: 3.9, end: 13.1, status: "loaded", label: "BHL25149 (NMDC Dom) - 22% [In Progress]", tag: "14:00 Target" },
    ],
    notes: [{ at: 13.4, text: "Idle / Night Shift Allocation" }],
  },
];

/* ------------------------------------------------------------------ */
/*  Charts                                                             */
/* ------------------------------------------------------------------ */
export const MONTHLY_TREND = [
  { month: "Jan", rakes: 280, target: 290 },
  { month: "Feb", rakes: 310, target: 300 },
  { month: "Mar", rakes: 295, target: 300 },
  { month: "Apr", rakes: 320, target: 295 },
  { month: "May", rakes: 302, target: 300 },
  { month: "Jun", rakes: 288, target: 295 },
  { month: "Jul", rakes: 265, target: 290 },
  { month: "Aug", rakes: 302, target: 300 },
];

export const PRODUCT_DISPATCH = [
  { label: "Fines", pct: 52, mt: "0.64 MT", color: "#1d8fe0" },
  { label: "Lump", pct: 21, mt: "0.26 MT", color: "#10b981" },
  { label: "Slimes", pct: 15, mt: "0.18 MT", color: "#f59e0b" },
  { label: "Cal. Lump", pct: 12, mt: "0.15 MT", color: "#8b5cf6" },
];

// rakes → left axis (0–120), tonnage in MT → right axis (0.0–0.6)
export const SIDING_LOADING = [
  { siding: "Lump", rakes: 72, tonnage: 0.3 },
  { siding: "Fine", rakes: 68, tonnage: 0.28 },
  { siding: "New Siding", rakes: 55, tonnage: 0.22 },
  { siding: "RGBL/RYD-5", rakes: 65, tonnage: 0.26 },
  { siding: "Siding 5", rakes: 42, tonnage: 0.18 },
];

/* ------------------------------------------------------------------ */
/*  Live rake register                                                 */
/* ------------------------------------------------------------------ */
export const REGISTER_TOTAL_TRACKED = 24;

export const LIVE_RAKE_REGISTER = [
  {
    sno: 1, rakeNo: "BHL25145", siding: "Lump", customer: "Tata Steel Ltd.", product: "Lump Ore",
    placementDate: "14 Aug", placement: "05:00", start: "05:20", complete: "—",
    loadedPct: 62, permitH: 7, actualH: 6.4, delayMin: 0, release: "Pending", dept: "—",
    remarks: "Loading in progress\n• Normal", remarkTone: "ok",
  },
  {
    sno: 2, rakeNo: "BHL25146", siding: "Fine", customer: "JSW Steel Ltd.", product: "Iron Ore Fines",
    placementDate: "14 Aug", placement: "00:30", start: "01:00", complete: "—",
    loadedPct: 37, permitH: 7, actualH: 7.7, delayMin: 42, release: "Pending", dept: "—",
    remarks: "Loading delayed •\nChute jam rectified", remarkTone: "warn",
  },
  {
    sno: 3, rakeNo: "BHL25147", siding: "New Siding", customer: "Jindal Steel & Power", product: "Iron Ore Fines",
    placementDate: "14 Aug", placement: "00:15", start: "00:45", complete: "—",
    loadedPct: 48, permitH: 7, actualH: 8.1, delayMin: 65, release: "Pending", dept: "—",
    remarks: "Conveyor issue •\nDemurrage\ntriggered", remarkTone: "danger",
  },
  {
    sno: 4, rakeNo: "BHL25148", siding: "RGBL / RYD-5", customer: "SAIL", product: "Slimes",
    placementDate: "14 Aug", placement: "02:50", start: "03:10", complete: "04:50",
    loadedPct: 100, permitH: 7, actualH: 1.7, delayMin: 0, release: "Awaiting Release", dept: "—",
    remarks: "Loading completed\n• RLY Guard Signoff", remarkTone: "ok",
  },
  {
    sno: 5, rakeNo: "BHL25149", siding: "Siding 5", customer: "NMDC (Domestic)", product: "Calibrated Lump",
    placementDate: "14 Aug", placement: "04:00", start: "04:30", complete: "—",
    loadedPct: 22, permitH: 7, actualH: 2.5, delayMin: 0, release: "Pending", dept: "—",
    remarks: "Loading in progress\n• Normal rate", remarkTone: "ok",
  },
];