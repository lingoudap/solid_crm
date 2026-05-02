import React from "react";

/**
 * TemplatePreview Component
 * Displays a live preview of the template with sample data
 * Replaces placeholders with sample data for visualization
 * Memoized to prevent unnecessary re-renders
 */
const TemplatePreview = ({ template, sampleData }) => {
  // Generate preview HTML by replacing placeholders with sample data
  const generatePreviewHTML = () => {
    let previewHTML = template?.content || "";

    if (!sampleData || Object.keys(sampleData).length === 0) {
      return previewHTML;
    }

    // First pass: replace all placeholders with sample data
    Object.keys(sampleData).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      previewHTML = previewHTML.replace(regex, sampleData[key]);
    });

    // Handle pipe filters (simple removal for preview - actual filtering happens on server)
    previewHTML = previewHTML.replace(/\{\{(.*?)\s*\|\s*\w+\}\}/g, "{{$1}}");

    // Second pass: replace any remaining placeholders with sample data (for edge cases)
    Object.keys(sampleData).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      previewHTML = previewHTML.replace(regex, sampleData[key]);
    });

    return previewHTML;
  };

  const previewHTML = generatePreviewHTML();

  return (
    <div className="template-preview">
      <div className="template-preview-header">
        📄 Template Preview - {template?.name || "Untitled"}
      </div>
      <div
        className="template-preview-content"
        dangerouslySetInnerHTML={{ __html: previewHTML }}
      />
    </div>
  );
};

export default React.memo(TemplatePreview);
