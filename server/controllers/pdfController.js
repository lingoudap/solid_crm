import puppeteer from "puppeteer";
import Template from "../models/Template.js";
import { getRecordByModule } from "../utils/moduleModels.js";
import { mergeTemplate, extractPlaceholders } from "../utils/templateHelper.js";

/**
 * Generate PDF from template and record data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Query Parameters:
 * - module (required): One of 'Lead', 'Quotation', 'Customer', 'Order'
 * - recordId (required): MongoDB ID of the record
 * - templateId (optional): MongoDB ID of template. If not provided, uses default template for module
 *
 * @returns {Promise<void>} - Streams PDF to response
 */
export const generatePDF = async (req, res) => {
  let browser = null;

  try {
    const { module, recordId, templateId } = req.query;

    // ===== STEP 1: Validate Query Parameters =====
    if (!module || !recordId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: module and recordId",
      });
    }

    const validModules = ["Lead", "Quotation", "Customer", "Order"];
    if (!validModules.includes(module)) {
      return res.status(400).json({
        success: false,
        error: `Invalid module: ${module}. Must be one of: ${validModules.join(", ")}`,
      });
    }

    // Validate MongoDB ObjectId format
    if (!recordId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid recordId format",
      });
    }

    if (templateId && !templateId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid templateId format",
      });
    }

    // ===== STEP 2: Fetch Record by ID =====
    console.log(`📄 Fetching ${module} record...`);
    const recordData = await getRecordByModule(module, recordId);

    if (!recordData) {
      return res.status(404).json({
        success: false,
        error: `${module} record not found with ID: ${recordId}`,
      });
    }

    // ===== STEP 3: Fetch Template =====
    console.log(`🎨 Fetching template...`);
    let template;

    if (templateId) {
      // Use specific template if provided
      template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          error: `Template not found with ID: ${templateId}`,
        });
      }
      if (template.module !== module) {
        return res.status(400).json({
          success: false,
          error: `Template module (${template.module}) does not match requested module (${module})`,
        });
      }
    } else {
      // Find default template for module
      template = await Template.findOne({ module, isDefault: true });
      if (!template) {
        return res.status(404).json({
          success: false,
          error: `No default template found for module: ${module}. Please specify a templateId.`,
        });
      }
    }

    // ===== STEP 4: Merge Template with Record Data =====
    console.log(`🔄 Merging template with record data...`);
    const htmlContent = mergeTemplate(template.content, recordData.toObject());

    // Note: Template content can include inline CSS in <style> tags for PDF styling
    // Example: <style>body{font-family:Arial;padding:20px;} h1{color:#333;}</style>

    // ===== STEP 5: Launch Puppeteer =====
    console.log(`🚀 Launching Puppeteer...`);
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    // ===== STEP 6: Set HTML Content =====
    console.log(`📝 Setting page content...`);
    await page.setContent(htmlContent, {
      waitUntil: "networkidle2",
    });

    // ===== STEP 7: Generate PDF =====
    console.log(`🖨️ Generating PDF...`);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await page.close();

    // ===== STEP 8: Stream PDF Response =====
    const filename = `${module}-${recordId}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${filename}"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    console.log(`✅ PDF generated successfully: ${filename}`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ Error generating PDF:", error);

    // Handle specific error types
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes("Invalid module")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate PDF",
    });
  } finally {
    // Clean up: Close browser
    if (browser) {
      await browser.close();
      console.log("🧹 Browser closed");
    }
  }
};

/**
 * Preview template without generating PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Query Parameters:
 * - module (required): One of 'Lead', 'Quotation', 'Customer', 'Order'
 * - recordId (required): MongoDB ID of the record
 * - templateId (optional): MongoDB ID of template. If not provided, uses default template for module
 *
 * @returns {Promise<void>} - Returns HTML content as JSON
 */
export const previewTemplate = async (req, res) => {
  try {
    const { module, recordId, templateId } = req.query;

    // Validate parameters
    if (!module || !recordId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: module and recordId",
      });
    }

    const validModules = ["Lead", "Quotation", "Customer", "Order"];
    if (!validModules.includes(module)) {
      return res.status(400).json({
        success: false,
        error: `Invalid module: ${module}`,
      });
    }

    // Fetch record
    console.log(`📄 Fetching ${module} record for preview...`);
    const recordData = await getRecordByModule(module, recordId);

    if (!recordData) {
      return res.status(404).json({
        success: false,
        error: `${module} record not found with ID: ${recordId}`,
      });
    }

    // Fetch template
    console.log(`🎨 Fetching template...`);
    let template;

    if (templateId) {
      template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          error: `Template not found with ID: ${templateId}`,
        });
      }
    } else {
      template = await Template.findOne({ module, isDefault: true });
      if (!template) {
        return res.status(404).json({
          success: false,
          error: `No default template found for module: ${module}`,
        });
      }
    }

    // Merge template
    console.log(`🔄 Merging template...`);
    const htmlContent = mergeTemplate(template.content, recordData.toObject());

    // Get placeholders used in template
    const placeholders = extractPlaceholders(template.content);

    res.json({
      success: true,
      data: {
        html: htmlContent,
        template: {
          id: template._id,
          name: template.name,
          module: template.module,
          isDefault: template.isDefault,
        },
        record: {
          id: recordData._id,
          module,
        },
        placeholders,
      },
    });
  } catch (error) {
    console.error("❌ Error previewing template:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to preview template",
    });
  }
};

/**
 * Download PDF (same as generatePDF but with attachment disposition)
 */
export const downloadPDF = async (req, res) => {
  let browser = null;

  try {
    const { module, recordId, templateId } = req.query;

    // Validate parameters
    if (!module || !recordId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: module and recordId",
      });
    }

    const validModules = ["Lead", "Quotation", "Customer", "Order"];
    if (!validModules.includes(module)) {
      return res.status(400).json({
        success: false,
        error: `Invalid module: ${module}`,
      });
    }

    // Fetch record and template
    const recordData = await getRecordByModule(module, recordId);
    if (!recordData) {
      return res.status(404).json({
        success: false,
        error: `${module} record not found`,
      });
    }

    let template;
    if (templateId) {
      template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          error: "Template not found",
        });
      }
    } else {
      template = await Template.findOne({ module, isDefault: true });
      if (!template) {
        return res.status(404).json({
          success: false,
          error: `No default template found for module: ${module}`,
        });
      }
    }

    // Generate PDF
    const htmlContent = mergeTemplate(template.content, recordData.toObject());

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle2" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await page.close();

    // Send as attachment (download)
    const filename = `${module}-${recordData._id || "document"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    console.log(`✅ PDF downloaded: ${filename}`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ Error downloading PDF:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to download PDF",
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default {
  generatePDF,
  previewTemplate,
  downloadPDF,
};
