import React from "react";

const STATUS_OPTIONS = ["New", "Active", "Converted", "Lost"];

export default function LeadsBulkActionBar({
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
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
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
