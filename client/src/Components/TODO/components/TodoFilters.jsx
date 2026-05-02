import React from "react";
import { FaSearch, FaSort, FaTrash } from "react-icons/fa";
import {
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "../utils/todoUtils";

const SORT_OPTIONS = [
  { value: "created", label: "Sort by Created" },
  { value: "priority", label: "Sort by Priority" },
  { value: "dueDate", label: "Sort by Due Date" },
  { value: "category", label: "Sort by Category" },
];

/**
 * Search + filter + sort controls. Stateless; the parent owns the filter
 * shape and decides which controls to surface.
 *
 * Props:
 *   filters: { search, status, priority, category, showCompleted? }
 *   onFiltersChange(partial)
 *   sortBy, sortOrder, onSortChange({ sortBy?, sortOrder? })
 *   showStatus?: boolean        // status select (default true)
 *   showCompletedToggle?: bool  // legacy "Show Completed" checkbox
 *   onClearCompleted?()         // shows the Clear Completed button when given
 */
export default function TodoFilters({
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onSortChange,
  showStatus = true,
  showCompletedToggle = false,
  onClearCompleted,
}) {
  const update = (patch) => onFiltersChange?.({ ...filters, ...patch });

  const toggleSortOrder = () =>
    onSortChange?.({ sortOrder: sortOrder === "desc" ? "asc" : "desc" });

  return (
    <div className="controls">
      <div className="control-group">
        <div className="search-group">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search todos..."
            value={filters.search || ""}
            onChange={(e) => update({ search: e.target.value })}
            className="search-input"
          />
        </div>

        {showStatus && (
          <select
            value={filters.status || "all"}
            onChange={(e) => update({ status: e.target.value })}
            className="filter-select"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.priority || "all"}
          onChange={(e) => update({ priority: e.target.value })}
          className="filter-select"
        >
          <option value="all">All Priorities</option>
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filters.category || "all"}
          onChange={(e) => update({ category: e.target.value })}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <select
          value={sortBy}
          onChange={(e) => onSortChange?.({ sortBy: e.target.value })}
          className="sort-select"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={toggleSortOrder}
          className="sort-order-button"
        >
          <FaSort /> {sortOrder === "desc" ? "Desc" : "Asc"}
        </button>

        {showCompletedToggle && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.showCompleted !== false}
              onChange={(e) => update({ showCompleted: e.target.checked })}
            />
            Show Completed
          </label>
        )}

        {onClearCompleted && (
          <button
            type="button"
            onClick={onClearCompleted}
            className="clear-button"
          >
            <FaTrash /> Clear Completed
          </button>
        )}
      </div>
    </div>
  );
}
