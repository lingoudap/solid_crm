import express from "express";
import Template from "../models/Template.js";

const router = express.Router();

/**
 * GET /api/templates?module=Quotation
 * Get all templates for a specific module
 */
router.get("/", async (req, res) => {
  try {
    const { module } = req.query;

    // Validate module parameter
    if (!module) {
      return res.status(400).json({ error: "module parameter is required" });
    }

    const validModules = ["Lead", "Quotation", "Customer", "Order"];
    if (!validModules.includes(module)) {
      return res.status(400).json({ error: `Invalid module: ${module}` });
    }

    const templates = await Template.find({ module }).sort({ isDefault: -1, name: 1 });
    res.json(templates);
  } catch (err) {
    console.error("❌ Error fetching templates:", err);
    res.status(500).json({ error: err.message || "Failed to fetch templates" });
  }
});

/**
 * GET /api/templates/:id
 * Get a specific template by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id.length < 24) {
      return res.status(400).json({ error: "Invalid template ID" });
    }

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(template);
  } catch (err) {
    console.error("❌ Error fetching template:", err);
    res.status(500).json({ error: "Failed to fetch template" });
  }
});

/**
 * POST /api/templates
 * Create a new template
 */
router.post("/", async (req, res) => {
  try {
    const { name, module, bodyFields, ...otherFields } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Template name is required" });
    }

    if (!module) {
      return res.status(400).json({ error: "Module is required" });
    }

    const validModules = ["Lead", "Quotation", "Customer", "Order"];
    if (!validModules.includes(module)) {
      return res.status(400).json({ error: `Invalid module: ${module}` });
    }

    // Validate bodyFields if provided
    if (bodyFields && !Array.isArray(bodyFields)) {
      return res.status(400).json({ error: "bodyFields must be an array" });
    }

    // If marking as default, unset other defaults in same module
    if (otherFields.isDefault) {
      await Template.updateMany({ module, isDefault: true }, { isDefault: false });
    }

    const template = new Template({
      name: name.trim(),
      module,
      bodyFields: bodyFields || [],
      ...otherFields,
    });

    await template.save();
    res.status(201).json(template);
  } catch (err) {
    console.error("❌ Error creating template:", err);
    res.status(400).json({ error: err.message || "Failed to create template" });
  }
});

/**
 * PUT /api/templates/:id
 * Update an existing template
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, module, bodyFields, isDefault, ...otherFields } = req.body;

    // Validate ID format
    if (!id || id.length < 24) {
      return res.status(400).json({ error: "Invalid template ID" });
    }

    // Validate name if provided
    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ error: "Template name cannot be empty" });
    }

    // Validate module if provided
    if (module) {
      const validModules = ["Lead", "Quotation", "Customer", "Order"];
      if (!validModules.includes(module)) {
        return res.status(400).json({ error: `Invalid module: ${module}` });
      }
    }

    // Validate bodyFields if provided
    if (bodyFields && !Array.isArray(bodyFields)) {
      return res.status(400).json({ error: "bodyFields must be an array" });
    }

    // Check if template exists
    const existingTemplate = await Template.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({ error: "Template not found" });
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(module && { module }),
      ...(bodyFields && { bodyFields }),
      ...otherFields,
    };

    // If marking as default, unset other defaults in same module
    if (isDefault) {
      const targetModule = module || existingTemplate.module;
      await Template.updateMany(
        { module: targetModule, _id: { $ne: id }, isDefault: true },
        { isDefault: false }
      );
      updateData.isDefault = true;
    } else if (isDefault === false) {
      updateData.isDefault = false;
    }

    const updatedTemplate = await Template.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedTemplate);
  } catch (err) {
    console.error("❌ Error updating template:", err);
    res.status(400).json({ error: err.message || "Failed to update template" });
  }
});

/**
 * DELETE /api/templates/:id
 * Delete a template
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id.length < 24) {
      return res.status(400).json({ error: "Invalid template ID" });
    }

    const template = await Template.findByIdAndDelete(id);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({ message: "Template deleted successfully", id });
  } catch (err) {
    console.error("❌ Error deleting template:", err);
    res.status(500).json({ error: err.message || "Failed to delete template" });
  }
});

export default router;
