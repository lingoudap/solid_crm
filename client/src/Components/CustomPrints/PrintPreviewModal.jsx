import React from "react";

/**
 * PrintPreviewModal Component
 * Displays a modal with print preview of the template
 * Shows how the template will look when printed with sample data
 * Memoized to prevent unnecessary re-renders
 */
const PrintPreviewModal = ({
  isOpen,
  template,
  onClose,
  onPrint,
  generatePrintHTML,
  getSampleData,
  fieldOptions,
}) => {
  if (!isOpen || !template) return null;

  const sampleData = getSampleData(template.module);
  const fields = fieldOptions ? fieldOptions[template.module] || [] : [];
  const printHTML = generatePrintHTML(template, sampleData, fields);

  return (
    <div className="print-modal open">
      <div className="print-modal-content">
        {/* Modal Header */}
        <div className="print-modal-header">
          <h2>Print Preview - {template.name}</h2>
          <button
            className="print-modal-close"
            onClick={onClose}
            title="Close preview"
            aria-label="Close modal"
          >
            ✕ Close
          </button>
        </div>

        {/* Preview iframe */}
        <div className="print-modal-body">
          <iframe
            title="print-preview"
            srcDoc={printHTML}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="print-modal-footer">
          <button
            className="print-modal-btn print-modal-btn-print"
            onClick={() => onPrint(template)}
          >
            🖨️ Print Now
          </button>
          <button
            className="print-modal-btn print-modal-btn-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PrintPreviewModal);
