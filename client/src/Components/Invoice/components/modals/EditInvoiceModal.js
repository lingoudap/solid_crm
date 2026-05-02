import React, { useEffect, useState } from "react";
import "../../../Quotation/quotation.css";
import INVOICE_CONFIG from "../../config";

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export default function EditInvoiceModal({ invoice, onSubmit, onClose }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!invoice) {
      setForm(null);
      return;
    }
    setForm({
      invoiceNumber: invoice.invoiceNumber || "",
      customerName: invoice.customerName || invoice.customerId?.name || "",
      invoiceDate: toDateInput(invoice.invoiceDate),
      dueDate: toDateInput(invoice.dueDate),
      totalAmount: invoice.totalAmount != null ? String(invoice.totalAmount) : "",
      taxAmount: invoice.taxAmount != null ? String(invoice.taxAmount) : "",
      notes: invoice.notes || "",
      status: invoice.status || "Draft",
    });
  }, [invoice]);

  if (!invoice || !form) return null;

  const updateField = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const payload = {
      invoiceNumber: form.invoiceNumber.trim(),
      customerName: form.customerName.trim(),
      invoiceDate: form.invoiceDate || null,
      dueDate: form.dueDate || null,
      totalAmount: form.totalAmount === "" ? 0 : Number(form.totalAmount),
      taxAmount: form.taxAmount === "" ? 0 : Number(form.taxAmount),
      notes: form.notes.trim(),
      status: form.status,
      // Preserve existing references — backend PUT zeroes orderId/customerId
      // if they're not included in the body.
      customerId: invoice.customerId?._id || invoice.customerId || null,
      orderId: invoice.orderId?._id || invoice.orderId || null,
    };

    setSaving(true);
    try {
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay eqm-overlay" onMouseDown={onClose}>
      <div
        className="modal-content eqm-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="eqm-header">
          <div>
            <h2>Edit Invoice</h2>
            {invoice.invoiceNumber && (
              <span className="eqm-quote-no">{invoice.invoiceNumber}</span>
            )}
          </div>
          <button
            type="button"
            className="eqm-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="eqm-form">
          <section className="eqm-section">
            <h3 className="eqm-section-title">Invoice Details</h3>
            <div className="eqm-grid">
              <div className="eqm-field">
                <label>Invoice Number *</label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) =>
                    updateField("invoiceNumber", e.target.value)
                  }
                  required
                />
              </div>
              <div className="eqm-field">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
                />
              </div>
              <div className="eqm-field">
                <label>Invoice Date</label>
                <input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => updateField("invoiceDate", e.target.value)}
                />
              </div>
              <div className="eqm-field">
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                />
              </div>
              <div className="eqm-field">
                <label>Total Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={(e) => updateField("totalAmount", e.target.value)}
                />
              </div>
              <div className="eqm-field">
                <label>Tax Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.taxAmount}
                  onChange={(e) => updateField("taxAmount", e.target.value)}
                />
              </div>
              <div className="eqm-field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  {INVOICE_CONFIG.STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="eqm-field eqm-col-2">
                <label>Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </div>
            </div>
          </section>

          <footer className="eqm-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
