import { useState, useEffect } from "react";
import {
  getTemplatesAxios,
} from "../services/templateService";

/**
 * Custom hook for managing print templates
 * Handles fetching, loading, and error states for templates
 *
 * @returns {Object} { templates, loading, error, fetchTemplates }
 */
export const useTemplates = () => {
  const [templates, setTemplates] = useState({
    Lead: {},
    Quotation: {},
    Customer: {},
    Order: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch templates from API for a specific module
   * @param {string} module - Module name (Lead, Quotation, Customer, Order)
   */
  const fetchTemplates = async (module) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTemplatesAxios(module);

      if (response.success) {
        // Convert array response to object with ID as key
        const templateMap = {};
        response.data.forEach((template) => {
          templateMap[template._id] = {
            ...template,
            bodyFields: template.bodyFields || [],
            margins: template.margins || { top: 30, right: 25, bottom: 30, left: 25 },
            fontSize: template.fontSize || "12px",
            fontFamily: template.fontFamily || "Arial",
            lineSpacing: template.lineSpacing || "1.4",
            paperSize: template.paperSize || "A4",
            orientation: template.orientation || "portrait",
            showDate: template.showDate !== undefined ? template.showDate : true,
            showPageNumber: template.showPageNumber !== undefined ? template.showPageNumber : true,
            showSignature: template.showSignature || false,
            showLogo: template.showLogo || false,
            watermark: template.watermark || "",
            watermarkOpacity: template.watermarkOpacity || 0.1,
          };
        });

        setTemplates((prev) => ({
          ...prev,
          [module]: templateMap,
        }));
      }
    } catch (err) {
      console.error(`❌ Error fetching ${module} templates:`, err);
      setError(err.response?.data?.error || "Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    setTemplates,
  };
};

export default useTemplates;
