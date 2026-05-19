/**
 * Simple Logger Utility
 * Provides consistent logging across the application
 */

const logger = {
  /**
   * Log info message
   */
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️  INFO: ${message}`, data || "");
  },

  /**
   * Log warning message
   */
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️  WARN: ${message}`, data || "");
  },

  /**
   * Log error message
   */
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ERROR: ${message}`, error || "");
  },

  /**
   * Log debug message
   */
  debug: (message, data = null) => {
    if (process.env.DEBUG === "true") {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🐛 DEBUG: ${message}`, data || "");
    }
  },

  /**
   * Log success message
   */
  success: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ SUCCESS: ${message}`, data || "");
  },

  /**
   * Log with custom prefix
   */
  log: (prefix, message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${prefix} ${message}`, data || "");
  },
};

export default logger;
