import React, { memo } from "react";
import CustomersActionsMenu from "./CustomersActionsMenu";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

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

const CustomerRow = memo(function CustomerRow({
  customer,
  rowIndex,
  selected,
  visibleColumns,
  onToggleSelect,
  onPreview,
  onView,
  onEdit,
  onDelete,
  onSendWhatsApp,
}) {
  const rowWithPreview = { ...customer, __onPreview: onPreview };

  return (
    <tr className="lt-row">
      <td className="checkbox-col" data-label="">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(customer._id)}
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
          {customer.phone || <span className="lt-muted">—</span>}
        </td>
      )}
      {visibleColumns.email && (
        <td data-label="Email">
          {customer.email || <span className="lt-muted">—</span>}
        </td>
      )}
      {visibleColumns.state && (
        <td data-label="State">
          {customer.state || <span className="lt-muted">—</span>}
        </td>
      )}
      {visibleColumns.address && (
        <td data-label="Address">
          {customer.address || <span className="lt-muted">—</span>}
        </td>
      )}
      {visibleColumns.created && (
        <td data-label="Created">
          {customer.createdAt ? (
            dateFmt.format(new Date(customer.createdAt))
          ) : (
            <span className="lt-muted">—</span>
          )}
        </td>
      )}
      <td data-label="" className="lt-actions-cell">
        <CustomersActionsMenu
          customer={customer}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onSendWhatsApp={onSendWhatsApp}
        />
      </td>
    </tr>
  );
});

export default function CustomersTable({
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
  onDelete,
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
            {visibleColumns.state && (
              <th
                className={headerClass("state")}
                onClick={() => onSort("state")}
              >
                State {sortArrow("state")}
              </th>
            )}
            {visibleColumns.address && <th>Address</th>}
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
          {rows.map((c, i) => (
            <CustomerRow
              key={c._id || i}
              customer={c}
              rowIndex={startIndex + i + 1}
              selected={selectedIds.includes(c._id)}
              visibleColumns={visibleColumns}
              onToggleSelect={onToggleSelect}
              onPreview={onPreview}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onSendWhatsApp={onSendWhatsApp}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
