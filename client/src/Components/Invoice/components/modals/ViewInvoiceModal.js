import React from "react";
import PrintTemplateSelector from "../../../common/PrintTemplateSelector";
import "../../../Quotation/quotation.css";

const STATUS_CLASS = {
  Draft: "iv-status-draft",
  Sent: "iv-status-sent",
  Paid: "iv-status-paid",
  Overdue: "iv-status-overdue",
  Cancelled: "iv-status-cancelled",
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

const dateOnlyFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
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

export default function ViewInvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  const sourceOrder = invoice.orderId;
  const sourceLabel = sourceOrder?.orderId
    ? `O-${String(sourceOrder.orderId).padStart(5, "0")}`
    : null;

  const customerName =
    invoice.customerName || invoice.customerId?.name || null;

  const totalAmount = Number(invoice.totalAmount || 0);
  const taxAmount = Number(invoice.taxAmount || 0);

  return (
    <div className="modal-overlay vqm-overlay" onMouseDown={onClose}>
      <div
        className="modal-content vqm-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="vqm-header">
          <div className="vqm-header-main">
            <h2>Invoice Details</h2>
            <div className="vqm-header-meta">
              {invoice.invoiceNumber && (
                <span className="vqm-quote-no">{invoice.invoiceNumber}</span>
              )}
              {invoice.status && (
                <span
                  className={`iv-status ${STATUS_CLASS[invoice.status] || ""}`}
                >
                  <span className="iv-status-dot" />
                  {invoice.status}
                </span>
              )}
              {sourceLabel && (
                <span className="iv-source-pill">From {sourceLabel}</span>
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
            <h3 className="vqm-section-title">Customer</h3>
            <div className="vqm-grid">
              <Field label="Customer Name" value={customerName} span={2} />
              <Field
                label="Source Order"
                value={
                  sourceLabel
                    ? `${sourceLabel}${sourceOrder?.customerName ? ` — ${sourceOrder.customerName}` : ""}`
                    : null
                }
                span={2}
              />
            </div>
          </section>

          <section className="vqm-section">
            <h3 className="vqm-section-title">Invoice</h3>
            <div className="vqm-grid">
              <Field
                label="Invoice Date"
                value={
                  invoice.invoiceDate
                    ? dateOnlyFmt.format(new Date(invoice.invoiceDate))
                    : null
                }
              />
              <Field
                label="Due Date"
                value={
                  invoice.dueDate
                    ? dateOnlyFmt.format(new Date(invoice.dueDate))
                    : null
                }
              />
              <Field
                label="Total Amount"
                value={totalAmount ? currencyFmt.format(totalAmount) : null}
              />
              <Field
                label="Tax Amount"
                value={taxAmount ? currencyFmt.format(taxAmount) : null}
              />
              <Field label="Notes" value={invoice.notes} span={2} />
              <Field
                label="Created"
                value={
                  invoice.createdAt
                    ? dateFmt.format(new Date(invoice.createdAt))
                    : null
                }
                span={2}
              />
            </div>
          </section>

          {Array.isArray(invoice.statusHistory) &&
            invoice.statusHistory.length > 0 && (
              <section className="vqm-section">
                <h3 className="vqm-section-title">
                  Status History
                  <span className="vqm-count">
                    {invoice.statusHistory.length}
                  </span>
                </h3>
                <ul className="vqm-followups">
                  {[...invoice.statusHistory]
                    .reverse()
                    .map((h, idx) => (
                      <li
                        key={h._id || idx}
                        className="vqm-followup-item"
                      >
                        <div className="vqm-followup-date">
                          {h.changedAt
                            ? dateFmt.format(new Date(h.changedAt))
                            : "—"}
                        </div>
                        <div className="vqm-followup-notes">
                          {h.remark || (
                            <span className="vqm-empty">No remark</span>
                          )}
                        </div>
                        <span className="vqm-followup-status">{h.status}</span>
                      </li>
                    ))}
                </ul>
              </section>
            )}
        </div>

        <footer className="vqm-footer">
          <PrintTemplateSelector
            module="Invoice"
            recordId={invoice._id}
            recordName={`Invoice ${invoice.invoiceNumber || invoice._id}`}
          />
          <button type="button" onClick={onClose} className="cancel-btn">
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
