import React, { useEffect, useState } from "react";
import "../../../Quotation/quotation.css";

export default function EditCustomerModal({ customer, onSubmit, onClose }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customer) {
      setForm(null);
      return;
    }
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      state: customer.state || "",
    });
  }, [customer]);

  if (!customer || !form) return null;

  const updateField = (key, value) => {
    let v = value;
    if (key === "phone") v = v.replace(/\D/g, "").slice(0, 10);
    setForm((p) => ({ ...p, [key]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (form.phone && form.phone.length !== 10) {
      alert("❌ Phone number must be exactly 10 digits");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      state: form.state.trim(),
      customFields: customer.customFields || {},
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
            <h2>Edit Customer</h2>
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
                <label>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>
              <div className="eqm-field">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  maxLength="10"
                  required
                />
              </div>
              <div className="eqm-field eqm-col-2">
                <label>Address *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  required
                />
              </div>
              <div className="eqm-field">
                <label>State *</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  required
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
