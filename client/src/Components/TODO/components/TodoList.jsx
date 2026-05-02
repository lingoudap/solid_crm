import React, { useCallback } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { FaInbox, FaSearch } from "react-icons/fa";
import TodoItem from "./TodoItem";

/**
 * Drag-and-drop list of todos. Wraps TodoItem so the page doesn't have to
 * deal with @hello-pangea/dnd directly.
 *
 * Props:
 *   todos
 *   isLoading?: boolean
 *   isFiltered?: boolean              // empty state copy depends on this
 *   onReorder(fromIndex, toIndex)
 *   onToggle(id), onEdit?(todo), onDelete(id)
 *   showEdit?: boolean
 *   confirmDelete?: boolean           // wraps onDelete in a window.confirm
 *   emptyTitle?, emptyText?           // override default empty copy
 */
export default function TodoList({
  todos,
  isLoading = false,
  isFiltered = false,
  onReorder,
  onToggle,
  onEdit,
  onDelete,
  showEdit = true,
  confirmDelete = false,
  emptyTitle,
  emptyText,
}) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    onReorder?.(result.source.index, result.destination.index);
  };

  // Wrap delete with a confirm when the page asks for it. Stable handler
  // identity preserves React.memo on TodoItem.
  const guardedDelete = useCallback(
    (id) => {
      if (confirmDelete && !window.confirm("Delete this todo?")) return;
      onDelete?.(id);
    },
    [confirmDelete, onDelete]
  );

  if (isLoading) {
    return (
      <div className="todo-list" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="todo-item skeleton" aria-hidden="true">
            <div className="skeleton-line skeleton-line-lg" />
            <div className="skeleton-line skeleton-line-sm" />
          </div>
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    const isSearchEmpty = isFiltered;
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden="true">
          {isSearchEmpty ? <FaSearch /> : <FaInbox />}
        </div>
        <h3 className="empty-state-title">
          {emptyTitle ||
            (isSearchEmpty ? "No matching todos" : "Nothing here yet")}
        </h3>
        <p className="empty-state-text">
          {emptyText ||
            (isSearchEmpty
              ? "Try clearing your search or relaxing the filters."
              : "Add your first todo to get started.")}
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="todos">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="todo-list"
          >
            {todos.map((todo, index) => (
              <Draggable key={todo.id} draggableId={todo.id} index={index}>
                {(dragProvided, snapshot) => (
                  <TodoItem
                    todo={todo}
                    innerRef={dragProvided.innerRef}
                    draggableProps={dragProvided.draggableProps}
                    dragHandleProps={dragProvided.dragHandleProps}
                    isDragging={snapshot.isDragging}
                    showEdit={showEdit}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={guardedDelete}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
