import React from "react";

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

export default function LeadsQuickPreview({ lead, onClose }) {
  if (!lead) return null;
  const next = getNextFollowUpDate(lead);

  return (
    <>
      <div className="quick-preview-overlay" onClick={onClose} />
      <div className="quick-preview-drawer">
        <div className="quick-preview-header">
          <h3>Quick Preview</h3>
          <button onClick={onClose} className="quick-preview-close">
            ✕
          </button>
        </div>
        <div className="quick-preview-content">
          <div className="preview-item">
            <span className="preview-label">Name:</span>
            <span className="preview-value">{lead.name}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Phone:</span>
            <span className="preview-value">{lead.phone || "-"}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Email:</span>
            <span className="preview-value">{lead.email || "-"}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Status:</span>
            <span
              className={`status-badge status-${(lead.status || "New").toLowerCase()}`}
            >
              {lead.status || "New"}
            </span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Source:</span>
            <span className="preview-value">{lead.Source || "-"}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Follow-ups:</span>
            <span className="followup-badge">{getFollowUpCount(lead)}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Next Follow-up:</span>
            <span className="preview-value">
              {next ? new Date(next).toLocaleDateString() : "No scheduled"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
