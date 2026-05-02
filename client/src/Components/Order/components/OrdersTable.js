import React, { memo } from "react";
import OrdersActionsMenu from "./OrdersActionsMenu";

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
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function StatusBadge({ status }) {
  const value = status || "New";
  return (
    <span className={`ot-status ${STATUS_CLASS[value] || ""}`}>
      <span className="ot-status-dot" />
      {value}
    </span>
  );
}

function CustomerCell({ row }) {
  const initials = (row.customerName || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="qt-customer">
      <div className="qt-avatar">{initials || "?"}</div>
      <div className="qt-customer-meta">
        <div className="qt-customer-name">{row.customerName || "—"}</div>
        {row.email && <div className="qt-customer-sub">{row.email}</div>}
      </div>
    </div>
  );
}

function SourceCell({ source }) {
  if (!source?.quotationId) return <span className="qt-muted">—</span>;
  const label = `Q-${String(source.quotationId).padStart(5, "0")}`;
  return <span className="ot-source-pill">{label}</span>;
}

const OrderRow = memo(function OrderRow({
  o,
  rowIndex,
  selected,
  visibleColumns,
  onToggleSelect,
  onView,
  onEdit,
  onExportPDF,
  onSendWhatsApp,
  onDelete,
  onUpdateStatus,
  onConvertToInvoice,
}) {
  const amount = Number(o.totalAmount ?? o.amount ?? 0);
  return (
    <tr className="quotation-row qt-row">
      <td className="checkbox-col" data-label="">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(o._id)}
        />
      </td>
      <td data-label="#" className="qt-index">
        {rowIndex}
      </td>
      {visibleColumns.orderNo && (
        <td data-label="Order No." className="qt-quote-no">
          {o.orderNumber || o.ref || o._id}
        </td>
      )}
      {visibleColumns.customer && (
        <td data-label="Customer">
          <CustomerCell row={o} />
        </td>
      )}
      {visibleColumns.amount && (
        <td data-label="Amount" className="qt-num qt-amount">
          {amount ? currencyFmt.format(amount) : "—"}
        </td>
      )}
      {visibleColumns.status && (
        <td data-label="Status">
          <StatusBadge status={o.status} />
        </td>
      )}
      {visibleColumns.sourceQuote && (
        <td data-label="From Quote">
          <SourceCell source={o.sourceQuotationId} />
        </td>
      )}
      {visibleColumns.date && (
        <td data-label="Date">
          {o.createdAt ? dateFmt.format(new Date(o.createdAt)) : "—"}
        </td>
      )}
      <td
        data-label=""
        className="qt-actions-cell"
        style={{ position: "relative" }}
      >
        <OrdersActionsMenu
          order={o}
          onView={onView}
          onEdit={onEdit}
          onExportPDF={onExportPDF}
          onSendWhatsApp={onSendWhatsApp}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
          onConvertToInvoice={onConvertToInvoice}
        />
      </td>
    </tr>
  );
});

export default function OrdersTable({
  rows,
  startIndex,
  visibleColumns,
  sortBy,
  sortOrder,
  onSort,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected,
  onView,
  onEdit,
  onExportPDF,
  onSendWhatsApp,
  onDelete,
  onUpdateStatus,
  onConvertToInvoice,
}) {
  const sortArrow = (col) =>
    sortBy === col ? (sortOrder === "asc" ? "↑" : "↓") : "";
  const headerClass = (col) =>
    `sortable-header ${sortBy === col ? "active" : ""}`;

  return (
    <div className="qt-wrap">
      <table className="data-table qt-table">
        <thead>
          <tr>
            <th className="checkbox-col">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAll}
              />
            </th>
            <th>#</th>
            {visibleColumns.orderNo && (
              <th
                className={headerClass("orderNumber")}
                onClick={() => onSort("orderNumber")}
              >
                Order No. {sortArrow("orderNumber")}
              </th>
            )}
            {visibleColumns.customer && (
              <th
                className={headerClass("customerName")}
                onClick={() => onSort("customerName")}
              >
                Customer {sortArrow("customerName")}
              </th>
            )}
            {visibleColumns.amount && (
              <th
                className={`${headerClass("totalAmount")} qt-num`}
                onClick={() => onSort("totalAmount")}
              >
                Amount {sortArrow("totalAmount")}
              </th>
            )}
            {visibleColumns.status && (
              <th
                className={headerClass("status")}
                onClick={() => onSort("status")}
              >
                Status {sortArrow("status")}
              </th>
            )}
            {visibleColumns.sourceQuote && <th>From Quote</th>}
            {visibleColumns.date && (
              <th
                className={headerClass("createdAt")}
                onClick={() => onSort("createdAt")}
              >
                Date {sortArrow("createdAt")}
              </th>
            )}
            <th className="qt-actions-col">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((o, i) => (
            <OrderRow
              key={o._id || i}
              o={o}
              rowIndex={startIndex + i + 1}
              selected={selectedIds.includes(o._id)}
              visibleColumns={visibleColumns}
              onToggleSelect={onToggleSelect}
              onView={onView}
              onEdit={onEdit}
              onExportPDF={onExportPDF}
              onSendWhatsApp={onSendWhatsApp}
              onDelete={onDelete}
              onUpdateStatus={onUpdateStatus}
              onConvertToInvoice={onConvertToInvoice}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
