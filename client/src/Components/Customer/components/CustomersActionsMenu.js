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
  Trash: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 5h14" />
      <path d="M8 5V3h4v2" />
      <path d="M5 5l1 12h8l1-12" />
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

export default function CustomersActionsMenu({
  customer,
  onView,
  onEdit,
  onDelete,
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
    fn?.(customer);
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
        title="Delete"
        aria-label="Delete"
        onClick={handle(onDelete)}
      >
        <Icon.Trash />
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
            onClick={handle(onSendWhatsApp)}
            role="menuitem"
          >
            <Icon.WhatsApp />
            <span>Send WhatsApp</span>
          </button>
          <div className="lt-actions-menu-divider" />
          <div className="lt-actions-menu-item lt-actions-menu-item-passthrough">
            <PrintTemplateSelector module="Customer" record={customer} />
          </div>
        </div>
      )}
    </div>
  );
}
