import React from "react";

export default function CustomersFilterDrawer({
  open,
  onClose,
  filterName,
  onFilterNameChange,
  filterState,
  onFilterStateChange,
  uniqueStates,
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
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="Search by name"
              value={filterName}
              onChange={(e) => onFilterNameChange(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>State</label>
            <select
              value={filterState}
              onChange={(e) => onFilterStateChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All States</option>
              {uniqueStates.map((s) => (
                <option key={s} value={s}>
                  {s}
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
