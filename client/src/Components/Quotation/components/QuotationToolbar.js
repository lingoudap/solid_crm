import React from "react";
import ColumnsDropdown from "./ColumnsDropdown";
import SavedFiltersDropdown from "./SavedFiltersDropdown";
import DateFilterContainer from "../../Leads/DateFilterContainer";

export default function QuotationToolbar({
  onOpenFilterDrawer,
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
    <div className="header-bar" style={{ marginBottom: "20px" }}>
      <div
        className="leads-controls"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <button
          className="filter-btn"
          onClick={onOpenFilterDrawer}
          title="Open filter panel"
        >
          🔍 Filter
        </button>
        <ColumnsDropdown
          visibleColumns={visibleColumns}
          onToggleColumn={onToggleColumn}
        />
        <SavedFiltersDropdown
          savedFilters={savedFilters}
          onSave={onSaveFilter}
          onLoad={onLoadFilter}
          onDelete={onDeleteFilter}
        />
        <button
          className="export-csv-btn"
          onClick={onExportCSV}
          title="Export current data to CSV"
        >
          📥 Export CSV
        </button>
        <button
          className="refresh-btn"
          onClick={onRefresh}
          style={{ cursor: "pointer" }}
        >
          🔄 Refresh
        </button>
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
  );
}
