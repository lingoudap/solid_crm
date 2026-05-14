// TemplateEditor.jsx
import React, { useState, useCallback, useEffect } from "react";
import PlaceholderPanel from "./PlaceholderPanel";
import SectionBuilder from "./SectionBuilder";
import { prepareTemplateForSave, parseSectionsFromHTML } from "./sectionToHtmlHelper";
import { getSampleData } from "../../utils/templateUtils";
import "./TemplateEditor.css";

/**
 * TemplateEditor Component
 * Form for creating and editing print templates with visual template builder
 * Handles template configuration with section-based layout
 */
const TemplateEditor = ({
  template,
  setTemplate,
  onSave,
  onCancel,
  onPreview,
  fieldOptions,
  modules,
  isEditing,
  renderPreview,
  paperSizes,
  fontFamilies,
  handleDragStart,
  handleDragOver,
  handleDrop,
  removeBodyField,
  addBodyField,
}) => {
  const [draggedField, setDraggedField] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState(null);
  const [sectionsInitialized, setSectionsInitialized] = useState(false);

  // Initialize sections from HTML content when editing existing template
  useEffect(() => {
    if (
      isEditing &&
      template.content &&
      !template.sections &&
      !sectionsInitialized
    ) {
      // Parse HTML content into sections
      const parsedSections = parseSectionsFromHTML(template.content);
      if (parsedSections.length > 0) {
        setTemplate((prev) => ({
          ...prev,
          sections: parsedSections,
        }));
      }
      setSectionsInitialized(true);
    }
  }, []);

  // Helper to update template property (memoized)
  const updateTemplate = useCallback((key, value) => {
    setTemplate((prev) => ({ ...prev, [key]: value }));
  }, [setTemplate]);

  // Initialize sections array if not present
  const sections = template.sections || [];

  // Add a new section
  const addSection = useCallback((sectionType) => {
    const newSection = {
      id: Date.now(),
      type: sectionType,
      fields: [],
    };
    setTemplate((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));
    setShowSectionSelector(false);
    setSelectedSectionType(null);
    // Set as selected section
    setSelectedSectionId(newSection.id);
  }, [setTemplate]);

  // Add field to section
  const addFieldToSection = useCallback((sectionId, fieldId) => {
    setTemplate((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: [...(section.fields || []), fieldId],
            }
          : section
      ),
    }));
  }, [setTemplate]);

  // Generate section-based preview
  const generateSectionPreview = () => {
    // Use comprehensive sample data from utility
    const sampleData = getSampleData(template.module);
    
    // Get current fields for label lookup
    const fieldsForLookup = fieldOptions[template.module] || [];

    const getSampleValue = (fieldId) => {
      // Get sample value from utility data, with fallback to fieldId placeholder
      return sampleData[fieldId] !== undefined ? sampleData[fieldId] : `[${fieldId}]`;
    };

    const getFieldLabel = (fieldId) => {
      const field = fieldsForLookup.find((f) => f.id === fieldId);
      return field?.label || fieldId;
    };

    return (
      <div className="template-preview">
        <div className="preview-header">
          <h4>📋 Live Preview</h4>
          <span className="preview-hint">Based on your sections</span>
        </div>

        {sections.length === 0 ? (
          <div className="preview-empty">
            <p>Add sections to see preview</p>
          </div>
        ) : (
          <div className="preview-content">
            {sections.map((section, sectionIndex) => {
              const sectionFields = section.fields || [];

              // Header Section
              if (section.type === "header") {
                return (
                  <div key={section.id} className="preview-section preview-header-section">
                    <div className="section-label">Header Section</div>
                    <div className="header-content">
                      <h3>{template.name || "Template Title"}</h3>
                      {sectionFields.length > 0 && (
                        <div className="header-fields">
                          {sectionFields.map((fieldId) => (
                            <div key={fieldId} className="preview-field">
                              <strong>{getFieldLabel(fieldId)}:</strong> {getSampleValue(fieldId)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Two Column Section
              if (section.type === "twoColumn") {
                const midpoint = Math.ceil(sectionFields.length / 2);
                const leftFields = sectionFields.slice(0, midpoint);
                const rightFields = sectionFields.slice(midpoint);

                return (
                  <div key={section.id} className="preview-section preview-two-column">
                    <div className="section-label">Two Column Section</div>
                    <div className="two-column-content">
                      <div className="column">
                        {leftFields.map((fieldId) => (
                          <div key={fieldId} className="preview-field">
                            <strong>{getFieldLabel(fieldId)}:</strong>
                            <div>{getSampleValue(fieldId)}</div>
                          </div>
                        ))}
                      </div>
                      <div className="column">
                        {rightFields.map((fieldId) => (
                          <div key={fieldId} className="preview-field">
                            <strong>{getFieldLabel(fieldId)}:</strong>
                            <div>{getSampleValue(fieldId)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Table Section
              if (section.type === "table") {
                return (
                  <div key={section.id} className="preview-section preview-table-section">
                    <div className="section-label">Table Section</div>
                    {sectionFields.length > 0 ? (
                      <table className="preview-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            {sectionFields.map((fieldId) => (
                              <th key={fieldId}>{getFieldLabel(fieldId)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3].map((rowNum) => (
                            <tr key={rowNum}>
                              <td>{rowNum}</td>
                              {sectionFields.map((fieldId) => (
                                <td key={fieldId}>{getSampleValue(fieldId)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-table-fields">Add fields to display table</p>
                    )}
                  </div>
                );
              }

              // Footer Section
              if (section.type === "footer") {
                return (
                  <div key={section.id} className="preview-section preview-footer-section">
                    <div className="section-label">Footer Section</div>
                    <div className="footer-content">
                      {sectionFields.length > 0 ? (
                        <div className="footer-fields">
                          {sectionFields.map((fieldId) => (
                            <div key={fieldId} className="preview-field">
                              <strong>{getFieldLabel(fieldId)}:</strong> {getSampleValue(fieldId)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No fields added to footer</p>
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    );
  };

  const currentFields = fieldOptions[template.module] || [];
  const sectionTypes = [
    { value: "header", label: "📌 Header Section", description: "Display title and key info" },
    { value: "twoColumn", label: "📊 Two Column", description: "Side-by-side content" },
    { value: "table", label: "📋 Table", description: "Data table with rows" },
    { value: "footer", label: "📍 Footer Section", description: "Bottom content" },
  ];

  // Handle save with HTML conversion
  const handleSaveTemplate = useCallback(() => {
    // Convert sections to HTML before saving
    const templateForSave = prepareTemplateForSave(template);
    // Call the parent's onSave with converted template
    onSave(templateForSave);
  }, [template, onSave]);

  return (
    <div className="create-template">
      {/* Header */}
      <div className="create-header">
        <h2>{isEditing ? "✏️ Edit Template" : "➕ Create Print Template"}</h2>
        <p className="subtitle">
          {isEditing
            ? "Modify your template settings and layout"
            : "Design a custom print template for your business needs"}
        </p>
      </div>

      {/* Info Banner for Quotation Templates */}
      {template.module === "Quotation" && (
        <div className="info-banner">
          <p>💡 Pro Tip for Quotations</p>
          <p>
            Include the <strong>Items List</strong> field to automatically
            display a professional table with Sr. No., Description, Qty, Price,
            and Subtotal. The system will format currency values with the rupee
            symbol.
          </p>
        </div>
      )}

      <div className="template-editor">
        {/* Left Panel - Configuration */}
        <div className="editor-left">
          <div className="form-section">
            <h3>📝 Template Details</h3>

            <div className="form-group">
              <label>Template Name *</label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => updateTemplate("name", e.target.value)}
                placeholder="e.g., Professional Lead Report"
                className="form-control"
                required
              />
            </div>

            {!isEditing && (
              <div className="form-group">
                <label>Select Module *</label>
                <select
                  value={template.module}
                  onChange={(e) => updateTemplate("module", e.target.value)}
                  className="form-control"
                >
                  {modules.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="toggle-switch">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={template.isDefault || false}
                  onChange={(e) => updateTemplate("isDefault", e.target.checked)}
                />
                Set as default template for this module
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>📐 Layout Settings</h3>

            <div className="form-group">
              <label>Paper Size</label>
              <select
                value={template.paperSize || "A4"}
                onChange={(e) => updateTemplate("paperSize", e.target.value)}
                className="form-control"
              >
                {paperSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Orientation</label>
              <div className="orientation-buttons">
                <button
                  type="button"
                  className={`orientation-btn ${
                    (template.orientation || "portrait") === "portrait"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => updateTemplate("orientation", "portrait")}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  className={`orientation-btn ${
                    (template.orientation || "portrait") === "landscape"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => updateTemplate("orientation", "landscape")}
                >
                  Landscape
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Font Family</label>
              <select
                value={template.fontFamily || "Arial"}
                onChange={(e) => updateTemplate("fontFamily", e.target.value)}
                className="form-control"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Font Size</label>
              <select
                value={template.fontSize || "12px"}
                onChange={(e) => updateTemplate("fontSize", e.target.value)}
                className="form-control"
              >
                <option value="10px">10px (Small)</option>
                <option value="12px">12px (Normal)</option>
                <option value="14px">14px (Large)</option>
                <option value="16px">16px (Extra Large)</option>
              </select>
            </div>
          </div>
          

          {/* <div className="form-section">
            <h3>📄 Header & Footer</h3>
            <div className="form-group">
              <label>Header Content (HTML)</label>
              <textarea
                value={template.headerContent || ""}
                onChange={(e) => updateTemplate("headerContent", e.target.value)}
                placeholder="<h2>Company Name</h2><p>Your header here...</p>"
                className="form-control"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Footer Content (HTML)</label>
              <textarea
                value={template.footerContent || ""}
                onChange={(e) => updateTemplate("footerContent", e.target.value)}
                placeholder="<p>Thank you for your business!</p>"
                className="form-control"
                rows="3"
              />
            </div>
            <div className="toggle-switch">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={template.showSignature || false}
                  onChange={(e) =>
                    updateTemplate("showSignature", e.target.checked)
                  }
                />
                Show Signature Line
              </label>
            </div>
            <div className="toggle-switch">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={template.showDate !== false}
                  onChange={(e) => updateTemplate("showDate", e.target.checked)}
                />
                Show Date
              </label>
            </div>
            <div className="toggle-switch">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={template.showPageNumber !== false}
                  onChange={(e) =>
                    updateTemplate("showPageNumber", e.target.checked)
                  }
                />
                Show Page Numbers
              </label>
            </div>
          </div> */}

          <div className="form-section">
            <h3>💧 Watermark</h3>
            <div className="form-group">
              <label>Watermark Text</label>
              <input
                type="text"
                value={template.watermark || ""}
                onChange={(e) => updateTemplate("watermark", e.target.value)}
                placeholder="e.g., CONFIDENTIAL, DRAFT, SAMPLE"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Opacity (0-1)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={template.watermarkOpacity || 0.1}
                onChange={(e) =>
                  updateTemplate("watermarkOpacity", parseFloat(e.target.value))
                }
                className="form-control"
              />
              <span>{template.watermarkOpacity || 0.1}</span>
            </div>
          </div>
        </div>

        {/* Middle Panel - Template Builder */}
        <div className="editor-middle">
          <div className="form-section">
            <h3>🏗️ Template Builder</h3>
            <p className="help-text">
              Build your template visually using customizable sections
            </p>

            {/* Section Selector Modal */}
            {showSectionSelector && (
              <div className="section-selector-modal">
                <div className="section-selector-content">
                  <h4>Select Section Type</h4>
                  <div className="section-types-grid">
                    {sectionTypes.map((sectionType) => (
                      <button
                        key={sectionType.value}
                        type="button"
                        className="section-type-btn"
                        onClick={() => addSection(sectionType.value)}
                      >
                        <div className="btn-label">{sectionType.label}</div>
                        <div className="btn-description">{sectionType.description}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-close-modal"
                    onClick={() => setShowSectionSelector(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Add Section Button */}
            <button
              type="button"
              className="btn-add-section"
              onClick={() => setShowSectionSelector(true)}
            >
              ➕ Add Section
            </button>

            {/* Section Builder Component */}
            <SectionBuilder
              sections={sections}
              setSections={(newSections) =>
                setTemplate((prev) => ({
                  ...prev,
                  sections: newSections,
                }))
              }
              fieldOptions={currentFields}
            />
          </div>

          {/* Placeholder Panel */}
          <PlaceholderPanel
            fields={currentFields}
            selectedSectionId={selectedSectionId}
            onAddFieldToSection={addFieldToSection}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="editor-right">
          {generateSectionPreview()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="template-actions">
        <button
          onClick={handleSaveTemplate}
          className="btn-save"
        >
          {isEditing ? "💾 Update Template" : "✅ Create Template"}
        </button>
        <button
          onClick={() => onPreview(template)}
          className="btn-edit"
        >
          👁️ Preview
        </button>
        <button
          onClick={onCancel}
          className="btn-cancel"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
};

export default React.memo(TemplateEditor);
