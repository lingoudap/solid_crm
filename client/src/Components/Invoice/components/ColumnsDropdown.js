import React, { useState } from "react";

export default function ColumnsDropdown({ visibleColumns, onToggleColumn }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        className="columns-btn"
        onClick={() => setOpen((v) => !v)}
        title="Toggle columns"
      >
        ⚙️ Columns
      </button>
      {open && (
        <div className="columns-dropdown">
          {Object.keys(visibleColumns).map((col) => (
            <label key={col} className="column-toggle-item">
              <input
                type="checkbox"
                checked={visibleColumns[col]}
                onChange={() => onToggleColumn(col)}
              />
              {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, " $1")}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
