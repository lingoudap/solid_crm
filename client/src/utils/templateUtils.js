/**
 * Template Utility Functions
 * Helper functions for template generation, printing, and sample data
 */

/**
 * Generate print-ready HTML for a template with sample data
 * @param {Object} template - Template object with content and styling options
 * @param {Object} data - Sample data to populate placeholders
 * @param {Array} fieldOptions - Available fields for the template module
 * @returns {string} Complete HTML document string ready for printing
 */
export const generatePrintHTML = (template, data, fieldOptions = []) => {
  const fields = fieldOptions || [];
  const bodyFields = template.bodyFields || [];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${template.name}</title>
      <style>
        @page {
          size: ${template.paperSize || "A4"} ${
    template.orientation || "portrait"
  };
          margin: ${(template.margins?.top || 30)}mm ${
    (template.margins?.right || 25)}mm ${(template.margins?.bottom || 30)}mm ${
    (template.margins?.left || 25)
  }mm;
        }
        body {
          font-family: ${template.fontFamily || "Arial"};
          font-size: ${template.fontSize || "12px"};
          line-height: ${template.lineSpacing || "1.4"};
          margin: 0;
          padding: 0;
        }
        .print-container {
          position: relative;
          min-height: 100vh;
        }
        ${
          template.watermark
            ? `
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          color: rgba(0,0,0,${template.watermarkOpacity || 0.1});
          z-index: -1;
          white-space: nowrap;
        }
        `
            : ""
        }
        .header { margin-bottom: 20px; }
        .footer { margin-top: 30px; }
        .field { margin-bottom: 10px; }
        .field-label { font-weight: bold; }
        .field-value { margin-left: 10px; }
        .signature { margin-top: 50px; }
        .page-number { position: absolute; bottom: 10px; right: 10px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .totals { text-align: right; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="print-container">
        ${template.watermark ? `<div class="watermark">${template.watermark}</div>` : ""}
        
        ${
          template.headerContent
            ? `
        <div class="header">
          ${template.headerContent}
        </div>
        `
            : ""
        }
        
        ${bodyFields
          .map((fieldId) => {
            const field = fields.find((f) => f.id === fieldId);
            const value = data[fieldId] || "N/A";
            return `
          <div class="field">
            <span class="field-label">${field?.label || fieldId}:</span>
            <span class="field-value">${value}</span>
          </div>
          `;
          })
          .join("")}
        
        ${
          template.footerContent
            ? `
        <div class="footer">
          ${template.footerContent}
        </div>
        `
            : ""
        }
        
        ${
          template.showSignature
            ? `
        <div class="signature">
          <hr>
          <p>Signature: _______________________</p>
        </div>
        `
            : ""
        }
        
        ${
          template.showDate !== false
            ? `
        <div class="date">
          Date: ${new Date().toLocaleDateString()}
        </div>
        `
            : ""
        }
        
        ${
          template.showPageNumber !== false
            ? `
        <div class="page-number">
          Page 1
        </div>
        `
            : ""
        }
      </div>
    </body>
    </html>
  `;
};

/**
 * Get sample data for template preview and testing
 * Contains realistic mock data for each module type
 * @param {string} module - Module name (Lead, Quotation, Customer, Order)
 * @returns {Object} Sample data object for the specified module
 */
export const getSampleData = (module) => {
  const sampleData = {
    Lead: {
      leadId: "LD-2023-001",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 (555) 123-4567",
      company: "TechCorp Inc.",
      jobTitle: "CTO",
      address: "123 Tech Street, Suite 400",
      city: "San Francisco",
      state: "California",
      zipCode: "94107",
      source: "Website Inquiry",
      status: "Qualified",
      createdDate: "2023-10-15",
      lastContact: "2023-10-20",
      notes: "Interested in enterprise solution. Follow up next week.",
    },
    Quotation: {
      quoteId: "QT-2023-045",
      customerName: "Sarah Johnson",
      company: "Global Enterprises",
      email: "sarah.j@globalent.com",
      phone: "+1 (555) 987-6543",
      address: "456 Business Ave, Floor 12\nNew York, NY 10001",
      items: `<table class="items-table"><thead><tr><th>Sr. No.</th><th>Description</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody><tr><td>1</td><td>Premium Package</td><td>1</td><td>$2,500.00</td><td>$2,500.00</td></tr><tr><td>2</td><td>Add-on Services</td><td>3</td><td>$250.00</td><td>$750.00</td></tr></tbody></table>`,
      subtotal: "$3,250.00",
      tax: "$325.00",
      discount: "$250.00",
      totalAmount: "$3,325.00",
      validUntil: "2023-11-30",
      terms: "Net 30. 50% advance required.",
      createdDate: "2023-10-18",
    },
    Customer: {
      customerId: "CUST-1001",
      name: "Michael Chen",
      email: "michael.chen@innovate.com",
      phone: "+1 (555) 456-7890",
      company: "Innovate Solutions",
      address: "789 Innovation Drive\nBoston, MA 02108",
      city: "Boston",
      state: "Massachusetts",
      zipCode: "02108",
      customerType: "Premium",
      joinDate: "2022-03-15",
      totalOrders: "24",
      totalSpent: "$45,820.00",
      lastOrder: "2023-10-10",
    },
    Order: {
      orderId: "ORD-2023-567",
      customerName: "Emma Davis",
      email: "emma.davis@quickmail.com",
      phone: "+1 (555) 234-5678",
      shippingAddress: "321 Delivery Lane\nChicago, IL 60601",
      billingAddress: "Same as shipping address",
      items: `<table class="items-table"><thead><tr><th>Sr. No.</th><th>Description</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody><tr><td>1</td><td>Product A</td><td>2</td><td>$199.99</td><td>$399.98</td></tr><tr><td>2</td><td>Product B</td><td>1</td><td>$89.99</td><td>$89.99</td></tr></tbody></table>`,
      subtotal: "$489.97",
      shippingCost: "$24.99",
      tax: "$41.25",
      totalAmount: "$556.21",
      paymentMethod: "Credit Card (Visa)",
      orderStatus: "Processing",
      orderDate: "2023-10-19",
      estimatedDelivery: "2023-10-26",
    },
  };

  return sampleData[module] || {};
};

export default {
  generatePrintHTML,
  getSampleData,
};
