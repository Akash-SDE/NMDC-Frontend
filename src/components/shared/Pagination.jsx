function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) items.push("start-ellipsis");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("end-ellipsis");
  items.push(totalPages);
  return items;
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange,
  showPrevNext = false,
  pageSizeOptions,
  onPageSizeChange,
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  function handlePageClick(page) {
    if (page >= 1 && page <= safeTotalPages && page !== currentPage && onPageChange) {
      onPageChange(page);
    }
  }

  const pages = buildPageItems(currentPage, safeTotalPages);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 3xl:pt-6 5xl:pt-8 border-t border-slate-100">
      {/* Info text */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">{startItem}</span> to{" "}
          <span className="font-semibold text-slate-700">{endItem}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalCount}</span>{" "}
          results
        </p>
        {pageSizeOptions?.length && onPageSizeChange ? (
          <label className="flex items-center gap-1.5 text-[12px] 3xl:text-[14px] text-slate-500">
            Rows
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[12px] 3xl:text-[14px] text-slate-700 outline-none focus:border-blue-400"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1 3xl:gap-1.5 5xl:gap-2">
        {/* Previous */}
        {showPrevNext ? (
          <button
            type="button"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 3xl:px-4 3xl:py-2 rounded-lg text-[12px] 3xl:text-[14px] 5xl:text-[18px] font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
        ) : (
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-8 w-8 3xl:h-10 3xl:w-10 5xl:h-12 5xl:w-12 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Page numbers */}
        {pages.map((page) =>
          typeof page === "number" ? (
            <button
              type="button"
              key={page}
              onClick={() => handlePageClick(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`flex h-8 min-w-8 px-1 3xl:h-10 3xl:min-w-10 5xl:h-12 5xl:min-w-12 items-center justify-center rounded-lg text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-semibold transition-all ${
                page === currentPage
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {page}
            </button>
          ) : (
            <span
              key={page}
              className="flex h-8 w-6 3xl:h-10 items-center justify-center text-[13px] 3xl:text-[15px] text-slate-400"
            >
              …
            </span>
          ),
        )}

        {/* Next */}
        {showPrevNext ? (
          <button
            type="button"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage >= safeTotalPages}
            className="px-3 py-1.5 3xl:px-4 3xl:py-2 rounded-lg text-[12px] 3xl:text-[14px] 5xl:text-[18px] font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            aria-label="Next page"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage >= safeTotalPages}
            className="flex h-8 w-8 3xl:h-10 3xl:w-10 5xl:h-12 5xl:w-12 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
