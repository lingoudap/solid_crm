import React, { memo } from "react";
import InvoicesActionsMenu from "./InvoicesActionsMenu";

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
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function StatusBadge({ status }) {
  const value = status || "Draft";
  return (
    <span className={`iv-status ${STATUS_CLASS[value] || ""}`}>
      <span className="iv-status-dot" />
      {value}
    </span>
  );
}

function CustomerCell({ row }) {
  const name = row.customerName || row.customerId?.name || "—";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="qt-customer">
      <div className="qt-avatar">{initials || "?"}</div>
      <div className="qt-customer-meta">
        <div className="qt-customer-name">{name}</div>
      </div>
    </div>
  );
}

function SourceOrderCell({ orderRef }) {
  if (!orderRef?.orderId) return <span className="qt-muted">—</span>;
  const label = `O-${String(orderRef.orderId).padStart(5, "0")}`;
  return <span className="iv-source-pill">{label}</span>;
}

const InvoiceRow = memo(function InvoiceRow({
  inv,
  rowIndex,
  selected,
  visibleColumns,
  onToggleSelect,
  onView,
  onEdit,
  onUpdateStatus,
  onDelete,
}) {
  const amount = Number(inv.totalAmount || 0);
  return (
    <tr className="quotation-row qt-row">
      <td className="checkbox-col" data-label="">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(inv._id)}
        />
      </td>
      <td data-label="#" className="qt-index">
        {rowIndex}
      </td>
      {visibleColumns.invoiceNumber && (
        <td data-label="Invoice No." className="qt-quote-no">
          {inv.invoiceNumber || inv._id}
        </td>
      )}
      {visibleColumns.customer && (
        <td data-label="Customer">
          <CustomerCell row={inv} />
        </td>
      )}
      {visibleColumns.invoiceDate && (
        <td data-label="Invoice Date">
          {inv.invoiceDate
            ? dateFmt.format(new Date(inv.invoiceDate))
            : "—"}
        </td>
      )}
      {visibleColumns.dueDate && (
        <td data-label="Due Date">
          {inv.dueDate ? (
            dateFmt.format(new Date(inv.dueDate))
          ) : (
            <span className="qt-muted">—</span>
          )}
        </td>
      )}
      {visibleColumns.totalAmount && (
        <td data-label="Amount" className="qt-num qt-amount">
          {amount ? currencyFmt.format(amount) : "—"}
        </td>
      )}
      {visibleColumns.status && (
        <td data-label="Status">
          <StatusBadge status={inv.status} />
        </td>
      )}
      {visibleColumns.sourceOrder && (
        <td data-label="From Order">
          <SourceOrderCell orderRef={inv.orderId} />
        </td>
      )}
      <td
        data-label=""
        className="qt-actions-cell"
        style={{ position: "relative" }}
      >
        <InvoicesActionsMenu
          invoice={inv}
          onView={onView}
          onEdit={onEdit}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
});

export default function InvoicesTable({
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
  onUpdateStatus,
  onDelete,
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
            {visibleColumns.invoiceNumber && (
              <th
                className={headerClass("invoiceNumber")}
                onClick={() => onSort("invoiceNumber")}
              >
                Invoice No. {sortArrow("invoiceNumber")}
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
            {visibleColumns.invoiceDate && (
              <th
                className={headerClass("invoiceDate")}
                onClick={() => onSort("invoiceDate")}
              >
                Invoice Date {sortArrow("invoiceDate")}
              </th>
            )}
            {visibleColumns.dueDate && (
              <th
                className={headerClass("dueDate")}
                onClick={() => onSort("dueDate")}
              >
                Due Date {sortArrow("dueDate")}
              </th>
            )}
            {visibleColumns.totalAmount && (
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
            
            {visibleColumns.sourceOrder && <th>Order Id</th>}
            <th className="qt-actions-col">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((inv, i) => (
            <InvoiceRow
              key={inv._id || i}
              inv={inv}
              rowIndex={startIndex + i + 1}
              selected={selectedIds.includes(inv._id)}
              visibleColumns={visibleColumns}
              onToggleSelect={onToggleSelect}
              onView={onView}
              onEdit={onEdit}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
