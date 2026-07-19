// TemplateEditor.jsx
import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import PlaceholderPanel from "./PlaceholderPanel";
import SectionBuilder from "./SectionBuilder";
import { prepareTemplateForSave, parseSectionsFromHTML } from "./sectionToHtmlHelper";
import { getSampleData } from "../../utils/templateUtils";
import "./TemplateEditor.css";
import "./TemplateDesigner.css";

const SECTION_TYPES = [
  { value: "header",    icon: "📌", label: "Header",     description: "Title block with key fields" },
  { value: "twoColumn", icon: "📊", label: "Two Column", description: "Side-by-side label/value list" },
  { value: "table",     icon: "📋", label: "Table",      description: "Rows of itemized data" },
  { value: "footer",    icon: "📍", label: "Footer",     description: "Closing notes and totals" },
];

/**
 * TemplateEditor — modern 3-pane print template designer.
 * Left: configuration panels. Center: visual section builder. Right: live A4 paper preview.
 */
const TemplateEditor = ({
  template,
  setTemplate,
  onSave,
  onCancel,
  onPreview,
  fieldOptions,
  modules,
  isEditing,
  paperSizes,
  fontFamilies,
}) => {
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [sectionsInitialized, setSectionsInitialized] = useState(false);
  const [collapsedPanels, setCollapsedPanels] = useState({});

  useEffect(() => {
    if (isEditing && template.content && !template.sections && !sectionsInitialized) {
      const parsedSections = parseSectionsFromHTML(template.content);
      if (parsedSections.length > 0) {
        setTemplate((prev) => ({ ...prev, sections: parsedSections }));
      }
      setSectionsInitialized(true);
    }
  }, [isEditing, template.content, template.sections, sectionsInitialized, setTemplate]);

  const updateTemplate = useCallback(
    (key, value) => setTemplate((prev) => ({ ...prev, [key]: value })),
    [setTemplate]
  );

  const sections = template.sections || [];
  const currentFields = fieldOptions[template.module] || [];

  const togglePanel = (key) =>
    setCollapsedPanels((prev) => ({ ...prev, [key]: !prev[key] }));

  const addSection = useCallback(
    (sectionType) => {
      const newSection = { id: Date.now(), type: sectionType, fields: [] };
      setTemplate((prev) => ({ ...prev, sections: [...(prev.sections || []), newSection] }));
      setShowSectionSelector(false);
    },
    [setTemplate]
  );

  const addFieldToLastSection = useCallback(
    (fieldId) => {
      setTemplate((prev) => {
        const list = prev.sections || [];
        if (list.length === 0) return prev;
        const lastId = list[list.length - 1].id;
        return {
          ...prev,
          sections: list.map((s) =>
            s.id === lastId ? { ...s, fields: [...(s.fields || []), fieldId] } : s
          ),
        };
      });
    },
    [setTemplate]
  );

  const handleSaveTemplate = useCallback(() => {
    const templateForSave = prepareTemplateForSave(template);
    onSave(templateForSave);
  }, [template, onSave]);

  return (
    <div className="td-designer">
      {/* ============ TOP TOOLBAR ============ */}
      <div className="td-toolbar">
        <div className="td-toolbar__title">
          <h2>
            {isEditing ? "✏️ Edit Print Template" : "✨ Create Print Template"}
          </h2>
          <p>
            {isEditing
              ? "Modify your template settings and layout"
              : "Design a professional printable document with drag-and-drop sections"}
          </p>
        </div>
        <div className="td-toolbar__actions">
          <button type="button" className="td-btn td-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="td-btn td-btn--secondary" onClick={() => onPreview(template)}>
            👁️ Preview
          </button>
          <button type="button" className="td-btn td-btn--primary" onClick={handleSaveTemplate}>
            {isEditing ? "💾 Update" : "✅ Save Template"}
          </button>
        </div>
      </div>

      {/* ============ 3-PANE SHELL ============ */}
      <div className="td-shell">
        {/* ---------- LEFT SIDEBAR ---------- */}
        <aside className="td-pane td-pane--sidebar">
          {template.module === "Quotation" && (
            <div className="td-banner">
              <div className="td-banner__icon">💡</div>
              <div className="td-banner__body">
                <p className="td-banner__title">Pro tip for quotations</p>
                <p className="td-banner__text">
                  Include the <strong>Items List</strong> field to auto-render a
                  professional table with Sr. No., Description, Qty, Price, and
                  Subtotal.
                </p>
              </div>
            </div>
          )}

          <SidebarPanel
            id="details"
            icon="📝"
            title="Template Details"
            collapsed={collapsedPanels.details}
            onToggle={togglePanel}
          >
            <div className="td-field">
              <label className="td-field__label">
                Template Name <span className="td-required">*</span>
              </label>
              <input
                type="text"
                className="td-input"
                value={template.name}
                onChange={(e) => updateTemplate("name", e.target.value)}
                placeholder="e.g., Professional Lead Report"
                required
              />
            </div>

            {!isEditing && (
              <div className="td-field">
                <label className="td-field__label">
                  Module <span className="td-required">*</span>
                </label>
                <select
                  className="td-select"
                  value={template.module}
                  onChange={(e) => updateTemplate("module", e.target.value)}
                >
                  {modules.map((mod) => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
              </div>
            )}

            <label className="td-toggle">
              <div className="td-toggle__text">
                <span className="td-toggle__label">Default template</span>
                <span className="td-toggle__hint">Use this template by default for this module</span>
              </div>
              <input
                type="checkbox"
                className="td-toggle__input"
                checked={template.isDefault || false}
                onChange={(e) => updateTemplate("isDefault", e.target.checked)}
              />
              <span className="td-toggle__track" />
            </label>
          </SidebarPanel>

          <SidebarPanel
            id="layout"
            icon="📐"
            title="Layout Settings"
            collapsed={collapsedPanels.layout}
            onToggle={togglePanel}
          >
            <div className="td-field">
              <label className="td-field__label">Paper Size</label>
              <select
                className="td-select"
                value={template.paperSize || "A4"}
                onChange={(e) => updateTemplate("paperSize", e.target.value)}
              >
                {paperSizes.map((size) => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>

            <div className="td-field">
              <label className="td-field__label">Orientation</label>
              <div className="td-segmented" role="tablist" aria-label="Orientation">
                <button
                  type="button"
                  className={`td-segmented__btn ${(template.orientation || "portrait") === "portrait" ? "td-segmented__btn--active" : ""}`}
                  onClick={() => updateTemplate("orientation", "portrait")}
                >
                  📄 Portrait
                </button>
                <button
                  type="button"
                  className={`td-segmented__btn ${template.orientation === "landscape" ? "td-segmented__btn--active" : ""}`}
                  onClick={() => updateTemplate("orientation", "landscape")}
                >
                  📰 Landscape
                </button>
              </div>
            </div>

            <div className="td-field">
              <label className="td-field__label">Font Family</label>
              <select
                className="td-select"
                value={template.fontFamily || "Arial"}
                onChange={(e) => updateTemplate("fontFamily", e.target.value)}
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>

            <div className="td-field">
              <label className="td-field__label">Font Size</label>
              <select
                className="td-select"
                value={template.fontSize || "12px"}
                onChange={(e) => updateTemplate("fontSize", e.target.value)}
              >
                <option value="10px">10px — Small</option>
                <option value="12px">12px — Normal</option>
                <option value="14px">14px — Large</option>
                <option value="16px">16px — Extra Large</option>
              </select>
            </div>
          </SidebarPanel>

          <SidebarPanel
            id="watermark"
            icon="💧"
            title="Watermark"
            collapsed={collapsedPanels.watermark}
            onToggle={togglePanel}
          >
            <div className="td-field">
              <label className="td-field__label">Watermark Text</label>
              <input
                type="text"
                className="td-input"
                value={template.watermark || ""}
                onChange={(e) => updateTemplate("watermark", e.target.value)}
                placeholder="CONFIDENTIAL, DRAFT, SAMPLE"
              />
            </div>
            <div className="td-field">
              <label className="td-field__label">Opacity</label>
              <div className="td-range">
                <input
                  type="range"
                  className="td-range__input"
                  min="0"
                  max="1"
                  step="0.05"
                  value={template.watermarkOpacity ?? 0.1}
                  onChange={(e) => updateTemplate("watermarkOpacity", parseFloat(e.target.value))}
                />
                <span className="td-range__value">
                  {Math.round((template.watermarkOpacity ?? 0.1) * 100)}%
                </span>
              </div>
            </div>
          </SidebarPanel>
        </aside>

        {/* ---------- CENTER WORKSPACE ---------- */}
        <main className="td-pane td-pane--workspace">
          <div className="td-workspace__head">
            <div className="td-workspace__title">
              <h3>🏗️ Document Builder</h3>
              <span className="td-workspace__count">
                {sections.length} {sections.length === 1 ? "section" : "sections"}
              </span>
            </div>
            <span className="td-workspace__hint">Drag to reorder · Click to expand</span>
          </div>

          <button
            type="button"
            className="td-add-cta"
            onClick={() => setShowSectionSelector(true)}
          >
            <span className="td-add-cta__plus">+</span>
            Add new section
          </button>

          {sections.length === 0 ? (
            <div className="td-empty-builder">
              <div className="td-empty-builder__icon">📐</div>
              <h4 className="td-empty-builder__title">Start building your template</h4>
              <p className="td-empty-builder__sub">
                Add a header, table, two-column layout, or footer section. Each
                section is fully customizable with the fields you need.
              </p>
            </div>
          ) : (
            <SectionBuilder
              sections={sections}
              setSections={(newSections) =>
                setTemplate((prev) => ({ ...prev, sections: newSections }))
              }
              fieldOptions={currentFields}
            />
          )}

          <PlaceholderPanel
            fields={currentFields}
            hasSections={sections.length > 0}
            onAddField={addFieldToLastSection}
          />
        </main>

        {/* ---------- RIGHT PREVIEW PANE ---------- */}
        <aside className="td-pane td-pane--preview">
          <div className="td-preview-head">
            <div className="td-preview-head__title">
              <span className="td-preview-head__icon">📄</span>
              Live Preview
            </div>
            <div className="td-preview-head__meta">
              <span className="td-preview-head__chip">
                {(template.paperSize || "A4")}
              </span>
              <span className="td-preview-head__chip">
                {(template.orientation || "portrait").toUpperCase()}
              </span>
            </div>
          </div>

          <PaperPreview
            template={template}
            sections={sections}
            fieldOptions={currentFields}
          />
        </aside>
      </div>

      {/* ============ SECTION TYPE PICKER MODAL ============ */}
      {showSectionSelector && (
        <div className="td-modal" role="dialog" aria-modal="true" onClick={() => setShowSectionSelector(false)}>
          <div className="td-modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="td-modal__head">
              <h4 className="td-modal__title">Choose a section type</h4>
              <button
                type="button"
                className="td-icon-btn"
                onClick={() => setShowSectionSelector(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="td-modal__body">
              <div className="td-section-types">
                {SECTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className="td-section-type"
                    onClick={() => addSection(t.value)}
                  >
                    <span className="td-section-type__icon">{t.icon}</span>
                    <span className="td-section-type__label">{t.label}</span>
                    <span className="td-section-type__desc">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="td-modal__foot">
              <button
                type="button"
                className="td-btn td-btn--ghost"
                onClick={() => setShowSectionSelector(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarPanel = ({ id, icon, title, collapsed, onToggle, children }) => (
  <section className={`td-panel ${collapsed ? "td-panel--collapsed" : ""}`}>
    <div className="td-panel__head" onClick={() => onToggle(id)}>
      <div className="td-panel__title">
        <span className="td-panel__icon">{icon}</span>
        {title}
      </div>
      <span className="td-panel__chevron">▼</span>
    </div>
    <div className="td-panel__body">{children}</div>
  </section>
);

const PaperPreview = ({ template, sections, fieldOptions }) => {
  const wrapRef = useRef(null);
  const paperRef = useRef(null);
  const [scale, setScale] = useState(1);

  const sampleData = getSampleData(template.module);
  const getSampleValue = (fieldId) =>
    sampleData[fieldId] !== undefined ? sampleData[fieldId] : `[${fieldId}]`;
  const getFieldLabel = (fieldId) => {
    const f = fieldOptions.find((x) => x.id === fieldId);
    return f?.label || fieldId;
  };

  useLayoutEffect(() => {
    const recompute = () => {
      const wrap = wrapRef.current;
      const paper = paperRef.current;
      if (!wrap || !paper) return;
      const wrapWidth = wrap.clientWidth - 24;
      const paperWidth = paper.offsetWidth;
      if (!paperWidth) return;
      const next = Math.min(1, wrapWidth / paperWidth);
      setScale(next > 0 ? next : 1);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [template.orientation, template.paperSize]);

  const isLandscape = template.orientation === "landscape";

  return (
    <div
      ref={wrapRef}
      className="td-paper-wrap"
      data-scale="auto"
      style={{ "--td-paper-scale": scale }}
    >
      <div
        ref={paperRef}
        className={`td-paper ${isLandscape ? "td-paper--landscape" : ""}`}
        style={{
          fontFamily: template.fontFamily ? `${template.fontFamily}, sans-serif` : undefined,
          fontSize: template.fontSize || undefined,
        }}
      >
        {template.watermark && (
          <div
            className="td-paper__watermark"
            style={{ opacity: template.watermarkOpacity ?? 0.1 }}
          >
            {template.watermark}
          </div>
        )}

        {sections.length === 0 ? (
          <div className="td-doc-empty">
            <div className="td-doc-empty__icon">📄</div>
            <div className="td-doc-empty__title">Your document preview will appear here</div>
            <div className="td-doc-empty__sub">
              Add sections from the builder to see how your document will look when printed.
            </div>
          </div>
        ) : (
          sections.map((section) => {
            const fields = section.fields || [];

            if (section.type === "header") {
              return (
                <div key={section.id} className="td-doc-section td-doc-header">
                  <h1>{template.name || "Document Title"}</h1>
                  {fields.length > 0 && (
                    <div className="td-doc-header__fields">
                      {fields.map((fid) => (
                        <div key={fid} className="td-doc-field">
                          <span className="td-doc-field__label">{getFieldLabel(fid)}:</span>
                          <span className="td-doc-field__value">{getSampleValue(fid)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (section.type === "twoColumn") {
              const mid = Math.ceil(fields.length / 2);
              const left = fields.slice(0, mid);
              const right = fields.slice(mid);
              return (
                <div key={section.id} className="td-doc-section">
                  <div className="td-doc-twocol">
                    <div>
                      {left.map((fid) => (
                        <div key={fid} className="td-doc-field">
                          <span className="td-doc-field__label">{getFieldLabel(fid)}</span>
                          <span className="td-doc-field__value">{getSampleValue(fid)}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      {right.map((fid) => (
                        <div key={fid} className="td-doc-field">
                          <span className="td-doc-field__label">{getFieldLabel(fid)}</span>
                          <span className="td-doc-field__value">{getSampleValue(fid)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            if (section.type === "table") {
              return (
                <div key={section.id} className="td-doc-section">
                  {fields.length > 0 ? (
                    <table className="td-doc-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>#</th>
                          {fields.map((fid) => (
                            <th key={fid}>{getFieldLabel(fid)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map((row) => (
                          <tr key={row}>
                            <td>{row}</td>
                            {fields.map((fid) => (
                              <td key={fid}>{getSampleValue(fid)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="td-doc-table__empty">Add fields to display table columns</div>
                  )}
                </div>
              );
            }

            if (section.type === "footer") {
              return (
                <div key={section.id} className="td-doc-section td-doc-footer">
                  {fields.length > 0 ? (
                    fields.map((fid) => (
                      <div key={fid} className="td-doc-field">
                        <span className="td-doc-field__label">{getFieldLabel(fid)}:</span>
                        <span className="td-doc-field__value">{getSampleValue(fid)}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
                      Footer placeholder
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })
        )}
      </div>
    </div>
  );
};

export default React.memo(TemplateEditor);
