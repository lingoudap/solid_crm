import React, { useState } from "react";
import "./SectionBuilder.css";

/**
 * SectionBuilder Component
 * Visual editor for template sections with drag-and-drop reordering
 * Allows adding/removing fields and managing section order
 */
const SectionBuilder = ({ sections = [], setSections, fieldOptions = [] }) => {
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [showFieldSelector, setShowFieldSelector] = useState(null);

  // Get field label by ID
  const getFieldLabel = (fieldId) => {
    return fieldOptions.find((f) => f.id === fieldId);
  };

  // Add field to section (keeps dropdown open for multiple selections)
  const addFieldToSection = (sectionId, fieldId) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: [...(section.fields || []), fieldId],
            }
          : section
      )
    );
    // Don't close dropdown - allows multiple field selections
  };

  // Remove field from section
  const removeFieldFromSection = (sectionId, fieldIndex) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.filter((_, i) => i !== fieldIndex),
            }
          : section
      )
    );
  };

  // Remove section
  const removeSection = (sectionId) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  // Drag and drop handlers for reordering sections
  const handleDragStart = (e, sectionId) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetSectionId) => {
    e.preventDefault();
    if (!draggedSectionId || draggedSectionId === targetSectionId) {
      setDraggedSectionId(null);
      return;
    }

    // Find indices
    const draggedIndex = sections.findIndex((s) => s.id === draggedSectionId);
    const targetIndex = sections.findIndex((s) => s.id === targetSectionId);

    // Reorder sections
    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    setSections(newSections);
    setDraggedSectionId(null);
  };

  const sectionTypeLabels = {
    header: "📌 Header",
    twoColumn: "📊 Two Column",
    table: "📋 Table",
    footer: "📍 Footer",
  };

  // Get available fields (not already in section)
  const getAvailableFields = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    const usedFields = section?.fields || [];
    return fieldOptions.filter((field) => !usedFields.includes(field.id));
  };

  return (
    <div className="section-builder">
      <div className="sections-list">
        {sections.length === 0 ? (
          <div className="empty-state">
            <p>No sections yet. Add one using the button above.</p>
          </div>
        ) : (
          sections.map((section, index) => {
            const isExpanded = expandedSectionId === section.id;
            const availableFields = getAvailableFields(section.id);

            return (
              <div
                key={section.id}
                className={`section-card ${
                  draggedSectionId === section.id ? "dragging" : ""
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, section.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, section.id)}
              >
                {/* Section Header */}
                <div className="section-card-header">
                  <div className="section-card-left">
                    <span className="drag-handle">⋮⋮</span>
                    <button
                      type="button"
                      className="expand-btn"
                      onClick={() =>
                        setExpandedSectionId(
                          isExpanded ? null : section.id
                        )
                      }
                    >
                      {isExpanded ? "▼" : "▶"}
                    </button>
                    <span className="section-type-badge">
                      {sectionTypeLabels[section.type] || section.type}
                    </span>
                    <span className="section-index">#{index + 1}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-remove-section"
                    onClick={() => removeSection(section.id)}
                  >
                    🗑️
                  </button>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="section-card-content">
                    {/* Fields as Tags */}
                    <div className="fields-section">
                      <h5>Fields in Section</h5>
                      {section.fields && section.fields.length > 0 ? (
                        <div className="fields-tags">
                          {section.fields.map((fieldId, fieldIndex) => {
                            const field = getFieldLabel(fieldId);
                            return (
                              <div
                                key={`${section.id}-${fieldIndex}`}
                                className="field-tag"
                              >
                                <span className="field-tag-label">
                                  {field?.icon} {field?.label || fieldId}
                                </span>
                                <button
                                  type="button"
                                  className="btn-remove-field-tag"
                                  onClick={() =>
                                    removeFieldFromSection(section.id, fieldIndex)
                                  }
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="no-fields-message">No fields added yet</p>
                      )}
                    </div>

                    {/* Add Field */}
                    <div className="add-field-section">
                      <button
                        type="button"
                        className="btn-add-field"
                        onClick={() =>
                          setShowFieldSelector(
                            showFieldSelector === section.id ? null : section.id
                          )
                        }
                      >
                        ➕ Add Field
                      </button>

                      {/* Field Selector Dropdown */}
                      {showFieldSelector === section.id && (
                        <div className="field-selector">
                          <div className="field-selector-header">
                            <span>Select Fields</span>
                            <button
                              type="button"
                              className="field-selector-close"
                              onClick={() => setShowFieldSelector(null)}
                              title="Close selector"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="field-selector-list">
                            {availableFields.length > 0 ? (
                              <>
                                {availableFields.map((field) => (
                                  <button
                                    key={field.id}
                                    type="button"
                                    className="field-option"
                                    onClick={() =>
                                      addFieldToSection(section.id, field.id)
                                    }
                                  >
                                    <span className="field-icon">{field.icon}</span>
                                    <span className="field-name">{field.label}</span>
                                    <span className="field-add-icon">+</span>
                                  </button>
                                ))}
                              </>
                            ) : (
                              <p className="no-available-fields">
                                All fields already added
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default React.memo(SectionBuilder);
