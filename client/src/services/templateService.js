/**
 * Template Service Utility
 * Handles template management with both localStorage and API support
 */

import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const STORAGE_KEY = "customPrintTemplates";
const USE_API = process.env.REACT_APP_USE_TEMPLATE_API === "true"; // Set to true to use API instead of localStorage

/**
 * Fetch all templates for a module from API
 */
export const fetchTemplatesFromAPI = async (module) => {
  try {
    const response = await fetch(
      `${API_BASE.replace(/\/$/, "")}/api/templates?module=${module}`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching templates from API:", error);
    return [];
  }
};

/**
 * Fetch a single template by ID from API
 */
export const fetchTemplateByIdFromAPI = async (templateId) => {
  try {
    const response = await fetch(
      `${API_BASE.replace(/\/$/, "")}/api/templates/${templateId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching template from API:", error);
    return null;
  }
};

/**
 * Save/Create template via API
 */
export const saveTemplateToAPI = async (template) => {
  try {
    const method = template._id || template.id ? "PUT" : "POST";
    const url = template._id
      ? `${API_BASE.replace(/\/$/, "")}/api/templates/${template._id}`
      : template.id
      ? `${API_BASE.replace(/\/$/, "")}/api/templates/${template.id}`
      : `${API_BASE.replace(/\/$/, "")}/api/templates`;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error saving template via API:", error);
    throw error;
  }
};

/**
 * Delete template via API
 */
export const deleteTemplateFromAPI = async (templateId) => {
  try {
    const response = await fetch(
      `${API_BASE.replace(/\/$/, "")}/api/templates/${templateId}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error deleting template via API:", error);
    throw error;
  }
};

/**
 * Get templates from localStorage
 * Legacy support for existing installations
 */
export const getTemplatesFromLocalStorage = (module) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};

    const parsed = JSON.parse(saved);
    return parsed[module] || {};
  } catch (error) {
    console.error("❌ Error parsing templates from localStorage:", error);
    return {};
  }
};

/**
 * Save templates to localStorage
 */
export const saveTemplatesToLocalStorage = (module, templates) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    all[module] = templates;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error("❌ Error saving templates to localStorage:", error);
  }
};

/**
 * Get templates - unified function that chooses between API and localStorage
 */
export const getTemplates = async (module) => {
  if (USE_API) {
    return await fetchTemplatesFromAPI(module);
  } else {
    return getTemplatesFromLocalStorage(module);
  }
};

/**
 * Save template - unified function
 */
export const saveTemplate = async (template) => {
  if (USE_API) {
    return await saveTemplateToAPI(template);
  } else {
    // For localStorage, convert API response format back to localStorage format
    const { _id, ...rest } = template;
    const id = _id || template.id || Date.now().toString();
    const templates = getTemplatesFromLocalStorage(template.module);
    templates[id] = { ...rest, id };
    saveTemplatesToLocalStorage(template.module, templates);
    return { ...rest, id };
  }
};

/**
 * Delete template - unified function
 */
export const deleteTemplate = async (templateId, module) => {
  if (USE_API) {
    return await deleteTemplateFromAPI(templateId);
  } else {
    const templates = getTemplatesFromLocalStorage(module);
    delete templates[templateId];
    saveTemplatesToLocalStorage(module, templates);
    return { message: "Template deleted", id: templateId };
  }
};

/**
 * Convert API template response to localStorage format
 */
export const convertAPITemplateToLocal = (apiTemplate) => {
  return {
    id: apiTemplate._id || apiTemplate.id,
    name: apiTemplate.name,
    module: apiTemplate.module,
    headerContent: apiTemplate.headerContent,
    bodyFields: apiTemplate.bodyFields || [],
    footerContent: apiTemplate.footerContent,
    showLogo: apiTemplate.showLogo !== false,
    showDate: apiTemplate.showDate !== false,
    showPageNumber: apiTemplate.showPageNumber !== false,
    showSignature: apiTemplate.showSignature || false,
    paperSize: apiTemplate.paperSize || "A4",
    orientation: apiTemplate.orientation || "portrait",
    margins: apiTemplate.margins || { top: 20, right: 20, bottom: 20, left: 20 },
    fontSize: apiTemplate.fontSize || "12px",
    fontFamily: apiTemplate.fontFamily || "Arial",
    lineSpacing: apiTemplate.lineSpacing || "1.5",
    watermark: apiTemplate.watermark || "",
    watermarkOpacity: apiTemplate.watermarkOpacity || 0.1,
    isDefault: apiTemplate.isDefault || false,
    lastModified: apiTemplate.lastModified,
    createdAt: apiTemplate.createdAt,
  };
};

/**
 * Get the default template for a module
 */
export const getDefaultTemplate = async (module) => {
  const templates = await getTemplates(module);

  if (USE_API) {
    // API returns array, find default
    return templates.find((t) => t.isDefault) || templates[0] || null;
  } else {
    // localStorage returns object, find default
    return (
      Object.values(templates).find((t) => t.isDefault) ||
      Object.values(templates)[0] ||
      null
    );
  }
};

/**
 * Sync templates from localStorage to API (one-time migration)
 */
export const syncLocalStorageToAPI = async () => {
  try {
    const modules = ["Lead", "Quotation", "Customer", "Order"];
    let synced = 0;

    for (const module of modules) {
      const localTemplates = getTemplatesFromLocalStorage(module);

      for (const [, template] of Object.entries(localTemplates)) {
        await saveTemplateToAPI({
          ...template,
          module,
          id: undefined, // Let server generate new ID
        });
        synced++;
      }
    }

    console.log(`✅ Synced ${synced} templates to API`);
    return { message: `Synced ${synced} templates to API` };
  } catch (error) {
    console.error("❌ Error syncing templates:", error);
    throw error;
  }
};

// ====== AXIOS-BASED API FUNCTIONS ======
// Modern axios-based functions for template management

/**
 * Fetch all templates for a specific module using axios
 * @param {string} module - Module name (Lead, Quotation, Customer, Order)
 * @returns {Promise} Response with template data
 */
export const getTemplatesAxios = async (module) => {
  try {
    const url = `${API_BASE.replace(/\/$/, "")}/api/templates?module=${module}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching ${module} templates:`, error);
    throw error;
  }
};

/**
 * Create a new template using axios
 * @param {object} data - Template data (name, module, content, isDefault, etc.)
 * @returns {Promise} Response with created template
 */
export const createTemplateAxios = async (data) => {
  try {
    console.log("📤 Creating new template...");
    const url = `${API_BASE.replace(/\/$/, "")}/api/templates`;
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating template:", error);
    throw error;
  }
};

/**
 * Update an existing template using axios
 * @param {string} id - Template ID
 * @param {object} data - Updated template data
 * @returns {Promise} Response with updated template
 */
export const updateTemplateAxios = async (id, data) => {
  try {
    console.log("📤 Updating template...", id);
    const url = `${API_BASE.replace(/\/$/, "")}/api/templates/${id}`;
    const response = await axios.put(url, data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating template:", error);
    throw error;
  }
};

/**
 * Delete a template using axios
 * @param {string} id - Template ID
 * @returns {Promise} Response confirming deletion
 */
export const deleteTemplateAxios = async (id) => {
  try {
    console.log("🗑️ Deleting template...", id);
    const url = `${API_BASE.replace(/\/$/, "")}/api/templates/${id}`;
    const response = await axios.delete(url);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting template:", error);
    throw error;
  }
};

/**
 * Set a template as default for its module using axios
 * @param {string} id - Template ID
 * @returns {Promise} Response with updated template
 */
export const setDefaultTemplateAxios = async (id) => {
  try {
    console.log("⭐ Setting default template...", id);
    const url = `${API_BASE.replace(/\/$/, "")}/api/templates/${id}`;
    const response = await axios.put(url, {
      isDefault: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error setting default template:", error);
    throw error;
  }
};
