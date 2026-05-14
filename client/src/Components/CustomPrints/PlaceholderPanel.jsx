import React from "react";

/**
 * PlaceholderPanel Component
 * Displays available template fields that can be added to sections
 * Allows users to click fields to add them to the currently selected section
 * Memoized to prevent unnecessary re-renders
 */
const PlaceholderPanel = ({ 
  fields, 
  selectedSectionId, 
  onAddFieldToSection 
}) => {
  if (!fields || fields.length === 0) {
    return null;
  }

  if (!selectedSectionId) {
    return (
      <div className="form-section">
        <h3>📚 Available Fields</h3>
        <p className="help-text">Select a section first to add fields</p>
        <div className="placeholder-panel">
          <p className="no-section-message">👈 Click on a section to add fields</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-section">
      <h3>📚 Available Fields</h3>
      <p className="help-text">Click on any field to add it to the selected section</p>
      <div className="placeholder-panel">
        <div className="placeholder-buttons">
          {fields.map((field) => (
            <button
              key={field.id}
              className="placeholder-btn"
              onClick={() => onAddFieldToSection(selectedSectionId, field.id)}
              title={field.type}
            >
              {field.icon} {field.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlaceholderPanel);
