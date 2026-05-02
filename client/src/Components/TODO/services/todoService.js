// Storage abstraction. Async-shaped so swapping localStorage for an HTTP
// client later is a body-only edit — callers already await.
//
// Errors are thrown rather than swallowed. Silent fallbacks (returning [])
// can erase a user's data the first time their JSON gets corrupted; let the
// caller decide whether to retry, toast, or fall back.

const STORAGE_KEY = "todos";

export async function getTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Stored todos payload is not an array");
    }
    return parsed;
  } catch (err) {
    throw new Error(`Failed to load todos: ${err.message}`);
  }
}

export async function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (err) {
    throw new Error(`Failed to save todos: ${err.message}`);
  }
}
