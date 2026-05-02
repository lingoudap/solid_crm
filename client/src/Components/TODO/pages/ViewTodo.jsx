import React, { useState } from "react";
import { FaMoon, FaSun, FaTimes, FaUndo } from "react-icons/fa";
import TodoFilters from "../components/TodoFilters";
import TodoList from "../components/TodoList";
import TodoStats from "../components/TodoStats";
import { useTodos } from "../hooks/useTodos";
import { useTodoView } from "../hooks/useTodoView";
import "../Todo.css";

export default function ViewTodo() {
  const {
    todos,
    deletedTodo,
    isLoading,
    error,
    dismissError,
    deleteTodo,
    undoDelete,
    toggleComplete,
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
  } = useTodoView(todos);

  const [theme, setTheme] = useState("light");

  return (
    <div className={`todo-container ${theme}`}>
      <div className="header">
        <h1>View Todos</h1>
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

      <TodoFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={setSort}
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
        onDelete={deleteTodo}
        showEdit={false}
        confirmDelete
      />
    </div>
  );
}
