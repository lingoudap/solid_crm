import React from "react";

/**
 * PlaceholderPanel Component
 * Displays available template field placeholders that can be inserted into editor
 * Allows users to click fields to insert their placeholders into the template content
 * Memoized to prevent unnecessary re-renders
 */
const PlaceholderPanel = ({ fields, onInsert }) => {
  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <div className="form-section">
      <h3>📚 Available Placeholders</h3>
      <p className="help-text">Click on any field to insert its placeholder</p>
      <div className="placeholder-panel">
        <div className="placeholder-buttons">
          {fields.map((field) => (
            <button
              key={field.id}
              className="placeholder-btn"
              onClick={() => onInsert(field.id)}
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
