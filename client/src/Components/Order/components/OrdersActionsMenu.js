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
  Whatsapp: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M10 2a8 8 0 00-6.93 12.02L2 18l4.06-1.05A8 8 0 1010 2zm4.36 11.39c-.18.5-.9.96-1.32 1-.36.04-.78.06-1.27-.08-.29-.09-.66-.21-1.14-.42-2.01-.87-3.32-2.9-3.42-3.03-.1-.13-.83-1.1-.83-2.1 0-1 .53-1.49.71-1.7.18-.21.4-.26.53-.26h.38c.12 0 .29-.05.45.34.18.43.6 1.49.65 1.6.05.11.08.24.02.38-.06.14-.1.22-.18.34-.09.12-.19.27-.27.36-.09.09-.18.19-.08.37.1.18.46.76 1 1.23.69.61 1.27.8 1.45.89.18.09.29.07.4-.04.11-.11.46-.54.59-.72.13-.18.26-.15.43-.09.18.06 1.13.53 1.32.63.18.09.31.14.36.22.05.08.05.46-.13.96z" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 5h13" />
      <path d="M8 2.5h4M5.5 5l1 11h7l1-11" />
      <path d="M8.5 8v6M11.5 8v6" />
    </svg>
  ),
  Dots: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="4" r="1.6" />
      <circle cx="10" cy="10" r="1.6" />
      <circle cx="10" cy="16" r="1.6" />
    </svg>
  ),
  Tag: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2H3v7l9 9 7-7-9-9z" />
      <circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  ),
  Receipt: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 2h10v16l-2-1.5L11 18l-2-1.5L7 18l-2-1.5L3 18V2z" />
      <path d="M7 6h6M7 9h6M7 12h4" />
    </svg>
  ),
};

export default function OrdersActionsMenu({
  order,
  onView,
  onEdit,
  onExportPDF,
  onSendWhatsApp,
  onDelete,
  onUpdateStatus,
  onConvertToInvoice,
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
    fn?.(order);
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
            onClick={handle(onUpdateStatus)}
            role="menuitem"
          >
            <Icon.Tag />
            <span>Update Status</span>
          </button>
          {order.status === "Delivered" && (
            <button
              type="button"
              className="qt-actions-menu-item ot-actions-menu-item-invoice"
              onClick={handle(onConvertToInvoice)}
              role="menuitem"
            >
              <Icon.Receipt />
              <span>Convert to Invoice</span>
            </button>
          )}
          <button
            type="button"
            className="qt-actions-menu-item"
            onClick={handle(onSendWhatsApp)}
            role="menuitem"
          >
            <Icon.Whatsapp />
            <span>Send WhatsApp</span>
          </button>
          <button
            type="button"
            className="qt-actions-menu-item"
            onClick={handle(onDelete)}
            role="menuitem"
          >
            <Icon.Trash />
            <span>Delete</span>
          </button>
          <div className="qt-actions-menu-divider" />
          <div className="qt-actions-menu-item qt-actions-menu-item-passthrough">
            <PrintTemplateSelector module="Order" record={order} />
          </div>
        </div>
      )}
    </div>
  );
}
