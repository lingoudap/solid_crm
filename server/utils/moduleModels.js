import Lead from "../models/Leads.js";
import Quotation from "../models/Quotation.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

/**
 * Mapping of module names to their respective Mongoose models
 * Used for dynamic model selection in template and data operations
 */
export const moduleModels = {
  Lead,
  Quotation,
  Customer,
  Order,
};

/**
 * Get the Mongoose model for a given module name
 * @param {String} moduleName - One of: 'Lead', 'Quotation', 'Customer', 'Order'
 * @returns {Model} - Mongoose model
 * @throws {Error} - If module name is invalid
 * @example
 * const LeadModel = getModelByModule('Lead');
 * const leads = await LeadModel.find();
 */
export const getModelByModule = (moduleName) => {
  if (!moduleName || typeof moduleName !== "string") {
    throw new Error("Module name must be a non-empty string");
  }

  const model = moduleModels[moduleName];

  if (!model) {
    const validModules = Object.keys(moduleModels).join(", ");
    throw new Error(
      `Invalid module: '${moduleName}'. Valid modules are: ${validModules}`
    );
  }

  return model;
};

/**
 * Get all available module names
 * @returns {Array<String>} - Array of valid module names
 */
export const getAvailableModules = () => {
  return Object.keys(moduleModels);
};

/**
 * Check if a module name is valid
 * @param {String} moduleName - Module name to validate
 * @returns {Boolean} - True if module is valid
 */
export const isValidModule = (moduleName) => {
  return Object.prototype.hasOwnProperty.call(moduleModels, moduleName);
};

/**
 * Get a record from the correct module by ID
 * @param {String} moduleName - Module name
 * @param {String} recordId - Record ID
 * @returns {Promise<Object>} - The record
 * @throws {Error} - If module or record not found
 * @example
 * const lead = await getRecordByModule('Lead', '507f1f77bcf86cd799439011');
 */
export const getRecordByModule = async (moduleName, recordId) => {
  try {
    const Model = getModelByModule(moduleName);
    const record = await Model.findById(recordId);

    if (!record) {
      throw new Error(`${moduleName} record not found with ID: ${recordId}`);
    }

    return record;
  } catch (error) {
    throw new Error(`Failed to fetch ${moduleName} record: ${error.message}`);
  }
};

/**
 * Get multiple records from a module by query
 * @param {String} moduleName - Module name
 * @param {Object} query - MongoDB query object
 * @param {Object} options - Options like { limit: 10, skip: 0, sort: {} }
 * @returns {Promise<Array>} - Array of records
 * @throws {Error} - If module is invalid
 * @example
 * const records = await getRecordsByModule('Lead', { status: 'Active' }, { limit: 10 });
 */
export const getRecordsByModule = async (moduleName, query = {}, options = {}) => {
  try {
    const Model = getModelByModule(moduleName);
    const { limit = 100, skip = 0, sort = { createdAt: -1 } } = options;

    const records = await Model.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sort);

    return records;
  } catch (error) {
    throw new Error(
      `Failed to fetch ${moduleName} records: ${error.message}`
    );
  }
};

export default {
  moduleModels,
  getModelByModule,
  getAvailableModules,
  isValidModule,
  getRecordByModule,
  getRecordsByModule,
};
