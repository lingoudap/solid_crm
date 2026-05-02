import React, { useEffect, useState } from "react";
import "../../../Quotation/quotation.css";

export default function EditLeadModal({ lead, onSubmit, onClose }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!lead) {
      setForm(null);
      return;
    }
    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      address: lead.address || "",
      state: lead.state || "",
      Source: lead.Source || "",
    });
  }, [lead]);

  if (!lead || !form) return null;

  const updateField = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      state: form.state.trim(),
      Source: form.Source.trim(),
      followUps: lead.followUps || [],
      customFields: lead.customFields || {},
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
            <h2>Edit Lead</h2>
            {lead.leadNumber && (
              <span className="eqm-quote-no">{lead.leadNumber}</span>
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
            <h3 className="eqm-section-title">Contact Details</h3>
            <div className="eqm-grid">
              <div className="eqm-field eqm-col-2">
                <label>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>
              <div className="eqm-field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div className="eqm-field">
                <label>Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div className="eqm-field eqm-col-2">
                <label>Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
              <div className="eqm-field">
                <label>State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
              </div>
              <div className="eqm-field">
                <label>Source</label>
                <input
                  type="text"
                  value={form.Source}
                  onChange={(e) => updateField("Source", e.target.value)}
                  placeholder="e.g. Website, Referral"
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
