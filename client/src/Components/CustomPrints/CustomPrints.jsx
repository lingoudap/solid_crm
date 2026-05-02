//customPrints.jsx
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

const CustomPrints = () => {
  const [activeTab, setActiveTab] = useState("manage");
  const { templates, loading, error, fetchTemplates, setTemplates } = useTemplates();
  const [selectedModule, setSelectedModule] = useState("Lead");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [draggedField, setDraggedField] = useState(null);

  // Enhanced new template with all required fields
  const [newTemplate, setNewTemplate] = useState({
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
  });

  // Enhanced field options with more business fields
  const fieldOptions = {
    Lead: [
      { id: "leadId", label: "Lead ID", icon: "🆔", type: "text" },
      { id: "name", label: "Name", icon: "👤", type: "text" },
      { id: "email", label: "Email", icon: "📧", type: "email" },
      { id: "phone", label: "Phone", icon: "📱", type: "phone" },
      { id: "company", label: "Company", icon: "🏢", type: "text" },
      { id: "jobTitle", label: "Job Title", icon: "💼", type: "text" },
      { id: "address", label: "Address", icon: "📍", type: "address" },
      { id: "city", label: "City", icon: "🏙️", type: "text" },
      { id: "state", label: "State", icon: "🗺️", type: "text" },
      { id: "zipCode", label: "Zip Code", icon: "📮", type: "text" },
      { id: "source", label: "Source", icon: "📌", type: "text" },
      { id: "status", label: "Status", icon: "📊", type: "status" },
      { id: "createdDate", label: "Created Date", icon: "📅", type: "date" },
      { id: "lastContact", label: "Last Contact", icon: "💬", type: "date" },
      { id: "notes", label: "Notes", icon: "📝", type: "textarea" },
    ],
    Quotation: [
      { id: "quoteId", label: "Quote ID", icon: "🆔", type: "text" },
      { id: "customerName", label: "Customer Name", icon: "👤", type: "text" },
      { id: "company", label: "Company", icon: "🏢", type: "text" },
      { id: "email", label: "Email", icon: "📧", type: "email" },
      { id: "phone", label: "Phone", icon: "📱", type: "phone" },
      { id: "address", label: "Address", icon: "📍", type: "address" },
      { id: "items", label: "Items List", icon: "📦", type: "table" },
      { id: "subtotal", label: "Subtotal", icon: "💰", type: "currency" },
      { id: "tax", label: "Tax", icon: "🏛️", type: "currency" },
      { id: "discount", label: "Discount", icon: "🎯", type: "currency" },
      { id: "totalAmount", label: "Total Amount", icon: "💵", type: "currency" },
      { id: "validUntil", label: "Valid Until", icon: "⏳", type: "date" },
      { id: "terms", label: "Terms & Conditions", icon: "📄", type: "textarea" },
      { id: "createdDate", label: "Created Date", icon: "📅", type: "date" },
    ],
    Customer: [
      { id: "customerId", label: "Customer ID", icon: "🆔", type: "text" },
      { id: "name", label: "Name", icon: "👤", type: "text" },
      { id: "email", label: "Email", icon: "📧", type: "email" },
      { id: "phone", label: "Phone", icon: "📱", type: "phone" },
      { id: "company", label: "Company", icon: "🏢", type: "text" },
      { id: "address", label: "Address", icon: "📍", type: "address" },
      { id: "city", label: "City", icon: "🏙️", type: "text" },
      { id: "state", label: "State", icon: "🗺️", type: "text" },
      { id: "zipCode", label: "Zip Code", icon: "📮", type: "text" },
      { id: "customerType", label: "Customer Type", icon: "🏷️", type: "text" },
      { id: "joinDate", label: "Join Date", icon: "📅", type: "date" },
      { id: "totalOrders", label: "Total Orders", icon: "📊", type: "number" },
      { id: "totalSpent", label: "Total Spent", icon: "💰", type: "currency" },
      { id: "lastOrder", label: "Last Order Date", icon: "🛒", type: "date" },
    ],
    Order: [
      { id: "orderId", label: "Order ID", icon: "🆔", type: "text" },
      { id: "customerName", label: "Customer Name", icon: "👤", type: "text" },
      { id: "email", label: "Email", icon: "📧", type: "email" },
      { id: "phone", label: "Phone", icon: "📱", type: "phone" },
      { id: "shippingAddress", label: "Shipping Address", icon: "🚚", type: "address" },
      { id: "billingAddress", label: "Billing Address", icon: "💳", type: "address" },
      { id: "items", label: "Items List", icon: "📦", type: "table" },
      { id: "subtotal", label: "Subtotal", icon: "💰", type: "currency" },
      { id: "shippingCost", label: "Shipping Cost", icon: "🚚", type: "currency" },
      { id: "tax", label: "Tax", icon: "🏛️", type: "currency" },
      { id: "totalAmount", label: "Total Amount", icon: "💵", type: "currency" },
      { id: "paymentMethod", label: "Payment Method", icon: "💳", type: "text" },
      { id: "orderStatus", label: "Order Status", icon: "📊", type: "status" },
      { id: "orderDate", label: "Order Date", icon: "📅", type: "date" },
      { id: "estimatedDelivery", label: "Estimated Delivery", icon: "📦", type: "date" },
    ],
  };

  const modules = ["Lead", "Quotation", "Customer", "Order"];

  // Paper size options
  const paperSizes = [
    { value: "A4", label: "A4 (210 × 297 mm)" },
    { value: "A3", label: "A3 (297 × 420 mm)" },
    { value: "Letter", label: "Letter (8.5 × 11 in)" },
    { value: "Legal", label: "Legal (8.5 × 14 in)" },
    { value: "Executive", label: "Executive (7.25 × 10.5 in)" },
  ];

  // Font family options
  const fontFamilies = [
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Georgia", label: "Georgia" },
    { value: "Courier New", label: "Courier New" },
    { value: "Verdana", label: "Verdana" },
  ];

  const showToast = (msg, type = "success") =>
    type === "success" ? toast.success(msg) : toast.error(msg);

  // Fetch templates when module changes
  useEffect(() => {
    fetchTemplates(selectedModule);
  }, [selectedModule]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
  }, [error]);

  // Drag and Drop functionality
  const handleDragStart = (e, fieldId) => {
    setDraggedField(fieldId);
    e.dataTransfer.setData("text/plain", fieldId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedField) return;

    const fieldId = draggedField;
    const currentFields = editingTemplate 
      ? [...(editingTemplate.bodyFields || [])] 
      : [...(newTemplate.bodyFields || [])];

    // Remove from current position
    const currentIndex = currentFields.indexOf(fieldId);
    if (currentIndex > -1) {
      currentFields.splice(currentIndex, 1);
    }

    // Insert at new position
    currentFields.splice(targetIndex, 0, fieldId);

    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        bodyFields: currentFields,
      });
    } else {
      setNewTemplate({
        ...newTemplate,
        bodyFields: currentFields,
      });
    }

    setDraggedField(null);
  };

  // Add field to body
  const addBodyField = (fieldId) => {
    const currentFields = editingTemplate 
      ? (editingTemplate.bodyFields || []) 
      : (newTemplate.bodyFields || []);

    if (!currentFields.includes(fieldId)) {
      if (editingTemplate) {
        setEditingTemplate({
          ...editingTemplate,
          bodyFields: [...currentFields, fieldId],
        });
      } else {
        setNewTemplate({
          ...newTemplate,
          bodyFields: [...currentFields, fieldId],
        });
      }
    }
  };

  // Remove field from body
  const removeBodyField = (index) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        bodyFields: (editingTemplate.bodyFields || []).filter((_, i) => i !== index),
      });
    } else {
      setNewTemplate({
        ...newTemplate,
        bodyFields: (newTemplate.bodyFields || []).filter((_, i) => i !== index),
      });
    }
  };

  // Save or create template via API
  const saveTemplate = async () => {
    try {
      const template = editingTemplate || newTemplate;

      if (!template.name.trim()) {
        return showToast("Template name is required", "error");
      }

      if (!template.content || !template.content.trim()) {
        return showToast("Template content is required", "error");
      }

      const module = editingTemplate?.module || selectedModule;

      // Prepare payload with only required fields for API
      const payload = {
        name: template.name.trim(),
        module,
        content: template.content.trim(),
        isDefault: template.isDefault ?? false,
      };

      if (editingTemplate && editingTemplate._id) {
        // Update existing template
        const response = await updateTemplateAxios(editingTemplate._id, payload);
        if (response.success) {
          showToast("✅ Template updated successfully!");
          await fetchTemplates(module);
        }
      } else {
        // Create new template
        const response = await createTemplateAxios(payload);
        if (response.success) {
          showToast("✅ Template created successfully!");
          await fetchTemplates(module);
        }
      }
      resetForm();
    } catch (err) {
      console.error("❌ Error saving template:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to save template";
      showToast(errorMsg, "error");
    }
  };

  // Reset form
  const resetForm = () => {
    setNewTemplate({
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
    });
    setEditingTemplate(null);
  };

  // Create Professional Quotation Template
  const createProQuotationTemplate = () => {
    const proTemplate = {
      name: "Professional Quotation",
      module: "Quotation",
      content: `<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'Arial', sans-serif;
    padding: 30px;
    line-height: 1.6;
    color: #333;
  }
  .quotation-container {
    max-width: 100%;
  }
  .header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 3px solid #007bff;
    padding-bottom: 20px;
  }
  .header h1 {
    font-size: 32px;
    color: #007bff;
    margin-bottom: 10px;
  }
  .header p {
    color: #666;
    margin: 5px 0;
  }
  .customer-info {
    background: #f9f9f9;
    padding: 15px;
    border-left: 4px solid #007bff;
    margin: 20px 0;
  }
  .customer-info h3 {
    color: #007bff;
    margin-bottom: 10px;
    font-size: 14px;
  }
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  .items-table th,
  .items-table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  .items-table th {
    background: #007bff;
    color: white;
    font-weight: bold;
  }
  .items-table tr:nth-child(even) {
    background: #f9f9f9;
  }
  .totals {
    text-align: right;
    margin: 30px 0;
    font-size: 14px;
  }
  .totals p {
    margin: 8px 0;
  }
  .total-amount {
    font-size: 16px;
    font-weight: bold;
    color: #007bff;
  }
  .terms {
    background: #f5f5f5;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
    font-size: 12px;
  }
  .footer {
    text-align: center;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
    color: #666;
    font-size: 12px;
  }
</style>

<div class="quotation-container">
  <div class="header">
    <h1>QUOTATION</h1>
    <p>Date: {{createdDate | formatDate}}</p>
    <p>Quote ID: {{quoteId}}</p>
  </div>

  <div class="customer-info">
    <h3>Bill To:</h3>
    <p><strong>{{customerName}}</strong></p>
    <p>{{company}}</p>
    <p>{{email}} | {{phone}}</p>
    <p>{{address}}</p>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Item Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{this.description}}</td>
        <td>{{this.quantity}}</td>
        <td>{{this.unitPrice | currency}}</td>
        <td>{{this.total | currency}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totals">
    <p>Subtotal: {{subtotal | currency}}</p>
    <p>Tax ({{taxRate}}%): {{tax | currency}}</p>
    <p class="total-amount">Total Amount: {{totalAmount | currency}}</p>
  </div>

  <div class="terms">
    <p><strong>Terms & Conditions:</strong></p>
    <p>{{terms}}</p>
    <p>Valid Until: {{validUntil | formatDate}}</p>
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Authorized Signatory: _______________________</p>
  </div>
</div>`,
      isDefault: true,
    };

    setNewTemplate(proTemplate);
    setSelectedModule("Quotation");
    setActiveTab("create");
    showToast("Professional quotation template loaded! Customize as needed.", "success");
  };

  // Edit template
  const handleEditTemplate = (moduleKey, templateId) => {
    const template = templates[moduleKey][templateId];
    setEditingTemplate({
      ...template,
      bodyFields: template.bodyFields || [],
      margins: template.margins || { top: 30, right: 25, bottom: 30, left: 25 },
    });
    setActiveTab("create");
    setSelectedModule(moduleKey);
  };

  // Delete template via API
  const deleteTemplate = async (module, templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        const response = await deleteTemplateAxios(templateId);
        if (response.success) {
          showToast("Template deleted successfully!");
          await fetchTemplates(module);
        }
      } catch (err) {
        console.error("❌ Error deleting template:", err);
        showToast(err.response?.data?.error || "Failed to delete template", "error");
      }
    }
  };

  // Set default template via API
  const setDefaultTemplate = async (module, templateId) => {
    try {
      const response = await setDefaultTemplateAxios(templateId);
      if (response.success) {
        showToast("Default template updated!");
        await fetchTemplates(module);
      }
    } catch (err) {
      console.error("❌ Error setting default template:", err);
      showToast(err.response?.data?.error || "Failed to set default template", "error");
    }
  };

  // Show print preview
  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
    setShowPrintPreview(true);
  };

  // Print template
  const handlePrintTemplate = (template) => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintHTML(template, getSampleData(template.module), fieldOptions[template.module] || []);

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Render template preview
  const renderPreview = () => {
    const template = editingTemplate || newTemplate;
    const sampleData = getSampleData(template.module);

    return <TemplatePreview template={template} sampleData={sampleData} />;
  };

  // Render Print Preview Modal
  const renderPrintPreviewModal = () => (
    <PrintPreviewModal
      isOpen={showPrintPreview}
      template={previewTemplate}
      onClose={() => setShowPrintPreview(false)}
      onPrint={handlePrintTemplate}
      generatePrintHTML={generatePrintHTML}
      getSampleData={getSampleData}
      fieldOptions={fieldOptions}
    />
  );

  // Manage Templates Tab
  const renderManageTab = () => (
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
      modules={modules}
    />
  );

  // Create/Edit Template Tab
  const renderCreateTab = () => {
    const template = editingTemplate || newTemplate;
    const isEditing = !!editingTemplate;

    // Helper to update template
    const setEditorTemplate = (updatedTemplate) => {
      if (isEditing) {
        setEditingTemplate(updatedTemplate);
      } else {
        setNewTemplate(updatedTemplate);
      }
    };

    return (
      <TemplateEditor
        template={template}
        setTemplate={setEditorTemplate}
        onSave={saveTemplate}
        onCancel={resetForm}
        onPreview={handlePreviewTemplate}
        fieldOptions={fieldOptions}
        modules={modules}
        isEditing={isEditing}
        renderPreview={renderPreview}
        paperSizes={paperSizes}
        fontFamilies={fontFamilies}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        removeBodyField={removeBodyField}
        addBodyField={addBodyField}
      />
    );
  };

  // Help Tab Component
  const renderHelpTab = () => (
    <div className="help-tab">
      <h2>❓ Help & Best Practices</h2>
      <div className="help-sections" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="help-section" style={{ flex: '1', minWidth: '250px' }}>
          <h3>📋 Template Creation Tips</h3>
          <ul>
            <li>Start with a descriptive name that reflects the template's purpose</li>
            <li>Group related fields together for better readability</li>
            <li>Use headers for company information and footers for legal disclaimers</li>
            <li>Set a default template for each module for quick printing</li>
          </ul>
        </div>
        <div className="help-section" style={{ flex: '1', minWidth: '250px' }}>
          <h3>🎨 Design Best Practices</h3>
          <ul>
            <li>Use consistent font sizes throughout the document</li>
            <li>Leave adequate margins for physical printing</li>
            <li>Test print on actual paper before bulk printing</li>
            <li>Use watermarks for draft or confidential documents</li>
          </ul>
        </div>
        <div className="help-section" style={{ flex: '1', minWidth: '250px' }}>
          <h3>🖨️ Printing Recommendations</h3>
          <ul>
            <li>A4 is standard for most business documents</li>
            <li>Use landscape for wide tables or charts</li>
            <li>Always preview before printing to save paper</li>
            <li>Consider duplex (double-sided) printing for lengthy reports</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="custom-prints-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Tabs */}
      <div className="print-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #ddd', marginBottom: '24px' }}>
        <button
          className={`tab-btn ${activeTab === "manage" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("manage");
            resetForm();
          }}
          style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'manage' ? '#1976d2' : 'transparent', color: activeTab === 'manage' ? 'white' : '#333', border: 'none', borderRadius: '4px 4px 0 0' }}
        >
          📋 Manage Templates
        </button>
        <button
          className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("create");
            if (!editingTemplate) resetForm();
          }}
          style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'create' ? '#1976d2' : 'transparent', color: activeTab === 'create' ? 'white' : '#333', border: 'none', borderRadius: '4px 4px 0 0' }}
        >
          ➕ Create New Template
        </button>
        <button
          className={`tab-btn ${activeTab === "help" ? "active" : ""}`}
          onClick={() => setActiveTab("help")}
          style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'help' ? '#1976d2' : 'transparent', color: activeTab === 'help' ? 'white' : '#333', border: 'none', borderRadius: '4px 4px 0 0' }}
        >
          ❓ Help & Tips
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "manage" && renderManageTab()}
        {activeTab === "create" && renderCreateTab()}
        {activeTab === "help" && renderHelpTab()}
      </div>

      {/* Print Preview Modal */}
      {renderPrintPreviewModal()}
    </div>
  );
};

export default CustomPrints;