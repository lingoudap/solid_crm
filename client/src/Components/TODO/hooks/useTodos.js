import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getTodos, saveTodos } from "../services/todoService";
import { reorderList } from "../utils/todoUtils";

const UNDO_TIMEOUT_MS = 5000;

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [deletedTodo, setDeletedTodo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const undoTimerRef = useRef(null);
  // Guards against the persistence effect overwriting real data with the
  // initial empty array before the load resolves.
  const hasLoadedRef = useRef(false);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    getTodos()
      .then((data) => {
        if (cancelled) return;
        setTodos(data);
        hasLoadedRef.current = true;
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        // Without this, save effect stays disarmed and edits would be lost.
        // Mark as loaded so the user can recover by editing — the next save
        // will overwrite the bad payload.
        hasLoadedRef.current = true;
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on change. Skipped until the initial load completes.
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveTodos(todos).catch((err) => setError(err));
  }, [todos]);

  // Clear pending undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const addTodo = useCallback((data) => {
    const text = (data.text || "").trim();
    if (!text) return null;

    const newTodo = {
      id: uuidv4(),
      text,
      completed: false,
      category: data.category || "personal",
      priority: data.priority || "medium",
      dueDate: data.dueDate || "",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    setTodos((prev) => [newTodo, ...prev]);
    return newTodo;
  }, []);

  const updateTodo = useCallback((id, patch) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) {
        setDeletedTodo({ ...target, deletedAt: Date.now() });
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        undoTimerRef.current = setTimeout(() => {
          setDeletedTodo(null);
          undoTimerRef.current = null;
        }, UNDO_TIMEOUT_MS);
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const undoDelete = useCallback(() => {
    setDeletedTodo((current) => {
      if (!current) return null;
      const { deletedAt, ...todo } = current;
      setTodos((prev) => [todo, ...prev]);
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
      return null;
    });
  }, []);

  const toggleComplete = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }, []);

  const reorderTodos = useCallback((fromIndex, toIndex) => {
    setTodos((prev) => reorderList(prev, fromIndex, toIndex));
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return {
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
  };
}
