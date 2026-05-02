import React, { useMemo } from "react";
import PrintTemplateSelector from "../../../common/PrintTemplateSelector";

const STATUS_CLASS = {
  New: "qt-status-new",
  Active: "qt-status-active",
  Converted: "qt-status-converted",
  Lost: "qt-status-lost",
};

const PRIORITY_CLASS = {
  High: "qt-priority-high",
  Medium: "qt-priority-medium",
  Low: "qt-priority-low",
};

const currencyFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function Field({ label, value, span = 1 }) {
  return (
    <div className={`vqm-field ${span === 2 ? "vqm-col-2" : ""}`}>
      <label>{label}</label>
      <div className="vqm-value">
        {value || value === 0 ? value : <span className="vqm-empty">—</span>}
      </div>
    </div>
  );
}

export default function ViewQuotationModal({ quotation, onClose }) {
  const quoteNo = quotation
    ? quotation.quotationNumber ||
      (quotation.quotationId != null
        ? `Q-${String(quotation.quotationId).padStart(5, "0")}`
        : null)
    : null;

  const items = quotation?.items || [];

  const totalAmount = useMemo(() => {
    if (quotation?.totalAmount != null) return Number(quotation.totalAmount);
    return items.reduce((acc, it) => acc + Number(it.subtotal || 0), 0);
  }, [quotation, items]);

  if (!quotation) return null;

  return (
    <div className="modal-overlay vqm-overlay" onMouseDown={onClose}>
      <div
        className="modal-content vqm-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="vqm-header">
          <div className="vqm-header-main">
            <h2>Quotation Details</h2>
            <div className="vqm-header-meta">
              {quoteNo && <span className="vqm-quote-no">{quoteNo}</span>}
              {quotation.status && (
                <span
                  className={`qt-status ${STATUS_CLASS[quotation.status] || ""}`}
                >
                  <span className="qt-status-dot" />
                  {quotation.status}
                </span>
              )}
              {quotation.priority && (
                <span
                  className={`qt-priority ${
                    PRIORITY_CLASS[quotation.priority] || ""
                  }`}
                >
                  <span className="qt-priority-bar" />
                  {quotation.priority}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="vqm-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="vqm-body">
          <section className="vqm-section">
            <h3 className="vqm-section-title">Customer Details</h3>
            <div className="vqm-grid">
              <Field
                label="Customer Name"
                value={quotation.customerName}
                span={2}
              />
              <Field label="Email" value={quotation.email} />
              <Field label="Phone" value={quotation.phone} />
              <Field label="Address" value={quotation.address} span={2} />
              <Field label="State" value={quotation.state} />
              <Field
                label="Created"
                value={
                  quotation.createdAt
                    ? dateFmt.format(new Date(quotation.createdAt))
                    : null
                }
              />
            </div>
          </section>

          <section className="vqm-section">
            <h3 className="vqm-section-title">Items</h3>
            {items.length === 0 ? (
              <div className="vqm-empty-block">No items on this quotation.</div>
            ) : (
              <div className="vqm-table-wrap">
                <table className="vqm-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: "32%" }}>Item</th>
                      <th style={{ width: "8%" }}>Qty</th>
                      <th style={{ width: "10%" }}>Unit</th>
                      <th style={{ width: "14%" }}>Price</th>
                      <th style={{ width: "10%" }}>Disc %</th>
                      <th style={{ width: "10%" }}>Tax %</th>
                      <th style={{ width: "16%" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.itemName || "—"}</td>
                        <td>{it.qty ?? "—"}</td>
                        <td>{it.unit || "—"}</td>
                        <td className="vqm-num">
                          {it.price != null
                            ? currencyFmt.format(Number(it.price))
                            : "—"}
                        </td>
                        <td>{it.discount ?? 0}</td>
                        <td>{it.tax ?? 0}</td>
                        <td className="vqm-num vqm-subtotal">
                          {it.subtotal != null
                            ? currencyFmt.format(Number(it.subtotal))
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="vqm-total">
              <span>Total Amount</span>
              <strong>{currencyFmt.format(totalAmount || 0)}</strong>
            </div>
          </section>

          {Array.isArray(quotation.followUpsNew) &&
            quotation.followUpsNew.length > 0 && (
              <section className="vqm-section">
                <h3 className="vqm-section-title">
                  Follow-ups
                  <span className="vqm-count">
                    {quotation.followUpsNew.length}
                  </span>
                </h3>
                <ul className="vqm-followups">
                  {quotation.followUpsNew.map((f) => (
                    <li key={f._id} className="vqm-followup-item">
                      <div className="vqm-followup-date">
                        {f.followUpDate
                          ? dateFmt.format(new Date(f.followUpDate))
                          : "—"}
                      </div>
                      <div className="vqm-followup-notes">
                        {f.notes || <span className="vqm-empty">No notes</span>}
                      </div>
                      {f.status && (
                        <span className="vqm-followup-status">{f.status}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
        </div>

        <footer className="vqm-footer">
          <PrintTemplateSelector
            module="Quotation"
            recordId={quotation._id}
            recordName={`Quotation ${quoteNo || quotation._id}`}
          />
          <button type="button" onClick={onClose} className="cancel-btn">
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
