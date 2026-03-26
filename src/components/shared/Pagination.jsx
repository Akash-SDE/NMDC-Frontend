export default function Pagination({
  currentPage = 1,
  totalPages = 3,
  totalCount = 24,
  pageSize = 5,
  onPageChange,
  showPrevNext = false,
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  function handlePageClick(page) {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  }

  // Generate page numbers to display
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 3xl:pt-6 5xl:pt-8 border-t border-slate-100">
      {/* Info text */}
      <p className="text-[12px] 3xl:text-[14px] 5xl:text-[18px] text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-700">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalCount}</span>{" "}
        results
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1 3xl:gap-1.5 5xl:gap-2">
        {/* Previous */}
        {showPrevNext ? (
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 3xl:px-4 3xl:py-2 rounded-lg text-[12px] 3xl:text-[14px] 5xl:text-[18px] font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
        ) : (
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
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
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`flex h-8 w-8 3xl:h-10 3xl:w-10 5xl:h-12 5xl:w-12 items-center justify-center rounded-lg text-[13px] 3xl:text-[15px] 5xl:text-[19px] font-semibold transition-all ${
              page === currentPage
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        {showPrevNext ? (
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 3xl:px-4 3xl:py-2 rounded-lg text-[12px] 3xl:text-[14px] 5xl:text-[18px] font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
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
