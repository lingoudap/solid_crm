import React, { useState, useEffect } from "react";
import { useSettings } from "../../context/SettingsContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./settings.css";

const moduleConfig = {
  lead: {
    title: "Lead Settings",
    icon: "📋",
    description: "Configure lead sources, statuses, and priorities",
    fields: {
      sources: { label: "Lead Sources", placeholder: "e.g. Facebook, Google Ads" },
      status: { label: "Lead Statuses", placeholder: "e.g. Qualified, Nurturing" },
      priority: { label: "Priorities", placeholder: "e.g. Urgent, Normal" },
    },
  },
  customer: {
    title: "Customer Settings",
    icon: "👥",
    description: "Configure customer types and statuses",
    fields: {
      type: { label: "Customer Types", placeholder: "e.g. Wholesale, Retail" },
      status: { label: "Customer Statuses", placeholder: "e.g. Active, Churned" },
    },
  },
  quotation: {
    title: "Quotation Settings",
    icon: "📝",
    description: "Configure quotation statuses and types",
    fields: {
      status: { label: "Quotation Statuses", placeholder: "e.g. Pending, Approved" },
      type: { label: "Quotation Types", placeholder: "e.g. Proforma, Final" },
    },
  },
  order: {
    title: "Order Settings",
    icon: "📦",
    description: "Configure order statuses and payment statuses",
    fields: {
      status: { label: "Order Statuses", placeholder: "e.g. Confirmed, Dispatched" },
      paymentStatus: { label: "Payment Statuses", placeholder: "e.g. Due, Overdue" },
    },
  },
};

const ModuleSettings = ({ module, setActiveTab }) => {
  const { moduleSettings, addOption, removeOption } = useSettings();
  const config = moduleConfig[module];
  const [newValues, setNewValues] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");

  if (!config) return null;

  const currentValues = moduleSettings[module] || {};

  const handleAdd = async (field) => {
    const val = (newValues[field] || "").trim();
    if (!val) {
      toast.error("Enter a value");
      return;
    }
    const existing = currentValues[field] || [];
    if (existing.some((v) => v.toLowerCase() === val.toLowerCase())) {
      toast.error("This value already exists");
      return;
    }
    await addOption(module, field, val);
    setNewValues((prev) => ({ ...prev, [field]: "" }));
    toast.success(`Added "${val}"`);
  };

  const handleRemove = async (field, value) => {
    if (!window.confirm(`Remove "${value}"?`)) return;
    await removeOption(module, field, value);
    toast.success(`Removed "${value}"`);
  };

  const handleEditStart = (field, value) => {
    setEditingItem({ field, original: value });
    setEditValue(value);
  };

  const handleEditSave = async () => {
    if (!editingItem) return;
    const { field, original } = editingItem;
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error("Value cannot be empty");
      return;
    }
    if (trimmed === original) {
      setEditingItem(null);
      return;
    }
    const existing = currentValues[field] || [];
    if (existing.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("This value already exists");
      return;
    }
    // Remove old, add new
    await removeOption(module, field, original);
    await addOption(module, field, trimmed);
    setEditingItem(null);
    setEditValue("");
    toast.success(`Updated "${original}" to "${trimmed}"`);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(field);
    }
  };

  return (
    <div className="settings-container">
      <ToastContainer />
      <div className="module-settings-header">
        <span className="module-settings-icon">{config.icon}</span>
        <div>
          <h2>{config.title}</h2>
          <p className="module-settings-desc">{config.description}</p>
        </div>
      </div>

      <div className="module-settings-grid">
        {Object.entries(config.fields).map(([field, meta]) => {
          const values = currentValues[field] || [];
          return (
            <div key={field} className="module-field-card">
              <div className="module-field-header">
                <h3>{meta.label}</h3>
                <span className="module-field-count">{values.length} items</span>
              </div>

              <div className="module-field-add">
                <input
                  type="text"
                  className="form-control"
                  placeholder={meta.placeholder}
                  value={newValues[field] || ""}
                  onChange={(e) => setNewValues((prev) => ({ ...prev, [field]: e.target.value }))}
                  onKeyDown={(e) => handleKeyDown(e, field)}
                />
                <button className="btn-primary btn-sm" onClick={() => handleAdd(field)}>+ Add</button>
              </div>

              <div className="module-field-list">
                {values.length === 0 ? (
                  <p className="module-field-empty">No values configured. Add one above.</p>
                ) : (
                  values.map((val, idx) => (
                    <div key={idx} className="module-field-item">
                      {editingItem?.field === field && editingItem?.original === val ? (
                        <div className="module-field-edit-row">
                          <input
                            type="text"
                            className="form-control"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(); if (e.key === "Escape") setEditingItem(null); }}
                            autoFocus
                          />
                          <button className="btn-primary btn-sm" onClick={handleEditSave}>Save</button>
                          <button className="btn-secondary btn-sm" onClick={() => setEditingItem(null)}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <span className="module-field-value">{val}</span>
                          <div className="module-field-actions">
                            <button onClick={() => handleEditStart(field, val)} title="Edit">✏️</button>
                            <button onClick={() => handleRemove(field, val)} title="Remove">🗑️</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <button className="btn-secondary" onClick={() => setActiveTab(null)}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ModuleSettings;
