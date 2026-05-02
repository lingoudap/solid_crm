import React from "react";

const STATUS_OPTIONS = ["New", "Active", "Converted", "Lost"];

export default function LeadsFilterDrawer({
  open,
  onClose,
  filterName,
  onFilterNameChange,
  filterStatus,
  onFilterStatusChange,
  filterSource,
  onFilterSourceChange,
  uniqueSources,
  onApply,
  onReset,
}) {
  return (
    <>
      {open && <div className="filter-overlay" onClick={onClose} />}
      <div className={`filter-drawer ${open ? "open" : ""}`}>
        <div className="filter-drawer-header">
          <h3>Filters</h3>
          <button className="filter-drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="filter-drawer-content">
          <div className="filter-group">
            <label>Lead Name</label>
            <input
              type="text"
              placeholder="Search by name"
              value={filterName}
              onChange={(e) => onFilterNameChange(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Source</label>
            <select
              value={filterSource}
              onChange={(e) => onFilterSourceChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-drawer-footer">
          <button className="filter-apply-btn" onClick={onApply}>
            ✓ Apply Filter
          </button>
          <button className="filter-reset-btn" onClick={onReset}>
            ↺ Reset
          </button>
        </div>
      </div>
    </>
  );
}
