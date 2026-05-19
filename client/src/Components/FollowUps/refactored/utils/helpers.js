/**
 * Follow-Up Utility Functions
 * Helper functions for date formatting, validation, and data manipulation
 */

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time'
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';

  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    iso: { year: 'numeric', month: '2-digit', day: '2-digit' }
  };

  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Format time to readable string
 * @param {Date|string} date - Date with time
 * @returns {string} Formatted time
 */
export const formatTime = (date) => {
  if (!date) return '-';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';

  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date and time together
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  if (!date) return '-';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';

  return `${formatDate(dateObj, 'short')} at ${formatTime(dateObj)}`;
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isDateInPast = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  return dateObj < new Date();
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Get days until follow-up
 * @param {Date|string} date - Follow-up date
 * @returns {number} Days until follow-up (negative if past)
 */
export const getDaysUntil = (date) => {
  if (!date) return 0;

  const dateObj = new Date(date);
  const today = new Date();

  const diffTime = dateObj - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get relative time string
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time (e.g., "2 days ago", "in 3 days")
 */
export const getRelativeTime = (date) => {
  if (!date) return '-';

  const days = getDaysUntil(date);

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return `In ${days} days`;
  if (days < -1) return `${Math.abs(days)} days ago`;

  return formatDate(date, 'short');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid phone
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50, suffix = '...') => {
  if (!text) return '-';
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Get status badge color
 * @param {string} status - Status value
 * @returns {string} Color class or hex color
 */
export const getStatusColor = (status) => {
  const colors = {
    'Pending': '#fbbf24',
    'Completed': '#34d399',
    'Rescheduled': '#60a5fa',
    'Overdue': '#f87171',
    'Cancelled': '#9ca3af'
  };

  return colors[status] || '#6b7280';
};

/**
 * Get status badge text color (for readability)
 * @param {string} status - Status value
 * @returns {string} Text color (white or dark)
 */
export const getStatusTextColor = (status) => {
  const darkStatuses = ['Completed', 'Cancelled'];
  return darkStatuses.includes(status) ? '#000' : '#fff';
};

/**
 * Sort array of objects
 * @param {Array} array - Array to sort
 * @param {string} key - Property to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (typeof aVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });
};

/**
 * Filter array by multiple criteria
 * @param {Array} array - Array to filter
 * @param {Object} criteria - Filter criteria
 * @returns {Array} Filtered array
 */
export const filterBy = (array, criteria) => {
  return array.filter(item => {
    return Object.keys(criteria).every(key => {
      const value = criteria[key];
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      return item[key] === value;
    });
  });
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Property or function to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function for optimizing expensive operations
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export const mergeObjects = (target, source) => {
  return { ...target, ...source };
};

/**
 * Compare two objects for equality
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} True if equal
 */
export const isDeepEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "JD" from "John Doe")
 */
export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Convert ISO date to input format (YYYY-MM-DD)
 * @param {Date|string} date - Date to convert
 * @returns {string} Formatted for input[type="date"]
 */
export const dateToInputFormat = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Convert time string to ISO format
 * @param {string} timeStr - Time string (HH:mm)
 * @returns {string} ISO format with current date
 */
export const timeToIsoFormat = (timeStr) => {
  if (!timeStr) return '';

  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0);

  return date.toISOString();
};
