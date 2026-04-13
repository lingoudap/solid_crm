import React, { useState, useEffect, useRef } from "react";
import { getTemplates, convertAPITemplateToLocal } from "../../services/templateService";
import { generatePDFFromTemplate, loadPrintLibraries } from "../../utils/printTemplateUtils";
import "./PrintTemplateSelector.css";

/**
 * PrintTemplateSelector Component
 * Allows users to select a template and print/preview the document
 * Supports both localStorage and API-based templates
 */
const PrintTemplateSelector = ({ module, record, onPrint }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState(null);
  const printRef = useRef(null);

  // Load templates when module changes
  useEffect(() => {
    loadTemplates();
  }, [module]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedTemplates = await getTemplates(module);

      // Handle both API (array) and localStorage (object) formats
      const templatesArray = Array.isArray(loadedTemplates)
        ? loadedTemplates.map(convertAPITemplateToLocal)
        : Object.entries(loadedTemplates).map(([id, t]) => ({ ...t, id }));

      setTemplates(templatesArray);

      // Auto-select default template if available
      const defaultTemplate = templatesArray.find((t) => t.isDefault) || templatesArray[0];
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate);
      }
    } catch (err) {
      console.error("❌ Error loading templates:", err);
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!selectedTemplate) {
      setError("Please select a template first");
      return;
    }

    setLoading(true);
    try {
      // Load print libraries
      await loadPrintLibraries();

      // Generate PDF
      const companyName = localStorage.getItem("companyName") || "Company";
      const result = await generatePDFFromTemplate(selectedTemplate, record, companyName);

      if (result && result.success !== false) {
        if (onPrint) {
          onPrint(selectedTemplate);
        }
        setShowSelector(false);
      }
    } catch (err) {
      console.error("❌ Error printing:", err);
      setError(err.message || "Failed to print");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setPreview(true);
  };

  if (!templates || templates.length === 0) {
    return (
      <div className="print-template-selector">
        <button
          className="print-btn disabled"
          disabled
          title="No templates available"
        >
          📄 No Templates
        </button>
        <p className="help-text">Create a print template in the CustomPrints section first</p>
      </div>
    );
  }

  return (
    <>
      <div className="print-template-selector">
        <button
          className="print-btn"
          onClick={() => setShowSelector(!showSelector)}
          title={`Print with template${selectedTemplate ? `: ${selectedTemplate.name}` : ""}`}
        >
          🖨️ Print
        </button>

        {showSelector && (
          <div className="template-dropdown">
            {error && <div className="error-message">⚠️ {error}</div>}

            <div className="template-list">
              <label className="dropdown-label">Select Template:</label>
              <select
                value={selectedTemplate?.id || ""}
                onChange={(e) => {
                  const template = templates.find((t) => t.id === e.target.value);
                  setSelectedTemplate(template);
                  setError(null);
                }}
                className="template-select"
                disabled={loading}
              >
                <option value="">-- Choose a template --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                    {template.isDefault ? " (Default)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div className="template-info">
                <p>
                  <strong>Paper:</strong> {selectedTemplate.paperSize}{" "}
                  {selectedTemplate.orientation}
                </p>
                <p>
                  <strong>Fields:</strong> {selectedTemplate.bodyFields.length}
                </p>
              </div>
            )}

            <div className="template-actions">
              <button
                onClick={handlePreview}
                className="preview-btn"
                disabled={!selectedTemplate || loading}
              >
                👁️ Preview
              </button>
              <button
                onClick={handlePrint}
                className="print-action-btn"
                disabled={!selectedTemplate || loading}
              >
                {loading ? "⏳ Processing..." : "🖨️ Print"}
              </button>
              <button
                onClick={() => setShowSelector(false)}
                className="close-btn"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Print Preview Modal */}
      {preview && selectedTemplate && (
        <QuotationPrintPreview
          template={selectedTemplate}
          record={record}
          onClose={() => setPreview(false)}
          onPrint={handlePrint}
          ref={printRef}
        />
      )}
    </>
  );
};

/**
 * QuotationPrintPreview Component
 * Renders the quotation formatted according to the template
 */
const QuotationPrintPreview = React.forwardRef(({ template, record, onClose, onPrint }, ref) => {
  const handlePrint = () => {
    if (window.print) {
      window.print();
    }
    onPrint && onPrint();
  };

  // Map field IDs to record values
  const getFieldValue = (fieldId) => {
    // Handle nested fields like items.0.name
    const parts = fieldId.split(".");
    let value = record;

    for (const part of parts) {
      if (value && typeof value === "object") {
        value = value[part];
      } else {
        value = null;
        break;
      }
    }

    return value !== null && value !== undefined ? value : "-";
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="print-preview-modal">
      <div className="print-preview-header">
        <h3>Print Preview</h3>
        <button onClick={onClose} className="close-preview-btn">
          ✕
        </button>
      </div>

      <div className="print-preview-content" ref={ref}>
        <div
          className={`print-document ${template.orientation}`}
          style={{
            padding: `${template.margins.top}mm ${template.margins.right}mm ${template.margins.bottom}mm ${template.margins.left}mm`,
            fontFamily: template.fontFamily,
            fontSize: template.fontSize,
            lineHeight: template.lineSpacing,
            position: "relative",
            backgroundColor: "#fff",
          }}
        >
          {/* Watermark */}
          {template.watermark && (
            <div
              className="watermark"
              style={{
                opacity: template.watermarkOpacity,
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-45deg)",
                fontSize: "60px",
                color: "#ccc",
                zIndex: 0,
                pointerEvents: "none",
              }}
            >
              {template.watermark}
            </div>
          )}

          {/* Header */}
          {template.headerContent && (
            <div className="print-header">
              {template.headerContent.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 style={{ marginBottom: "20px", textAlign: "center" }}>
            {record.moduleName || template.module}
          </h1>

          {/* Body Fields */}
          <div className="print-body">
            {template.bodyFields.map((fieldId) => (
              <div key={fieldId} className="field-row">
                <span className="field-label">
                  {fieldId.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span className="field-value">
                  {formatValue(getFieldValue(fieldId))}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          {template.footerContent && (
            <div className="print-footer">
              {template.footerContent.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}

          {/* Signature */}
          {template.showSignature && (
            <div className="signature-area">
              <p>_____________________</p>
              <p>Authorized Signature</p>
            </div>
          )}
        </div>
      </div>

      <div className="print-preview-footer">
        <button onClick={handlePrint} className="print-now-btn">
          🖨️ Print Now
        </button>
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
      </div>

      <style>{`
        @media print {
          .print-preview-modal {
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

QuotationPrintPreview.displayName = "QuotationPrintPreview";

export default PrintTemplateSelector;
