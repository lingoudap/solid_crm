import React from "react";
import DateFilterContainer from "../DateFilterContainer";
import ColumnsDropdown from "../../Quotation/components/ColumnsDropdown";
import SavedFiltersDropdown from "../../Quotation/components/SavedFiltersDropdown";

const Icon = {
  Search: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="9" r="6" />
      <path d="M17 17l-3.5-3.5" />
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h14l-5 7v5l-4 2v-7L3 4z" />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3v10m0 0l-4-4m4 4l4-4" />
      <path d="M3 16h14" />
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4v4h-4" />
      <path d="M4 16v-4h4" />
      <path d="M5 8a6 6 0 0110-2l1 2M15 12a6 6 0 01-10 2l-1-2" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  ),
};

export default function LeadsToolbar({
  query,
  onQueryChange,
  onOpenFilterDrawer,
  activeFilterCount = 0,
  visibleColumns,
  onToggleColumn,
  savedFilters,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  onExportCSV,
  onRefresh,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  dateFilterOpen,
  setDateFilterOpen,
  onPageChange,
}) {
  return (
    <div className="lt-toolbar" role="toolbar" aria-label="Leads toolbar">
      {/* LEFT: search, filter, date */}
      <div className="lt-toolbar-group lt-toolbar-left">
        <div className="lt-toolbar-search">
          <span className="lt-toolbar-search-icon" aria-hidden="true">
            <Icon.Search />
          </span>
          <input
            type="search"
            placeholder="Search leads…"
            value={query || ""}
            onChange={(e) => onQueryChange?.(e.target.value)}
            aria-label="Search leads"
          />
          {query && (
            <button
              type="button"
              className="lt-toolbar-search-clear"
              onClick={() => onQueryChange?.("")}
              aria-label="Clear search"
            >
              <Icon.Close />
            </button>
          )}
        </div>

        <button
          type="button"
          className="lt-tb-btn lt-tb-btn--secondary"
          onClick={onOpenFilterDrawer}
          title="Filters"
        >
          <Icon.Filter />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="lt-tb-badge">{activeFilterCount}</span>
          )}
        </button>

        <div className="lt-toolbar-datewrap">
          <DateFilterContainer
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            dateFilterOpen={dateFilterOpen}
            setDateFilterOpen={setDateFilterOpen}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {/* CENTER: columns + saved filters */}
      <div className="lt-toolbar-group lt-toolbar-center">
        <div className="lt-toolbar-slot">
          <ColumnsDropdown
            visibleColumns={visibleColumns}
            onToggleColumn={onToggleColumn}
          />
        </div>
        <div className="lt-toolbar-slot">
          <SavedFiltersDropdown
            savedFilters={savedFilters}
            onSave={onSaveFilter}
            onLoad={onLoadFilter}
            onDelete={onDeleteFilter}
          />
        </div>
      </div>

      {/* RIGHT: export, refresh */}
      <div className="lt-toolbar-group lt-toolbar-right">
        <button
          type="button"
          className="lt-tb-btn lt-tb-btn--secondary"
          onClick={onExportCSV}
          title="Export current view to CSV"
        >
          <Icon.Download />
          <span>Export</span>
        </button>
        <button
          type="button"
          className="lt-tb-btn lt-tb-btn--icon"
          onClick={onRefresh}
          title="Refresh"
          aria-label="Refresh"
        >
          <Icon.Refresh />
        </button>
      </div>
    </div>
  );
}
