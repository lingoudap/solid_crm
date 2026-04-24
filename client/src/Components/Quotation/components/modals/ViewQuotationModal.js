import React from "react";

export default function ViewQuotationModal({ quotation, onClose }) {
  if (!quotation) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Quotation Details</h2>
        <p>
          <b>Quote No:</b> {quotation.quoteNumber || quotation._id}
        </p>
        <p>
          <b>Customer:</b> {quotation.customerName}
        </p>
        <p>
          <b>Email:</b> {quotation.email}
        </p>
        <p>
          <b>Phone:</b> {quotation.phone}
        </p>
        <p>
          <b>Item:</b> {quotation.item}
        </p>
        <p>
          <b>Quantity:</b> {quotation.quantity}
        </p>
        <p>
          <b>Amount:</b> ₹{quotation.amount}
        </p>
        <p>
          <b>Status:</b> {quotation.status}
        </p>
        <p>
          <b>Date:</b> {new Date(quotation.createdAt).toLocaleString()}
        </p>
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
