import React, { useMemo } from "react";
import PrintTemplateSelector from "../../../common/PrintTemplateSelector";
import "../../../Quotation/quotation.css";

const STATUS_CLASS = {
  New: "ot-status-new",
  Processing: "ot-status-processing",
  Shipped: "ot-status-shipped",
  Delivered: "ot-status-delivered",
  Cancelled: "ot-status-cancelled",
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

export default function ViewOrderModal({ order, onClose }) {
  const items = order?.items || [];

  const totalAmount = useMemo(() => {
    if (!order) return 0;
    if (order.totalAmount != null) return Number(order.totalAmount);
    return items.reduce((acc, it) => acc + Number(it.subtotal || 0), 0);
  }, [order, items]);

  if (!order) return null;

  const orderNo =
    order.orderNumber ||
    (order.orderId != null
      ? `O-${String(order.orderId).padStart(5, "0")}`
      : null);

  const sourceQuote = order.sourceQuotationId;
  const sourceLabel = sourceQuote?.quotationId
    ? `Q-${String(sourceQuote.quotationId).padStart(5, "0")}`
    : null;

  return (
    <div className="modal-overlay vqm-overlay" onMouseDown={onClose}>
      <div
        className="modal-content vqm-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="vqm-header">
          <div className="vqm-header-main">
            <h2>Order Details</h2>
            <div className="vqm-header-meta">
              {orderNo && <span className="vqm-quote-no">{orderNo}</span>}
              {order.status && (
                <span className={`ot-status ${STATUS_CLASS[order.status] || ""}`}>
                  <span className="ot-status-dot" />
                  {order.status}
                </span>
              )}
              {sourceLabel && (
                <span className="ot-source-pill">From {sourceLabel}</span>
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
                value={order.customerName}
                span={2}
              />
              <Field label="Email" value={order.email} />
              <Field label="Phone" value={order.phone} />
              <Field label="Address" value={order.address} span={2} />
              <Field label="State" value={order.state} />
              <Field
                label="Created"
                value={
                  order.createdAt
                    ? dateFmt.format(new Date(order.createdAt))
                    : null
                }
              />
            </div>
          </section>

          <section className="vqm-section">
            <h3 className="vqm-section-title">Items</h3>
            {items.length === 0 ? (
              <div className="vqm-empty-block">No items on this order.</div>
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
        </div>

        <footer className="vqm-footer">
          <PrintTemplateSelector
            module="Order"
            recordId={order._id}
            recordName={`Order ${order.orderId || order._id}`}
          />
          <button type="button" onClick={onClose} className="cancel-btn">
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
