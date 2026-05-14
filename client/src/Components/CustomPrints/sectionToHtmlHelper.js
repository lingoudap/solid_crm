/**
 * Section to HTML Helper
 * Converts visual template sections into HTML with {{placeholder}} syntax
 * Used internally before saving to database
 */

/**
 * Generates HTML from template sections
 * @param {Array} sections - Array of section objects with type and fields
 * @returns {string} HTML string with {{fieldId}} placeholders
 */
export const generateHTMLFromSections = (sections) => {
  if (!sections || sections.length === 0) {
    return "<p>No content</p>";
  }

  let html = '<div class="template-sections">\n';

  sections.forEach((section) => {
    if (section.type === "header") {
      html += generateHeaderSection(section);
    } else if (section.type === "twoColumn") {
      html += generateTwoColumnSection(section);
    } else if (section.type === "table") {
      html += generateTableSection(section);
    } else if (section.type === "footer") {
      html += generateFooterSection(section);
    }
  });

  html += "</div>";
  return html;
};

/**
 * Generate header section HTML
 */
const generateHeaderSection = (section) => {
  const fields = section.fields || [];
  let html = '<div class="section header-section">\n';

  if (fields.length > 0) {
    fields.forEach((fieldId) => {
      html += `  <div class="field"><strong>{{${fieldId}}}}</strong></div>\n`;
    });
  }

  html += "</div>\n";
  return html;
};

/**
 * Generate two-column section HTML
 */
const generateTwoColumnSection = (section) => {
  const fields = section.fields || [];
  const midpoint = Math.ceil(fields.length / 2);
  const leftFields = fields.slice(0, midpoint);
  const rightFields = fields.slice(midpoint);

  let html = '<div class="section two-column-section">\n';
  html += '  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">\n';

  // Left column
  html += '    <div class="column-left">\n';
  leftFields.forEach((fieldId) => {
    html += `      <div class="field"><strong>${fieldId}:</strong> {{${fieldId}}}}</div>\n`;
  });
  html += "    </div>\n";

  // Right column
  html += '    <div class="column-right">\n';
  rightFields.forEach((fieldId) => {
    html += `      <div class="field"><strong>${fieldId}:</strong> {{${fieldId}}}}</div>\n`;
  });
  html += "    </div>\n";

  html += "  </div>\n";
  html += "</div>\n";
  return html;
};

/**
 * Generate table section HTML
 */
const generateTableSection = (section) => {
  const fields = section.fields || [];

  if (fields.length === 0) {
    return '<div class="section table-section"><p>No fields in table</p></div>\n';
  }

  let html = '<div class="section table-section">\n';
  html += '  <table style="width: 100%; border-collapse: collapse;">\n';

  // Table header
  html += "    <thead>\n";
  html += "      <tr>\n";
  html += '        <th style="border: 1px solid #ddd; padding: 8px;">#</th>\n';
  fields.forEach((fieldId) => {
    html += `        <th style="border: 1px solid #ddd; padding: 8px;">${fieldId}</th>\n`;
  });
  html += "      </tr>\n";
  html += "    </thead>\n";

  // Table body (empty - will be populated with actual data)
  html += "    <tbody>\n";
  html += "      <tr>\n";
  html += '        <td style="border: 1px solid #ddd; padding: 8px;">1</td>\n';
  fields.forEach((fieldId) => {
    html += `        <td style="border: 1px solid #ddd; padding: 8px;">{{${fieldId}}}}</td>\n`;
  });
  html += "      </tr>\n";
  html += "    </tbody>\n";

  html += "  </table>\n";
  html += "</div>\n";
  return html;
};

/**
 * Generate footer section HTML
 */
const generateFooterSection = (section) => {
  const fields = section.fields || [];
  let html = '<div class="section footer-section">\n';

  if (fields.length > 0) {
    html += '  <div style="border-top: 1px solid #ddd; padding-top: 15px;">\n';
    fields.forEach((fieldId) => {
      html += `    <div class="field"><strong>${fieldId}:</strong> {{${fieldId}}}}</div>\n`;
    });
    html += "  </div>\n";
  }

  html += "</div>\n";
  return html;
};

/**
 * Converts sections array to complete template object with HTML content
 * @param {Object} template - Template object with sections
 * @returns {Object} Template object with content property (HTML) and sections removed
 */
export const prepareTemplateForSave = (template) => {
  const templateToSave = { ...template };

  // Generate HTML from sections only if sections exist and have fields
  if (templateToSave.sections && templateToSave.sections.length > 0) {
    // Check if any section has fields
    const hasSectionFields = templateToSave.sections.some(
      (section) => section.fields && section.fields.length > 0
    );

    if (hasSectionFields) {
      templateToSave.content = generateHTMLFromSections(templateToSave.sections);
      
      // Extract all field IDs from sections and populate bodyFields
      const bodyFields = [];
      templateToSave.sections.forEach((section) => {
        const sectionFields = section.fields || [];
        sectionFields.forEach((fieldId) => {
          if (!bodyFields.includes(fieldId)) {
            bodyFields.push(fieldId);
          }
        });
      });
      
      templateToSave.bodyFields = bodyFields;
    }
  }

  // Remove sections array before saving (not needed in DB)
  // Optional: keep sections for future editing, but content is the source of truth
  // delete templateToSave.sections;

  return templateToSave;
};

/**
 * Parses HTML content back into sections array
 * Used when loading existing templates for editing
 * @param {string} htmlContent - HTML string with section divs
 * @returns {Array} Array of section objects
 */
export const parseSectionsFromHTML = (htmlContent) => {
  if (!htmlContent) return [];

  const sections = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  // Find all section divs
  const sectionDivs = doc.querySelectorAll(".section");

  sectionDivs.forEach((sectionDiv) => {
    let sectionType = "header";
    let fields = [];

    // Determine section type from class
    if (sectionDiv.classList.contains("header-section")) {
      sectionType = "header";
    } else if (sectionDiv.classList.contains("two-column-section")) {
      sectionType = "twoColumn";
    } else if (sectionDiv.classList.contains("table-section")) {
      sectionType = "table";
    } else if (sectionDiv.classList.contains("footer-section")) {
      sectionType = "footer";
    }

    // Extract field placeholders ({{fieldId}})
    const html = sectionDiv.innerHTML;
    const fieldRegex = /\{\{([^}]+)\}\}/g;
    let match;
    const foundFields = [];

    while ((match = fieldRegex.exec(html)) !== null) {
      const fieldId = match[1].trim();
      if (!foundFields.includes(fieldId)) {
        foundFields.push(fieldId);
      }
    }

    fields = foundFields;

    sections.push({
      id: Date.now() + Math.random(),
      type: sectionType,
      fields: fields,
    });
  });

  return sections;
};
