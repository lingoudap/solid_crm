import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CustomPrints.css";

const CustomPrints = () => {
  const [activeTab, setActiveTab] = useState("manage");
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem("customPrintTemplates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          Lead: parsed.Lead || {},
          Quotation: parsed.Quotation || {},
          Customer: parsed.Customer || {},
          Order: parsed.Order || {},
        };
      } catch (e) {
        console.error("Error parsing templates:", e);
        return initializeDefaultTemplates();
      }
    }
    return initializeDefaultTemplates();
  });

  // Enhanced default templates
  function initializeDefaultTemplates() {
    return {
      Lead: {},
      Quotation: {},
      Customer: {},
      Order: {},
    };
  }

  const [selectedModule, setSelectedModule] = useState("Lead");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [draggedField, setDraggedField] = useState(null);
  
  // Enhanced new template with more options
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    module: "Lead",
    headerContent: "",
    bodyFields: [],
    footerContent: "",
    showLogo: true,
    showDate: true,
    showPageNumber: true,
    showSignature: false,
    paperSize: "A4",
    orientation: "portrait",
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    fontSize: "12px",
    fontFamily: "Arial",
    lineSpacing: "1.5",
    watermark: "",
    watermarkOpacity: 0.1,
    isDefault: false,
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

  // Save templates to localStorage
  useEffect(() => {
    localStorage.setItem("customPrintTemplates", JSON.stringify(templates));
  }, [templates]);

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
    const currentFields = editingTemplate ? [...editingTemplate.bodyFields] : [...newTemplate.bodyFields];
    
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
    const currentFields = editingTemplate ? editingTemplate.bodyFields : newTemplate.bodyFields;
    
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
        bodyFields: editingTemplate.bodyFields.filter((_, i) => i !== index),
      });
    } else {
      setNewTemplate({
        ...newTemplate,
        bodyFields: newTemplate.bodyFields.filter((_, i) => i !== index),
      });
    }
  };

  // Save or create template
  const saveTemplate = () => {
    const template = editingTemplate || newTemplate;
    
    if (!template.name.trim()) {
      return showToast("Template name is required", "error");
    }

    if (template.bodyFields.length === 0) {
      return showToast("Add at least one field to the template body", "error");
    }

    const templateId = editingTemplate?.id || Date.now().toString();
    const module = editingTemplate?.module || selectedModule;

    // If setting as default, remove default from other templates in same module
    let updatedTemplates = { ...templates };
    
    if (template.isDefault) {
      Object.keys(updatedTemplates[module] || {}).forEach(key => {
        if (updatedTemplates[module][key]) {
          updatedTemplates[module][key].isDefault = false;
        }
      });
    }

    updatedTemplates[module] = {
      ...updatedTemplates[module],
      [templateId]: {
        ...template,
        id: templateId,
        module,
        lastModified: new Date().toISOString(),
      },
    };

    setTemplates(updatedTemplates);
    showToast(editingTemplate ? "Template updated!" : "Template created!");
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setNewTemplate({
      name: "",
      module: "Lead",
      headerContent: "",
      bodyFields: [],
      footerContent: "",
      showLogo: true,
      showDate: true,
      showPageNumber: true,
      showSignature: false,
      paperSize: "A4",
      orientation: "portrait",
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      fontSize: "12px",
      fontFamily: "Arial",
      lineSpacing: "1.5",
      watermark: "",
      watermarkOpacity: 0.1,
      isDefault: false,
    });
    setEditingTemplate(null);
  };

  // Create Professional Quotation Template
  const createProQuotationTemplate = () => {
    const proTemplate = {
      name: "Professional Quotation",
      module: "Quotation",
      headerContent: "Quotation Details",
      bodyFields: [
        "quoteId",
        "customerName",
        "email",
        "phone",
        "address",
        "items",
        "subtotal",
        "tax",
        "totalAmount",
        "validUntil",
        "terms"
      ],
      footerContent: "Thank you for your business!\nAuthorized Signatory",
      showLogo: true,
      showDate: true,
      showPageNumber: true,
      showSignature: true,
      paperSize: "A4",
      orientation: "portrait",
      margins: { top: 30, right: 25, bottom: 30, left: 25 },
      fontSize: "11px",
      fontFamily: "Arial",
      lineSpacing: "1.4",
      watermark: "",
      watermarkOpacity: 0.1,
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
    setEditingTemplate(template);
    setActiveTab("create");
    setSelectedModule(moduleKey);
  };

  // Delete template
  const deleteTemplate = (module, templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      setTemplates((prev) => {
        const newTemplates = { ...prev };
        if (newTemplates[module]) {
          delete newTemplates[module][templateId];
        }
        return newTemplates;
      });
      showToast("Template deleted!");
    }
  };

  // Set default template
  const setDefaultTemplate = (module, templateId) => {
    const updatedTemplates = { ...templates };
    
    // Remove default from all templates in module
    Object.keys(updatedTemplates[module] || {}).forEach(key => {
      if (updatedTemplates[module][key]) {
        updatedTemplates[module][key].isDefault = false;
      }
    });
    
    // Set new default
    if (updatedTemplates[module][templateId]) {
      updatedTemplates[module][templateId].isDefault = true;
    }
    
    setTemplates(updatedTemplates);
    showToast("Default template updated!");
  };

  // Show print preview
  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
    setShowPrintPreview(true);
  };

  // Print template
  const handlePrintTemplate = (template) => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintHTML(template, getSampleData(template.module));
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Generate print HTML
  const generatePrintHTML = (template, data) => {
    const fields = fieldOptions[template.module] || [];
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${template.name}</title>
        <style>
          @page {
            size: ${template.paperSize} ${template.orientation};
            margin: ${template.margins.top}mm ${template.margins.right}mm ${template.margins.bottom}mm ${template.margins.left}mm;
          }
          body {
            font-family: ${template.fontFamily};
            font-size: ${template.fontSize};
            line-height: ${template.lineSpacing};
            margin: 0;
            padding: 0;
          }
          .print-container {
            position: relative;
            min-height: 100vh;
          }
          ${template.watermark ? `
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(0,0,0,${template.watermarkOpacity});
            z-index: -1;
            white-space: nowrap;
          }
          ` : ''}
          .header { margin-bottom: 20px; }
          .footer { margin-top: 30px; }
          .field { margin-bottom: 10px; }
          .field-label { font-weight: bold; }
          .field-value { margin-left: 10px; }
          .signature { margin-top: 50px; }
          .page-number { position: absolute; bottom: 10px; right: 10px; }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${template.watermark ? `<div class="watermark">${template.watermark}</div>` : ''}
          
          ${template.headerContent ? `
          <div class="header">
            ${template.headerContent}
          </div>
          ` : ''}
          
          ${template.bodyFields.map(fieldId => {
            const field = fields.find(f => f.id === fieldId);
            const value = data[fieldId] || 'N/A';
            return `
            <div class="field">
              <span class="field-label">${field?.label}:</span>
              <span class="field-value">${value}</span>
            </div>
            `;
          }).join('')}
          
          ${template.footerContent ? `
          <div class="footer">
            ${template.footerContent}
          </div>
          ` : ''}
          
          ${template.showSignature ? `
          <div class="signature">
            <hr>
            <p>Signature: _______________________</p>
          </div>
          ` : ''}
          
          ${template.showDate ? `
          <div class="date">
            Date: ${new Date().toLocaleDateString()}
          </div>
          ` : ''}
          
          ${template.showPageNumber ? `
          <div class="page-number">
            Page 1
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  // Sample data for preview
  const getSampleData = (module) => {
    const sampleData = {
      Lead: {
        leadId: "LD-2023-001",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        company: "TechCorp Inc.",
        jobTitle: "CTO",
        address: "123 Tech Street, Suite 400",
        city: "San Francisco",
        state: "California",
        zipCode: "94107",
        source: "Website Inquiry",
        status: "Qualified",
        createdDate: "2023-10-15",
        lastContact: "2023-10-20",
        notes: "Interested in enterprise solution. Follow up next week."
      },
      Quotation: {
        quoteId: "QT-2023-045",
        customerName: "Sarah Johnson",
        company: "Global Enterprises",
        email: "sarah.j@globalent.com",
        phone: "+1 (555) 987-6543",
        address: "456 Business Ave, Floor 12\nNew York, NY 10001",
        items: "1x Premium Package - $2,500\n3x Add-on Services - $750",
        subtotal: "$3,250.00",
        tax: "$325.00",
        discount: "$250.00",
        totalAmount: "$3,325.00",
        validUntil: "2023-11-30",
        terms: "Net 30. 50% advance required.",
        createdDate: "2023-10-18"
      },
      Customer: {
        customerId: "CUST-1001",
        name: "Michael Chen",
        email: "michael.chen@innovate.com",
        phone: "+1 (555) 456-7890",
        company: "Innovate Solutions",
        address: "789 Innovation Drive\nBoston, MA 02108",
        city: "Boston",
        state: "Massachusetts",
        zipCode: "02108",
        customerType: "Premium",
        joinDate: "2022-03-15",
        totalOrders: "24",
        totalSpent: "$45,820.00",
        lastOrder: "2023-10-10"
      },
      Order: {
        orderId: "ORD-2023-567",
        customerName: "Emma Davis",
        email: "emma.davis@quickmail.com",
        phone: "+1 (555) 234-5678",
        shippingAddress: "321 Delivery Lane\nChicago, IL 60601",
        billingAddress: "Same as shipping address",
        items: "2x Product A - $199.99 each\n1x Product B - $89.99",
        subtotal: "$489.97",
        shippingCost: "$24.99",
        tax: "$41.25",
        totalAmount: "$556.21",
        paymentMethod: "Credit Card (Visa)",
        orderStatus: "Processing",
        orderDate: "2023-10-19",
        estimatedDelivery: "2023-10-26"
      }
    };
    
    return sampleData[module] || {};
  };

  // Render template preview
  const renderPreview = () => {
    const template = editingTemplate || newTemplate;
    const fields = fieldOptions[template.module] || [];
    const sampleData = getSampleData(template.module);
    
    return (
      <div className="preview-container">
        <div className="preview-header">
          📄 Template Preview - {template.name || "Untitled"}
        </div>
        <div className="preview-content">
          {template.watermark && (
            <div className="preview-watermark" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              fontSize: '60px',
              color: `rgba(0,0,0,${template.watermarkOpacity})`,
              zIndex: 0,
              whiteSpace: 'nowrap',
            }}>
              {template.watermark}
            </div>
          )}
          
          {template.showLogo && (
            <div className="preview-logo">🏢 Company Logo</div>
          )}
          
          {template.headerContent && (
            <div className="preview-section">
              <h3>Header</h3>
              <div style={{ fontFamily: template.fontFamily, fontSize: template.fontSize }}>
                {template.headerContent}
              </div>
            </div>
          )}

          <div className="preview-section">
            <h3>Data Fields</h3>
            {template.bodyFields.length === 0 ? (
              <p style={{ color: "#999" }}>No fields added</p>
            ) : (
              <div className="preview-fields">
                {template.bodyFields.map((fieldId, idx) => {
                  const field = fields.find(f => f.id === fieldId);
                  const value = sampleData[fieldId] || 'Sample Data';
                  return (
                    <div key={idx} className="preview-field">
                      <strong>{field?.label}:</strong> {value}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {template.footerContent && (
            <div className="preview-section">
              <h3>Footer</h3>
              <div style={{ fontFamily: template.fontFamily, fontSize: template.fontSize }}>
                {template.footerContent}
              </div>
            </div>
          )}

          {template.showSignature && (
            <div className="preview-section">
              <h3>Signature</h3>
              <div style={{ borderTop: '1px solid #000', paddingTop: '20px', width: '200px' }}>
                <p>Signature: _______________________</p>
                <p>Name: __________________________</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <div className="preview-meta">
            {template.showDate && (
              <div>Date: {new Date().toLocaleDateString()}</div>
            )}
            {template.showPageNumber && (
              <div>Page: 1 of 1</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Print Preview Modal
  const renderPrintPreviewModal = () => {
    if (!showPrintPreview || !previewTemplate) return null;
    
    const sampleData = getSampleData(previewTemplate.module);
    const printHTML = generatePrintHTML(previewTemplate, sampleData);
    
    return (
      <div className="print-preview-modal">
        <div className="preview-modal-content">
          <div className="preview-modal-header">
            <h2>Print Preview - {previewTemplate.name}</h2>
            <button className="close-modal" onClick={() => setShowPrintPreview(false)}>
              ×
            </button>
          </div>
          <iframe
            title="print-preview"
            srcDoc={printHTML}
            style={{ width: '100%', height: '600px', border: '1px solid #ddd' }}
          />
          <div className="template-actions" style={{ marginTop: '20px' }}>
            <button className="btn-print" onClick={() => handlePrintTemplate(previewTemplate)}>
              🖨️ Print Now
            </button>
            <button className="btn-cancel" onClick={() => setShowPrintPreview(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Manage Templates Tab
  const renderManageTab = () => (
    <div className="manage-templates">
      <div className="manage-header">
        <h2>📋 Manage Print Templates</h2>
        <p className="subtitle">Create, edit, and manage print templates for different modules</p>
      </div>

      {/* Module Selector */}
      <div className="module-selector">
        {modules.map((mod) => (
          <button
            key={mod}
            className={`module-btn ${selectedModule === mod ? "active" : ""}`}
            onClick={() => setSelectedModule(mod)}
          >
            {mod} ({Object.keys(templates[mod] || {}).length})
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Templates</h3>
          <p>{Object.values(templates).reduce((acc, mod) => acc + Object.keys(mod).length, 0)}</p>
        </div>
        <div className="stat-card">
          <h3>Default Templates</h3>
          <p>{Object.values(templates).filter(mod => 
            Object.values(mod).some(t => t.isDefault)
          ).length}</p>
        </div>
        <div className="stat-card">
          <h3>Last Created</h3>
          <p>{(() => {
            const allTemplates = Object.values(templates).flatMap(mod => Object.values(mod));
            const sorted = allTemplates.sort((a, b) => 
              new Date(b.lastModified || 0) - new Date(a.lastModified || 0)
            );
            return sorted[0] ? new Date(sorted[0].lastModified).toLocaleDateString() : 'N/A';
          })()}</p>
        </div>
      </div>

      {/* Templates List */}
      <div className="quick-templates" style={{ marginBottom: '30px' }}>
        <h3>🚀 Quick Templates</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>Start with a professional template and customize it</p>
        {selectedModule === "Quotation" && (
          <button 
            className="btn-save" 
            onClick={createProQuotationTemplate}
            style={{ 
              background: '#8b5cf6',
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ⭐ Create Professional Quotation
          </button>
        )}
      </div>

      {/* Templates List */}
      <div className="templates-grid">
        {Object.entries(templates[selectedModule] || {}).length === 0 ? (
          <div className="no-templates">
            <p>No templates for {selectedModule} yet.</p>
            <p>Create one by clicking "New Template"</p>
            <button 
              className="btn-save" 
              style={{ marginTop: '20px' }}
              onClick={() => setActiveTab("create")}
            >
              ➕ Create First Template
            </button>
          </div>
        ) : (
          Object.entries(templates[selectedModule] || {}).map(([id, template]) => (
            <div key={id} className="template-card">
              <div className="template-card-header">
                <div>
                  <h3>{template.name}</h3>
                  {template.isDefault && (
                    <span className="default-badge" style={{
                      background: '#10b981',
                      color: 'white',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      marginTop: '5px'
                    }}>
                      Default
                    </span>
                  )}
                </div>
                <span className="template-module-badge">{template.module}</span>
              </div>
              <div className="template-card-body">
                <p><strong>Fields:</strong> {template.bodyFields.length}</p>
                <p><strong>Paper:</strong> {template.paperSize} ({template.orientation})</p>
                <p><strong>Last Modified:</strong> {new Date(template.lastModified).toLocaleDateString()}</p>
              </div>
              <div className="template-card-actions">
                <button 
                  className="btn-preview"
                  onClick={() => handlePreviewTemplate(template)}
                >
                  👁️ Preview
                </button>
                <button 
                  className="btn-edit"
                  onClick={() => handleEditTemplate(selectedModule, id)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn-print"
                  onClick={() => handlePrintTemplate(template)}
                >
                  🖨️ Print
                </button>
                {!template.isDefault && (
                  <button 
                    className="btn-edit"
                    onClick={() => setDefaultTemplate(selectedModule, id)}
                  >
                    ⭐ Set Default
                  </button>
                )}
                <button 
                  className="btn-delete"
                  onClick={() => deleteTemplate(selectedModule, id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Create/Edit Template Tab
  const renderCreateTab = () => {
    const template = editingTemplate || newTemplate;
    const currentFields = fieldOptions[template.module] || [];
    const availableFields = currentFields.filter(field => !template.bodyFields.includes(field.id));
    
    return (
      <div className="create-template">
        <div className="create-header">
          <h2>{editingTemplate ? "✏️ Edit Template" : "➕ Create Print Template"}</h2>
          <p className="subtitle">
            {editingTemplate 
              ? "Modify your template settings and layout"
              : "Design a custom print template for your business needs"}
          </p>
        </div>

        {/* Info Banner for Quotation Templates */}
        {template.module === "Quotation" && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>💡 Pro Tip for Quotations</p>
            <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.5' }}>
              Include the <strong>Items List</strong> field to automatically display a professional table with Sr. No., Description, Qty, Price, and Subtotal. The system will format currency values with the rupee symbol.
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
                  onChange={(e) => {
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, name: e.target.value });
                    } else {
                      setNewTemplate({ ...newTemplate, name: e.target.value });
                    }
                  }}
                  placeholder="e.g., Professional Lead Report"
                  className="form-control"
                  required
                />
              </div>

              {!editingTemplate && (
                <div className="form-group">
                  <label>Select Module *</label>
                  <select
                    value={template.module}
                    onChange={(e) => setNewTemplate({ ...newTemplate, module: e.target.value })}
                    className="form-control"
                  >
                    {modules.map((mod) => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="toggle-switch">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={template.isDefault}
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, isDefault: e.target.checked });
                      } else {
                        setNewTemplate({ ...newTemplate, isDefault: e.target.checked });
                      }
                    }}
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
                  value={template.paperSize}
                  onChange={(e) => {
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, paperSize: e.target.value });
                    } else {
                      setNewTemplate({ ...newTemplate, paperSize: e.target.value });
                    }
                  }}
                  className="form-control"
                >
                  {paperSizes.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Orientation</label>
                <div className="orientation-buttons">
                  <button
                    type="button"
                    className={`orientation-btn ${template.orientation === 'portrait' ? 'active' : ''}`}
                    onClick={() => {
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, orientation: 'portrait' });
                      } else {
                        setNewTemplate({ ...newTemplate, orientation: 'portrait' });
                      }
                    }}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    className={`orientation-btn ${template.orientation === 'landscape' ? 'active' : ''}`}
                    onClick={() => {
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, orientation: 'landscape' });
                      } else {
                        setNewTemplate({ ...newTemplate, orientation: 'landscape' });
                      }
                    }}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Font Family</label>
                <select
                  value={template.fontFamily}
                  onChange={(e) => {
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, fontFamily: e.target.value });
                    } else {
                      setNewTemplate({ ...newTemplate, fontFamily: e.target.value });
                    }
                  }}
                  className="form-control"
                >
                  {fontFamilies.map(font => (
                    <option key={font.value} value={font.value}>{font.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Font Size</label>
                <select
                  value={template.fontSize}
                  onChange={(e) => {
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, fontSize: e.target.value });
                    } else {
                      setNewTemplate({ ...newTemplate, fontSize: e.target.value });
                    }
                  }}
                  className="form-control"
                >
                  <option value="10px">10px (Small)</option>
                  <option value="12px">12px (Normal)</option>
                  <option value="14px">14px (Large)</option>
                  <option value="16px">16px (Extra Large)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Middle Panel - Content */}
          <div className="editor-middle">
            <div className="form-section">
              <h3>📌 Header Content</h3>
              <p className="help-text">Add company information, title, or any header content</p>
              <textarea
                value={template.headerContent}
                onChange={(e) => {
                  if (editingTemplate) {
                    setEditingTemplate({ ...editingTemplate, headerContent: e.target.value });
                  } else {
                    setNewTemplate({ ...newTemplate, headerContent: e.target.value });
                  }
                }}
                placeholder="Example: 
Company Name
Address Line 1
Phone: (123) 456-7890
Email: info@company.com"
                className="textarea-control"
                rows="6"
              />
            </div>

            <div className="form-section">
              <h3>📄 Available Fields</h3>
              <p className="help-text">Click fields to add them to your template</p>
              <div className="fields-selector">
                {availableFields.length === 0 ? (
                  <p style={{ color: "#999" }}>All available fields have been added</p>
                ) : (
                  availableFields.map((field) => (
                    <button
                      key={field.id}
                      className="field-btn"
                      onClick={() => addBodyField(field.id)}
                      title={field.type}
                    >
                      {field.icon} {field.label}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>📌 Footer Content</h3>
              <p className="help-text">Add terms, conditions, signatures, or footer notes</p>
              <textarea
                value={template.footerContent}
                onChange={(e) => {
                  if (editingTemplate) {
                    setEditingTemplate({ ...editingTemplate, footerContent: e.target.value });
                  } else {
                    setNewTemplate({ ...newTemplate, footerContent: e.target.value });
                  }
                }}
                placeholder="Example:
Terms & Conditions:
1. Payment due in 30 days
2. All prices are exclusive of tax

Authorized Signature: ___________________"
                className="textarea-control"
                rows="6"
              />
            </div>
          </div>

          {/* Right Panel - Preview & Body Fields */}
          <div className="editor-right">
            {renderPreview()}

            <div className="selected-fields">
              <h3>Selected Fields ({template.bodyFields.length})</h3>
              <p className="help-text">Drag to reorder, click ✕ to remove</p>
              <div 
                className="fields-list"
                onDragOver={handleDragOver}
              >
                {template.bodyFields.length === 0 ? (
                  <p style={{ color: "#999", textAlign: 'center', padding: '20px' }}>
                    No fields selected. Add fields from the left panel.
                  </p>
                ) : (
                  template.bodyFields.map((fieldId, idx) => {
                    const field = currentFields.find(f => f.id === fieldId);
                    return (
                      <div 
                        key={idx}
                        className="draggable-field"
                        draggable
                        onDragStart={(e) => handleDragStart(e, fieldId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                      >
                        <span>{field?.icon} {field?.label || fieldId}</span>
                        <div>
                          <span className="drag-handle">☰</span>
                          <button
                            onClick={() => removeBodyField(idx)}
                            className="remove-field-btn"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Watermark Settings */}
            <div className="form-section" style={{ marginTop: '20px' }}>
              <h3>💧 Watermark</h3>
              <div className="form-group">
                <input
                  type="text"
                  value={template.watermark}
                  onChange={(e) => {
                    if (editingTemplate) {
                      setEditingTemplate({ ...editingTemplate, watermark: e.target.value });
                    } else {
                      setNewTemplate({ ...newTemplate, watermark: e.target.value });
                    }
                  }}
                  placeholder="Enter watermark text (e.g., DRAFT, CONFIDENTIAL)"
                  className="form-control"
                />
              </div>
              {template.watermark && (
                <div className="form-group">
                  <label>Watermark Opacity: {template.watermarkOpacity}</label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.05"
                    value={template.watermarkOpacity}
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({ ...editingTemplate, watermarkOpacity: parseFloat(e.target.value) });
                      } else {
                        setNewTemplate({ ...newTemplate, watermarkOpacity: parseFloat(e.target.value) });
                      }
                    }}
                    className="form-control"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="template-actions">
          <button onClick={saveTemplate} className="btn-save">
            {editingTemplate ? "💾 Update Template" : "✅ Create Template"}
          </button>
          <button onClick={() => handlePreviewTemplate(template)} className="btn-edit">
            👁️ Preview
          </button>
          <button onClick={resetForm} className="btn-cancel">
            ❌ Cancel
          </button>
        </div>
      </div>
    );
  };

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
          onClick={() => {
            setActiveTab("create");
            if (!editingTemplate) resetForm();
          }}
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
        {activeTab === "manage" ? renderManageTab() :
         activeTab === "create" ? renderCreateTab() :
         activeTab === "help" ? renderHelpTab() : null}
      </div>

      {/* Print Preview Modal */}
      {renderPrintPreviewModal()}
    </div>
  );
};

// Help Tab Component
const renderHelpTab = () => (
  <div className="help-tab">
    <h2>❓ Help & Best Practices</h2>
    <div className="help-sections">
      <div className="help-section">
        <h3>📋 Template Creation Tips</h3>
        <ul>
          <li>Start with a descriptive name that reflects the template's purpose</li>
          <li>Group related fields together for better readability</li>
          <li>Use headers for company information and footers for legal disclaimers</li>
          <li>Set a default template for each module for quick printing</li>
        </ul>
      </div>
      <div className="help-section">
        <h3>🎨 Design Best Practices</h3>
        <ul>
          <li>Use consistent font sizes throughout the document</li>
          <li>Leave adequate margins for physical printing</li>
          <li>Test print on actual paper before bulk printing</li>
          <li>Use watermarks for draft or confidential documents</li>
        </ul>
      </div>
      <div className="help-section">
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

export default CustomPrints;