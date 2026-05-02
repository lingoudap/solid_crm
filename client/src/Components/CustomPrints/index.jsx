import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CustomPrints.css";
import {
  createTemplateAxios,
  updateTemplateAxios,
  deleteTemplateAxios,
  setDefaultTemplateAxios,
} from "../../services/templateService";
import { useTemplates } from "../../hooks/useTemplates";
import { generatePrintHTML, getSampleData } from "../../utils/templateUtils";
import TemplateList from "./TemplateList";
import TemplateEditor from "./TemplateEditor";
import TemplatePreview from "./TemplatePreview";
import PrintPreviewModal from "./PrintPreviewModal";
import HelpTab from "./HelpTab";
import { FIELD_OPTIONS, PAPER_SIZES, FONT_FAMILIES, MODULES } from "./constants";

/**
 * CustomPrints Container Component
 * Main container for template management
 * Manages state and orchestrates sub-components
 */
const CustomPrints = () => {
  // Tabs state
  const [activeTab, setActiveTab] = useState("manage");

  // Templates hook
  const { templates, loading, error, fetchTemplates, setTemplates } = useTemplates();

  // Module selection
  const [selectedModule, setSelectedModule] = useState("Lead");

  // Template states
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState(getInitialTemplate());
  const [draggedField, setDraggedField] = useState(null);

  // Preview modal state
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Fetch templates when module changes
  useEffect(() => {
    fetchTemplates(selectedModule);
  }, [selectedModule]);

  function getInitialTemplate() {
    return {
      name: "",
      module: "Lead",
      content: "",
      isDefault: false,
      bodyFields: [],
      headerContent: "",
      footerContent: "",
      showLogo: false,
      showDate: true,
      showPageNumber: true,
      showSignature: false,
      paperSize: "A4",
      orientation: "portrait",
      margins: { top: 30, right: 25, bottom: 30, left: 25 },
      fontSize: "12px",
      fontFamily: "Arial",
      lineSpacing: "1.4",
      watermark: "",
      watermarkOpacity: 0.1,
    };
  }

  function resetForm() {
    setNewTemplate(getInitialTemplate());
    setEditingTemplate(null);
  }

  // Template API handlers
  async function saveTemplate() {
    const template = editingTemplate || newTemplate;

    if (!template.name.trim()) return toast.error("Template name is required");
    if (!template.content?.trim()) return toast.error("Template content is required");

    const module = editingTemplate?.module || selectedModule;
    const payload = {
      name: template.name.trim(),
      module,
      content: template.content.trim(),
      isDefault: template.isDefault ?? false,
    };

    try {
      if (editingTemplate?._id) {
        await updateTemplateAxios(editingTemplate._id, payload);
        toast.success("✅ Template updated successfully!");
      } else {
        await createTemplateAxios(payload);
        toast.success("✅ Template created successfully!");
      }
      await fetchTemplates(module);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save template");
    }
  }

  async function deleteTemplate(module, templateId) {
    if (!window.confirm("Delete this template?")) return;
    try {
      await deleteTemplateAxios(templateId);
      toast.success("Template deleted successfully!");
      await fetchTemplates(module);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete template");
    }
  }

  async function setDefaultTemplate(module, templateId) {
    try {
      await setDefaultTemplateAxios(templateId);
      toast.success("Default template updated!");
      await fetchTemplates(module);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to set default template");
    }
  }

  // Preview/Print handlers
  function handlePreviewTemplate(template) {
    setPreviewTemplate(template);
    setShowPrintPreview(true);
  }

  function handlePrintTemplate(template) {
    const printWindow = window.open("", "_blank");
    const printContent = generatePrintHTML(
      template,
      getSampleData(template.module),
      FIELD_OPTIONS[template.module] || []
    );
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  function handleEditTemplate(module, templateId) {
    const template = templates[module][templateId];
    setEditingTemplate({ ...template, bodyFields: template.bodyFields || [] });
    setActiveTab("create");
    setSelectedModule(module);
  }

  // Drag & Drop handlers
  function handleDragStart(e, fieldId) {
    setDraggedField(fieldId);
    e.dataTransfer.setData("text/plain", fieldId);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e, targetIndex) {
    e.preventDefault();
    if (!draggedField) return;

    const template = editingTemplate || newTemplate;
    const currentFields = [...(template.bodyFields || [])];
    const currentIndex = currentFields.indexOf(draggedField);

    if (currentIndex > -1) currentFields.splice(currentIndex, 1);
    currentFields.splice(targetIndex, 0, draggedField);

    const updatedTemplate = { ...template, bodyFields: currentFields };
    editingTemplate ? setEditingTemplate(updatedTemplate) : setNewTemplate(updatedTemplate);
    setDraggedField(null);
  }

  // Field handlers
  function addBodyField(fieldId) {
    const template = editingTemplate || newTemplate;
    const bodyFields = template.bodyFields || [];

    if (!bodyFields.includes(fieldId)) {
      const updatedTemplate = { ...template, bodyFields: [...bodyFields, fieldId] };
      editingTemplate ? setEditingTemplate(updatedTemplate) : setNewTemplate(updatedTemplate);
    }
  }

  function removeBodyField(index) {
    const template = editingTemplate || newTemplate;
    const updatedTemplate = {
      ...template,
      bodyFields: (template.bodyFields || []).filter((_, i) => i !== index),
    };
    editingTemplate ? setEditingTemplate(updatedTemplate) : setNewTemplate(updatedTemplate);
  }

  function createProQuotationTemplate() {
    const proTemplate = {
      name: "Professional Quotation",
      module: "Quotation",
      content: `<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Arial', sans-serif; padding: 30px; line-height: 1.6; color: #333; }
.quotation-container { max-width: 100%; }
.header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #007bff; padding-bottom: 20px; }
.header h1 { font-size: 32px; color: #007bff; margin-bottom: 10px; }
.customer-info { background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
.customer-info h3 { color: #007bff; margin-bottom: 10px; font-size: 14px; }
.items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
.items-table th { background: #007bff; color: white; font-weight: bold; }
.totals { text-align: right; margin: 30px 0; font-size: 14px; }
.total-amount { font-size: 16px; font-weight: bold; color: #007bff; }
</style>
<div class="quotation-container">
  <div class="header">
    <h1>QUOTATION</h1>
    <p>Quote ID: {{quoteId}}</p>
  </div>
  <div class="customer-info">
    <h3>Bill To:</h3>
    <p><strong>{{customerName}}</strong></p>
    <p>{{company}}</p>
    <p>{{email}} | {{phone}}</p>
  </div>
  <p>Thank you for your business!</p>
</div>`,
      isDefault: true,
      bodyFields: [],
      headerContent: "",
      footerContent: "",
      showSignature: false,
      showDate: true,
      showPageNumber: true,
      paperSize: "A4",
      orientation: "portrait",
      margins: { top: 30, right: 25, bottom: 30, left: 25 },
      fontSize: "12px",
      fontFamily: "Arial",
      lineSpacing: "1.4",
      watermark: "",
      watermarkOpacity: 0.1,
    };
    setNewTemplate(proTemplate);
    setSelectedModule("Quotation");
    setActiveTab("create");
    toast.success("Professional template loaded!");
  }

  return (
    <div className="custom-prints-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Tabs */}
      <div className="print-tabs">
        <button
          className={`tab-btn ${activeTab === "manage" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("manage");
            resetForm();
          }}
        >
          📋 Manage Templates
        </button>
        <button
          className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          ➕ Create New Template
        </button>
        <button
          className={`tab-btn ${activeTab === "help" ? "active" : ""}`}
          onClick={() => setActiveTab("help")}
        >
          ❓ Help & Tips
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "manage" && (
          <TemplateList
            templates={templates}
            selectedModule={selectedModule}
            setSelectedModule={setSelectedModule}
            onEdit={handleEditTemplate}
            onDelete={deleteTemplate}
            onSetDefault={setDefaultTemplate}
            onPreview={handlePreviewTemplate}
            onPrint={handlePrintTemplate}
            onCreateNew={() => setActiveTab("create")}
            onCreateProTemplate={createProQuotationTemplate}
            loading={loading}
            error={error}
            fetchTemplates={fetchTemplates}
            modules={MODULES}
          />
        )}

        {activeTab === "create" && (
          <TemplateEditor
            template={editingTemplate || newTemplate}
            setTemplate={(t) => (editingTemplate ? setEditingTemplate(t) : setNewTemplate(t))}
            onSave={saveTemplate}
            onCancel={resetForm}
            onPreview={handlePreviewTemplate}
            fieldOptions={FIELD_OPTIONS}
            modules={MODULES}
            isEditing={!!editingTemplate}
            renderPreview={() => (
              <TemplatePreview
                template={editingTemplate || newTemplate}
                sampleData={getSampleData((editingTemplate || newTemplate).module)}
              />
            )}
            paperSizes={PAPER_SIZES}
            fontFamilies={FONT_FAMILIES}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            removeBodyField={removeBodyField}
            addBodyField={addBodyField}
          />
        )}

        {activeTab === "help" && <HelpTab />}
      </div>

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        template={previewTemplate}
        onClose={() => setShowPrintPreview(false)}
        onPrint={handlePrintTemplate}
        generatePrintHTML={generatePrintHTML}
        getSampleData={getSampleData}
        fieldOptions={FIELD_OPTIONS}
      />
    </div>
  );
};

export default CustomPrints;
