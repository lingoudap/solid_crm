import React, { useEffect, useState } from "react";

export default function WhatsAppModal({ order, onClose, onSend }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!order) return;
    const orderNo =
      order.orderNumber ||
      (order.orderId != null
        ? `O-${String(order.orderId).padStart(5, "0")}`
        : null);
    setMessage(
      `Hello ${order.customerName || ""},\n\nYour order ${orderNo || ""} is currently ${order.status || "in progress"}. Please reply if you need assistance.`
    );
  }, [order]);

  if (!order) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(order, message);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          width: 420,
          maxWidth: "95vw",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: "#25D366",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 22 }}>💬</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
            Send WhatsApp Message
          </span>
        </div>
        <div style={{ padding: 20 }}>
          <div
            style={{
              marginBottom: 14,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <label style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>
              To
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#f3f4f6",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              <span style={{ fontWeight: 600, color: "#111827" }}>
                {order.customerName}
              </span>
              <span style={{ color: "#6b7280", fontSize: 13 }}>
                {order.phone}
              </span>
            </div>
          </div>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <label style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                padding: "10px 12px",
                fontSize: 14,
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "#25D366",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                opacity: message.trim() ? 1 : 0.5,
              }}
            >
              Send via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
