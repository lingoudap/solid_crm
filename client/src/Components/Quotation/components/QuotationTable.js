import React from "react";
import QuotationActionsMenu from "./QuotationActionsMenu";
import {
  getFollowUpCount,
  getNextFollowUpDate,
  getFollowUpHighlight,
} from "../utils/followUps";

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

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
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
                Customer Name {sortArrow("customerName")}
              </th>
            )}
            {visibleColumns.amount && (
              <th
                className={headerClass("totalAmount")}
                onClick={() => onSort("totalAmount")}
              >
                Total Amount (₹) {sortArrow("totalAmount")}
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((q, i) => {
            const rowIndex = startIndex + i + 1;
            const highlight = getFollowUpHighlight(q);
            const highlightClass =
              highlight === "today"
                ? "highlight-today"
                : highlight === "overdue"
                ? "highlight-overdue"
                : "";
            const next = getNextFollowUpDate(q);

            return (
              <tr
                key={q._id || i}
                className={`quotation-row ${highlightClass}`}
              >
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(q._id)}
                    onChange={() => onToggleSelect(q._id)}
                  />
                </td>
                <td>{rowIndex}</td>
                {visibleColumns.quotationNo && (
                  <td>{q.quoteNumber || q.ref || q._id}</td>
                )}
                {visibleColumns.customer && <td>{q.customerName || "-"}</td>}
                {visibleColumns.amount && (
                  <td>{q.totalAmount || q.amount || "-"}</td>
                )}
                {visibleColumns.status && <td>{q.status || "-"}</td>}
                {visibleColumns.followups && (
                  <td>
                    <span className="followup-badge">{getFollowUpCount(q)}</span>
                  </td>
                )}
                {visibleColumns.nextFollowup && (
                  <td>
                    {next ? new Date(next).toLocaleDateString() : "No scheduled"}
                  </td>
                )}
                {visibleColumns.date && (
                  <td>
                    {q.createdAt ? new Date(q.createdAt).toLocaleString() : "-"}
                  </td>
                )}
                <td style={{ position: "relative" }}>
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
          })}
        </tbody>
      </table>
    </div>
  );
}
