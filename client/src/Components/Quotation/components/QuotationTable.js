import React, { memo } from "react";
import QuotationActionsMenu from "./QuotationActionsMenu";
import {
  getFollowUpCount,
  getNextFollowUpDate,
  getFollowUpHighlight,
} from "../utils/followUps";

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
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function StatusBadge({ status }) {
  if (!status) return <span className="qt-muted">—</span>;
  return (
    <span className={`qt-status ${STATUS_CLASS[status] || ""}`}>
      <span className="qt-status-dot" />
      {status}
    </span>
  );
}

function PriorityIndicator({ priority }) {
  if (!priority) return <span className="qt-muted">—</span>;
  return (
    <span className={`qt-priority ${PRIORITY_CLASS[priority] || ""}`}>
      <span className="qt-priority-bar" />
      {priority}
    </span>
  );
}

const QuotationRow = memo(function QuotationRow({
  q,
  rowIndex,
  selected,
  visibleColumns,
  showPriority,
  onToggleSelect,
  onView,
  onEdit,
  onExportPDF,
  onConvertToOrder,
  onAddFollowUp,
}) {
  const highlight = getFollowUpHighlight(q);
  const highlightClass =
    highlight === "today"
      ? "highlight-today"
      : highlight === "overdue"
      ? "highlight-overdue"
      : "";
  const next = getNextFollowUpDate(q);
  const amount = Number(q.totalAmount ?? q.amount ?? 0);

  return (
    <tr className={`quotation-row qt-row ${highlightClass}`}>
      <td className="checkbox-col" data-label="">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(q._id)}
        />
      </td>
      <td data-label="#" className="qt-index">
        {rowIndex}
      </td>
      {visibleColumns.quotationNo && (
        <td data-label="Quotation No." className="qt-quote-no">
          {q.quotationNumber || q.quoteNumber || q.ref || q._id}
        </td>
      )}
      {visibleColumns.customer && (
        <td data-label="Customer">
          <CustomerCell row={q} />
        </td>
      )}
      {visibleColumns.amount && (
        <td data-label="Amount" className="qt-num qt-amount">
          {amount ? currencyFmt.format(amount) : "—"}
        </td>
      )}
      {visibleColumns.status && (
        <td data-label="Status">
          <StatusBadge status={q.status} />
        </td>
      )}
      {showPriority && (
        <td data-label="Priority">
          <PriorityIndicator priority={q.priority} />
        </td>
      )}
      {visibleColumns.followups && (
        <td data-label="Follow-ups">
          <span className="followup-badge">{getFollowUpCount(q)}</span>
        </td>
      )}
      {visibleColumns.nextFollowup && (
        <td data-label="Next Follow-up">
          {next ? (
            dateFmt.format(new Date(next))
          ) : (
            <span className="qt-muted">No scheduled</span>
          )}
        </td>
      )}
      {visibleColumns.date && (
        <td data-label="Date">
          {q.createdAt ? dateFmt.format(new Date(q.createdAt)) : "—"}
        </td>
      )}
      <td
        data-label=""
        className="qt-actions-cell"
        style={{ position: "relative" }}
      >
        <QuotationActionsMenu
          quotation={q}
          onView={onView}
          onEdit={onEdit}
          onExportPDF={onExportPDF}
          onConvertToOrder={onConvertToOrder}
          onAddFollowUp={onAddFollowUp}
        />
      </td>
    </tr>
  );
});

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

export default function QuotationTable({
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
  onConvertToOrder,
  onAddFollowUp,
}) {
  const sortArrow = (col) =>
    sortBy === col ? (sortOrder === "asc" ? "↑" : "↓") : "";
  const headerClass = (col) =>
    `sortable-header ${sortBy === col ? "active" : ""}`;

  // Default-show priority for users whose stored prefs predate the column.
  const showPriority = visibleColumns.priority !== false;

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
            {visibleColumns.quotationNo && (
              <th
                className={headerClass("quoteNumber")}
                onClick={() => onSort("quoteNumber")}
              >
                Quotation No. {sortArrow("quoteNumber")}
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
            {showPriority && (
              <th
                className={headerClass("priority")}
                onClick={() => onSort("priority")}
              >
                Priority {sortArrow("priority")}
              </th>
            )}
            {visibleColumns.followups && (
              <th
                className={headerClass("followups")}
                onClick={() => onSort("followups")}
              >
                Follow-ups {sortArrow("followups")}
              </th>
            )}
            {visibleColumns.nextFollowup && (
              <th
                className={headerClass("nextFollowup")}
                onClick={() => onSort("nextFollowup")}
              >
                Next Follow-up {sortArrow("nextFollowup")}
              </th>
            )}
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
          {rows.map((q, i) => (
            <QuotationRow
              key={q._id || i}
              q={q}
              rowIndex={startIndex + i + 1}
              selected={selectedIds.includes(q._id)}
              visibleColumns={visibleColumns}
              showPriority={showPriority}
              onToggleSelect={onToggleSelect}
              onView={onView}
              onEdit={onEdit}
              onExportPDF={onExportPDF}
              onConvertToOrder={onConvertToOrder}
              onAddFollowUp={onAddFollowUp}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
