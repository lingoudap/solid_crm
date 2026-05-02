import { useCallback, useState } from "react";

/**
 * Generic page-scoped row selection. Pass in the array of IDs visible on the
 * current page; the hook tracks which are selected and exposes toggles.
 *
 * `isAllSelected` reflects only the current page (not the full dataset).
 */
export function useTableSelection(pageIds) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === pageIds.length ? [] : [...pageIds]
    );
  }, [pageIds]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const isAllSelected =
    selectedIds.length === pageIds.length && pageIds.length > 0;

  return {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
  };
}
