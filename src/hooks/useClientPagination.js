import { useCallback, useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Client-side pagination over an already filtered/sorted array.
 * Pass `resetKey` (e.g. search text + active tab) to jump back to page 1 when filters change.
 */
export function useClientPagination(items, { pageSize: initialPageSize = DEFAULT_PAGE_SIZE, resetKey = "" } = {}) {
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [pageState, setPageState] = useState({ page: 1, key: resetKey });

  const totalCount = items?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const requestedPage = pageState.key === resetKey ? pageState.page : 1;
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);

  const setCurrentPage = useCallback(
    (page) => setPageState({ page, key: resetKey }),
    [resetKey],
  );

  const setPageSize = useCallback(
    (size) => {
      setPageSizeState(size);
      setPageState({ page: 1, key: resetKey });
    },
    [resetKey],
  );

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return (items ?? []).slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  return {
    pageItems,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    paginationProps: {
      currentPage,
      totalPages,
      totalCount,
      pageSize,
      onPageChange: setCurrentPage,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      onPageSizeChange: setPageSize,
    },
  };
}
