import React, { useEffect, useRef, useState } from "react";
import PrintTemplateSelector from "../../../common/PrintTemplateSelector";
import "../../../Quotation/quotation.css";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.272c-1.464.873-2.722 2.06-3.638 3.46-2.243 3.355-1.466 7.978 1.833 10.23 1.64 1.149 3.627 1.773 5.751 1.773 2.124 0 4.111-.624 5.751-1.773 3.299-2.252 4.076-6.875 1.833-10.23-.916-1.4-2.174-2.587-3.638-3.46a9.87 9.87 0 00-4.942-1.272zM2.982 21.614C1.265 19.897 0 17.626 0 14.996 0 6.681 6.681 0 14.996 0c3.63 0 7.021 1.265 9.638 3.982 2.617 2.717 4.05 6.108 4.05 9.638 0 8.315-6.681 14.996-14.996 14.996-3.63 0-7.021-1.265-9.638-3.982" />
  </svg>
);

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

function Field({ label, value, span = 1 }) {
  return (
    <div className={`vqm-field ${span === 2 ? "vqm-col-2" : ""}`}>
      <label>{label}</label>
      <div className="vqm-value">
        {value || value === 0 ? value : <span className="vqm-empty">—</span>}
      </div>
    </div>
  );
}

export default function ViewCustomerModal({
  customer,
  onClose,
  onSendWhatsApp,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!customer) return null;

  const handleSendWhatsAppClick = () => {
    if (onSendWhatsApp) onSendWhatsApp(customer);
    setMenuOpen(false);
  };

  const customFieldEntries = customer.customFields
    ? Object.entries(customer.customFields).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    : [];

  return (
    <div className="modal-overlay vqm-overlay" onMouseDown={onClose}>
      <div
        className="modal-content vqm-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="vqm-header">
          <div className="vqm-header-main">
            <h2>Customer Details</h2>
          </div>
          <div className="vqm-header-actions">
            {onSendWhatsApp && (
              <div className="vqm-menu-container" ref={menuRef}>
                <button
                  type="button"
                  className="vqm-menu-trigger"
                  onClick={() => setMenuOpen(!menuOpen)}
                  title="More actions"
                >
                  <DotsIcon />
                </button>
                {menuOpen && (
                  <div className="vqm-dropdown-menu">
                    <button
                      type="button"
                      className="vqm-menu-item"
                      onClick={handleSendWhatsAppClick}
                    >
                      <WhatsAppIcon />
                      <span>Send WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="vqm-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="vqm-body">
          <section className="vqm-section">
            <h3 className="vqm-section-title">Contact Details</h3>
            <div className="vqm-grid">
              <Field label="Name" value={customer.name} span={2} />
              <Field label="Email" value={customer.email} />
              <Field label="Phone" value={customer.phone} />
              <Field label="Address" value={customer.address} span={2} />
              <Field label="State" value={customer.state} />
              <Field
                label="Created"
                value={
                  customer.createdAt
                    ? dateFmt.format(new Date(customer.createdAt))
                    : null
                }
              />
            </div>
          </section>

          {customFieldEntries.length > 0 && (
            <section className="vqm-section">
              <h3 className="vqm-section-title">Custom Fields</h3>
              <div className="vqm-grid">
                {customFieldEntries.map(([k, v]) => (
                  <Field key={k} label={k} value={String(v)} />
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="vqm-footer">
          <PrintTemplateSelector
            module="Customer"
            recordId={customer._id}
            recordName={customer.name}
          />
          <button type="button" onClick={onClose} className="cancel-btn">
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
