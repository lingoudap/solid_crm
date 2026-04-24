import React from "react";
import QUOTATION_CONFIG from "../config";

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
        {QUOTATION_CONFIG.STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
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
