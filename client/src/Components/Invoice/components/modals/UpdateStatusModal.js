import React, { useEffect, useState } from "react";
import INVOICE_CONFIG from "../../config";

export default function UpdateStatusModal({ invoice, onClose, onSubmit }) {
  const [status, setStatus] = useState("Draft");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!invoice) return;
    setStatus(invoice.status || "Draft");
    setRemark("");
  }, [invoice]);

  if (!invoice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit(invoice, status, remark.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay usm-overlay" onMouseDown={onClose}>
      <div
        className="modal-content usm-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="usm-header">
          <div>
            <h2>Update Status</h2>
            {invoice.invoiceNumber && (
              <span className="usm-subtitle">{invoice.invoiceNumber}</span>
            )}
          </div>
          <button
            type="button"
            className="usm-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="usm-form">
          <div className="usm-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {INVOICE_CONFIG.STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="usm-field">
            <label>Remark (optional)</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add a note about this status change…"
              rows={4}
            />
          </div>

          <footer className="usm-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Updating…" : "Update Status"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
