import { useEffect, useState } from "react";

/**
 * Returns a copy of `value` that only updates after `delay` ms of no further
 * changes. Use to throttle expensive work driven by fast-changing input
 * (search boxes, sliders, etc.).
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
