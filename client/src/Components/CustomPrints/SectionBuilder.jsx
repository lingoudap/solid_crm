import React, { useState } from "react";
import "./SectionBuilder.css";

const SECTION_META = {
  header:    { icon: "📌", label: "Header" },
  twoColumn: { icon: "📊", label: "Two Column" },
  table:     { icon: "📋", label: "Table" },
  footer:    { icon: "📍", label: "Footer" },
};

/**
 * SectionBuilder — visual block list with drag-to-reorder and field pills.
 * Uses the td- design system from TemplateDesigner.css.
 */
const SectionBuilder = ({ sections = [], setSections, fieldOptions = [] }) => {
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [draggedSectionId, setDraggedSectionId] = useState(null);

  const getField = (fieldId) => fieldOptions.find((f) => f.id === fieldId);

  const removeFieldFromSection = (sectionId, fieldIndex) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter((_, i) => i !== fieldIndex) }
          : section
      )
    );
  };

  const removeSection = (sectionId) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

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
    const draggedIndex = sections.findIndex((s) => s.id === draggedSectionId);
    const targetIndex = sections.findIndex((s) => s.id === targetSectionId);
    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);
    setSections(newSections);
    setDraggedSectionId(null);
  };

  if (sections.length === 0) return null;

  return (
    <div className="td-sections">
      {sections.map((section) => {
        const isExpanded = expandedSectionId === section.id;
        const meta = SECTION_META[section.type] || { icon: "📦", label: section.type };
        const fields = section.fields || [];

        return (
          <div
            key={section.id}
            className={`td-section-card ${draggedSectionId === section.id ? "td-section-card--dragging" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section.id)}
          >
            <div
              className="td-section-card__head"
              onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
            >
              <div className="td-section-card__left">
                <span
                  className="td-drag-handle"
                  title="Drag to reorder"
                  onClick={(e) => e.stopPropagation()}
                >
                  ⋮⋮
                </span>
                <span className="td-section-card__type">
                  <span className="td-section-card__type-icon">{meta.icon}</span>
                  {meta.label}
                </span>
                <span className="td-section-card__count">
                  {fields.length} {fields.length === 1 ? "field" : "fields"}
                </span>
              </div>
              <div className="td-section-card__actions">
                <button
                  type="button"
                  className="td-icon-btn"
                  title={isExpanded ? "Collapse" : "Expand"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSectionId(isExpanded ? null : section.id);
                  }}
                >
                  {isExpanded ? "▾" : "▸"}
                </button>
                <button
                  type="button"
                  className="td-icon-btn td-icon-btn--danger"
                  title="Delete section"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSection(section.id);
                  }}
                >
                  🗑
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="td-section-card__body">
                <p className="td-section-card__fields-label">Fields in this section</p>
                {fields.length > 0 ? (
                  <div className="td-section-card__field-pills">
                    {fields.map((fieldId, idx) => {
                      const field = getField(fieldId);
                      return (
                        <span key={`${section.id}-${idx}`} className="td-pill">
                          <span>{field?.icon} {field?.label || fieldId}</span>
                          <button
                            type="button"
                            className="td-pill__remove"
                            title="Remove field"
                            onClick={() => removeFieldFromSection(section.id, idx)}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="td-no-fields">
                    No fields yet. Add some from the “Available Fields” panel below.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(SectionBuilder);
