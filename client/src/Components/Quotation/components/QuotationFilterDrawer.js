import React from "react";

export default function QuotationFilterDrawer({
  open,
  onClose,
  filterStatus,
  onFilterStatusChange,
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
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
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
