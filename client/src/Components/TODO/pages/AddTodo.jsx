import React, { useState } from "react";
import { FaMoon, FaSun, FaTimes, FaUndo } from "react-icons/fa";
import TodoFilters from "../components/TodoFilters";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import TodoStats from "../components/TodoStats";
import { useTodos } from "../hooks/useTodos";
import { useTodoView } from "../hooks/useTodoView";
import "../Todo.css";

export default function AddTodo() {
  const {
    todos,
    deletedTodo,
    isLoading,
    error,
    dismissError,
    addTodo,
    updateTodo,
    deleteTodo,
    undoDelete,
    toggleComplete,
    clearCompleted,
    reorderTodos,
  } = useTodos();

  const {
    filters,
    setFilters,
    sortBy,
    sortOrder,
    setSort,
    visibleTodos,
    stats,
    isFiltered,
  } = useTodoView(todos, {
    initialFilters: { showCompleted: true },
  });

  const [theme, setTheme] = useState("light");
  const [editingTodo, setEditingTodo] = useState(null);

  const handleFormSubmit = (values) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, {
        text: values.text.trim(),
        category: values.category,
        priority: values.priority,
        dueDate: values.dueDate,
      });
      setEditingTodo(null);
    } else {
      addTodo(values);
    }
  };

  return (
    <div className={`todo-container ${theme}`}>
      <div className="header">
        <h1>Advanced Todo App</h1>
        <button
          type="button"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          className="theme-toggle"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>

      {error && (
        <div className="undo-notification" role="alert">
          <span>⚠️ {error.message}</span>
          <button type="button" onClick={dismissError} className="undo-button">
            <FaTimes /> Dismiss
          </button>
        </div>
      )}

      <TodoStats stats={stats} />

      <TodoForm
        mode={editingTodo ? "edit" : "add"}
        initialValues={editingTodo || undefined}
        onSubmit={handleFormSubmit}
        onCancel={() => setEditingTodo(null)}
      />

      <TodoFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={setSort}
        showStatus={false}
        showCompletedToggle
        onClearCompleted={clearCompleted}
      />

      {deletedTodo && (
        <div className="undo-notification">
          <span>Todo "{deletedTodo.text}" deleted</span>
          <button type="button" onClick={undoDelete} className="undo-button">
            <FaUndo /> Undo
          </button>
        </div>
      )}

      <TodoList
        todos={visibleTodos}
        isLoading={isLoading}
        isFiltered={isFiltered}
        onReorder={reorderTodos}
        onToggle={toggleComplete}
        onEdit={setEditingTodo}
        onDelete={deleteTodo}
      />
    </div>
  );
}
