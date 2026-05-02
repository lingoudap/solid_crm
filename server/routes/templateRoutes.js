import express from "express";
import Template from "../models/Template.js";
import { generatePDF, previewTemplate, downloadPDF } from "../controllers/pdfController.js";

const router = express.Router();

// Validation helper
const validateModule = (module) => {
  const validModules = ["Lead", "Quotation", "Customer", "Order"];
  return validModules.includes(module);
};

// Error response helper
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, error: message });
};

/**
 * GET /api/templates?module=Lead
 * Get all templates filtered by module
 * @query {String} module - Required. One of: Lead, Quotation, Customer, Order
 */
router.get("/", async (req, res) => {
  try {
    const { module } = req.query;

    // Validate module parameter
    if (!module) {
      return errorResponse(res, 400, "Module parameter is required");
    }

    if (!validateModule(module)) {
      return errorResponse(
        res,
        400,
        "Invalid module. Must be one of: Lead, Quotation, Customer, Order"
      );
    }

    const templates = await Template.find({ module })
      .sort({ isDefault: -1, name: 1 })
      .select("-__v");

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (err) {
    console.error("❌ Error fetching templates:", err);
    errorResponse(res, 500, err.message || "Failed to fetch templates");
  }
});

/**
 * GET /api/templates/:id
 * Get a specific template by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, 400, "Invalid template ID format");
    }

    const template = await Template.findById(id).select("-__v");

    if (!template) {
      return errorResponse(res, 404, "Template not found");
    }

    res.json({ success: true, data: template });
  } catch (err) {
    console.error("❌ Error fetching template:", err);
    errorResponse(res, 500, "Failed to fetch template");
  }
});

/**
 * POST /api/templates
 * Create a new template
 * @body {String} name - Required. Template name (max 100 characters)
 * @body {String} module - Required. One of: Lead, Quotation, Customer, Order
 * @body {String} content - Required. HTML content with {{placeholders}}
 * @body {Boolean} isDefault - Optional. Set as default template for module (default: false)
 */
router.post("/", async (req, res) => {
  try {
    const { name, module, content, isDefault } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return errorResponse(res, 400, "Template name is required");
    }

    if (!module) {
      return errorResponse(res, 400, "Module is required");
    }

    if (!validateModule(module)) {
      return errorResponse(
        res,
        400,
        "Invalid module. Must be one of: Lead, Quotation, Customer, Order"
      );
    }

    if (!content || !content.trim()) {
      return errorResponse(res, 400, "Template content is required");
    }

    // If marking as default, unset other defaults in same module
    if (isDefault === true) {
      await Template.updateMany(
        { module, isDefault: true },
        { isDefault: false }
      );
    }

    const template = new Template({
      name: name.trim(),
      module,
      content: content.trim(),
      isDefault: isDefault === true ? true : false,
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: template,
    });
  } catch (err) {
    console.error("❌ Error creating template:", err);
    errorResponse(res, 400, err.message || "Failed to create template");
  }
});

/**
 * PUT /api/templates/:id
 * Update an existing template
 * @body {String} name - Optional. New template name
 * @body {String} content - Optional. New template content with {{placeholders}}
 * @body {Boolean} isDefault - Optional. Update default status
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, isDefault } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, 400, "Invalid template ID format");
    }

    // Check if template exists
    const existingTemplate = await Template.findById(id);
    if (!existingTemplate) {
      return errorResponse(res, 404, "Template not found");
    }

    // Validate name if provided
    if (name !== undefined && name !== null) {
      if (!name.trim()) {
        return errorResponse(res, 400, "Template name cannot be empty");
      }
    }

    // Validate content if provided
    if (content !== undefined && content !== null) {
      if (!content.trim()) {
        return errorResponse(res, 400, "Template content cannot be empty");
      }
    }

    // Prepare update data
    const updateData = {};

    if (name) {
      updateData.name = name.trim();
    }

    if (content) {
      updateData.content = content.trim();
    }

    // If marking as default, unset other defaults in same module
    if (isDefault === true) {
      await Template.updateMany(
        { module: existingTemplate.module, _id: { $ne: id }, isDefault: true },
        { isDefault: false }
      );
      updateData.isDefault = true;
    } else if (isDefault === false) {
      updateData.isDefault = false;
    }

    const updatedTemplate = await Template.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-__v");

    res.json({
      success: true,
      message: "Template updated successfully",
      data: updatedTemplate,
    });
  } catch (err) {
    console.error("❌ Error updating template:", err);
    errorResponse(res, 400, err.message || "Failed to update template");
  }
});

/**
 * DELETE /api/templates/:id
 * Delete a template by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, 400, "Invalid template ID format");
    }

    const deletedTemplate = await Template.findByIdAndDelete(id);

    if (!deletedTemplate) {
      return errorResponse(res, 404, "Template not found");
    }

    res.json({
      success: true,
      message: "Template deleted successfully",
      data: { id: deletedTemplate._id, name: deletedTemplate.name },
    });
  } catch (err) {
    console.error("❌ Error deleting template:", err);
    errorResponse(res, 500, err.message || "Failed to delete template");
  }
});

/**
 * GET /api/templates/pdf
 * Generate and stream PDF from template
 * @query {String} module - Required. Module name
 * @query {String} recordId - Required. Record ID
 * @query {String} templateId - Optional. Template ID. If not provided, uses default
 * @returns {Stream} - PDF file stream
 */
router.get("/pdf", generatePDF);

/**
 * GET /api/templates/preview
 * Preview template HTML without generating PDF
 * @query {String} module - Required. Module name
 * @query {String} recordId - Required. Record ID
 * @query {String} templateId - Optional. Template ID
 * @returns {JSON} - HTML content and metadata
 */
router.get("/preview", previewTemplate);

/**
 * GET /api/templates/download
 * Download PDF as attachment
 * @query {String} module - Required. Module name
 * @query {String} recordId - Required. Record ID
 * @query {String} templateId - Optional. Template ID
 * @returns {Stream} - PDF file attachment
 */
router.get("/download", downloadPDF);

export default router;
