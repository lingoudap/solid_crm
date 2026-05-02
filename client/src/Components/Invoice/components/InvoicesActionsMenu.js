import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  Tag: () => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2H3v7l9 9 7-7-9-9z" />
      <circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" />
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
};

export default function InvoicesActionsMenu({
  invoice,
  onView,
  onEdit,
  onUpdateStatus,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Compute position from trigger's bounding rect each time the menu opens,
  // and again on scroll/resize while open. Portal renders to <body>, so we
  // can't rely on CSS `top: 100%` — must use viewport coordinates.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const reposition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    };
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      const inTrigger = containerRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const handle = (fn) => (e) => {
    e?.stopPropagation?.();
    setOpen(false);
    fn?.(invoice);
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
        ref={triggerRef}
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

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="qt-actions-menu"
            role="menu"
            style={{
              position: "fixed",
              top: menuPos.top,
              right: menuPos.right,
            }}
          >
            <button
              type="button"
              className="qt-actions-menu-item"
              onClick={handle(onUpdateStatus)}
              role="menuitem"
            >
              <Icon.Tag />
              <span>Update Status</span>
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
              <PrintTemplateSelector module="Invoice" record={invoice} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
