import React, { useEffect, useRef, useState } from "react";
import PrintTemplateSelector from "../../common/PrintTemplateSelector";

const menuBtnStyle = {
  display: "block",
  width: "100%",
  background: "none",
  border: "none",
  padding: "8px 12px",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "14px",
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

  const handle = (fn) => () => {
    setOpen(false);
    fn?.(quotation);
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        className="action-btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "5px 50px",
          cursor: "pointer",
        }}
      >
        Actions ⬇️
      </button>

      {open && (
        <div
          className="action-dropdown-menu"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "5px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
            minWidth: "150px",
          }}
        >
          <button onClick={handle(onView)} style={menuBtnStyle}>👁 View</button>
          <button onClick={handle(onEdit)} style={menuBtnStyle}>✏️ Edit</button>
          <button onClick={handle(onExportPDF)} style={menuBtnStyle}>📄 Export PDF</button>
          <button style={{ ...menuBtnStyle, padding: 0, overflow: "visible" }}>
            <PrintTemplateSelector module="Quotation" record={quotation} />
          </button>
          <button onClick={handle(onConvertToOrder)} style={menuBtnStyle}>
            🔁 Convert to Order
          </button>
          <button onClick={handle(onAddFollowUp)} style={menuBtnStyle}>
            📞 Add Follow-up
          </button>
        </div>
      )}
    </div>
  );
}
