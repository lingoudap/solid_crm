import React, { useEffect, useRef, useState } from "react";
import PrintTemplateSelector from "../../common/PrintTemplateSelector";

const Icon = {
  Eye: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6S1.5 10 1.5 10z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ),
  Pencil: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 3.5l2 2L7 15l-3 1 1-3 9.5-9.5z" />
    </svg>
  ),
  File: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 2h7l4 4v12H5z" />
      <path d="M12 2v4h4" />
    </svg>
  ),
  Convert: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h12l-3-3" />
      <path d="M17 13H5l3 3" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 3.5h3l1.5 4-2 1a10 10 0 005 5l1-2 4 1.5v3a1.5 1.5 0 01-1.5 1.5C8.5 17.5 2.5 11.5 2.5 5A1.5 1.5 0 014 3.5z" />
    </svg>
  ),
  Dots: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="4" r="1.6" />
      <circle cx="10" cy="10" r="1.6" />
      <circle cx="10" cy="16" r="1.6" />
    </svg>
  ),
};

export default function QuotationActionsMenu({
  quotation,
  onView,
  onEdit,
  onExportPDF,
  onConvertToOrder,
  onAddFollowUp,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const handle = (fn) => (e) => {
    e?.stopPropagation?.();
    setOpen(false);
    fn?.(quotation);
  };

  return (
    <div ref={containerRef} className="qt-actions">
      <button
        type="button"
        className="qt-icon-btn"
        title="View"
        aria-label="View"
        onClick={handle(onView)}
      >
        <Icon.Eye />
      </button>
      <button
        type="button"
        className="qt-icon-btn"
        title="Edit"
        aria-label="Edit"
        onClick={handle(onEdit)}
      >
        <Icon.Pencil />
      </button>
      <button
        type="button"
        className="qt-icon-btn"
        title="Export PDF"
        aria-label="Export PDF"
        onClick={handle(onExportPDF)}
      >
        <Icon.File />
      </button>

      <button
        type="button"
        className={`qt-icon-btn qt-icon-btn-more ${open ? "is-open" : ""}`}
        title="More actions"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <Icon.Dots />
      </button>

      {open && (
        <div className="qt-actions-menu" role="menu">
          <button
            type="button"
            className="qt-actions-menu-item"
            onClick={handle(onConvertToOrder)}
            role="menuitem"
          >
            <Icon.Convert />
            <span>Convert to Order</span>
          </button>
          <button
            type="button"
            className="qt-actions-menu-item"
            onClick={handle(onAddFollowUp)}
            role="menuitem"
          >
            <Icon.Phone />
            <span>Add Follow-up</span>
          </button>
          <div className="qt-actions-menu-divider" />
          <div className="qt-actions-menu-item qt-actions-menu-item-passthrough">
            <PrintTemplateSelector module="Quotation" record={quotation} />
          </div>
        </div>
      )}
    </div>
  );
}
