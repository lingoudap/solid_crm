import React from "react";

// Preserves pre-existing behavior: this form edits `name`/`item`/`quantity`/`amount`
// while the backend expects `customerName`/`items[]`/`totalAmount`. The save request
// will fail with a 400. Phase 2 rebuilds this against the real schema.
export default function EditQuotationModal({
  quotation,
  onChange,
  onSubmit,
  onClose,
}) {
  if (!quotation) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Quotation</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Customer Name:</label>
            <input
              type="text"
              value={quotation.name || ""}
              onChange={(e) => onChange({ ...quotation, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Item:</label>
            <input
              type="text"
              value={quotation.item || ""}
              onChange={(e) => onChange({ ...quotation, item: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              value={quotation.quantity || ""}
              onChange={(e) =>
                onChange({ ...quotation, quantity: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              value={quotation.amount || ""}
              onChange={(e) =>
                onChange({ ...quotation, amount: e.target.value })
              }
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="save-btn">
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
