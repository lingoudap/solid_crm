import React, { useEffect, useMemo, useState } from "react";
import "../../../Quotation/quotation.css";
import ORDER_CONFIG from "../../config";

const EMPTY_ITEM = {
  itemName: "",
  qty: 1,
  unit: "",
  price: 0,
  discount: 0,
  tax: 0,
  subtotal: 0,
};

function calcSubtotal({ qty, price, discount, tax }) {
  const base = Number(qty || 0) * Number(price || 0);
  const afterDiscount = base - (base * Number(discount || 0)) / 100;
  const taxAmount = (afterDiscount * Number(tax || 0)) / 100;
  return Number((afterDiscount + taxAmount).toFixed(2));
}

export default function EditOrderModal({ order, onSubmit, onClose }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) {
      setForm(null);
      return;
    }
    const seedItems = order.items?.length ? order.items : [EMPTY_ITEM];
    setForm({
      customerName: order.customerName || "",
      email: order.email || "",
      phone: order.phone || "",
      address: order.address || "",
      state: order.state || "",
      status: order.status || "New",
      items: seedItems.map((it) => ({
        itemName: it.itemName || "",
        qty: Number(it.qty || 0),
        unit: it.unit || "",
        price: Number(it.price || 0),
        discount: Number(it.discount || 0),
        tax: Number(it.tax || 0),
        subtotal: Number(it.subtotal || 0),
      })),
    });
  }, [order]);

  const totalAmount = useMemo(
    () =>
      (form?.items || []).reduce(
        (acc, it) => acc + Number(it.subtotal || 0),
        0
      ),
    [form]
  );

  if (!order || !form) return null;

  const updateField = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }));

  const updateItem = (idx, key, value) => {
    setForm((p) => {
      const items = p.items.map((it, i) => {
        if (i !== idx) return it;
        const next = {
          ...it,
          [key]:
            key === "itemName" || key === "unit" ? value : Number(value || 0),
        };
        next.subtotal = calcSubtotal(next);
        return next;
      });
      return { ...p, items };
    });
  };

  const addRow = () =>
    setForm((p) => ({ ...p, items: [...p.items, { ...EMPTY_ITEM }] }));

  const removeRow = (idx) =>
    setForm((p) =>
      p.items.length > 1
        ? { ...p, items: p.items.filter((_, i) => i !== idx) }
        : p
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const payload = {
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      state: form.state.trim(),
      status: form.status,
      items: form.items.map((it) => ({
        itemName: it.itemName.trim(),
        qty: Number(it.qty),
        unit: it.unit,
        price: Number(it.price),
        discount: Number(it.discount),
        tax: Number(it.tax),
        subtotal: Number(it.subtotal),
      })),
      totalAmount: Number(totalAmount.toFixed(2)),
    };

    setSaving(true);
    try {
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  const orderNo =
    order.orderNumber ||
    (order.orderId != null
      ? `O-${String(order.orderId).padStart(5, "0")}`
      : null);

  return (
    <div className="modal-overlay eqm-overlay" onMouseDown={onClose}>
      <div
        className="modal-content eqm-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="eqm-header">
          <div>
            <h2>Edit Order</h2>
            {orderNo && <span className="eqm-quote-no">{orderNo}</span>}
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
            <h3 className="eqm-section-title">Customer Details</h3>
            <div className="eqm-grid">
              <div className="eqm-field eqm-col-2">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
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
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  {ORDER_CONFIG.STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="eqm-section">
            <div className="eqm-items-head">
              <h3 className="eqm-section-title">Items</h3>
              <button type="button" className="eqm-add-btn" onClick={addRow}>
                + Add Item
              </button>
            </div>

            <div className="eqm-table-wrap">
              <table className="eqm-items-table">
                <thead>
                  <tr>
                    <th style={{ width: "26%" }}>Item</th>
                    <th style={{ width: "8%" }}>Qty</th>
                    <th style={{ width: "10%" }}>Unit</th>
                    <th style={{ width: "12%" }}>Price</th>
                    <th style={{ width: "10%" }}>Disc %</th>
                    <th style={{ width: "10%" }}>Tax %</th>
                    <th style={{ width: "14%" }}>Subtotal</th>
                    <th style={{ width: "10%" }} />
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          value={it.itemName}
                          onChange={(e) =>
                            updateItem(idx, "itemName", e.target.value)
                          }
                          placeholder="Item name"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={it.qty}
                          onChange={(e) =>
                            updateItem(idx, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) =>
                            updateItem(idx, "unit", e.target.value)
                          }
                          placeholder="pcs"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={it.price}
                          onChange={(e) =>
                            updateItem(idx, "price", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={it.discount}
                          onChange={(e) =>
                            updateItem(idx, "discount", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={it.tax}
                          onChange={(e) =>
                            updateItem(idx, "tax", e.target.value)
                          }
                        />
                      </td>
                      <td className="eqm-subtotal">
                        ₹{Number(it.subtotal).toFixed(2)}
                      </td>
                      <td className="eqm-row-action">
                        <button
                          type="button"
                          className="eqm-remove-btn"
                          disabled={form.items.length === 1}
                          onClick={() => removeRow(idx)}
                          aria-label="Remove item"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="eqm-total">
              <span>Total Amount</span>
              <strong>₹{totalAmount.toFixed(2)}</strong>
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
