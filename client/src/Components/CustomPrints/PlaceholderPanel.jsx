import React, { useMemo, useState } from "react";

const CATEGORY_META = {
  text:     { label: "Basic Info",  icon: "🔤", order: 1 },
  textarea: { label: "Basic Info",  icon: "🔤", order: 1 },
  email:    { label: "Contact",     icon: "📞", order: 2 },
  phone:    { label: "Contact",     icon: "📞", order: 2 },
  address:  { label: "Location",    icon: "📍", order: 3 },
  date:     { label: "Dates",       icon: "📅", order: 4 },
  currency: { label: "Financial",   icon: "💰", order: 5 },
  number:   { label: "Numbers",     icon: "🔢", order: 6 },
  status:   { label: "Status",      icon: "🏷️", order: 7 },
  table:    { label: "Tables",      icon: "📦", order: 8 },
};

const fallbackCategory = { label: "Other", icon: "📎", order: 99 };

/**
 * PlaceholderPanel — searchable, category-grouped field picker.
 * Click any pill to append the field to the latest section.
 */
const PlaceholderPanel = ({ fields, hasSections, onAddField }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return fields || [];
    const q = query.trim().toLowerCase();
    return (fields || []).filter(
      (f) => f.label.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)
    );
  }, [fields, query]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const f of filtered) {
      const meta = CATEGORY_META[f.type] || fallbackCategory;
      const key = meta.label;
      if (!map.has(key)) map.set(key, { ...meta, fields: [] });
      map.get(key).fields.push(f);
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [filtered]);

  if (!fields || fields.length === 0) return null;

  return (
    <section className="td-fields-panel">
      <header className="td-fields-panel__head">
        <div className="td-fields-panel__title">
          <span>📚</span> Available Fields
        </div>
        <span className="td-fields-panel__hint">
          {hasSections
            ? "Click a field to add it to the last section"
            : "Add a section first to start adding fields"}
        </span>
      </header>

      <div className="td-fields-search">
        <span className="td-fields-search__icon">🔎</span>
        <input
          type="text"
          className="td-fields-search__input"
          placeholder="Search fields by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="td-fields-panel__body">
        {grouped.length === 0 ? (
          <div className="td-fields-empty">
            <div className="td-fields-empty__icon">🔎</div>
            No fields match “{query}”
          </div>
        ) : (
          grouped.map((cat) => (
            <div key={cat.label} className="td-field-category">
              <h5 className="td-field-category__title">
                <span>{cat.icon}</span>
                {cat.label}
                <span className="td-field-category__count">{cat.fields.length}</span>
              </h5>
              <div className="td-field-category__pills">
                {cat.fields.map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    className="td-field-pill"
                    title={hasSections ? `Add ${field.label}` : "Add a section first"}
                    disabled={!hasSections}
                    onClick={() => hasSections && onAddField(field.id)}
                  >
                    <span className="td-field-pill__icon">{field.icon}</span>
                    {field.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default React.memo(PlaceholderPanel);
