/**
 * Validation Middleware for Follow-Up Routes
 * Basic validation for request body
 */

export const validateInput = (req, res, next) => {
  try {
    // Check if body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "Request body is empty",
        success: false
      });
    }

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error("❌ Validation middleware error:", error);
    res.status(500).json({
      error: "Validation middleware error",
      success: false
    });
  }
};

/**
 * Validate required fields
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Function} Express middleware function
 */
export const validateRequiredFields = (requiredFields = []) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
        success: false
      });
    }
    
    next();
  };
};

/**
 * Validate date format
 * @param {string} fieldName - Field name to validate
 * @returns {Function} Express middleware function
 */
export const validateDateFormat = (fieldName = "date") => {
  return (req, res, next) => {
    const dateValue = req.body[fieldName];
    
    if (!dateValue) {
      return next(); // Let required field validation handle this
    }

    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          error: `Invalid date format for ${fieldName}. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)`,
          success: false
        });
      }
    } catch (error) {
      return res.status(400).json({
        error: `Invalid date format for ${fieldName}`,
        success: false
      });
    }

    next();
  };
};

export default validateInput;
