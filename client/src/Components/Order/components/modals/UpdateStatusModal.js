import React, { useEffect, useState } from "react";
import ORDER_CONFIG from "../../config";

export default function UpdateStatusModal({ order, onClose, onSubmit }) {
  const [status, setStatus] = useState("New");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    setStatus(order.status || "New");
    setRemark("");
  }, [order]);

  if (!order) return null;

  const orderNo =
    order.orderNumber ||
    (order.orderId != null
      ? `O-${String(order.orderId).padStart(5, "0")}`
      : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit(order, status, remark.trim());
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
            {orderNo && <span className="usm-subtitle">{orderNo}</span>}
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
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {ORDER_CONFIG.STATUS_OPTIONS.map((s) => (
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
