import { useCallback, useMemo, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { computeStats, filterTodos, sortTodos } from "../utils/todoUtils";

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  showCompleted: true,
};

/**
 * Owns the view-layer state both pages used to duplicate: filters, sort, and
 * the derived visibleTodos. Search input is debounced before driving the
 * filter pass so typing stays snappy on large lists.
 */
export function useTodoView(
  todos,
  {
    initialFilters = {},
    initialSortBy = "created",
    initialSortOrder = "desc",
    searchDebounceMs = 200,
  } = {}
) {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  const debouncedSearch = useDebouncedValue(filters.search, searchDebounceMs);

  // Filter on the debounced search so each keystroke doesn't re-walk the list.
  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const visibleTodos = useMemo(
    () => sortTodos(filterTodos(todos, effectiveFilters), sortBy, sortOrder),
    [todos, effectiveFilters, sortBy, sortOrder]
  );

  // Stats computed against the *unfiltered* dataset — they describe the user's
  // entire backlog, not the current view.
  const stats = useMemo(() => computeStats(todos), [todos]);

  const setSort = useCallback(({ sortBy: nextBy, sortOrder: nextOrder }) => {
    if (nextBy !== undefined) setSortBy(nextBy);
    if (nextOrder !== undefined) setSortOrder(nextOrder);
  }, []);

  const isFiltered =
    !!filters.search ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all";

  return {
    filters,
    setFilters,
    sortBy,
    sortOrder,
    setSort,
    visibleTodos,
    stats,
    isFiltered,
  };
}
