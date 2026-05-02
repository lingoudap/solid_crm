/**
 * Order Module Configuration
 *
 * Single source of truth for status metadata, UI constants, and column
 * defaults. Mirrors the Quotation config pattern.
 */
export const ORDER_CONFIG = {
  UI: {
    ITEMS_PER_PAGE: 10,
    SEARCH_DEBOUNCE_MS: 300,
  },

  STATUS_OPTIONS: [
    { value: "New", label: "New" },
    { value: "Processing", label: "Processing" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ],

  COLUMNS: {
    orderNo: true,
    customer: true,
    amount: true,
    status: true,
    sourceQuote: true,
    date: true,
  },

  API: {
    BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  },
};

export default ORDER_CONFIG;
