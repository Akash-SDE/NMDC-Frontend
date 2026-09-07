import { useRef, useState } from "react";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import { ExtractionIcon } from "../../../components/icons";

/* ── Status badge ──────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    extracted: "border-emerald-200 bg-emerald-50 text-emerald-700",
    processing: "border-amber-200 bg-amber-50 text-amber-700",
    failed: "border-red-200 bg-red-50 text-red-700",
  };
  const labels = { extracted: "Extracted", processing: "Processing", failed: "Failed" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[status] ?? map.extracted}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "extracted"
            ? "bg-emerald-500"
            : status === "processing"
              ? "bg-amber-500"
              : "bg-red-500"
        }`}
      />
      {labels[status] ?? status}
    </span>
  );
}

/* ── Upload zone ───────────────────────────────────────────────── */
function UploadZone({ onFiles, uploading }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf");
    if (files.length) onFiles(files);
  }

  function handleChange(e) {
    const files = Array.from(e.target.files).filter((f) => f.type === "application/pdf");
    if (files.length) onFiles(files);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`
        relative flex cursor-pointer flex-col items-center justify-center gap-3
        rounded-xl border-2 border-dashed px-6 py-10 text-center
        transition-all duration-200
        ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"}
        ${uploading ? "pointer-events-none opacity-60" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
        {uploading ? (
          <svg className="h-7 w-7 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        )}
      </div>

      <div>
        <p className="text-[14px] font-semibold text-slate-700">
          {uploading ? "Processing PDFs…" : "Drop eT-RR PDFs here or click to browse"}
        </p>
        <p className="mt-1 text-[12px] text-slate-500">
          Supports multiple PDF files · Data will be extracted and stored automatically
        </p>
      </div>

      {!uploading && (
        <span className="rounded-lg border border-blue-200 bg-white px-4 py-1.5 text-[12px] font-semibold text-blue-700 shadow-sm">
          Choose Files
        </span>
      )}
    </div>
  );
}

/* ── Columns definition ────────────────────────────────────────── */
const COLUMNS = [
  { key: "rrNo",          label: "RR No",           width: "w-[120px]" },
  { key: "rrDate",        label: "RR Date",          width: "w-[110px]" },
  { key: "fnr",           label: "FNR",              width: "w-[150px]" },
  { key: "invoiceNo",     label: "Invoice No",       width: "w-[110px]" },
  { key: "invoiceDate",   label: "Invoice Date",     width: "w-[110px]" },
  { key: "fromStation",   label: "From Station",     width: "w-[180px]" },
  { key: "toStation",     label: "To Station",       width: "w-[160px]" },
  { key: "consignorName", label: "Consignor",        width: "w-[200px]" },
  { key: "consigneeName", label: "Consignee",        width: "w-[180px]" },
  { key: "commodity",     label: "Commodity",        width: "w-[220px]" },
  { key: "wagons",        label: "Wagons",           width: "w-[80px]"  },
  { key: "totalWeight",   label: "Total Wt (T)",     width: "w-[110px]" },
  { key: "chargeableWt",  label: "Chargeable Wt (T)", width: "w-[130px]" },
  { key: "freight",       label: "Freight (₹)",      width: "w-[130px]" },
  { key: "totalFreight",  label: "Total Freight (₹)", width: "w-[140px]" },
  { key: "distanceKm",    label: "Distance (km)",    width: "w-[110px]" },
  { key: "zone",          label: "Zone",             width: "w-[80px]"  },
  { key: "hsnCode",       label: "HSN Code",         width: "w-[110px]" },
];

/* ── Mock seed data (mirrors the uploaded PDF) ─────────────────── */
const SEED_ROWS = [
  {
    id: "1",
    status: "extracted",
    fileName: "NK-123 PD Industries.pdf",
    uploadedAt: "29-05-2026 13:26",
    rrNo: "281003104",
    rrDate: "29-05-2026",
    fnr: "26052623765",
    invoiceNo: "56",
    invoiceDate: "29-05-2026",
    fromStation: "NMDC IRON ORE LOADING DEPOSITE NO. 5 SIDING - BACHELI",
    toStation: "BADEARAPUR, 22-CHHATTISGARH",
    consignorName: "M/S NATIONAL MINERAL DEVELOPMENT CORPORATION",
    consigneeName: "M/S P.D. INDUSTIRIES PVT. LTD",
    commodity: "CALIBRATED LUMP IRON ORE (RAKE DEMAND)",
    wagons: 59,
    totalWeight: 4516.4,
    chargeableWt: 4516.4,
    freight: "1400987.28",
    totalFreight: "1975553",
    distanceKm: 144,
    zone: "ECO",
    hsnCode: "26011119",
  },
];

/* ── Detail drawer ─────────────────────────────────────────────── */
function DetailDrawer({ row, onClose }) {
  if (!row) return null;
  const fields = [
    ["RR No", row.rrNo],
    ["RR Date", row.rrDate],
    ["FNR", row.fnr],
    ["Invoice No", row.invoiceNo],
    ["Invoice Date", row.invoiceDate],
    ["From Station", row.fromStation],
    ["To Station", row.toStation],
    ["Consignor", row.consignorName],
    ["Consignee", row.consigneeName],
    ["Commodity", row.commodity],
    ["Wagons", row.wagons],
    ["Total Weight (T)", row.totalWeight],
    ["Chargeable Weight (T)", row.chargeableWt],
    ["Freight (₹)", row.freight],
    ["Total Freight (₹)", row.totalFreight],
    ["Distance (km)", row.distanceKm],
    ["Zone", row.zone],
    ["HSN Code", row.hsnCode],
    ["File", row.fileName],
    ["Uploaded At", row.uploadedAt],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="relative h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <h3 className="text-[15px] font-bold text-[#102a57]">eT-RR Details</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{row.fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="divide-y divide-slate-100 px-5 py-4">
          {fields.map(([label, value]) => (
            <div key={label} className="flex gap-3 py-2.5">
              <span className="w-40 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </span>
              <span className="text-[13px] font-medium text-slate-700 break-words">{value ?? "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function ExtractionPage() {
  const [rows, setRows] = useState(SEED_ROWS);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rrDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedRow, setSelectedRow] = useState(null);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  /* Simulate upload + extraction */
  async function handleFiles(files) {
    setUploading(true);

    const pending = files.map((f) => ({
      id: String(Date.now() + Math.random()),
      status: "processing",
      fileName: f.name,
      uploadedAt: new Date().toLocaleString("en-IN", { hour12: false }),
      rrNo: "—", rrDate: "—", fnr: "—", invoiceNo: "—", invoiceDate: "—",
      fromStation: "—", toStation: "—", consignorName: "—", consigneeName: "—",
      commodity: "—", wagons: "—", totalWeight: "—", chargeableWt: "—",
      freight: "—", totalFreight: "—", distanceKm: "—", zone: "—", hsnCode: "—",
    }));

    setRows((prev) => [...pending, ...prev]);

    /* Simulate backend extraction delay (2 s) */
    await new Promise((res) => setTimeout(res, 2000));

    setRows((prev) =>
      prev.map((r) => {
        const match = pending.find((p) => p.id === r.id);
        if (!match) return r;
        return {
          ...r,
          status: "extracted",
          rrNo: `RR-${Math.floor(100000000 + Math.random() * 900000000)}`,
          rrDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
          fnr: `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
          invoiceNo: `${Math.floor(10 + Math.random() * 90)}`,
          invoiceDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
          fromStation: "NMDC IRON ORE LOADING DEPOSITE - BACHELI",
          toStation: "BADEARAPUR, 22-CHHATTISGARH",
          consignorName: "M/S NATIONAL MINERAL DEVELOPMENT CORPORATION",
          consigneeName: "M/S P.D. INDUSTIRIES PVT. LTD",
          commodity: "CALIBRATED LUMP IRON ORE (RAKE DEMAND)",
          wagons: Math.floor(55 + Math.random() * 10),
          totalWeight: +(4400 + Math.random() * 200).toFixed(1),
          chargeableWt: +(4400 + Math.random() * 200).toFixed(1),
          freight: (1300000 + Math.random() * 200000).toFixed(2),
          totalFreight: (1900000 + Math.random() * 200000).toFixed(0),
          distanceKm: 144,
          zone: "ECO",
          hsnCode: "26011119",
        };
      }),
    );

    setUploading(false);
    showToast(`${files.length} PDF${files.length > 1 ? "s" : ""} extracted successfully.`);
  }

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return COLUMNS.some((col) =>
      String(r[col.key] ?? "").toLowerCase().includes(q),
    ) || r.fileName.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = String(a[sortBy] ?? "").toLowerCase();
    const bv = String(b[sortBy] ?? "").toLowerCase();
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const extractedCount = rows.filter((r) => r.status === "extracted").length;
  const processingCount = rows.filter((r) => r.status === "processing").length;
  const failedCount = rows.filter((r) => r.status === "failed").length;

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800">
              eT-RR Extraction
            </h2>
            <p className="mt-1 text-[14px] text-slate-500">
              Upload eT-RR PDF files to automatically extract and store railway receipt data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExtractionIcon size={18} className="text-blue-600" />
            <span className="text-[13px] font-semibold text-slate-600">
              {extractedCount} records extracted
            </span>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
          {[
            { label: "Total Uploaded", value: rows.length, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
            { label: "Extracted",       value: extractedCount, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { label: "Processing",      value: processingCount, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 ${bg}`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-1 text-[22px] font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Upload zone ── */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-[15px] font-bold text-[#102a57]">Upload PDFs</h3>
          <UploadZone onFiles={handleFiles} uploading={uploading} />
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] font-medium text-emerald-700">
            {toast}
          </div>
        )}

        {/* ── Search ── */}
        <SearchBar
          placeholder="Search by RR No, consignor, consignee, commodity, file name…"
          value={search}
          onChange={setSearch}
          showFilter={false}
        />

        {/* ── Table ── */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[2400px] border-separate border-spacing-0 whitespace-nowrap text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {/* Fixed: Actions */}
                  <th className="sticky left-0 z-30 w-[100px] border-r border-slate-200/70 bg-slate-50 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    View
                  </th>
                  {/* Fixed: Status */}
                  <th className="sticky left-[100px] z-30 w-[120px] border-r border-slate-200/70 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Status
                  </th>
                  {/* Fixed: File name */}
                  <th className="sticky left-[220px] z-30 w-[180px] border-r border-slate-200/70 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    File
                  </th>
                  {/* Dynamic columns */}
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`${col.width} px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500`}
                    >
                      <SortHeaderButton
                        label={col.label}
                        field={col.key}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </th>
                  ))}
                  {/* Uploaded at */}
                  <th className="w-[150px] px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Uploaded At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sorted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS.length + 4}
                      className="py-16 text-center text-[13px] text-slate-400"
                    >
                      No records found. Upload eT-RR PDFs to get started.
                    </td>
                  </tr>
                ) : (
                  sorted.map((row) => (
                    <tr
                      key={row.id}
                      className={`transition-colors hover:bg-blue-50/30 ${
                        row.status === "processing" ? "animate-pulse bg-amber-50/40" : ""
                      }`}
                    >
                      {/* View button */}
                      <td className="sticky left-0 z-20 w-[100px] border-r border-slate-200/70 bg-white px-4 py-3 text-center shadow-[2px_0_4px_-2px_rgba(15,23,42,0.06)]">
                        <button
                          type="button"
                          onClick={() => setSelectedRow(row)}
                          disabled={row.status !== "extracted"}
                          title="View details"
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                            row.status === "extracted"
                              ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                              : "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                          }`}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="sticky left-[100px] z-20 w-[120px] border-r border-slate-200/70 bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(15,23,42,0.06)]">
                        <StatusBadge status={row.status} />
                      </td>

                      {/* File name */}
                      <td className="sticky left-[220px] z-20 w-[180px] border-r border-slate-200/70 bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(15,23,42,0.06)]">
                        <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-400">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="truncate max-w-[140px]" title={row.fileName}>
                            {row.fileName}
                          </span>
                        </span>
                      </td>

                      {/* Data columns */}
                      {COLUMNS.map((col) => (
                        <td key={col.key} className={`${col.width} px-4 py-3 text-slate-700`}>
                          {col.key === "freight" || col.key === "totalFreight"
                            ? row[col.key] !== "—"
                              ? `₹${Number(row[col.key]).toLocaleString("en-IN")}`
                              : "—"
                            : String(row[col.key] ?? "—")}
                        </td>
                      ))}

                      {/* Uploaded at */}
                      <td className="w-[150px] px-4 py-3 text-[12px] text-slate-500">
                        {row.uploadedAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {sorted.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-2.5">
              <p className="text-[12px] text-slate-500">
                Showing {sorted.length} of {rows.length} record{rows.length !== 1 ? "s" : ""}
                {failedCount > 0 && (
                  <span className="ml-3 font-semibold text-red-600">
                    · {failedCount} failed
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail drawer ── */}
      {selectedRow && (
        <DetailDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </>
  );
}
