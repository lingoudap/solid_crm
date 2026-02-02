/**
 * Print Utility - Generates PDFs from custom templates
 * Requires: jspdf and html2canvas libraries
 */

// Install with: npm install jspdf html2canvas

export const generatePDFFromTemplate = async (template, data, companyName = "Your Company") => {
  try {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;

    if (!jsPDF || !html2canvas) {
      console.error("Required libraries not loaded: jsPDF or html2canvas");
      alert("Print libraries not loaded. Please refresh the page.");
      return;
    }

    const pageWidth = template.paperSize === "A3" ? 297 : template.paperSize === "Letter" ? 215.9 : 210; // mm
    const pageHeight = template.paperSize === "A3" ? 420 : template.paperSize === "Letter" ? 279.4 : 297; // mm
    const orientation = template.orientation || "portrait";

    const pdf = new jsPDF({
      orientation: orientation === "landscape" ? "l" : "p",
      unit: "mm",
      format: template.paperSize || "a4",
    });

    const margins = template.margins || { top: 20, right: 20, bottom: 20, left: 20 };
    const pageWidthInner = pageWidth - margins.left - margins.right;

    // Start Y position
    let yPos = margins.top;

    // 1. Add Logo (if enabled)
    if (template.showLogo) {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.logo) {
            const logoWidth = 30;
            const logoHeight = 30;
            pdf.addImage(settings.logo, "PNG", margins.left, yPos, logoWidth, logoHeight);
            yPos += logoHeight + 5;
          }
        } catch (e) {
          console.warn("Failed to add logo:", e);
        }
      }
    }

    // 2. Add Header Content
    if (template.headerContent) {
      const headerLines = template.headerContent.split("\n");
      headerLines.forEach((line) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        const wrapped = pdf.splitTextToSize(line, pageWidthInner);
        wrapped.forEach((wrappedLine) => {
          pdf.text(wrappedLine, margins.left, yPos);
          yPos += 5;
        });
      });
      yPos += 10;
    }

    // 3. Add Company/Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(companyName, margins.left, yPos);
    yPos += 12;

    // 4. Add Body Fields
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const fieldOptions = {
      Lead: ["name", "email", "phone", "address", "state", "Source"],
      Quotation: ["customerName", "email", "phone", "items", "totalAmount", "date"],
      Customer: ["name", "email", "phone", "address", "state"],
      Order: ["customerName", "email", "phone", "items", "totalAmount", "date"],
    };

    const allFields = fieldOptions[template.module] || [];

    template.bodyFields.forEach((fieldId) => {
      let label = fieldId;
      let value = data[fieldId] || "-";

      // Format field label
      label =
        label.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() +
        label.replace(/([A-Z])/g, " $1").slice(1).toLowerCase();

      // Handle special fields
      if (fieldId === "items" && Array.isArray(value)) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("Items", margins.left, yPos);
        yPos += 8;

        // Create table header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setFillColor(240, 240, 240);
        
        const colWidths = [15, 60, 20, 25, 30];
        const headers = ["SR. No.", "Description", "Qty", "Price", "Subtotal"];
        let xPos = margins.left;
        
        headers.forEach((header, idx) => {
          pdf.rect(xPos, yPos - 4, colWidths[idx], 6, "F");
          pdf.text(header, xPos + 2, yPos, { maxWidth: colWidths[idx] - 4 });
          xPos += colWidths[idx];
        });
        
        yPos += 8;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);

        // Add table rows
        value.forEach((item, idx) => {
          const rowData = [
            (idx + 1).toString(),
            item.itemName || item.name || "Item",
            item.qty || "1",
            `₹${item.price || "0"}`,
            `₹${item.subtotal || "0"}`
          ];
          
          xPos = margins.left;
          rowData.forEach((data, colIdx) => {
            pdf.text(String(data), xPos + 2, yPos, { maxWidth: colWidths[colIdx] - 4 });
            xPos += colWidths[colIdx];
          });
          
          // Draw row borders
          xPos = margins.left;
          for (let i = 0; i < headers.length; i++) {
            pdf.rect(xPos, yPos - 4, colWidths[i], 5);
            xPos += colWidths[i];
          }
          
          yPos += 6;

          // Check if we need a new page
          if (yPos > pageHeight - margins.bottom - 30) {
            pdf.addPage();
            yPos = margins.top;
          }
        });
        
        yPos += 3;
      } else if (fieldId === "totalAmount" || fieldId === "subtotal" || fieldId === "tax" || fieldId === "discount") {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        const formattedValue = typeof value === "number" ? `₹${value.toFixed(2)}` : `₹${value}`;
        pdf.text(`${label}: ${formattedValue}`, margins.left, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
      } else if (fieldId === "quoteId" || fieldId === "orderId" || fieldId === "customerId" || fieldId === "leadId") {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(`${label}: ${value}`, margins.left, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
      } else {
        const wrapped = pdf.splitTextToSize(`${label}: ${value}`, pageWidthInner);
        wrapped.forEach((line) => {
          pdf.text(line, margins.left, yPos);
          yPos += 5;
        });
      }

      yPos += 2;

      // Check if we need a new page
      if (yPos > pageHeight - margins.bottom - 10) {
        pdf.addPage();
        yPos = margins.top;
      }
    });

    yPos += 10;

    // 5. Add Footer Content
    if (template.footerContent || template.showSignature) {
      const footerStartY = pageHeight - margins.bottom - (template.showSignature ? 35 : 20);
      let footerYPos = footerStartY;
      
      if (template.footerContent) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const footerLines = template.footerContent.split("\n");
        footerLines.forEach((line) => {
          const wrapped = pdf.splitTextToSize(line, pageWidthInner);
          wrapped.forEach((wrappedLine) => {
            pdf.text(wrappedLine, margins.left, footerYPos);
            footerYPos += 4;
          });
        });
      }

      // Add signature line if enabled
      if (template.showSignature) {
        footerYPos = pageHeight - margins.bottom - 10;
        pdf.setLineWidth(0.3);
        pdf.line(pageWidth - margins.right - 50, footerYPos, pageWidth - margins.right, footerYPos);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text("Authorized Signatory", pageWidth - margins.right - 35, footerYPos + 4);
      }
    }

    // 6. Add Date and Page Number
    if (template.showDate || template.showPageNumber) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        const bottomY = pageHeight - 10;

        if (template.showDate) {
          pdf.text(
            `Date: ${new Date().toLocaleDateString()}`,
            margins.left,
            bottomY
          );
        }

        if (template.showPageNumber) {
          pdf.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - margins.right - 30,
            bottomY
          );
        }
      }
    }

    // Save PDF
    const filename = `${template.name}-${data.name || data.customerName || "document"}-${new Date().getTime()}.pdf`;
    pdf.save(filename);

    return { success: true, message: "PDF generated successfully!" };
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert(`Failed to generate PDF: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Load required libraries from CDN
export const loadPrintLibraries = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.jspdf && window.html2canvas) {
      resolve();
      return;
    }

    // Load jsPDF
    if (!window.jspdf) {
      const jsPdfScript = document.createElement("script");
      jsPdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      jsPdfScript.async = true;
      document.head.appendChild(jsPdfScript);
    }

    // Load html2canvas
    if (!window.html2canvas) {
      const html2canvasScript = document.createElement("script");
      html2canvasScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      html2canvasScript.async = true;
      document.head.appendChild(html2canvasScript);
    }

    // Wait a bit for scripts to load
    setTimeout(resolve, 2000);
  });
};

// Get template for a module
export const getTemplates = (module) => {
  try {
    const saved = localStorage.getItem("customPrintTemplates");
    if (saved) {
      const templates = JSON.parse(saved);
      return templates[module] || {};
    }
    return {};
  } catch (error) {
    console.error("Error getting templates:", error);
    return {};
  }
};

// Get single template by ID
export const getTemplateById = (module, templateId) => {
  const templates = getTemplates(module);
  return templates[templateId] || null;
};
