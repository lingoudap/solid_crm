import React from "react";

/**
 * HelpTab Component
 * Displays help and best practices for template creation
 */
const HelpTab = () => (
  <div className="help-tab">
    <h2>❓ Help & Best Practices</h2>
    <div className="help-sections">
      <div className="help-section">
        <h3>📋 Template Creation Tips</h3>
        <ul>
          <li>Start with a descriptive name that reflects the template's purpose</li>
          <li>Group related fields together for better readability</li>
          <li>Use headers for company information and footers for legal disclaimers</li>
          <li>Set a default template for each module for quick printing</li>
        </ul>
      </div>
      <div className="help-section">
        <h3>🎨 Design Best Practices</h3>
        <ul>
          <li>Use consistent font sizes throughout the document</li>
          <li>Leave adequate margins for physical printing</li>
          <li>Test print on actual paper before bulk printing</li>
          <li>Use watermarks for draft or confidential documents</li>
        </ul>
      </div>
      <div className="help-section">
        <h3>🖨️ Printing Recommendations</h3>
        <ul>
          <li>A4 is standard for most business documents</li>
          <li>Use landscape for wide tables or charts</li>
          <li>Always preview before printing to save paper</li>
          <li>Consider duplex (double-sided) printing for lengthy reports</li>
        </ul>
      </div>
    </div>
  </div>
);

export default HelpTab;
