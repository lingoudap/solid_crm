import React, { useState, useCallback } from "react";
import PlaceholderPanel from "./PlaceholderPanel";

/**
 * TemplateEditor Component
 * Form for creating and editing print templates
 * Handles template configuration, HTML content editing, and field management
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

  // Helper to update template property (memoized)
  const updateTemplate = useCallback((key, value) => {
    setTemplate((prev) => ({ ...prev, [key]: value }));
  }, [setTemplate]);

  // Insert placeholder at cursor position in textarea (memoized)
  const insertPlaceholder = useCallback((fieldId) => {
    const textarea = document.querySelector(".editor-middle .textarea-control");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const placeholder = `{{${fieldId}}}`;
      const currentContent = template.content || "";
      const newContent =
        currentContent.substring(0, start) +
        placeholder +
        currentContent.substring(end);
      updateTemplate("content", newContent);
      setTimeout(() => textarea.focus(), 0);
    }
  }, [template.content, updateTemplate]);

  const currentFields = fieldOptions[template.module] || [];
  const availableFields = currentFields.filter(
    (field) => !(template.bodyFields || []).includes(field.id)
  );

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

          <div className="form-section">
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
          </div>

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

        {/* Middle Panel - HTML Editor */}
        <div className="editor-middle">
          <div className="form-section">
            <h3>📝 HTML Template Content</h3>
            <p className="help-text">
              Write HTML with {"{{"} placeholders {"}}"} for dynamic fields
            </p>
            <textarea
              value={template.content || ""}
              onChange={(e) => updateTemplate("content", e.target.value)}
              placeholder={`<style>
  body {
    font-family: Arial, sans-serif;
    padding: 20px;
    line-height: 1.6;
  }
</style>

<h1>Template</h1>
<p>Content here...</p>`}
              className="textarea-control"
              rows="18"
            />
          </div>

          <PlaceholderPanel
            fields={fieldOptions[template.module] || []}
            onInsert={insertPlaceholder}
          />

          <div className="form-section">
            <h3>🎨 CSS Styling Tips</h3>
            <p className="help-text">
              Add inline CSS in a &lt;style&gt; tag at the top for PDF styling
            </p>
            <div className="css-tips-box">
              <pre>{`<style>
  body { 
    font-family: Arial; 
    padding: 20px; 
    line-height: 1.6;
  }
  h1, h2 { color: #333; }
  table { 
    width: 100%; 
    border-collapse: collapse;
  }
  td, th { 
    border: 1px solid #ddd; 
    padding: 8px;
  }
  .section { 
    margin: 20px 0; 
    padding: 15px; 
    border-left: 3px solid #007bff;
  }
</style>`}</pre>
            </div>
          </div>

          <div className="form-section">
            <h3>🎯 Body Fields Order (Drag & Drop)</h3>
            <p className="help-text">
              Drag fields below to reorder them for the preview
            </p>
            <div
              className="body-fields-list"
              onDragOver={handleDragOver}
            >
              {(template.bodyFields || []).length === 0 ? (
                <p className="empty-message">
                  No fields added. Add fields from above.
                </p>
              ) : (
                (template.bodyFields || []).map((fieldId, index) => {
                  const field = fieldOptions[template.module]?.find(
                    (f) => f.id === fieldId
                  );
                  return (
                    <div
                      key={fieldId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, fieldId)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="draggable-field"
                    >
                      <span>
                        {field?.icon} {field?.label || fieldId}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBodyField(index)}
                        className="remove-field-btn"
                      >
                        ❌
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="available-fields">
              <p>
                <strong>Add fields:</strong>
              </p>
              <div className="add-fields-buttons">
                {availableFields.map((field) => (
                  <button
                    key={field.id}
                    onClick={() => addBodyField(field.id)}
                    className="add-field-btn"
                  >
                    + {field.icon} {field.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="editor-right">
          {renderPreview()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="template-actions">
        <button
          onClick={onSave}
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
