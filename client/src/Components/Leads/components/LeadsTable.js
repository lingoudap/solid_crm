import React, { memo } from "react";
import LeadsActionsMenu from "./LeadsActionsMenu";

const STATUS_CLASS = {
  New: "lt-status-new",
  Active: "lt-status-active",
  Converted: "lt-status-converted",
  Lost: "lt-status-lost",
};

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function StatusBadge({ status }) {
  const value = status || "New";
  return (
    <span className={`lt-status ${STATUS_CLASS[value] || ""}`}>
      <span className="lt-status-dot" />
      {value}
    </span>
  );
}

function ContactCell({ row }) {
  const initials = (row.name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="lt-contact">
      <div className="lt-avatar">{initials || "?"}</div>
      <div className="lt-contact-meta">
        <button
          type="button"
          className="lt-contact-name"
          onClick={() => row.__onPreview?.(row)}
        >
          {row.name || "—"}
        </button>
        {row.email && <div className="lt-contact-sub">{row.email}</div>}
      </div>
    </div>
  );
}

function getFollowUpCount(lead) {
  const list = lead.followUpsNew || lead.followUps || [];
  return Array.isArray(list) ? list.length : 0;
}

function getNextFollowUpDate(lead) {
  const list = lead.followUpsNew || lead.followUps || [];
  if (!Array.isArray(list) || list.length === 0) return null;
  const future = list
    .filter((f) => {
      const d = f.followUpDate || f.date;
      return d && new Date(d) > new Date();
    })
    .sort(
      (a, b) =>
        new Date(a.followUpDate || a.date) - new Date(b.followUpDate || b.date)
    );
  return future.length > 0 ? future[0].followUpDate || future[0].date : null;
}

function getHighlight(lead) {
  const next = getNextFollowUpDate(lead);
  if (!next) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(next);
  d.setHours(0, 0, 0, 0);
  if (d < today) return "overdue";
  if (d.getTime() === today.getTime()) return "today";
  return null;
}

const LeadRow = memo(function LeadRow({
  lead,
  rowIndex,
  selected,
  visibleColumns,
  onToggleSelect,
  onPreview,
  onView,
  onEdit,
  onExportPDF,
  onAddFollowUp,
  onConvertToQuotation,
  onSendWhatsApp,
}) {
  const highlight = getHighlight(lead);
  const highlightClass =
    highlight === "today"
      ? "lt-highlight-today"
      : highlight === "overdue"
      ? "lt-highlight-overdue"
      : "";
  const next = getNextFollowUpDate(lead);

  // Pass preview handler through the row so the contact cell button can fire it.
  const rowWithPreview = { ...lead, __onPreview: onPreview };

  return (
    <tr className={`lt-row ${highlightClass}`}>
      <td className="checkbox-col" data-label="">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(lead._id)}
        />
      </td>
      <td data-label="#" className="lt-index">
        {rowIndex}
      </td>
      {visibleColumns.name && (
        <td data-label="Name">
          <ContactCell row={rowWithPreview} />
        </td>
      )}
      {visibleColumns.phone && (
        <td data-label="Phone" className="lt-mono">
          {lead.phone || <span className="lt-muted">—</span>}
        </td>
      )}
      {visibleColumns.email && (
        <td data-label="Email">
          {lead.email || <span className="lt-muted">—</span>}
        </td>
      )}
      {visibleColumns.source && (
        <td data-label="Source">
          {lead.Source ? (
            <span className="lt-source-pill">{lead.Source}</span>
          ) : (
            <span className="lt-muted">—</span>
          )}
        </td>
      )}
      {visibleColumns.status && (
        <td data-label="Status">
          <StatusBadge status={lead.status} />
        </td>
      )}
      {visibleColumns.followups && (
        <td data-label="Follow-ups">
          <span className="lt-followup-badge">{getFollowUpCount(lead)}</span>
        </td>
      )}
      {visibleColumns.nextFollowup && (
        <td data-label="Next Follow-up">
          {next ? (
            dateFmt.format(new Date(next))
          ) : (
            <span className="lt-muted">No scheduled</span>
          )}
        </td>
      )}
      {visibleColumns.created && (
        <td data-label="Created">
          {lead.createdAt ? (
            dateFmt.format(new Date(lead.createdAt))
          ) : (
            <span className="lt-muted">—</span>
          )}
        </td>
      )}
      <td data-label="" className="lt-actions-cell">
        <LeadsActionsMenu
          lead={lead}
          onView={onView}
          onEdit={onEdit}
          onExportPDF={onExportPDF}
          onAddFollowUp={onAddFollowUp}
          onConvertToQuotation={onConvertToQuotation}
          onSendWhatsApp={onSendWhatsApp}
        />
      </td>
    </tr>
  );
});

export default function LeadsTable({
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
  onPreview,
  onView,
  onEdit,
  onExportPDF,
  onAddFollowUp,
  onConvertToQuotation,
  onSendWhatsApp,
}) {
  const sortArrow = (col) =>
    sortBy === col ? (sortOrder === "asc" ? "↑" : "↓") : "";
  const headerClass = (col) =>
    `sortable-header ${sortBy === col ? "active" : ""}`;

  return (
    <div className="lt-wrap">
      <table className="lt-table">
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
            {visibleColumns.name && (
              <th
                className={headerClass("name")}
                onClick={() => onSort("name")}
              >
                Name {sortArrow("name")}
              </th>
            )}
            {visibleColumns.phone && (
              <th
                className={headerClass("phone")}
                onClick={() => onSort("phone")}
              >
                Phone {sortArrow("phone")}
              </th>
            )}
            {visibleColumns.email && (
              <th
                className={headerClass("email")}
                onClick={() => onSort("email")}
              >
                Email {sortArrow("email")}
              </th>
            )}
            {visibleColumns.source && (
              <th
                className={headerClass("source")}
                onClick={() => onSort("source")}
              >
                Source {sortArrow("source")}
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
            {visibleColumns.followups && <th>Follow-ups</th>}
            {visibleColumns.nextFollowup && <th>Next Follow-up</th>}
            {visibleColumns.created && (
              <th
                className={headerClass("createdAt")}
                onClick={() => onSort("createdAt")}
              >
                Created {sortArrow("createdAt")}
              </th>
            )}
            <th className="lt-actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l, i) => (
            <LeadRow
              key={l._id || i}
              lead={l}
              rowIndex={startIndex + i + 1}
              selected={selectedIds.includes(l._id)}
              visibleColumns={visibleColumns}
              onToggleSelect={onToggleSelect}
              onPreview={onPreview}
              onView={onView}
              onEdit={onEdit}
              onExportPDF={onExportPDF}
              onAddFollowUp={onAddFollowUp}
              onConvertToQuotation={onConvertToQuotation}
              onSendWhatsApp={onSendWhatsApp}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
