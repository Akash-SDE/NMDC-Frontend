import { useState, useCallback, useMemo } from "react";

export default function useCrud(initialData = [], keyField = "code") {
  const [data, setData] = useState([...initialData]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [toast, setToast] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const openAddForm = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((item) => {
    setEditingItem({ ...item });
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(false);
  }, []);

  const addItem = useCallback(
    (newItem) => {
      const exists = data.find(
        (d) => d[keyField].toLowerCase() === newItem[keyField].toLowerCase(),
      );
      if (exists) {
        showToast(
          `Item with code "${newItem[keyField]}" already exists.`,
          "error",
        );
        return false;
      }
      setData((prev) => [newItem, ...prev]);
      setIsFormOpen(false);
      setEditingItem(null);
      showToast(`"${newItem[keyField]}" added successfully.`);
      return true;
    },
    [data, keyField, showToast],
  );

  const updateItem = useCallback(
    (updatedItem) => {
      setData((prev) =>
        prev.map((item) =>
          item[keyField] === updatedItem[keyField] ? { ...updatedItem } : item,
        ),
      );
      setIsFormOpen(false);
      setEditingItem(null);
      showToast(`"${updatedItem[keyField]}" updated successfully.`);
    },
    [keyField, showToast],
  );

  const saveItem = useCallback(
    (item) => {
      if (editingItem) {
        updateItem(item);
      } else {
        return addItem(item);
      }
      return true;
    },
    [editingItem, addItem, updateItem],
  );

  const openDeleteConfirm = useCallback((item) => {
    setDeletingItem(item);
    setIsDeleteOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeletingItem(null);
    setIsDeleteOpen(false);
  }, []);

  const deleteItem = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) =>
      prev.filter((item) => item[keyField] !== deletingItem[keyField]),
    );
    showToast(`"${deletingItem[keyField]}" deleted successfully.`);
    setDeletingItem(null);
    setIsDeleteOpen(false);
    // Reset page if needed
    setCurrentPage((prev) => Math.max(1, prev));
  }, [deletingItem, keyField, showToast]);

  const toggleFilter = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  const applyFilter = useCallback((filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Filtered data based on search and active filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(query),
        ),
      );
    }

    // Apply status filter
    if (activeFilters.status && activeFilters.status !== "all") {
      result = result.filter((item) => item.status === activeFilters.status);
    }

    // Apply custom filter function
    if (activeFilters.customFilter) {
      result = result.filter(activeFilters.customFilter);
    }

    // Apply sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        const comparison = String(aVal).localeCompare(String(bVal), undefined, {
          numeric: true,
        });
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, search, activeFilters, sortConfig]);

  return {
    data: filteredData,
    allData: data,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    editingItem,
    isFormOpen,
    openAddForm,
    openEditForm,
    closeForm,
    saveItem,
    isDeleteOpen,
    deletingItem,
    openDeleteConfirm,
    closeDeleteConfirm,
    deleteItem,
    isFilterOpen,
    toggleFilter,
    activeFilters,
    applyFilter,
    clearFilters,
    toast,
    sortConfig,
    handleSort,
  };
}
