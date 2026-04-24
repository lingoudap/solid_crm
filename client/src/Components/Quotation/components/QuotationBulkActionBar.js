import React from "react";

export default function QuotationBulkActionBar({
  count,
  onStatusChange,
  onExportCSV,
  onDelete,
}) {
  if (count === 0) return null;

  return (
    <div className="bulk-action-bar">
      <span>{count} selected</span>
      <select
        onChange={(e) => {
          if (e.target.value) onStatusChange(e.target.value);
          e.target.value = "";
        }}
        className="bulk-status-select"
      >
        <option value="">Change Status</option>
        <option value="New">New</option>
        <option value="Active">Active</option>
        <option value="Converted">Converted</option>
        <option value="Lost">Lost</option>
      </select>
      <button onClick={onExportCSV} className="bulk-export-btn">
        📥 Export CSV
      </button>
      <button onClick={onDelete} className="bulk-delete-btn">
        🗑 Delete
      </button>
    </div>
  );
}
