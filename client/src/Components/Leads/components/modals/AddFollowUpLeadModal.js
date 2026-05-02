import React, { useState } from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const dialogStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "30px",
  maxWidth: "500px",
  width: "90%",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  maxHeight: "90vh",
  overflowY: "auto",
};

const inputBase = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const primaryBtn = {
  padding: "10px 20px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "500",
};

const secondaryBtn = {
  padding: "10px 20px",
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "500",
};

export default function AddFollowUpLeadModal({ lead, onClose, onSubmit }) {
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (!lead) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note || !date || !time) {
      alert("❌ Please enter remark, date, and time");
      return;
    }
    onSubmit({ note, date, time });
  };

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <h2 style={{ marginTop: 0 }}>Add Follow-up</h2>
        <p style={{ marginBottom: "15px", color: "#666" }}>
          Lead: <strong>{lead.name}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}
            >
              Remark:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter follow-up notes"
              style={{ ...inputBase, minHeight: "100px", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}
            >
              Follow-up Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputBase}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}
            >
              Follow-up Time:
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={inputBase}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="submit" style={primaryBtn}>
              Add Follow-up
            </button>
            <button type="button" onClick={onClose} style={secondaryBtn}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
