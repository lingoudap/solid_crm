import React, { useState } from "react";

export default function SavedFiltersDropdown({
  savedFilters,
  onSave,
  onLoad,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");

  const handleSave = () => {
    if (!newFilterName.trim()) {
      alert("Enter filter name");
      return;
    }
    onSave(newFilterName);
    setNewFilterName("");
    alert("✅ Filter saved!");
  };

  const handleLoad = (id) => {
    onLoad(id);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        className="saved-filters-btn"
        onClick={() => setOpen((v) => !v)}
        title="Saved filters"
      >
        ⭐ Filters ({savedFilters.length})
      </button>
      {open && (
        <div className="saved-filters-dropdown">
          <div className="saved-filters-save">
            <input
              type="text"
              placeholder="Filter name"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              className="saved-filter-input"
            />
            <button onClick={handleSave} className="save-filter-btn">
              Save
            </button>
          </div>
          {savedFilters.length > 0 ? (
            <div className="saved-filters-list">
              {savedFilters.map((filter) => (
                <div key={filter.id} className="saved-filter-item">
                  <button onClick={() => handleLoad(filter.id)}>{filter.name}</button>
                  <button
                    onClick={() => onDelete(filter.id)}
                    className="delete-filter-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-saved-filters">No saved filters</div>
          )}
        </div>
      )}
    </div>
  );
}
