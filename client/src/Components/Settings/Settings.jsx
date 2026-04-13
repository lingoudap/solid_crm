// Settings.jsx - A comprehensive settings page with customizable form fields
import React, { useState, useEffect } from "react";
import { useSettings } from "../../context/SettingsContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GeneralSettings from "./GeneralSettings";
import ModuleSettings from "./ModuleSettings";
import CompanyProfile from "./CompanyProfile";
import "./settings.css";

const Settings = () => {
  const { moduleSettings, updateCustomFields } = useSettings();
  const [activeTab, setActiveTab] = useState(null);
  const [selectedForm, setSelectedForm] = useState("Lead");
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("userSettings");
    return savedSettings ? JSON.parse(savedSettings) : {
      theme: "light",
      language: "en",
      notifications: true,
      autoSave: true,
      customFields: {
        Lead: [],
        Quotation: [],
        Customer: [],
        Order: []
      }
    };
  });
  const [newField, setNewField] = useState({
    label: "",
    name: "",
    type: "text",
    options: "",
    required: false,
    purpose: ""
  });
  const [editingField, setEditingField] = useState(null);

  const fieldTypes = [
    { value: "text", label: "Text", icon: "📝" },
    { value: "email", label: "Email", icon: "📧" },
    { value: "number", label: "Number", icon: "🔢" },
    { value: "date", label: "Date", icon: "📅" },
    { value: "dropdown", label: "Dropdown", icon: "📋" },
    { value: "checkbox", label: "Checkbox", icon: "☑️" },
    { value: "textarea", label: "Text Area", icon: "📄" },
    { value: "phone", label: "Phone", icon: "📱" },
    { value: "url", label: "URL", icon: "🔗" },
    { value: "currency", label: "Currency", icon: "💰" }
  ];

  // Initialize default structure and sync with moduleSettings
  useEffect(() => {
    if (!settings.customFields) {
      setSettings({
        ...settings,
        customFields: { Lead: [], Quotation: [], Customer: [], Order: [] }
      });
    }
  }, [settings]);

  // Auto-save changes and sync with context
  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
    // Update custom fields in context
    if (updateCustomFields) {
      updateCustomFields(settings.customFields);
    }
  }, [settings, updateCustomFields]);

  const showToast = (msg, type = "success") =>
    type === "success" ? toast.success(msg) : toast.error(msg);

  const generateFieldName = (label) =>
    label.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "_");

  const normalizeOptions = (opts) =>
    Array.isArray(opts)
      ? opts
      : opts
        ? opts.split(",").map((o) => o.trim()).filter((o) => o)
        : [];

  // ✅ Add Field
  const addCustomField = () => {
    if (!newField.label.trim()) return showToast("Enter field label", "error");

    // Generate name automatically if missing
    if (!newField.name || !newField.name.trim()) {
      newField.name = generateFieldName(newField.label);
    }

    // Safe duplicate check
    const duplicate = (settings.customFields[selectedForm] || []).some(
      (f) =>
        f.name &&
        newField.name &&
        f.name.toLowerCase() === newField.name.toLowerCase()
    );
    if (duplicate) return showToast("Duplicate field name", "error");

    const field = {
      ...newField,
      id: Date.now().toString(),
      name: generateFieldName(newField.name),
      options:
        newField.type === "dropdown" ? normalizeOptions(newField.options) : []
    };

    setSettings((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [selectedForm]: [...(prev.customFields[selectedForm] || []), field]
      }
    }));

    setNewField({
      label: "",
      name: "",
      type: "text",
      options: "",
      required: false,
      purpose: ""
    });

    showToast("Field added successfully!");
  };

  // ✅ Edit Field
  const handleEditField = (field) =>
    setEditingField({
      ...field,
      options:
        field.type === "dropdown"
          ? Array.isArray(field.options)
            ? field.options.join(", ")
            : field.options || ""
          : ""
    });

  // ✅ Update Field
  const updateCustomField = () => {
    setSettings((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [selectedForm]: prev.customFields[selectedForm].map((f) =>
          f.id === editingField.id
            ? {
              ...editingField,
              options:
                editingField.type === "dropdown"
                  ? normalizeOptions(editingField.options)
                  : []
            }
            : f
        )
      }
    }));
    setEditingField(null);
    showToast("Field updated successfully!");
  };

  // ✅ Remove Field
  const removeCustomField = (form, id) => {
    setSettings((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [form]: prev.customFields[form].filter((f) => f.id !== id)
      }
    }));
    showToast("Field removed successfully!");
  };

  // 🧩 Render Customizable Settings Page
  const renderCustomizableSettings = () => (
    <div className="settings-container">
      <ToastContainer />
      <h2>🎨 Custom Form Fields</h2>

      <div className="settings-content">
        {/* Sidebar */}
        <div className="settings-sidebar">
          {["Lead", "Quotation", "Customer", "Order"].map((form) => (
            <button
              key={form}
              className={`form-type-button ${selectedForm === form ? "active" : ""
                }`}
              onClick={() => setSelectedForm(form)}
            >
              {form} Form ({(settings.customFields?.[form] || []).length})
            </button>
          ))}
        </div>

        {/* Main Form */}
        <div className="settings-main">
          <div className="settings-card">
            <h3>{editingField ? "✏️ Edit Field" : "➕ Add Field"}</h3>

            {/* Label */}
            <input
              className="form-control"
              placeholder="Field Label"
              value={editingField ? editingField.label : newField.label}
              onChange={(e) =>
                editingField
                  ? setEditingField({
                    ...editingField,
                    label: e.target.value,
                    name: generateFieldName(e.target.value)
                  })
                  : setNewField({
                    ...newField,
                    label: e.target.value,
                    name: generateFieldName(e.target.value)
                  })
              }
            />

            {/* Type */}
            <select
              className="form-control"
              value={editingField ? editingField.type : newField.type}
              onChange={(e) =>
                editingField
                  ? setEditingField({ ...editingField, type: e.target.value })
                  : setNewField({ ...newField, type: e.target.value })
              }
            >
              {fieldTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>

            {/* Dropdown Options */}
            {(editingField ? editingField.type : newField.type) ===
              "dropdown" && (
                <textarea
                  className="form-control"
                  placeholder="Enter options (comma separated)"
                  value={editingField ? editingField.options : newField.options}
                  onChange={(e) =>
                    editingField
                      ? setEditingField({
                        ...editingField,
                        options: e.target.value
                      })
                      : setNewField({ ...newField, options: e.target.value })
                  }
                />
              )}

            {/* Required Checkbox */}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editingField ? editingField.required : newField.required}
                onChange={(e) =>
                  editingField
                    ? setEditingField({
                      ...editingField,
                      required: e.target.checked
                    })
                    : setNewField({ ...newField, required: e.target.checked })
                }
              />
              Required Field
            </label>

            {/* Add/Update Button */}
            <div className="form-actions">
              {editingField ? (
                <>
                  <button onClick={updateCustomField} className="btn-primary">
                    ✅ Update
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={addCustomField} className="btn-primary">
                  ➕ Add Field
                </button>
              )}
            </div>
          </div>

          {/* Existing Fields */}
          <div className="settings-card">
            <h3>{selectedForm} Form Fields</h3>
            <div className="field-list">
              {(settings.customFields?.[selectedForm] || []).length === 0 ? (
                <p>No custom fields yet.</p>
              ) : (
                settings.customFields[selectedForm].map((f) => (
                  <div key={f.id} className="field-item">
                    <div>
                      <strong>{f.label}</strong> ({f.type})
                      {f.required && (
                        <span className="required-badge">Required</span>
                      )}
                    </div>
                    <div className="field-actions">
                      <button onClick={() => handleEditField(f)}>✏️</button>
                      <button
                        onClick={() => removeCustomField(selectedForm, f.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-10">
        <button className="btn-secondary" onClick={() => setActiveTab(null)}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  // Tabs
  if (activeTab === "general")
    return <GeneralSettings setActiveTab={setActiveTab} />;
  if (activeTab === "customizable") return renderCustomizableSettings();
  if (activeTab === "company")
    return <CompanyProfile setActiveTab={setActiveTab} />;
  if (activeTab === "lead")
    return <ModuleSettings module="lead" setActiveTab={setActiveTab} />;
  if (activeTab === "customer")
    return <ModuleSettings module="customer" setActiveTab={setActiveTab} />;
  if (activeTab === "quotation")
    return <ModuleSettings module="quotation" setActiveTab={setActiveTab} />;
  if (activeTab === "order")
    return <ModuleSettings module="order" setActiveTab={setActiveTab} />;

  // Default Settings Dashboard
  return (
    <div className="settings-dashboard">
      <ToastContainer />
      <h1>⚙️ Settings Dashboard</h1>
      <div className="dashboard-grid">
        <div className="settings-card clickable" onClick={() => setActiveTab("general")}>
          <span className="settings-card-icon">⚙️</span>
          <h3>General Settings</h3>
          <p>Manage theme, notifications, language, and logo.</p>
        </div>

        <div className="settings-card clickable" onClick={() => setActiveTab("company")}>
          <span className="settings-card-icon">🏢</span>
          <h3>Company Profile</h3>
          <p>Company name, address, contact, and tax details.</p>
        </div>

        <div className="settings-card clickable" onClick={() => setActiveTab("customizable")}>
          <span className="settings-card-icon">🎨</span>
          <h3>Custom Form Fields</h3>
          <p>Create and manage custom fields for your forms.</p>
        </div>

        <div className="settings-card clickable" onClick={() => setActiveTab("lead")}>
          <span className="settings-card-icon">📋</span>
          <h3>Lead Settings</h3>
          <p>Configure lead sources, statuses, and priorities.</p>
        </div>

        <div className="settings-card clickable" onClick={() => setActiveTab("customer")}>
          <span className="settings-card-icon">👥</span>
          <h3>Customer Settings</h3>
          <p>Configure customer types and statuses.</p>
        </div>

        <div className="settings-card clickable" onClick={() => setActiveTab("quotation")}>
          <span className="settings-card-icon">📝</span>
          <h3>Quotation Settings</h3>
          <p>Configure quotation statuses and types.</p>
        </div>

        <div className="settings-card clickable" onClick={() => setActiveTab("order")}>
          <span className="settings-card-icon">📦</span>
          <h3>Order Settings</h3>
          <p>Configure order and payment statuses.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
