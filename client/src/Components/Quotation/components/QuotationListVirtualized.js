/**
 * Virtualized list variant of QuotationTable using react-window v2.
 *
 * WHEN TO USE:
 *   - Only worth enabling when rendering large pages (~100+ rows). At the
 *     current default of perPage=10, the standard <QuotationTable> is
 *     faster — virtualization adds layout overhead for no gain.
 *   - Drop in by replacing <QuotationTable> in ViewQuotation.js, OR by
 *     conditionally swapping based on rows.length / perPage.
 *
 * TRADE-OFFS vs the standard table:
 *   - Uses div-based grid layout (not <table>), so semantic table features
 *     (e.g. selecting cells, copying as TSV) are lost.
 *   - Sticky-header sortable columns are kept, but column widths are
 *     fixed pixels rather than fluid percentages.
 */
import React, { memo, useMemo } from "react";
import { List } from "react-window";
import QuotationActionsMenu from "./QuotationActionsMenu";
import {
  getFollowUpCount,
  getNextFollowUpDate,
  getFollowUpHighlight,
} from "../utils/followUps";

const ROW_HEIGHT = 56;
const LIST_HEIGHT = 560;

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

const VirtualRow = memo(function VirtualRow({ index, style, rowProps }) {
  const {
    rows,
    startIndex,
    selectedIds,
    visibleColumns,
    showPriority,
    onToggleSelect,
    onView,
    onEdit,
    onExportPDF,
    onConvertToOrder,
    onAddFollowUp,
  } = rowProps;

  const q = rows[index];
  const rowIndex = startIndex + index + 1;
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
    <div
      style={style}
      className={`qtv-row ${highlightClass}`}
      role="row"
    >
      <div className="qtv-cell qtv-checkbox">
        <input
          type="checkbox"
          checked={selectedIds.includes(q._id)}
          onChange={() => onToggleSelect(q._id)}
        />
      </div>
      <div className="qtv-cell qt-index">{rowIndex}</div>
      {visibleColumns.quotationNo && (
        <div className="qtv-cell qt-quote-no">
          {q.quotationNumber || q.quoteNumber || q.ref || q._id}
        </div>
      )}
      {visibleColumns.customer && (
        <div className="qtv-cell">{q.customerName || "—"}</div>
      )}
      {visibleColumns.amount && (
        <div className="qtv-cell qt-num qt-amount">
          {amount ? currencyFmt.format(amount) : "—"}
        </div>
      )}
      {visibleColumns.status && (
        <div className="qtv-cell">
          {q.status ? (
            <span className={`qt-status ${STATUS_CLASS[q.status] || ""}`}>
              <span className="qt-status-dot" />
              {q.status}
            </span>
          ) : (
            <span className="qt-muted">—</span>
          )}
        </div>
      )}
      {showPriority && (
        <div className="qtv-cell">
          {q.priority ? (
            <span
              className={`qt-priority ${PRIORITY_CLASS[q.priority] || ""}`}
            >
              <span className="qt-priority-bar" />
              {q.priority}
            </span>
          ) : (
            <span className="qt-muted">—</span>
          )}
        </div>
      )}
      {visibleColumns.followups && (
        <div className="qtv-cell">
          <span className="followup-badge">{getFollowUpCount(q)}</span>
        </div>
      )}
      {visibleColumns.nextFollowup && (
        <div className="qtv-cell">
          {next ? (
            dateFmt.format(new Date(next))
          ) : (
            <span className="qt-muted">No scheduled</span>
          )}
        </div>
      )}
      {visibleColumns.date && (
        <div className="qtv-cell">
          {q.createdAt ? dateFmt.format(new Date(q.createdAt)) : "—"}
        </div>
      )}
      <div className="qtv-cell qtv-actions">
        <QuotationActionsMenu
          quotation={q}
          onView={onView}
          onEdit={onEdit}
          onExportPDF={onExportPDF}
          onConvertToOrder={onConvertToOrder}
          onAddFollowUp={onAddFollowUp}
        />
      </div>
    </div>
  );
});

export default function QuotationListVirtualized({
  rows,
  startIndex,
  visibleColumns,
  selectedIds,
  onToggleSelect,
  onView,
  onEdit,
  onExportPDF,
  onConvertToOrder,
  onAddFollowUp,
}) {
  const showPriority = visibleColumns.priority !== false;

  // rowProps must be referentially stable so List doesn't tell every row
  // its props changed on every parent render.
  const rowProps = useMemo(
    () => ({
      rows,
      startIndex,
      selectedIds,
      visibleColumns,
      showPriority,
      onToggleSelect,
      onView,
      onEdit,
      onExportPDF,
      onConvertToOrder,
      onAddFollowUp,
    }),
    [
      rows,
      startIndex,
      selectedIds,
      visibleColumns,
      showPriority,
      onToggleSelect,
      onView,
      onEdit,
      onExportPDF,
      onConvertToOrder,
      onAddFollowUp,
    ]
  );

  return (
    <div className="qt-wrap qtv-wrap">
      <div className="qtv-header" role="row">
        <div className="qtv-cell qtv-checkbox" />
        <div className="qtv-cell">#</div>
        {visibleColumns.quotationNo && <div className="qtv-cell">Quotation No.</div>}
        {visibleColumns.customer && <div className="qtv-cell">Customer</div>}
        {visibleColumns.amount && <div className="qtv-cell qt-num">Amount</div>}
        {visibleColumns.status && <div className="qtv-cell">Status</div>}
        {showPriority && <div className="qtv-cell">Priority</div>}
        {visibleColumns.followups && <div className="qtv-cell">Follow-ups</div>}
        {visibleColumns.nextFollowup && <div className="qtv-cell">Next Follow-up</div>}
        {visibleColumns.date && <div className="qtv-cell">Date</div>}
        <div className="qtv-cell qtv-actions">Actions</div>
      </div>

      <List
        defaultHeight={LIST_HEIGHT}
        rowCount={rows.length}
        rowHeight={ROW_HEIGHT}
        rowComponent={VirtualRow}
        rowProps={rowProps}
      />
    </div>
  );
}
