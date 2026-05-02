import React from "react";

export default function CustomersQuickPreview({ customer, onClose }) {
  if (!customer) return null;

  return (
    <>
      <div className="quick-preview-overlay" onClick={onClose} />
      <div className="quick-preview-drawer">
        <div className="quick-preview-header">
          <h3>Quick Preview</h3>
          <button onClick={onClose} className="quick-preview-close">
            ✕
          </button>
        </div>
        <div className="quick-preview-content">
          <div className="preview-item">
            <span className="preview-label">Name:</span>
            <span className="preview-value">{customer.name}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Phone:</span>
            <span className="preview-value">{customer.phone || "-"}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Email:</span>
            <span className="preview-value">{customer.email || "-"}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">State:</span>
            <span className="preview-value">{customer.state || "-"}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Address:</span>
            <span className="preview-value">{customer.address || "-"}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Created:</span>
            <span className="preview-value">
              {customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString()
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
