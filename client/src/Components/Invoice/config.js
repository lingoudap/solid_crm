/**
 * Invoice Module Configuration
 * Mirrors the Order/Quotation config pattern.
 */
export const INVOICE_CONFIG = {
  UI: {
    ITEMS_PER_PAGE: 10,
    SEARCH_DEBOUNCE_MS: 300,
  },

  STATUS_OPTIONS: [
    { value: "Draft", label: "Draft" },
    { value: "Sent", label: "Sent" },
    { value: "Paid", label: "Paid" },
    { value: "Overdue", label: "Overdue" },
    { value: "Cancelled", label: "Cancelled" },
  ],

  COLUMNS: {
    invoiceNumber: true,
    customer: true,
    invoiceDate: true,
    dueDate: true,
    totalAmount: true,
    status: true,
    sourceOrder: true,
  },

  API: {
    BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  },
};

export default INVOICE_CONFIG;
