import React, { useEffect, useState } from "react";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "../utils/todoUtils";

const EMPTY = {
  text: "",
  category: "personal",
  priority: "medium",
  dueDate: "",
};

/**
 * Reusable Add/Edit form. Self-contained state — parent only owns the
 * onSubmit handler and (for edit mode) the initial values.
 *
 * Props:
 *   mode: "add" | "edit"
 *   initialValues?: { text, category, priority, dueDate }
 *   onSubmit(values)
 *   onCancel?()      // edit mode only
 */
export default function TodoForm({
  mode = "add",
  initialValues = EMPTY,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });

  // Reset state when initialValues change (e.g. switching which todo is being edited).
  useEffect(() => {
    setValues({ ...EMPTY, ...initialValues });
  }, [initialValues]);

  const handleChange = (key) => (e) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.text.trim()) return;
    onSubmit(values);
    if (mode === "add") setValues(EMPTY);
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={values.text}
        onChange={handleChange("text")}
        placeholder={mode === "edit" ? "Edit your todo..." : "What needs to be done?"}
        className="todo-input"
        autoFocus={mode === "edit"}
      />

      <div className="form-controls">
        <select value={values.category} onChange={handleChange("category")}>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select value={values.priority} onChange={handleChange("priority")}>
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={values.dueDate || ""}
          onChange={handleChange("dueDate")}
          className="date-input"
        />

        <div className="form-actions">
          {mode === "edit" ? (
            <>
              <button type="submit" className="save-button">
                <FaSave /> Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="cancel-button"
              >
                <FaTimes /> Cancel
              </button>
            </>
          ) : (
            <button type="submit" className="add-button">
              <FaPlus /> Add
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
