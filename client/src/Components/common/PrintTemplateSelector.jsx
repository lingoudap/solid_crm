import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./PrintTemplateSelector.css";

/**
 * PrintTemplateSelector Component
 * Reusable component for selecting a template and printing/downloading records
 * Uses backend PDF generation with Puppeteer
 * 
 * Props:
 * - module: 'Invoice' | 'Quotation' | 'Lead' | 'Order' (must match Template model enum)
 * - recordId: MongoDB ID of the record to print
 * - recordName: Display name for the record (e.g., "Invoice INV-001"), optional
 * - onPrint: Callback function after successful print, optional
 */
const PrintTemplateSelector = ({ module, recordId, recordName = "Document", onPrint }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(false);
  const [error, setError] = useState(null);

  // Load templates when module changes
  useEffect(() => {
    loadTemplates();
  }, [module]);

  const loadTemplates = async () => {
    if (!module) return;
    
    setFetchingTemplates(true);
    setError(null);
    try {
      const response = await axios.get(`/api/templates?module=${module}`);

      if (response.data.success && Array.isArray(response.data.data)) {
        const templatesArray = response.data.data;
        setTemplates(templatesArray);

        // Auto-select default template if available
        const defaultTemplate = templatesArray.find((t) => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate._id);
        } else if (templatesArray.length > 0) {
          // If no default, select the first one
          setSelectedTemplate(templatesArray[0]._id);
        }
      } else {
        const errorMsg = "Failed to load templates";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("❌ Error loading templates:", err);
      const errorMsg = err.response?.data?.error || "Failed to load templates. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setFetchingTemplates(false);
    }
  };

  const handlePrint = async () => {
    if (!recordId) {
      const msg = "Record ID is missing";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (templates.length === 0) {
      const msg = "No templates available for printing";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build URL with query parameters
      let url = `/api/print/generate?module=${module}&recordId=${recordId}`;

      // Add template ID if selected
      if (selectedTemplate) {
        url += `&templateId=${selectedTemplate}`;
      }

      // Open in new window for printing
      const printWindow = window.open(url, "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups in your browser.");
        return;
      }
      
      if (onPrint) {
        onPrint(selectedTemplate);
      }
      toast.success("Opening print preview...");
    } catch (err) {
      console.error("❌ Error printing:", err);
      const errorMsg = "Failed to open print preview";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!recordId) {
      const msg = "Record ID is missing";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (templates.length === 0) {
      const msg = "No templates available for downloading";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build URL with query parameters
      let url = `/api/print/download?module=${module}&recordId=${recordId}`;

      // Add template ID if selected
      if (selectedTemplate) {
        url += `&templateId=${selectedTemplate}`;
      }

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${module}-${recordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Downloading PDF...");
    } catch (err) {
      console.error("❌ Error downloading:", err);
      const errorMsg = "Failed to download PDF";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Preview opens in existing tab/window
    handlePrint();
  };

  // Render loading state
  if (fetchingTemplates) {
    return (
      <div className="print-template-selector">
        <select disabled className="template-select">
          <option>Loading templates...</option>
        </select>
        <button disabled className="print-btn">
          ⏳ Loading...
        </button>
      </div>
    );
  }

  // Render no templates state
  if (templates.length === 0) {
    return (
      <div className="print-template-selector">
        <div className="error-message">⚠️ No templates available for {module}</div>
        <select disabled className="template-select">
          <option>No templates available</option>
        </select>
        <button disabled className="print-btn" title="Create templates first">
          📄 No Templates
        </button>
        <button onClick={loadTemplates} className="retry-btn" title="Refresh template list">
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="print-template-selector">
      {/* Error message */}
      {error && <div className="error-message">⚠️ {error}</div>}

      {/* Template Selector */}
      <select
        value={selectedTemplate}
        onChange={(e) => {
          setSelectedTemplate(e.target.value);
          setError(null);
        }}
        disabled={loading}
        className="template-select"
        title="Select a print template"
      >
        <option value="">
          {templates.length === 0 ? "No templates" : "Select template (or use default)"}
        </option>
        {templates.map((template) => (
          <option key={template._id} value={template._id}>
            {template.name}
            {template.isDefault ? " (Default)" : ""}
          </option>
        ))}
      </select>

      {/* Print Button (View in browser) */}
      <button
        onClick={handlePrint}
        disabled={loading || !recordId || templates.length === 0}
        className="print-btn print-view-btn"
        title={templates.length === 0 ? "No templates available - create one first" : `Print ${recordName} in browser`}
      >
        {loading ? "⏳ Opening..." : "🖨️ Print"}
      </button>

      {/* Download Button (Save as PDF) */}
      <button
        onClick={handleDownload}
        disabled={loading || !recordId || templates.length === 0}
        className="print-btn print-download-btn"
        title={templates.length === 0 ? "No templates available - create one first" : `Download ${recordName} as PDF`}
      >
        {loading ? "⏳ Downloading..." : "⬇️ Download"}
      </button>
    </div>
  );
};

export default PrintTemplateSelector;
