import React, { useState, useEffect } from "react";
import { generatePDFFromTemplate, getTemplates, loadPrintLibraries } from "../../utils/printTemplateUtils";
import "./PrintTemplateSelector.css";

const PrintTemplateSelector = ({ module, record, onPrint }) => {
  const [templates, setTemplates] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load templates for this module
    const loadedTemplates = getTemplates(module);
    setTemplates(loadedTemplates);
  }, [module]);

  const handlePrint = async () => {
    if (!selectedTemplateId) {
      alert("Please select a template");
      return;
    }

    const template = templates[selectedTemplateId];
    if (!template) {
      alert("Template not found");
      return;
    }

    setLoading(true);
    try {
      // Load print libraries if needed
      await loadPrintLibraries();

      // Generate PDF
      const result = await generatePDFFromTemplate(
        template,
        record,
        localStorage.getItem("companyName") || "Company"
      );

      if (result.success) {
        if (onPrint) onPrint(template);
        setShowSelector(false);
      }
    } catch (error) {
      console.error("Error printing:", error);
      alert(`Print failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (Object.keys(templates).length === 0) {
    return (
      <div className="no-templates-message">
        <span>🖨️ No print templates available. </span>
        <span>Create one in Custom Prints module.</span>
      </div>
    );
  }

  return (
    <div className="print-template-selector">
      <button
        className="print-btn"
        onClick={() => setShowSelector(!showSelector)}
        title="Print using custom template"
      >
        🖨️ Print
      </button>

      {showSelector && (
        <div className="print-selector-dropdown">
          <div className="print-selector-header">
            <h4>Select Print Template</h4>
            <button
              className="close-btn"
              onClick={() => setShowSelector(false)}
            >
              ✕
            </button>
          </div>

          <div className="template-list">
            {Object.entries(templates).map(([id, template]) => (
              <div key={id} className="template-option">
                <input
                  type="radio"
                  id={`template-${id}`}
                  name="template"
                  value={id}
                  checked={selectedTemplateId === id}
                  onChange={() => setSelectedTemplateId(id)}
                />
                <label htmlFor={`template-${id}`}>
                  <span className="template-name">{template.name}</span>
                  <span className="template-details">
                    {template.bodyFields.length} fields • {template.paperSize}
                  </span>
                </label>
              </div>
            ))}
          </div>

          <button
            className="print-action-btn"
            onClick={handlePrint}
            disabled={loading || !selectedTemplateId}
          >
            {loading ? "⏳ Generating..." : "✓ Print"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PrintTemplateSelector;
