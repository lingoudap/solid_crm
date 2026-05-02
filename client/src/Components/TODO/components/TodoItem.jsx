import React, { memo } from "react";
import {
  FaCalendar,
  FaCheck,
  FaEdit,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";
import {
  getCategoryColor,
  getPriorityColor,
  isOverdue,
} from "../utils/todoUtils";

/**
 * Single todo card. Pure presentational — receives draggable plumbing as
 * props so the same component works inside or outside a DragDropContext.
 *
 * Wrapped in React.memo so re-renders driven by other parts of the list
 * (e.g. typing in search) don't re-paint every row. Relies on stable
 * handlers from useTodos + setters from useTodoView.
 *
 * Props:
 *   todo
 *   draggableProps, dragHandleProps, innerRef    // from @hello-pangea/dnd
 *   isDragging?: boolean
 *   showEdit?: boolean                            // hide pencil on read-only views
 *   onToggle(id), onEdit(todo), onDelete(id)
 */
function TodoItem({
  todo,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging = false,
  showEdit = true,
  onToggle,
  onEdit,
  onDelete,
}) {
  const overdue = isOverdue(todo);
  const className = [
    "todo-item",
    todo.completed ? "completed" : "",
    isDragging ? "dragging" : "",
    overdue ? "overdue" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className={className}
    >
      <div className="todo-content">
        <div className="todo-main">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle?.(todo.id)}
            className="complete-checkbox"
          />

          <div className="todo-text">
            <span>{todo.text}</span>
            <div className="todo-meta">
              {todo.category && (
                <span
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(todo.category) }}
                >
                  {todo.category}
                </span>
              )}
              {todo.priority && (
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(todo.priority) }}
                >
                  {todo.priority}
                </span>
              )}
              {todo.dueDate && (
                <span className="due-date">
                  <FaCalendar />{" "}
                  {new Date(todo.dueDate).toLocaleDateString()}
                </span>
              )}
              {overdue && (
                <span className="overdue-badge">
                  <FaExclamationTriangle /> Overdue
                </span>
              )}
              {todo.completed && todo.completedAt && (
                <span className="completed-badge">
                  <FaCheck /> Completed on{" "}
                  {new Date(todo.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="todo-actions">
          {showEdit && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(todo)}
              className="edit-button"
              title="Edit todo"
            >
              <FaEdit />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete?.(todo.id)}
            className="delete-button"
            title="Delete todo"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(TodoItem);
