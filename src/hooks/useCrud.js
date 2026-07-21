import { useCallback, useMemo, useState } from "react";
import { useToast } from "./useToast";
import { usePagination } from "./usePagination";
import { useSorting } from "./useSorting";
import { useSearch } from "./useFilters";

/**
 * Generic local CRUD hook for list views.
 * Works with in-memory arrays or Redux-backed selectors passed via `items` + setters.
 */
export function useCrud({
  items,
  setItems,
  keyField = "id",
  pageSize = 10,
  initialSortField = null,
}) {
  const { toast, showToast } = useToast();
  const { search, setSearch, filterBySearch } = useSearch();
  const { sortBy, sortOrder, handleSort, sortItems } = useSorting(initialSortField);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [statusToggleItem, setStatusToggleItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusToggleOpen, setIsStatusToggleOpen] = useState(false);

  const searched = useMemo(
    () =>
      filterBySearch(items, (item) =>
        Object.values(item).map((v) => String(v ?? "")),
      ),
    [items, filterBySearch],
  );

  const sorted = useMemo(
    () =>
      sortItems(searched, (row, field) => {
        const value = row[field];
        return typeof value === "string" ? value.toLowerCase() : value ?? "";
      }),
    [searched, sortItems],
  );

  const { currentPage, totalPages, paginate, setCurrentPage, range } =
    usePagination({ totalCount: sorted.length, pageSize });

  const pageItems = useMemo(
    () => paginate(sorted),
    [paginate, sorted],
  );

  const addItem = useCallback(
    (newItem) => {
      const exists = items.find(
        (d) =>
          String(d[keyField]).toLowerCase() ===
          String(newItem[keyField]).toLowerCase(),
      );
      if (exists) {
        showToast(`Item with key "${newItem[keyField]}" already exists.`, "error");
        return false;
      }
      setItems([newItem, ...items]);
      setIsFormOpen(false);
      setEditingItem(null);
      showToast(`"${newItem[keyField]}" added successfully.`);
      return true;
    },
    [items, keyField, setItems, showToast],
  );

  const updateItem = useCallback(
    (updatedItem) => {
      setItems(
        items.map((item) =>
          item[keyField] === updatedItem[keyField] ? { ...updatedItem } : item,
        ),
      );
      setIsFormOpen(false);
      setEditingItem(null);
      showToast(`"${updatedItem[keyField]}" updated successfully.`);
    },
    [items, keyField, setItems, showToast],
  );

  const deleteItem = useCallback(() => {
    if (!deletingItem) return;
    const next = items.filter((item) => item[keyField] !== deletingItem[keyField]);
    setItems(next);
    showToast(`"${deletingItem[keyField]}" deleted successfully.`);
    setDeletingItem(null);
    setIsDeleteOpen(false);
    const nextTotalPages = Math.max(1, Math.ceil(next.length / pageSize));
    if (currentPage > nextTotalPages) setCurrentPage(nextTotalPages);
  }, [
    deletingItem,
    items,
    keyField,
    setItems,
    showToast,
    currentPage,
    pageSize,
    setCurrentPage,
  ]);

  const toggleItemStatus = useCallback(
    (targetItem, statusField = "status") => {
      if (!targetItem) return;
      setItems(
        items.map((item) => {
          if (item[keyField] !== targetItem[keyField]) return item;
          const isInactive =
            item[statusField] === "inactive" || item.isDisabled === true;
          if (statusField === "status") {
            return {
              ...item,
              status: isInactive ? "active" : "inactive",
            };
          }
          return { ...item, isDisabled: !item.isDisabled };
        }),
      );
      showToast(`"${targetItem[keyField]}" status updated.`);
    },
    [items, keyField, setItems, showToast],
  );

  return {
    items: pageItems,
    allItems: sorted,
    totalCount: sorted.length,
    search,
    setSearch,
    sortBy,
    sortOrder,
    handleSort,
    currentPage,
    totalPages,
    setCurrentPage,
    range,
    toast,
    showToast,
    editingItem,
    setEditingItem,
    isFormOpen,
    setIsFormOpen,
    deletingItem,
    setDeletingItem,
    isDeleteOpen,
    setIsDeleteOpen,
    statusToggleItem,
    setStatusToggleItem,
    isStatusToggleOpen,
    setIsStatusToggleOpen,
    addItem,
    updateItem,
    deleteItem,
    toggleItemStatus,
  };
}
