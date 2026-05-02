import express from "express";
import { generatePDF, downloadPDF, previewTemplate } from "../controllers/pdfController.js";

const router = express.Router();

/**
 * Print Routes for PDF Generation
 * All PDF generation endpoints
 */

/**
 * GET /api/print/generate
 * Generate and view PDF in browser
 * @query {String} module - Required: Lead, Quotation, Customer, Order
 * @query {String} recordId - Required: MongoDB ObjectId
 * @query {String} templateId - Optional: Template MongoDB ObjectId
 */
router.get("/generate", generatePDF);

/**
 * GET /api/print/download
 * Download PDF as file attachment
 * @query {String} module - Required
 * @query {String} recordId - Required
 * @query {String} templateId - Optional
 */
router.get("/download", downloadPDF);

/**
 * GET /api/print/preview
 * Preview template HTML without generating PDF
 * @query {String} module - Required
 * @query {String} recordId - Required
 * @query {String} templateId - Optional
 */
router.get("/preview", previewTemplate);

export default router;
