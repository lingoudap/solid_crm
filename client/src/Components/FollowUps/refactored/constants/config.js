/**
 * Follow-Up Module Configuration
 * Centralized constants for the Follow-Up feature
 */

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const FOLLOW_UP_TABS = [
  {
    id: 'leads',
    label: 'Leads',
    apiPath: 'leads',
    icon: 'users',
    color: '#3b82f6'
  },
  {
    id: 'quotations',
    label: 'Quotations',
    apiPath: 'quotations',
    icon: 'file-text',
    color: '#10b981'
  }
];

export const FOLLOW_UP_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  RESCHEDULED: 'Rescheduled',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled'
};

export const STATUS_COLORS = {
  'Pending': '#fbbf24',
  'Completed': '#34d399',
  'Rescheduled': '#60a5fa',
  'Overdue': '#f87171',
  'Cancelled': '#9ca3af'
};

export const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Date (Oldest First)' },
  { value: 'date-desc', label: 'Date (Newest First)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'status', label: 'Status' }
];

export const DATE_FORMAT_OPTIONS = {
  DISPLAY: 'MMM DD, YYYY',
  ISO: 'YYYY-MM-DD',
  TIME_ISO: 'YYYY-MM-DDTHH:mm:ss'
};

export const API_ENDPOINTS = {
  FOLLOW_UPS: '/api/followups',
  LEADS: '/api/leads',
  QUOTATIONS: '/api/quotations'
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
};

export const VALIDATION_RULES = {
  NOTE_MIN_LENGTH: 3,
  NOTE_MAX_LENGTH: 500,
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
  TIME_FORMAT: /^\d{2}:\d{2}$/
};

export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Please fill in all required fields',
  INVALID_DATE: 'Please select a valid date',
  INVALID_TIME: 'Please select a valid time',
  INVALID_NOTE: `Note must be between ${VALIDATION_RULES.NOTE_MIN_LENGTH} and ${VALIDATION_RULES.NOTE_MAX_LENGTH} characters`,
  FETCH_ERROR: 'Failed to fetch data. Please try again.',
  SUBMIT_ERROR: 'Failed to submit follow-up. Please try again.',
  UPDATE_ERROR: 'Failed to update follow-up. Please try again.',
  DELETE_ERROR: 'Failed to delete follow-up. Please try again.',
  NO_ENTRIES: 'No entries found'
};

export const SUCCESS_MESSAGES = {
  CREATED: 'Follow-up created successfully!',
  UPDATED: 'Follow-up updated successfully!',
  DELETED: 'Follow-up deleted successfully!',
  RESCHEDULED: 'Follow-up rescheduled successfully!'
};
