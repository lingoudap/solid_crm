// Pure helpers for filtering, sorting, and metadata. No React, no state.

export const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const CATEGORY_OPTIONS = [
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
  { value: "shopping", label: "Shopping" },
  { value: "health", label: "Health" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };
const FAR_FUTURE = new Date("9999-12-31").getTime();

export function isOverdue(todo) {
  if (!todo?.dueDate || todo.completed) return false;
  return new Date(todo.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
}

export function getPriorityColor(priority) {
  switch (priority) {
    case "high":
      return "#ff4444";
    case "medium":
      return "#ffbb33";
    case "low":
      return "#00C851";
    default:
      return "#33b5e5";
  }
}

export function getCategoryColor(category) {
  switch (category) {
    case "work":
      return "#4285F4";
    case "personal":
      return "#9C27B0";
    case "shopping":
      return "#FF9800";
    case "health":
      return "#4CAF50";
    default:
      return "#795548";
  }
}

/**
 * filters: {
 *   search?: string,
 *   status?: "all" | "active" | "completed",
 *   priority?: "all" | "high" | "medium" | "low",
 *   category?: "all" | "<category>",
 *   showCompleted?: boolean,   // legacy toggle from AddTodo page
 * }
 */
export function filterTodos(todos, filters = {}) {
  const {
    search = "",
    status = "all",
    priority = "all",
    category = "all",
    showCompleted = true,
  } = filters;

  const needle = search.trim().toLowerCase();

  return todos.filter((todo) => {
    if (status === "completed" && !todo.completed) return false;
    if (status === "active" && todo.completed) return false;
    if (!showCompleted && todo.completed) return false;
    if (priority !== "all" && todo.priority !== priority) return false;
    if (category !== "all" && todo.category !== category) return false;

    if (needle) {
      const text = (todo.text || "").toLowerCase();
      const cat = (todo.category || "").toLowerCase();
      if (!text.includes(needle) && !cat.includes(needle)) return false;
    }

    return true;
  });
}

export function sortTodos(todos, sortBy = "created", sortOrder = "desc") {
  const dir = sortOrder === "desc" ? -1 : 1;

  const decorated = todos.map((t) => {
    let key;
    switch (sortBy) {
      case "priority":
        key = PRIORITY_ORDER[t.priority] || 0;
        break;
      case "category":
        key = (t.category || "").toLowerCase();
        break;
      case "dueDate":
        key = t.dueDate ? new Date(t.dueDate).getTime() : FAR_FUTURE;
        break;
      case "created":
      default:
        key = new Date(t.createdAt || 0).getTime();
    }
    return [t, key];
  });

  decorated.sort(([, a], [, b]) => {
    if (typeof a === "string" || typeof b === "string") {
      return String(a).localeCompare(String(b)) * dir;
    }
    if (a < b) return -1 * dir;
    if (a > b) return 1 * dir;
    return 0;
  });

  return decorated.map(([t]) => t);
}

export function computeStats(todos) {
  let completed = 0;
  let overdue = 0;
  for (const t of todos) {
    if (t.completed) completed++;
    if (isOverdue(t)) overdue++;
  }
  return {
    total: todos.length,
    completed,
    pending: todos.length - completed,
    overdue,
  };
}

export function reorderList(list, fromIndex, toIndex) {
  const next = Array.from(list);
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
