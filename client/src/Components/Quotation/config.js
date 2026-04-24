/**
 * Quotation Module Configuration
 *
 * Single source of truth for feature flags, UI constants, status metadata,
 * API paths, and validation rules. Imported by ViewQuotation.js and its
 * child components; also powers ship-dark rollout for Phase 2+ features via
 * isFeatureEnabled().
 */

export const QUOTATION_CONFIG = {
  // Feature Flags
  FEATURES: {
    DARK_MODE: true,
    VIRTUALIZATION: true,
    REAL_TIME_UPDATES: false, // Set to true when Socket.IO is ready
    ACTIVITY_TIMELINE: true,
    ADVANCED_SEARCH: true,
    BULK_OPERATIONS: true,
    LEAD_SCORING: true,
    SMART_SUGGESTIONS: true,
    EMAIL_INTEGRATION: false, // Set to true when email API is ready
  },

  // UI Preferences
  UI: {
    ITEMS_PER_PAGE: 10,
    GRID_ROW_HEIGHT: 50,
    HEADER_HEIGHT: 50,
    SEARCH_DEBOUNCE_MS: 300,
    CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
    ANIMATION_DURATION: 300,
  },

  // Colors (Light Mode)
  COLORS: {
    PRIMARY: "#007bff",
    SUCCESS: "#28a745",
    DANGER: "#dc3545",
    WARNING: "#ffc107",
    INFO: "#17a2b8",
    SECONDARY: "#6c757d",
  },

  // Status Configuration
  STATUS_OPTIONS: [
    { value: "New", label: "New", color: "#007bff" },
    { value: "Active", label: "Active", color: "#28a745" },
    { value: "Converted", label: "Converted", color: "#6f42c1" },
    { value: "Lost", label: "Lost", color: "#dc3545" },
  ],

  // Export Options
  EXPORT: {
    FORMATS: ["CSV", "PDF", "EXCEL"],
    INCLUDE_FIELDS: [
      "quoteNumber",
      "customerName",
      "email",
      "phone",
      "totalAmount",
      "status",
      "createdAt",
    ],
  },

  // API Configuration
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
    ENDPOINTS: {
      QUOTATIONS: "/api/quotations",
      FOLLOWUPS: "/api/followups",
      EMAIL: "/api/email/share",
      EXPORT: "/api/quotations/:id/export",
    },
    TIMEOUT_MS: 30000,
  },

  // Sorting Options
  SORT_OPTIONS: [
    { key: "createdAt", label: "Date", default: "desc" },
    { key: "quoteNumber", label: "Quote Number", default: "asc" },
    { key: "customerName", label: "Customer", default: "asc" },
    { key: "totalAmount", label: "Amount", default: "desc" },
    { key: "status", label: "Status", default: "asc" },
  ],

  // Column Visibility Defaults
  COLUMNS: {
    quotationNo: true,
    customer: true,
    amount: true,
    status: true,
    followups: true,
    nextFollowup: true,
    date: true,
  },

  // Lead Scoring Configuration
  SCORING: {
    BASE_SCORE: 50,
    STATUS_WEIGHTS: {
      Active: 20,
      Converted: 30,
      New: 0,
      Lost: -10,
    },
    AMOUNT_THRESHOLDS: {
      HIGH: { min: 50000, points: 15 },
      MEDIUM: { min: 10000, points: 10 },
      LOW: { min: 5000, points: 5 },
    },
    FOLLOWUP_THRESHOLDS: {
      HIGH: { min: 3, points: 10 },
      MEDIUM: { min: 1, points: 5 },
    },
    RECENCY_THRESHOLDS: {
      FRESH: { days: 7, points: 10 },
      RECENT: { days: 30, points: 5 },
      OLD: { days: 180, points: -10 },
    },
  },

  // Follow-up Suggestion Configuration
  FOLLOWUP_SUGGESTIONS: {
    PRIORITIES: {
      HIGH: { days: 1, label: "Follow up tomorrow" },
      MEDIUM: { days: 3, label: "Follow up in 3 days" },
      LOW: { days: 7, label: "Follow up in a week" },
    },
    AUTO_SCHEDULE: true,
    REMIND_OVERDUE: true,
  },

  // Validation Rules
  VALIDATION: {
    MIN_CUSTOMER_NAME_LENGTH: 2,
    MAX_CUSTOMER_NAME_LENGTH: 100,
    MIN_AMOUNT: 0,
    MAX_AMOUNT: 99999999,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[0-9\-\(\)\+\s]{7,}$/,
  },

  // Notification Settings
  NOTIFICATIONS: {
    TOAST_DURATION_MS: 3000,
    AUTO_DISMISS_ERRORS: false,
    SHOW_SUCCESS_TOAST: true,
  },
};

/**
 * Check if a feature flag is enabled. Use as a single-expression gate:
 *   if (isFeatureEnabled("DARK_MODE")) { ... }
 */
export const isFeatureEnabled = (featureName) =>
  QUOTATION_CONFIG.FEATURES[featureName] === true;

/**
 * Look up the color for a status value (falls back to SECONDARY).
 */
export const getStatusColor = (status) => {
  const entry = QUOTATION_CONFIG.STATUS_OPTIONS.find((s) => s.value === status);
  return entry ? entry.color : QUOTATION_CONFIG.COLORS.SECONDARY;
};

/**
 * Look up the display label for a status value (falls back to the raw value).
 */
export const getStatusLabel = (status) => {
  const entry = QUOTATION_CONFIG.STATUS_OPTIONS.find((s) => s.value === status);
  return entry ? entry.label : status;
};

export default QUOTATION_CONFIG;
