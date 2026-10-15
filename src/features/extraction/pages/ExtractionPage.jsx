import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchRailwayReceipts,
  uploadRailwayReceiptPdf,
  fetchRailwayReceiptById,
  reprocessRailwayReceipt,
} from "../../../services/extractionService";
import SearchBar from "../../../components/shared/SearchBar";
import Pagination from "../../../components/shared/Pagination";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import { ExtractionIcon } from "../../../components/icons";
import { Upload } from "lucide-react";
import ColumnSettingsMenu, { ICON_BUTTON_CLASS } from "../../../components/shared/ColumnSettingsMenu";
import { useColumnVisibility } from "../../../hooks/useColumnVisibility";
import ColumnFilterRow from "../../../components/shared/ColumnFilterRow";
import { useColumnFilters, useServerColumnFilters } from "../../../hooks/useColumnFilters";

const PAGE_SIZE = 10;

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
function fmt(val) {
  return val === null || val === undefined || val === "" ? "—" : String(val);
}

function fmtCurrency(val) {
  if (val === null || val === undefined || val === "") return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  // plain date "2026-05-29"
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  }
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function getFileName(pdfPath) {
  if (!pdfPath) return "—";
  return pdfPath.split("/").pop();
}

/* ─────────────────────────────────────────────────────────────────
   Status badge — maps API values (COMPLETED, PROCESSING, FAILED, PENDING)
───────────────────────────────────────────────────────────────── */
const STATUS_MAP = {
  COMPLETED:  { label: "Completed",  dot: "bg-emerald-500", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  PROCESSING: { label: "Processing", dot: "bg-amber-500",   cls: "border-amber-200 bg-amber-50 text-amber-700"       },
  FAILED:     { label: "Failed",     dot: "bg-red-500",     cls: "border-red-200 bg-red-50 text-red-700"             },
  PENDING:    { label: "Pending",    dot: "bg-slate-400",   cls: "border-slate-200 bg-slate-100 text-slate-600"      },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status?.toUpperCase()] ?? STATUS_MAP.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Upload progress
───────────────────────────────────────────────────────────────── */
function UploadProgress({ uploadState }) {
  return (
    <div>
      {uploadState.length > 0 && (
        <div className="space-y-2">
          {uploadState.map((f, idx) => (
            <div key={`${idx}-${f.name}`}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[12px] transition-colors ${
                f.status === "done"    ? "border-emerald-200 bg-emerald-50" :
                f.status === "error"  ? "border-red-200 bg-red-50" :
                f.status === "duplicate" ? "border-amber-200 bg-amber-50" :
                f.status === "active" || f.status === "polling" ? "border-blue-200 bg-blue-50" :
                                        "border-slate-200 bg-slate-50"
              }`}
            >
              {/* icon */}
              <span className="shrink-0">
                {f.status === "done" ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : f.status === "error" ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : f.status === "duplicate" ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                ) : f.status === "active" || f.status === "polling" ? (
                  <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
              </span>

              {/* file name */}
              <span className={`flex-1 truncate font-medium ${
                f.status === "done"   ? "text-emerald-800" :
                f.status === "error"  ? "text-red-700" :
                f.status === "duplicate" ? "text-amber-800" :
                f.status === "active" || f.status === "polling" ? "text-blue-700" :
                                        "text-slate-500"
              }`}>
                {f.name}
              </span>

              {/* status label + elapsed */}
              <span className={`shrink-0 font-semibold tabular-nums ${
                f.status === "done"   ? "text-emerald-600" :
                f.status === "error"  ? "text-red-600" :
                f.status === "duplicate" ? "text-amber-700" :
                f.status === "active" || f.status === "polling" ? "text-blue-600" :
                                        "text-slate-400"
              }`}>
                {f.status === "done"    ? "Extracted ✓" :
                 f.status === "error" || f.status === "duplicate" ? (f.errorMsg || "Failed") :
                 f.status === "active"  ? `Uploading… ${f.elapsed > 0 ? `${f.elapsed}s` : ""}` :
                 f.status === "polling" ? `Extracting… ${f.elapsed > 0 ? `${f.elapsed}s` : ""}` :
                                          "Queued"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Detail Drawer  — maps API fields directly
───────────────────────────────────────────────────────────────── */
const WAGON_COLUMNS = [
  { key: "serial_number",      label: "Sr" },
  { key: "owning_railway",     label: "Owning Rly" },
  { key: "wagon_type",         label: "Type" },
  { key: "wagon_number",       label: "Wagon No" },
  { key: "cc",                 label: "CC (T)" },
  { key: "tare_weight",        label: "Tare (T)" },
  { key: "no_of_articles",     label: "Articles" },
  { key: "commodity_code",     label: "Commodity" },
  { key: "gross_weight",       label: "Gross (T)" },
  { key: "dip_measurement",    label: "DIP Wt (T)" },
  { key: "actual_weight",      label: "Actual (T)" },
  { key: "permissible_weight", label: "Permissible (T)" },
  { key: "over_weight",        label: "Over Wt (T)" },
  { key: "normal_rate",        label: "Over Wt Normal" },
  { key: "punitive_rate",      label: "Over Wt Punitive" },
  { key: "chargeable_weight",  label: "Chargeable (T)" },
];

const WAGON_FILTER_COLUMNS = WAGON_COLUMNS.map((col) =>
  col.key === "serial_number"
    ? { key: col.key, label: col.label, type: "none" }
    : { key: col.key, label: col.label, getValue: (wagon) => fmt(wagon[col.key]) },
);

function WagonTable({ wagons }) {
  const columnFilters = useColumnFilters(WAGON_FILTER_COLUMNS);
  const { applyFilters } = columnFilters;
  const wagonRows = useMemo(() => (Array.isArray(wagons) ? wagons : []), [wagons]);
  const filteredWagons = useMemo(() => applyFilters(wagonRows), [applyFilters, wagonRows]);

  if (wagonRows.length === 0) {
    return <p className="px-5 py-3 text-[12px] text-slate-500">No wagon rows were extracted.</p>;
  }
  return (
    <div className="max-h-80 overflow-auto">
      <table className="w-full whitespace-nowrap text-[11px]">
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr>
            {WAGON_COLUMNS.map((col) => (
              <th key={col.key} className="px-2 py-1.5 text-left font-bold uppercase tracking-wide text-slate-500">
                {col.label}
              </th>
            ))}
          </tr>
          <ColumnFilterRow
            {...columnFilters.filterRowProps}
            rows={wagonRows}
            cellClassName="px-2 py-1"
            rowClassName="border-b border-slate-200 bg-slate-100"
          />
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredWagons.length === 0 ? (
            <tr>
              <td colSpan={WAGON_COLUMNS.length} className="px-5 py-4 text-center text-[12px] text-slate-500">
                No wagons match the column filters.
              </td>
            </tr>
          ) : (
            filteredWagons.map((wagon) => (
              <tr key={wagon.id ?? wagon.serial_number} className="hover:bg-slate-50">
                {WAGON_COLUMNS.map((col) => (
                  <td key={col.key} className="px-2 py-1.5 text-slate-700">{fmt(wagon[col.key])}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DetailDrawer({ record, onClose, onReprocess, reprocessing }) {
  if (!record) return null;

  const sections = [
    {
      title: "Receipt",
      rows: [
        ["RR Number",     fmt(record.rr_number)],
        ["RR Date",       fmtDate(record.rr_date)],
        ["FNR",           fmt(record.fnr)],
        ["Status",        fmt(record.status)],
        ["PDF File",      getFileName(record.pdf_file)],
      ],
    },
    {
      title: "Invoice",
      rows: [
        ["Tax Invoice No",  fmt(record.tax_invoice_number)],
        ["Invoice Number",  fmt(record.invoice_number)],
        ["Invoice Date",    fmtDate(record.invoice_date)],
        ["F-Note Number",   fmt(record.f_note_number)],
        ["F-Note Date",     fmtDate(record.f_note_date)],
        ["Form Number",     fmt(record.form_number)],
        ["Document Type",   fmt(record.document_type)],
      ],
    },
    {
      title: "Route",
      rows: [
        ["From Station",   fmt(record.from_station_name)],
        ["From Code",      fmt(record.from_station_code)],
        ["From Address",   fmt(record.from_station_address)],
        ["To Station",     fmt(record.to_station_name)],
        ["To Code",        fmt(record.to_station_code)],
        ["To Address",     fmt(record.to_station_address)],
        ["Distance (km)",  fmt(record.distance_km)],
        ["Zone",           fmt(record.zone)],
        ["Traffic Type",   fmt(record.traffic_type)],
        ["Charged Via",    fmt(record.charged_via)],
        ["Wagons",         fmt(record.wagons)],
        ["Train/Wagon Load", fmt(record.train_wagon_load)],
      ],
    },
    {
      title: "Parties",
      rows: [
        ["Consignor Name",    fmt(record.consignor_name)],
        ["Consignor Code",    fmt(record.consignor_code)],
        ["Consignor GSTIN",   fmt(record.consignor_gstin)],
        ["Consignor Address", fmt(record.consignor_address)],
        ["Consignee Name",    fmt(record.consignee_name)],
        ["Consignee Code",    fmt(record.consignee_code)],
        ["Consignee GSTIN",   fmt(record.consignee_gstin)],
        ["Consignee Address", fmt(record.consignee_address)],
      ],
    },
    {
      title: "Goods & Weight",
      rows: [
        ["Commodity Code",       fmt(record.commodity_code)],
        ["Commodity Desc",       fmt(record.commodity_description)],
        ["HSN Code",             fmt(record.hsn_code)],
        ["Weight Unit",          fmt(record.weight_unit)],
        ["Total Weight (T)",     fmt(record.total_weight)],
        ["Sender Weight (T)",    fmt(record.sender_weight)],
        ["Actual Weight (T)",    fmt(record.actual_weight)],
        ["Chargeable Wt Normal", fmt(record.chargeable_weight_normal)],
        ["Punitive Weight (T)",  fmt(record.punitive_weight)],
        ["No. of Articles",      fmt(record.no_of_articles)],
        ["Packaging Code",       fmt(record.packaging_code)],
      ],
    },
    {
      title: "Charges",
      rows: [
        ["Rate",          fmt(record.rate)],
        ["Rate Type",     fmt(record.rate_type)],
        ["Risk Rate",     fmt(record.risk_rate)],
        ["Freight",       fmtCurrency(record.freight)],
        ["Total Freight", fmtCurrency(record.total_freight)],
        ["GST Amount",    fmtCurrency(record.gst_amount)],
        ["Handled By",    fmt(record.handled_by)],
        ["Invoiced At",   fmt(record.invoiced_at)],
        ["Weighed At",    fmt(record.weighed_at)],
      ],
    },
    {
      title: "Payment",
      rows: [
        ["Payment Mode",      fmt(record.payment_mode)],
        ["Transaction ID",    fmt(record.transaction_id)],
        ["Transaction Date",  fmtDate(record.transaction_date)],
      ],
    },
    {
      title: "System",
      rows: [
        ["Created At", fmtDate(record.created_at)],
        ["Updated At", fmtDate(record.updated_at)],
        ["Error",      fmt(record.error_message)],
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="relative h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <h3 className="text-[15px] font-bold text-[#102a57]">eT-RR Details</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{getFileName(record.pdf_file)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={record.status} />
            <button
              type="button"
              onClick={() => onReprocess(record)}
              disabled={reprocessing}
              title="Run extraction again on the uploaded PDF"
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reprocessing ? "Re-extracting…" : "Re-extract"}
            </button>
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* wagon details */}
        <div className="border-b border-slate-100">
          <p className="bg-slate-50 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Wagon Details ({record.wagon_details?.length ?? 0})
          </p>
          <WagonTable wagons={record.wagon_details} />
        </div>

        {/* sections */}
        {sections.map((sec) => (
          <div key={sec.title} className="border-b border-slate-100">
            <p className="bg-slate-50 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {sec.title}
            </p>
            <div className="divide-y divide-slate-100 px-5">
              {sec.rows.map(([label, value]) => (
                <div key={label} className="flex gap-3 py-2.5">
                  <span className="w-44 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                  </span>
                  <span className="text-[13px] font-medium text-slate-700 break-words min-w-0">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Table columns mapped to API response fields
───────────────────────────────────────────────────────────────── */
const COLUMNS = [
  { key: "rr_number",               label: "RR No",             width: "w-[130px]" },
  { key: "rr_date",                 label: "RR Date",           width: "w-[110px]", isDate: true },
  { key: "fnr",                     label: "FNR",               width: "w-[150px]" },
  { key: "wagons",                  label: "Wagons",            width: "w-[90px]"  },
  { key: "invoice_number",          label: "Invoice No",        width: "w-[160px]" },
  { key: "invoice_date",            label: "Invoice Date",      width: "w-[110px]", isDate: true },
  { key: "f_note_number",           label: "F-Note No",         width: "w-[120px]" },
  { key: "from_station_name",       label: "From Station",      width: "w-[200px]" },
  { key: "to_station_name",         label: "To Station",        width: "w-[180px]" },
  { key: "consignor_name",          label: "Consignor",         width: "w-[200px]" },
  { key: "consignor_code",          label: "Consignor Code",    width: "w-[130px]" },
  { key: "consignee_name",          label: "Consignee",         width: "w-[200px]" },
  { key: "consignee_code",          label: "Consignee Code",    width: "w-[130px]" },
  { key: "commodity_code",          label: "Commodity Code",    width: "w-[130px]" },
  { key: "commodity_description",   label: "Commodity",         width: "w-[220px]" },
  { key: "total_weight",            label: "Total Wt (T)",      width: "w-[120px]" },
  { key: "actual_weight",           label: "Actual Wt (T)",     width: "w-[120px]" },
  { key: "chargeable_weight_normal",label: "Chargeable Wt (T)", width: "w-[140px]" },
  { key: "punitive_weight",         label: "Punitive Wt (T)",   width: "w-[130px]" },
  { key: "freight",                 label: "Freight (₹)",       width: "w-[140px]", isCurrency: true },
  { key: "gst_amount",              label: "GST (₹)",           width: "w-[120px]", isCurrency: true },
  { key: "total_freight",           label: "Total Freight (₹)", width: "w-[150px]", isCurrency: true },
  { key: "distance_km",             label: "Distance (km)",     width: "w-[120px]" },
  { key: "zone",                    label: "Zone",              width: "w-[80px]"  },
  { key: "hsn_code",                label: "HSN Code",          width: "w-[110px]" },
];

function formatCell(col, value) {
  if (col.isCurrency) return fmtCurrency(value);
  if (col.isDate) return fmtDate(value);
  return fmt(value);
}

const statusLabel = (status) => (STATUS_MAP[status?.toUpperCase()] ?? STATUS_MAP.PENDING).label;

/* horizontal padding is per column so the narrow sticky View cell can still fit the Clear button */
const HIDDEN_COLS_KEY = "nmdc_extraction_hidden_columns";
const STICKY_FILTER_CELL = "sticky z-30 border-r border-slate-200/70 bg-white";
const RECEIPT_FILTER_COLUMNS = [
  { key: "view", type: "none", className: `${STICKY_FILTER_CELL} left-0 w-[80px] min-w-[80px] max-w-[80px] px-2` },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: Object.values(STATUS_MAP).map((s) => s.label),
    getValue: (rec) => statusLabel(rec.status),
    className: `${STICKY_FILTER_CELL} left-[80px] w-[130px] min-w-[130px] max-w-[130px] px-4`,
  },
  {
    key: "pdf_file",
    label: "File",
    getValue: (rec) => getFileName(rec.pdf_file),
    className: `${STICKY_FILTER_CELL} left-[210px] w-[180px] min-w-[180px] max-w-[180px] px-4`,
  },
  ...COLUMNS.map((col) => ({
    key: col.key,
    label: col.label,
    getValue: (rec) => formatCell(col, rec[col.key]),
    className: `${col.width} px-4`,
  })),
  { key: "created_at", label: "Created At", getValue: (rec) => fmtDate(rec.created_at), className: "w-[160px] px-4" },
];

/* ─────────────────────────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────────────────────────── */
function SkeletonRows({ columnCount }) {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b border-slate-100">
      {Array.from({ length: columnCount }).map((__, j) => (
        <td key={j} className="px-4 py-3.5">
          <div className="h-3 animate-pulse rounded-full bg-slate-200"
            style={{ width: `${45 + ((j * 13 + i * 17) % 45)}%` }} />
        </td>
      ))}
    </tr>
  ));
}

/* ─────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────── */
export default function ExtractionPage() {
  const [records, setRecords]       = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage]         = useState(1);
  const [sortBy, setSortBy]                   = useState("created_at");
  const [sortOrder, setSortOrder]             = useState("desc");

  // uploadState: [{ name, status: "queued"|"active"|"polling"|"done"|"error"|"duplicate", errorMsg? }]
  const [uploadState, setUploadState]   = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [reprocessingId, setReprocessingId] = useState(null);
  const [toast, setToast]               = useState({ msg: "", type: "success" });

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  /* client-side sort; while column filters are active this covers every loaded record */
  const sorted = useMemo(() => [...records].sort((a, b) => {
    const av = String(a[sortBy] ?? "").toLowerCase();
    const bv = String(b[sortBy] ?? "").toLowerCase();
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return sortOrder === "asc" ? cmp : -cmp;
  }), [records, sortBy, sortOrder]);

  const fileInputRef = useRef(null);
  const columnVisibility = useColumnVisibility(HIDDEN_COLS_KEY, COLUMNS, {
    onHide: (keys) => keys.forEach((k) => columnFilters.setFilter(k, "")),
  });
  const hiddenCols = columnVisibility.hidden;
  const visibleCols = useMemo(() => COLUMNS.filter((c) => !hiddenCols.includes(c.key)), [hiddenCols]);
  const filterCols = useMemo(
    () => RECEIPT_FILTER_COLUMNS.filter((c) => !hiddenCols.includes(c.key)),
    [hiddenCols],
  );

  const resetPage = useCallback(() => setCurrentPage(1), []);
  const columnFilters = useServerColumnFilters(filterCols, {
    rows: sorted,
    totalCount,
    currentPage,
    pageSize: PAGE_SIZE,
    onChange: resetPage,
  });
  const { serverPage, serverPageSize, isFiltering } = columnFilters;

  function handleFilePick(e) {
    const files = Array.from(e.target.files).filter((f) => f.type === "application/pdf");
    e.target.value = "";
    if (files.length) handleFiles(files);
  }

  /* fetch records */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRailwayReceipts({
        page: serverPage,
        page_size: serverPageSize,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      setRecords(data.results ?? []);
      setTotalCount(data.count ?? 0);
    } catch (err) {
      setError(err?.message || "Failed to load records. Please try again.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [serverPage, serverPageSize, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  /* ── polling helper ──
     Polls fetchRailwayReceiptById every `interval` ms (with backoff),
     until status is COMPLETED or FAILED, or maxWait is exceeded.
     Calls onUpdate(record) on every poll so the table row updates live.
  ── */
  async function pollUntilDone(id, onUpdate, { maxWait = 5 * 60 * 1000, baseInterval = 3000, maxInterval = 15000 } = {}) {
    const start = Date.now();
    let interval = baseInterval;

    while (Date.now() - start < maxWait) {
      await new Promise((r) => setTimeout(r, interval));
      try {
        const record = await fetchRailwayReceiptById(id);
        if (record) {
          onUpdate(record);
          const s = record.status?.toUpperCase();
          if (s === "COMPLETED" || s === "FAILED") return record;
        }
      } catch {
        // ignore transient poll errors, keep retrying
      }
      // backoff: grow interval up to maxInterval
      interval = Math.min(interval * 1.4, maxInterval);
    }

    // timed out — return null so caller can mark as failed
    return null;
  }

  /* ── upload handler — one file at a time, sequential ── */
  async function handleFiles(files) {
    const initial = files.map((f) => ({ name: f.name, status: "queued", elapsed: 0 }));
    setUploadState(initial);

    let successCount = 0;
    let failCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      /* mark active + start elapsed timer */
      const timerStart = Date.now();
      const elapsedTimer = setInterval(() => {
        setUploadState((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, elapsed: Math.floor((Date.now() - timerStart) / 1000) } : f
          )
        );
      }, 1000);

      setUploadState((prev) =>
        prev.map((f, idx) => idx === i ? { ...f, status: "active", elapsed: 0 } : f)
      );

      try {
        /* 1. upload — backend returns a record (possibly PENDING/PROCESSING) */
        const initial = await uploadRailwayReceiptPdf(file);

        /* 2. add the record to the table immediately so the user sees it */
        setRecords((prev) => {
          const exists = prev.some((r) => r.id === initial.id);
          return exists ? prev.map((r) => r.id === initial.id ? initial : r) : [initial, ...prev];
        });
        setTotalCount((prev) => prev + 1);

        const initialStatus = initial.status?.toUpperCase();

        if (initialStatus === "COMPLETED") {
          /* extraction finished synchronously */
          clearInterval(elapsedTimer);
          setUploadState((prev) =>
            prev.map((f, idx) => idx === i ? { ...f, status: "done" } : f)
          );
          successCount++;
        } else if (initialStatus === "FAILED") {
          clearInterval(elapsedTimer);
          setUploadState((prev) =>
            prev.map((f, idx) => idx === i ? { ...f, status: "error", errorMsg: initial.error_message || "Extraction failed" } : f)
          );
          failCount++;
        } else {
          /* 3. PENDING / PROCESSING — poll until done */
          setUploadState((prev) =>
            prev.map((f, idx) => idx === i ? { ...f, status: "polling" } : f)
          );

          const final = await pollUntilDone(
            initial.id,
            (updated) => {
              /* update the table row live on every poll */
              setRecords((prev) =>
                prev.map((r) => r.id === updated.id ? updated : r)
              );
            }
          );

          clearInterval(elapsedTimer);

          if (!final) {
            /* polling timed out */
            setUploadState((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, status: "error", errorMsg: "Timed out waiting for extraction" } : f
              )
            );
            failCount++;
          } else if (final.status?.toUpperCase() === "COMPLETED") {
            setUploadState((prev) =>
              prev.map((f, idx) => idx === i ? { ...f, status: "done" } : f)
            );
            successCount++;
          } else {
            setUploadState((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, status: "error", errorMsg: final.error_message || "Extraction failed" } : f
              )
            );
            failCount++;
          }
        }
      } catch (err) {
        clearInterval(elapsedTimer);
        if (err?.status === 409) {
          const rr = err.data?.existing_rr_number;
          setUploadState((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: "duplicate", errorMsg: rr ? `Already uploaded (RR ${rr})` : "Already uploaded" }
                : f
            )
          );
          duplicateCount++;
        } else {
          setUploadState((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "error", errorMsg: err?.message || "Upload failed" } : f
            )
          );
          failCount++;
        }
      }
    }

    /* summary toast */
    const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
    const duplicateNote = duplicateCount
      ? `${plural(duplicateCount, "duplicate PDF")} rejected — already uploaded.`
      : "";

    if (successCount === 0 && failCount === 0) {
      showToast(duplicateNote, "warning");
    } else if (failCount === 0) {
      showToast(
        `${plural(successCount, "PDF")} extracted successfully.${duplicateNote ? ` ${duplicateNote}` : ""}`,
        duplicateCount ? "warning" : "success",
      );
    } else if (successCount === 0) {
      showToast(`${failCount === 1 ? "Upload" : `All ${failCount} uploads`} failed.${duplicateNote ? ` ${duplicateNote}` : ""}`, "error");
    } else {
      showToast(`${successCount} extracted, ${failCount} failed.${duplicateNote ? ` ${duplicateNote}` : ""}`, "error");
    }

    /* clear progress list after 6 s */
    setTimeout(() => setUploadState([]), 6000);
  }

  async function handleReprocess(record) {
    const applyUpdate = (updated) => {
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRecord((prev) => (prev?.id === updated.id ? updated : prev));
    };
    setReprocessingId(record.id);
    try {
      applyUpdate(await reprocessRailwayReceipt(record.id));
      const final = await pollUntilDone(record.id, applyUpdate);
      if (final?.status?.toUpperCase() === "COMPLETED") {
        showToast(`Re-extracted ${final.rr_number || getFileName(final.pdf_file)} (${final.wagon_details?.length ?? 0} wagons).`);
      } else {
        showToast(final?.error_message || "Re-extraction did not finish. Check that the extraction worker is running.", "error");
      }
    } catch (err) {
      showToast(err?.message || "Unable to re-extract this PDF.", "error");
    } finally {
      setReprocessingId(null);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  }

  function handleSort(field) {
    if (sortBy === field) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortOrder("asc"); }
  }

  const pageRows        = columnFilters.pageRows;
  const completedCount  = records.filter((r) => r.status === "COMPLETED").length;
  const processingCount = records.filter((r) => r.status === "PROCESSING" || r.status === "PENDING").length;
  const failedCount     = records.filter((r) => r.status === "FAILED").length;

  return (
    <>
      <div className="space-y-6 animate-fadeIn">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800">eT-RR Extraction</h2>
            <p className="mt-1 text-[14px] text-slate-500">
              Upload eT-RR PDF files — the backend extracts and stores all receipt data automatically.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <ExtractionIcon size={16} className="text-blue-600" />
            <span className="text-[13px] font-semibold text-slate-700">{totalCount} receipts</span>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total",      value: loading ? "—" : totalCount,      color: "text-slate-700",   bg: "bg-slate-50 border-slate-200"    },
            { label: "Completed",  value: loading ? "—" : completedCount,  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { label: "Processing", value: loading ? "—" : processingCount, color: "text-amber-700",   bg: "bg-amber-50 border-amber-200"     },
            { label: "Failed",     value: loading ? "—" : failedCount,     color: "text-red-600",     bg: "bg-red-50 border-red-200"         },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 ${bg}`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-1 text-[22px] font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Toast ── */}
        {toast.msg && (
          <div className={`rounded-lg border px-4 py-2.5 text-[13px] font-medium ${
            toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : toast.type === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}>
            {toast.msg}
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-[13px] font-medium text-red-700">{error}</p>
            <button type="button" onClick={load}
              className="ml-4 shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Search + toolbar ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by RR No, FNR, consignor, consignee, commodity…"
              value={search}
              onChange={setSearch}
              showFilter={false}
            />
          </div>
          <ColumnSettingsMenu {...columnVisibility.menuProps} />
          <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={handleFilePick} />
          <button type="button" disabled={uploadState.length > 0} onClick={() => fileInputRef.current?.click()}
            className={`${ICON_BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-60`}
            title={uploadState.length > 0 ? "Uploading…" : "Upload PDFs (multiple allowed)"}>
            <Upload size={18} />
          </button>
        </div>
        <UploadProgress uploadState={uploadState} />

        {/* ── Table ── */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 whitespace-nowrap text-[13px]"
              style={{ minWidth: `${visibleCols.length * 130 + 400}px` }}>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {/* sticky: view */}
                  <th className="sticky left-0 z-30 w-[80px] min-w-[80px] max-w-[80px] border-r border-slate-200/70 bg-slate-50 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    View
                  </th>
                  {/* sticky: status */}
                  <th className="sticky left-[80px] z-30 w-[130px] min-w-[130px] max-w-[130px] border-r border-slate-200/70 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Status
                  </th>
                  {/* sticky: file */}
                  <th className="sticky left-[210px] z-30 w-[180px] min-w-[180px] max-w-[180px] border-r border-slate-200/70 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    File
                  </th>
                  {/* data columns */}
                  {visibleCols.map((col) => (
                    <th key={col.key} className={`${col.width} px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500`}>
                      <SortHeaderButton label={col.label} field={col.key} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    </th>
                  ))}
                  <th className="w-[160px] px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Created At
                  </th>
                </tr>
                <ColumnFilterRow {...columnFilters.filterRowProps} rows={records} cellClassName="py-2" />
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <SkeletonRows columnCount={visibleCols.length + 4} />
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={visibleCols.length + 4} className="py-16 text-center">
                      <ExtractionIcon size={36} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-[14px] font-semibold text-slate-500">
                        {debouncedSearch || isFiltering ? "No records match your search or filters" : "No receipts yet"}
                      </p>
                      <p className="mt-1 text-[12px] text-slate-400">
                        {debouncedSearch || isFiltering
                          ? "Try a different search term or clear the column filters."
                          : "Click \"Upload PDFs\" to get started."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((rec) => (
                    <tr key={rec.id}
                      className={`transition-colors hover:bg-blue-50/30 ${
                        rec.status === "PROCESSING" || rec.status === "PENDING"
                          ? "bg-amber-50/30"
                          : rec.status === "FAILED"
                            ? "bg-red-50/20"
                            : ""
                      }`}
                    >
                      {/* view */}
                      <td className="sticky left-0 z-20 w-[80px] min-w-[80px] max-w-[80px] border-r border-slate-200/70 bg-white px-4 py-3 text-center shadow-[2px_0_4px_-2px_rgba(15,23,42,0.06)]">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(rec)}
                          title="View details"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>

                      {/* status */}
                      <td className="sticky left-[80px] z-20 w-[130px] min-w-[130px] max-w-[130px] border-r border-slate-200/70 bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(15,23,42,0.06)]">
                        <StatusBadge status={rec.status} />
                      </td>

                      {/* file */}
                      <td className="sticky left-[210px] z-20 w-[180px] min-w-[180px] max-w-[180px] border-r border-slate-200/70 bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(15,23,42,0.06)]">
                        <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-400">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="truncate max-w-[140px]" title={getFileName(rec.pdf_file)}>
                            {getFileName(rec.pdf_file)}
                          </span>
                        </span>
                      </td>

                      {/* data columns */}
                      {visibleCols.map((col) => (
                        <td key={col.key} className={`${col.width} px-4 py-3 text-slate-700`}>
                          {formatCell(col, rec[col.key])}
                        </td>
                      ))}

                      {/* created at */}
                      <td className="w-[160px] px-4 py-3 text-[12px] text-slate-500">
                        {fmtDate(rec.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          {!loading && !error && columnFilters.count > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
              <Pagination
                currentPage={currentPage}
                totalPages={columnFilters.totalPages}
                totalCount={columnFilters.count}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {selectedRecord && (
        <DetailDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onReprocess={handleReprocess}
          reprocessing={reprocessingId === selectedRecord.id}
        />
      )}
    </>
  );
}
