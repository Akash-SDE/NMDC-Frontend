import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchRakeExtractions,
  fetchRakeExtractionDetail,
  uploadRakeDocument,
  reprocessRakeDocument,
} from "../../../services/extractionService";
import SearchBar from "../../../components/shared/SearchBar";
import Pagination from "../../../components/shared/Pagination";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ColumnFilterRow from "../../../components/shared/ColumnFilterRow";
import { useColumnFilters, useServerColumnFilters } from "../../../hooks/useColumnFilters";
import { ExtractionIcon } from "../../../components/icons";
import DocumentSlotCell from "../components/DocumentSlotCell";
import RakeExtractionDetailModal from "../components/RakeExtractionDetailModal";
import {
  DOCUMENT_TYPES,
  DOC_STATUS_BADGE,
  RAKE_STATUS,
  RAKE_STATUS_BADGE,
} from "../utils/rakeExtractionStatus";

const PAGE_SIZE = 10;

function RakeStatusBadge({ status }) {
  const s = (status || RAKE_STATUS.PENDING).toUpperCase();
  const meta = RAKE_STATUS_BADGE[s] ?? RAKE_STATUS_BADGE.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

const slotStatusLabel = (slot) =>
  (DOC_STATUS_BADGE[(slot?.status || "PENDING").toUpperCase()] ?? DOC_STATUS_BADGE.PENDING).label;

const rakeStatusLabel = (row) =>
  (RAKE_STATUS_BADGE[(row?.status || RAKE_STATUS.PENDING).toUpperCase()] ?? RAKE_STATUS_BADGE.PENDING).label;

const FILTER_COLUMNS = [
  { key: "view", type: "none", className: "w-[72px] px-3" },
  {
    key: "rake_number",
    label: "Rake",
    getValue: (row) => row.rake_number || "",
    className: "min-w-[160px] px-4",
  },
  {
    key: "rr",
    label: "RR",
    type: "select",
    options: Object.values(DOC_STATUS_BADGE).map((b) => b.label),
    getValue: (row) => slotStatusLabel(row.rr),
    className: "min-w-[180px] px-4",
  },
  {
    key: "rtp",
    label: "RTP",
    type: "select",
    options: Object.values(DOC_STATUS_BADGE).map((b) => b.label),
    getValue: (row) => slotStatusLabel(row.rtp),
    className: "min-w-[180px] px-4",
  },
  {
    key: "invoice",
    label: "Invoice",
    type: "select",
    options: Object.values(DOC_STATUS_BADGE).map((b) => b.label),
    getValue: (row) => slotStatusLabel(row.invoice),
    className: "min-w-[180px] px-4",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: Object.values(RAKE_STATUS_BADGE).map((b) => b.label),
    getValue: rakeStatusLabel,
    className: "min-w-[140px] px-4",
  },
];

export default function ExtractionPage() {
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("rake_number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [uploadingKey, setUploadingKey] = useState(null);
  const [detailRakeId, setDetailRakeId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reprocessingType, setReprocessingType] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const fileInputsRef = useRef({});

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let av;
      let bv;
      if (sortBy === "status") {
        av = rakeStatusLabel(a);
        bv = rakeStatusLabel(b);
      } else {
        av = String(a[sortBy] ?? "").toLowerCase();
        bv = String(b[sortBy] ?? "").toLowerCase();
      }
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [rows, sortBy, sortOrder]);

  const resetPage = useCallback(() => setCurrentPage(1), []);
  const columnFilters = useServerColumnFilters(FILTER_COLUMNS, {
    rows: sorted,
    totalCount,
    currentPage,
    pageSize: PAGE_SIZE,
    onChange: resetPage,
  });
  const { serverPage, serverPageSize, isFiltering, pageRows } = columnFilters;

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRakeExtractions({
        page: serverPage,
        page_size: serverPageSize,
        order_by: sortBy === "rake_number" ? "rake_number" : "id",
        order_type: sortOrder,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      setRows(data.results ?? []);
      setTotalCount(data.count ?? 0);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load rakes.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [serverPage, serverPageSize, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    load();
  }, [load]);

  const mergeRow = useCallback((rakeId, patch) => {
    setRows((prev) =>
      prev.map((row) => (row.rake_id === rakeId ? { ...row, ...patch } : row)),
    );
  }, []);

  async function pollRakeUntilSettled(rakeId, documentType) {
    const maxWait = 5 * 60 * 1000;
    const start = Date.now();
    let interval = 3000;
    while (Date.now() - start < maxWait) {
      await new Promise((r) => setTimeout(r, interval));
      try {
        const detailFresh = await fetchRakeExtractionDetail(rakeId);
        const slotKey =
          documentType === DOCUMENT_TYPES.RR
            ? "rr"
            : documentType === DOCUMENT_TYPES.RTP
              ? "rtp"
              : "invoice";
        mergeRow(rakeId, {
          rr: detailFresh.rr
            ? {
                id: detailFresh.rr.id,
                status: detailFresh.rr.status,
                error_message: detailFresh.rr.error_message,
                pdf_file: detailFresh.rr.pdf_file,
              }
            : detailFresh.rr,
          rtp: detailFresh.rtp
            ? {
                id: detailFresh.rtp.id,
                status: detailFresh.rtp.status,
                error_message: detailFresh.rtp.error_message,
                pdf_file: detailFresh.rtp.pdf_file,
              }
            : detailFresh.rtp,
          invoice: detailFresh.invoice
            ? {
                id: detailFresh.invoice.id,
                status: detailFresh.invoice.status,
                error_message: detailFresh.invoice.error_message,
                pdf_file: detailFresh.invoice.pdf_file,
              }
            : detailFresh.invoice,
          status: detailFresh.status,
        });
        const slot = detailFresh[slotKey];
        const st = slot?.status?.toUpperCase();
        if (st === "COMPLETED" || st === "FAILED") {
          await load();
          return;
        }
      } catch {
        /* retry */
      }
      interval = Math.min(interval * 1.3, 12000);
    }
    showToast("Extraction is taking longer than expected. Refresh to check status.", "warning");
  }

  function triggerUpload(rakeId, documentType) {
    const key = `${rakeId}-${documentType}`;
    const input = fileInputsRef.current[key];
    input?.click();
  }

  async function handleFileSelected(rakeId, documentType, event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Only PDF files are allowed.", "error");
      return;
    }
    const uploadKey = `${rakeId}-${documentType}`;
    setUploadingKey(uploadKey);
    try {
      await uploadRakeDocument(rakeId, documentType, file);
      mergeRow(rakeId, {
        [documentType === DOCUMENT_TYPES.RR
          ? "rr"
          : documentType === DOCUMENT_TYPES.RTP
            ? "rtp"
            : "invoice"]: { status: "PROCESSING" },
        status: RAKE_STATUS.IN_PROGRESS,
      });
      showToast(`${documentType} upload started. Extracting…`);
      await pollRakeUntilSettled(rakeId, documentType);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Upload failed.";
      showToast(typeof msg === "string" ? msg : "Upload failed.", "error");
    } finally {
      setUploadingKey(null);
    }
  }

  async function openDetail(rakeId) {
    setDetailRakeId(rakeId);
    setDetailLoading(true);
    setDetail(null);
    try {
      setDetail(await fetchRakeExtractionDetail(rakeId));
    } catch {
      showToast("Could not load rake details.", "error");
      setDetailRakeId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleReprocess(documentType) {
    if (!detailRakeId) return;
    setReprocessingType(documentType);
    try {
      await reprocessRakeDocument(detailRakeId, documentType);
      showToast(`${documentType} re-extraction started.`);
      await pollRakeUntilSettled(detailRakeId, documentType);
      setDetail(await fetchRakeExtractionDetail(detailRakeId));
      await load();
    } catch (err) {
      showToast(err?.response?.data?.detail || err?.message || "Re-extract failed.", "error");
    } finally {
      setReprocessingType(null);
    }
  }

  function handleSort(field) {
    if (sortBy === field) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  const stats = useMemo(() => {
    const counts = { completed: 0, inProgress: 0, pending: 0 };
    rows.forEach((row) => {
      const s = (row.status || "").toUpperCase();
      if (s === RAKE_STATUS.COMPLETED) counts.completed += 1;
      else if (s === RAKE_STATUS.IN_PROGRESS) counts.inProgress += 1;
      else counts.pending += 1;
    });
    return counts;
  }, [rows]);

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800">eT-RR Extraction</h2>
            <p className="mt-1 text-[14px] text-slate-500">
              One row per rake — upload RR, RTP, and Invoice PDFs independently.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <ExtractionIcon size={16} className="text-blue-600" />
            <span className="text-[13px] font-semibold text-slate-700">{totalCount} rakes</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: loading ? "—" : totalCount, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
            { label: "Completed", value: loading ? "—" : stats.completed, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { label: "In Progress", value: loading ? "—" : stats.inProgress, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
            { label: "Pending", value: loading ? "—" : stats.pending, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 ${bg}`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-1 text-[22px] font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {toast.msg ? (
          <div
            className={`rounded-lg border px-4 py-2.5 text-[13px] font-medium ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : toast.type === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {toast.msg}
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-[13px] font-medium text-red-700">{error}</p>
            <button type="button" onClick={load} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600">
              Retry
            </button>
          </div>
        ) : null}

        <SearchBar
          placeholder="Search by rake number…"
          value={search}
          onChange={setSearch}
          showFilter={false}
        />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 whitespace-nowrap text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-3 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    View
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Rake" field="rake_number" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">RR</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">RTP</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">Invoice</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    <SortHeaderButton label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </th>
                </tr>
                <ColumnFilterRow {...columnFilters.filterRowProps} rows={rows} cellClassName="py-2" />
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Loading rakes…
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <ExtractionIcon size={36} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-[14px] font-semibold text-slate-500">No rakes match your filters</p>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.rake_id} className="hover:bg-blue-50/30">
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openDetail(row.rake_id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="View details"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#2563eb]">{row.rake_number || "—"}</td>
                      {[DOCUMENT_TYPES.RR, DOCUMENT_TYPES.RTP, DOCUMENT_TYPES.INVOICE].map((docType) => {
                        const slotKey =
                          docType === DOCUMENT_TYPES.RR
                            ? "rr"
                            : docType === DOCUMENT_TYPES.RTP
                              ? "rtp"
                              : "invoice";
                        const inputKey = `${row.rake_id}-${docType}`;
                        return (
                          <td key={docType} className="px-4 py-3 align-middle">
                            <input
                              ref={(el) => {
                                fileInputsRef.current[inputKey] = el;
                              }}
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => handleFileSelected(row.rake_id, docType, e)}
                            />
                            <DocumentSlotCell
                              slot={row[slotKey]}
                              uploading={uploadingKey === inputKey}
                              onUpload={() => triggerUpload(row.rake_id, docType)}
                            />
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">
                        <RakeStatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && columnFilters.count > 0 ? (
            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
              <Pagination
                currentPage={currentPage}
                totalPages={columnFilters.totalPages}
                totalCount={columnFilters.count}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : null}
        </div>
      </div>

      {detailRakeId ? (
        <RakeExtractionDetailModal
          detail={detail}
          loading={detailLoading}
          onReprocess={handleReprocess}
          reprocessingType={reprocessingType}
          onClose={() => {
            setDetailRakeId(null);
            setDetail(null);
          }}
        />
      ) : null}
    </>
  );
}
