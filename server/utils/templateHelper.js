import Handlebars from "handlebars";

/**
 * Merges template HTML with data using Handlebars
 * @param {String} templateHTML - HTML template with {{placeholders}}
 * @param {Object} data - Data object to merge into template
 * @returns {String} - Compiled HTML with replaced values
 * @example
 * const template = "Hello {{firstName}} {{lastName}}!";
 * const data = { firstName: "John", lastName: "Doe" };
 * const result = mergeTemplate(template, data);
 * // Output: "Hello John Doe!"
 */
export const mergeTemplate = (templateHTML, data) => {
  try {
    // Validate inputs
    if (!templateHTML || typeof templateHTML !== "string") {
      throw new Error("Template HTML must be a non-empty string");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Data must be a valid object");
    }

    // Register custom Handlebars helpers
    registerCustomHelpers();

    // Compile the template
    const compiledTemplate = Handlebars.compile(templateHTML);

    // Merge data into template
    const result = compiledTemplate(data);

    return result;
  } catch (error) {
    console.error("❌ Error merging template:", error.message);
    throw new Error(`Template merge failed: ${error.message}`);
  }
};

/**
 * Register custom Handlebars helpers for enhanced functionality
 */
const registerCustomHelpers = () => {
  // Format currency with rupee symbol
  Handlebars.registerHelper("currency", function (value) {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return "₹" + num.toFixed(2);
  });

  // Format date
  Handlebars.registerHelper("formatDate", function (date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Convert to uppercase
  Handlebars.registerHelper("uppercase", function (value) {
    return value ? value.toString().toUpperCase() : "";
  });

  // Convert to lowercase
  Handlebars.registerHelper("lowercase", function (value) {
    return value ? value.toString().toLowerCase() : "";
  });

  // Conditional check
  Handlebars.registerHelper("eq", function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  // Default value if empty
  Handlebars.registerHelper("default", function (value, defaultVal) {
    return value ? value : defaultVal;
  });

  // Join array with separator
  Handlebars.registerHelper("join", function (arr, separator = ", ") {
    if (Array.isArray(arr)) {
      return arr.join(separator);
    }
    return arr;
  });

  // Conditional block
  Handlebars.registerHelper("if_eq", function (a, b, options) {
    return a == b ? options.fn(this) : options.inverse(this);
  });
};

/**
 * Validate if a template has all required placeholders
 * @param {String} templateHTML - HTML template to validate
 * @param {Array<String>} requiredFields - Array of required field names
 * @returns {Object} - { isValid: Boolean, missingFields: Array<String> }
 */
export const validateTemplate = (templateHTML, requiredFields = []) => {
  try {
    if (!templateHTML || typeof templateHTML !== "string") {
      return {
        isValid: false,
        error: "Template HTML must be a non-empty string",
      };
    }

    // Extract all placeholders from template using regex
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = new Set();
    let match;

    while ((match = placeholderRegex.exec(templateHTML)) !== null) {
      // Remove any helper functions and get the variable name
      const placeholder = match[1].trim().split(" ")[0];
      placeholders.add(placeholder);
    }

    // Check for missing required fields
    const missingFields = requiredFields.filter(
      (field) => !placeholders.has(field)
    );

    return {
      isValid: missingFields.length === 0,
      placeholders: Array.from(placeholders),
      missingFields,
    };
  } catch (error) {
    console.error("❌ Error validating template:", error.message);
    return {
      isValid: false,
      error: `Validation failed: ${error.message}`,
    };
  }
};

/**
 * Extract all placeholders from a template
 * @param {String} templateHTML - HTML template to analyze
 * @returns {Array<String>} - Array of placeholder names
 */
export const extractPlaceholders = (templateHTML) => {
  try {
    if (!templateHTML || typeof templateHTML !== "string") {
      throw new Error("Template HTML must be a non-empty string");
    }

    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = new Set();
    let match;

    while ((match = placeholderRegex.exec(templateHTML)) !== null) {
      const placeholder = match[1].trim().split(" ")[0];
      placeholders.add(placeholder);
    }

    return Array.from(placeholders);
  } catch (error) {
    console.error("❌ Error extracting placeholders:", error.message);
    return [];
  }
};

/**
 * Generate sample data for template preview
 * @param {Array<String>} placeholders - Array of placeholder names
 * @returns {Object} - Sample data object with placeholder keys
 */
export const generateSampleData = (placeholders) => {
  const sampleValues = {
    name: "John Smith",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    company: "Tech Corp",
    jobTitle: "Manager",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    id: "ID-001",
    leadId: "LD-2023-001",
    customerId: "CUST-001",
    quoteId: "QT-2023-001",
    orderId: "ORD-2023-001",
    status: "Active",
    amount: "5000",
    totalAmount: "5000.00",
    date: new Date().toISOString(),
    createdDate: new Date().toISOString(),
    notes: "Sample notes for testing",
  };

  const sampleData = {};
  placeholders.forEach((placeholder) => {
    sampleData[placeholder] =
      sampleValues[placeholder] || `Sample ${placeholder}`;
  });

  return sampleData;
};

export default {
  mergeTemplate,
  validateTemplate,
  extractPlaceholders,
  generateSampleData,
};
