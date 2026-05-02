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
  WhatsApp: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2.5a7.5 7.5 0 00-6.4 11.4L2.5 17.5l3.7-1A7.5 7.5 0 1010 2.5z" />
      <path d="M7 7.5c0-.5.5-1 1-1l1 .5.5 1.5L8.5 9a4 4 0 002.5 2.5l.5-1 1.5.5.5 1c0 .5-.5 1-1 1A6 6 0 017 7.5z" />
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

export default function LeadsActionsMenu({
  lead,
  onView,
  onEdit,
  onExportPDF,
  onAddFollowUp,
  onConvertToQuotation,
  onSendWhatsApp,
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
    fn?.(lead);
  };

  return (
    <div ref={containerRef} className="lt-actions">
      <button
        type="button"
        className="lt-icon-btn"
        title="View"
        aria-label="View"
        onClick={handle(onView)}
      >
        <Icon.Eye />
      </button>
      <button
        type="button"
        className="lt-icon-btn"
        title="Edit"
        aria-label="Edit"
        onClick={handle(onEdit)}
      >
        <Icon.Pencil />
      </button>
      <button
        type="button"
        className="lt-icon-btn"
        title="Export PDF"
        aria-label="Export PDF"
        onClick={handle(onExportPDF)}
      >
        <Icon.File />
      </button>

      <button
        type="button"
        className={`lt-icon-btn lt-icon-btn-more ${open ? "is-open" : ""}`}
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
        <div className="lt-actions-menu" role="menu">
          <button
            type="button"
            className="lt-actions-menu-item"
            onClick={handle(onAddFollowUp)}
            role="menuitem"
          >
            <Icon.Phone />
            <span>Add Follow-up</span>
          </button>
          <button
            type="button"
            className="lt-actions-menu-item"
            onClick={handle(onSendWhatsApp)}
            role="menuitem"
          >
            <Icon.WhatsApp />
            <span>Send WhatsApp</span>
          </button>
          <button
            type="button"
            className="lt-actions-menu-item"
            onClick={handle(onConvertToQuotation)}
            role="menuitem"
          >
            <Icon.Convert />
            <span>Convert to Quotation</span>
          </button>
          <div className="lt-actions-menu-divider" />
          <div className="lt-actions-menu-item lt-actions-menu-item-passthrough">
            <PrintTemplateSelector module="Lead" record={lead} />
          </div>
        </div>
      )}
    </div>
  );
}
