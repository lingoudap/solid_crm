import React from "react";

export default function CustomersBulkActionBar({
  count,
  onExportCSV,
  onDelete,
}) {
  if (count === 0) return null;

  return (
    <div className="bulk-action-bar">
      <span>{count} selected</span>
      <button onClick={onExportCSV} className="bulk-export-btn">
        📥 Export CSV
      </button>
      <button onClick={onDelete} className="bulk-delete-btn">
        🗑 Delete
      </button>
    </div>
  );
}
