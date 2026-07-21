import { useCallback, useMemo, useState } from "react";

export function usePagination({ totalCount, pageSize = 10, initialPage = 1 }) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  );

  const clampPage = useCallback(
    (page) => Math.min(Math.max(1, page), totalPages),
    [totalPages],
  );

  const goToPage = useCallback(
    (page) => setCurrentPage(clampPage(page)),
    [clampPage],
  );

  const paginate = useCallback(
    (items) => {
      const start = (currentPage - 1) * pageSize;
      return items.slice(start, start + pageSize);
    },
    [currentPage, pageSize],
  );

  const range = useMemo(() => {
    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);
    return { startItem, endItem };
  }, [currentPage, pageSize, totalCount]);

  return {
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage: goToPage,
    paginate,
    range,
  };
}
