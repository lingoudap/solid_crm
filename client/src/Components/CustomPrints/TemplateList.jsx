import React from "react";

/**
 * TemplateList Component
 * Displays and manages a list of templates for a selected module
 * Handles template actions: edit, delete, set default, preview, print
 * Memoized to prevent unnecessary re-renders
 */
const TemplateList = ({
  templates,
  selectedModule,
  setSelectedModule,
  onEdit,
  onDelete,
  onSetDefault,
  onPreview,
  onPrint,
  onCreateNew,
  onCreateProTemplate,
  loading,
  error,
  fetchTemplates,
  modules,
}) => {
  return (
    <div className="manage-templates">
      {/* Header */}
      <div className="manage-header">
        <h2>📋 Manage Print Templates</h2>
        <p className="subtitle">Create, edit, and manage print templates for different modules</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-alert">
          <span>⏳ Loading templates...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-alert">
          <span>❌ {error}</span>
          <button
            onClick={() => fetchTemplates(selectedModule)}
            className="error-alert-btn"
          >
            Retry
          </button>
        </div>
      )}

      {/* Module Selector */}
      <div className="module-selector">
        {modules.map((mod) => (
          <button
            key={mod}
            className={`module-btn ${selectedModule === mod ? "active" : ""}`}
            onClick={() => setSelectedModule(mod)}
          >
            {mod} ({Object.keys(templates[mod] || {}).length})
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Templates</h3>
          <p>{Object.values(templates).reduce((acc, mod) => acc + Object.keys(mod).length, 0)}</p>
        </div>
        <div className="stat-card">
          <h3>Default Templates</h3>
          <p>
            {Object.values(templates).filter((mod) =>
              Object.values(mod).some((t) => t.isDefault)
            ).length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Last Created</h3>
          <p>
            {(() => {
              const allTemplates = Object.values(templates).flatMap((mod) => Object.values(mod));
              const sorted = allTemplates.sort(
                (a, b) =>
                  new Date(b.lastModified || b.updatedAt || 0) -
                  new Date(a.lastModified || a.updatedAt || 0)
              );
              return sorted[0]
                ? new Date(sorted[0].updatedAt || sorted[0].lastModified).toLocaleDateString()
                : "N/A";
            })()}
          </p>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="quick-templates">
        <h3>🚀 Quick Templates</h3>
        <p className="quick-templates-description">
          Start with a professional template and customize it
        </p>
        {selectedModule === "Quotation" && (
          <div className="quick-templates-buttons">
            <button
              className="quick-template-btn"
              onClick={onCreateProTemplate}
            >
              ⭐ Create Professional Quotation
            </button>
          </div>
        )}
      </div>

      {/* Templates List */}
      <div className="templates-grid">
        {Object.entries(templates[selectedModule] || {}).length === 0 ? (
          <div className="no-templates">
            <p>No templates for {selectedModule} yet.</p>
            <p>Create one by clicking "New Template"</p>
            <button
              className="btn-save"
              onClick={onCreateNew}
            >
              ➕ Create First Template
            </button>
          </div>
        ) : (
          Object.entries(templates[selectedModule] || {}).map(([id, template]) => (
            <div key={id} className="template-card">
              <div className="template-card-header">
                <div>
                  <h3>{template.name}</h3>
                  {template.isDefault && (
                    <span className="default-badge">
                      Default
                    </span>
                  )}
                </div>
                <span className="template-module-badge">{template.module}</span>
              </div>
              <div className="template-card-body">
                <p>
                  <strong>Fields:</strong> {(template.bodyFields || []).length}
                </p>
                <p>
                  <strong>Paper:</strong> {template.paperSize || "A4"} (
                  {template.orientation || "portrait"})
                </p>
                <p>
                  <strong>Last Modified:</strong>{" "}
                  {new Date(
                    template.updatedAt || template.lastModified
                  ).toLocaleDateString()}
                </p>
              </div>
              <div className="template-card-actions">
                <button
                  className="btn-preview"
                  onClick={() => onPreview(template)}
                  title="Preview template"
                >
                  👁️ Preview
                </button>
                <button
                  className="btn-edit"
                  onClick={() => onEdit(selectedModule, id)}
                  title="Edit template"
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-print"
                  onClick={() => onPrint(template)}
                  title="Print template"
                >
                  🖨️ Print
                </button>
                {!template.isDefault && (
                  <button
                    className="btn-set-default"
                    onClick={() => onSetDefault(selectedModule, id)}
                    title="Set as default template"
                  >
                    ⭐ Set Default
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={() => onDelete(selectedModule, id)}
                  title="Delete template"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(TemplateList);
