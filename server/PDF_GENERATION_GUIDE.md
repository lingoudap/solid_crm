/**
 * PDF Generation Feature - Complete Implementation Guide
 * 
 * This document outlines the PDF generation system for the CRM application
 * using Puppeteer and Handlebars templates.
 */

// ============================================
// 1. INSTALLATION
// ============================================
// npm install puppeteer handlebars

// ============================================
// 2. API ENDPOINTS
// ============================================

/**
 * GENERATE PDF (View in Browser)
 * GET /api/templates/pdf?module=Lead&recordId=507f1f77bcf86cd799439011&templateId=507f1f77bcf86cd799439012
 * 
 * Query Parameters:
 * - module (required): 'Lead' | 'Quotation' | 'Customer' | 'Order'
 * - recordId (required): MongoDB ObjectId of the record
 * - templateId (optional): MongoDB ObjectId of template
 *   → If not provided, uses default template for the module
 * 
 * Response:
 * - Content-Type: application/pdf
 * - Content-Disposition: inline; filename="Lead-507f1f77bcf86cd799439011.pdf"
 * - Returns PDF stream directly
 * 
 * Usage:
 * // View in browser
 * window.open('/api/templates/pdf?module=Lead&recordId=xyz');
 * 
 * // Download to iframe
 * <iframe src="/api/templates/pdf?module=Lead&recordId=xyz" />
 * 
 * Error Responses:
 * - 400: Missing or invalid parameters
 * - 404: Record or template not found
 * - 500: Server error during PDF generation
 */

/**
 * DOWNLOAD PDF (Force Download)
 * GET /api/templates/download?module=Lead&recordId=507f1f77bcf86cd799439011
 * 
 * Same as /pdf but with Content-Disposition: attachment
 * Triggers download dialog in browser
 * 
 * Usage:
 * <a href="/api/templates/download?module=Lead&recordId=xyz">Download PDF</a>
 */

/**
 * PREVIEW TEMPLATE
 * GET /api/templates/preview?module=Lead&recordId=507f1f77bcf86cd799439011&templateId=507f1f77bcf86cd799439012
 * 
 * Returns HTML content without generating PDF (faster, for preview)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "html": "<html>...</html>",
 *     "template": {
 *       "id": "...",
 *       "name": "Professional Lead Report",
 *       "module": "Lead",
 *       "isDefault": true
 *     },
 *     "record": {
 *       "id": "...",
 *       "module": "Lead"
 *     },
 *     "placeholders": ["name", "email", "phone", ...]
 *   }
 * }
 */

// ============================================
// 3. TEMPLATE STRUCTURE
// ============================================

/**
 * Templates use Handlebars syntax with {{placeholders}}
 * 
 * Example Template HTML:
 * 
 * <html>
 *   <head>
 *     <style>
 *       body { font-family: Arial; }
 *       .header { border-bottom: 2px solid #333; padding: 20px; }
 *       .field { margin: 10px 0; }
 *     </style>
 *   </head>
 *   <body>
 *     <div class="header">
 *       <h1>Lead Report</h1>
 *     </div>
 *     
 *     <div class="field">
 *       <strong>Name:</strong> {{name}}
 *     </div>
 *     
 *     <div class="field">
 *       <strong>Email:</strong> {{email}}
 *     </div>
 *     
 *     <div class="field">
 *       <strong>Phone:</strong> {{phone}}
 *     </div>
 *     
 *     <div class="field">
 *       <strong>Company:</strong> {{company}}
 *     </div>
 *     
 *     <div class="field">
 *       <strong>Amount:</strong> {{amount | currency}}
 *     </div>
 *     
 *     <div class="field">
 *       <strong>Created Date:</strong> {{createdDate | formatDate}}
 *     </div>
 *     
 *     {{#eq status "Active"}}
 *       <div class="status-active">Status: ACTIVE</div>
 *     {{/eq}}
 *   </body>
 * </html>
 */

// ============================================
// 4. AVAILABLE HANDLEBARS HELPERS
// ============================================

/**
 * Built-in Helpers:
 * 
 * 1. currency - Format with rupee symbol
 *    {{amount | currency}}
 *    → Output: ₹1000.00
 * 
 * 2. formatDate - Format date in Indian format
 *    {{createdDate | formatDate}}
 *    → Output: 15 October 2023
 * 
 * 3. uppercase - Convert to uppercase
 *    {{name | uppercase}}
 *    → Output: JOHN SMITH
 * 
 * 4. lowercase - Convert to lowercase
 *    {{email | lowercase}}
 * 
 * 5. default - Provide fallback value
 *    {{company | default "N/A"}}
 * 
 * 6. join - Join array items
 *    {{items | join ", "}}
 * 
 * 7. eq - Equality check
 *    {{#eq status "Active"}}...{{/eq}}
 * 
 * 8. if_eq - Loose equality check
 *    {{#if_eq value "1"}}...{{/if_eq}}
 */

// ============================================
// 5. WORKFLOW EXAMPLE
// ============================================

/**
 * Step-by-step process:
 * 
 * 1. User clicks "Print" or "Generate PDF" button
 *    
 * 2. Frontend calls:
 *    GET /api/templates/pdf?module=Lead&recordId=123
 * 
 * 3. Backend:
 *    a) Validates module and recordId
 *    b) Fetches Lead record from database
 *    c) Fetches default template (or specified templateId)
 *    d) Launches Puppeteer headless browser
 *    e) Merges template with record data using Handlebars
 *    f) Generates PDF (A4, print background enabled)
 *    g) Streams PDF to response
 *    h) Closes browser
 * 
 * 4. Frontend receives PDF stream
 *    - Displays in browser, or
 *    - Triggers download dialog
 */

// ============================================
// 6. FRONTEND IMPLEMENTATION EXAMPLES
// ============================================

/**
 * Example 1: View PDF in new window
 * 
 * const handlePrint = (module, recordId) => {
 *   const url = `/api/templates/pdf?module=${module}&recordId=${recordId}`;
 *   window.open(url, '_blank');
 * };
 */

/**
 * Example 2: Download PDF
 * 
 * const handleDownload = (module, recordId) => {
 *   const url = `/api/templates/download?module=${module}&recordId=${recordId}`;
 *   const link = document.createElement('a');
 *   link.href = url;
 *   link.download = `${module}-${recordId}.pdf`;
 *   link.click();
 * };
 */

/**
 * Example 3: Preview template before PDF generation
 * 
 * const handlePreview = async (module, recordId, templateId) => {
 *   const response = await fetch(
 *     `/api/templates/preview?module=${module}&recordId=${recordId}&templateId=${templateId}`
 *   );
 *   const data = await response.json();
 *   
 *   // Show HTML preview in modal
 *   setPreviewHTML(data.data.html);
 *   setShowPreview(true);
 * };
 */

/**
 * Example 4: React hook for PDF generation
 * 
 * const usePDFGenerator = () => {
 *   const generatePDF = async (module, recordId, templateId) => {
 *     try {
 *       const url = `/api/templates/pdf?module=${module}&recordId=${recordId}`;
 *       if (templateId) {
 *         url += `&templateId=${templateId}`;
 *       }
 *       
 *       const response = await fetch(url);
 *       if (!response.ok) throw new Error('Failed to generate PDF');
 *       
 *       const blob = await response.blob();
 *       const blobUrl = window.URL.createObjectURL(blob);
 *       window.open(blobUrl, '_blank');
 *     } catch (error) {
 *       console.error('Error:', error);
 *       toast.error('Failed to generate PDF');
 *     }
 *   };
 *   
 *   return { generatePDF };
 * };
 */

// ============================================
// 7. PDF GENERATION OPTIONS
// ============================================

/**
 * Current PDF settings:
 * 
 * - Format: A4 (210 × 297 mm)
 * - Orientation: Portrait (can be customized)
 * - Background: Enabled (prints background colors and images)
 * - Margins: 20mm on all sides
 * 
 * These can be customized in pdfController.js
 */

// ============================================
// 8. ERROR HANDLING
// ============================================

/**
 * Common errors and solutions:
 * 
 * Error: "Missing required parameters: module and recordId"
 * Solution: Ensure both module and recordId query parameters are provided
 * 
 * Error: "Invalid module: XYZ"
 * Solution: Use valid module: Lead, Quotation, Customer, or Order
 * 
 * Error: "Record not found"
 * Solution: Check recordId exists in database
 * 
 * Error: "No default template found for module"
 * Solution: Create a default template for the module OR specify templateId
 * 
 * Error: "Template module does not match requested module"
 * Solution: Ensure templateId belongs to the specified module
 */

// ============================================
// 9. PERFORMANCE CONSIDERATIONS
// ============================================

/**
 * - PDF generation is synchronous per request (not queued)
 * - Each request launches a new browser instance
 * - Browser closes after PDF generation
 * - For high volume: Consider implementing job queue (Bull, BullMQ)
 * - Template caching can improve performance
 * - Handlebars templates are compiled on every request (cacheable)
 */

// ============================================
// 10. SECURITY CONSIDERATIONS
// ============================================

/**
 * - Validate all query parameters on backend
 * - Use MongoDB ObjectId validation
 * - Ensure user has permission to access the record
 * - Escape HTML in template content (Handlebars does this)
 * - Limit PDF generation rate to prevent DoS
 * - Consider adding auth middleware to PDF routes
 */

export default {
  // Implementation complete - See pdfController.js for source
};
