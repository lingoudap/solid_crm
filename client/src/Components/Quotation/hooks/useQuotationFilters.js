import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import QUOTATION_CONFIG from "../config";

// Build a single lowercase haystack per row, once per `quotes` change. Searching
// then becomes a cheap `String.includes` instead of JSON.stringify on every
// keystroke. Indexes only the fields a user would realistically search.
function buildSearchIndex(quotes) {
  const map = new WeakMap();
  for (const q of quotes) {
    const parts = [
      q.customerName,
      q.email,
      q.phone,
      q.address,
      q.state,
      q.status,
      q.priority,
      q.quotationNumber,
      q.quoteNumber,
      q.ref,
      q._id,
      ...(Array.isArray(q.items) ? q.items.map((i) => i.itemName) : []),
    ];
    map.set(
      q,
      parts.filter(Boolean).join("  ").toLowerCase()
    );
  }
  return map;
}

export function useQuotationFilters(quotes) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Debounce the typed query so filtering doesn't run on every keystroke.
  const debouncedQuery = useDebouncedValue(
    query,
    QUOTATION_CONFIG.UI.SEARCH_DEBOUNCE_MS
  );

  // Wire the global search bar (header input) into local query state.
  useEffect(() => {
    const input = document.getElementById("global-search");
    const handler = (e) => setQuery(e.target.value);
    if (input) input.addEventListener("input", handler);
    return () => input && input.removeEventListener("input", handler);
  }, []);

  // Recompute the index only when the underlying data changes.
  const searchIndex = useMemo(() => buildSearchIndex(quotes), [quotes]);

  const filteredQuotes = useMemo(() => {
    let result = quotes;

    if (filterStatus !== "all") {
      result = result.filter((q) => q.status === filterStatus);
    }

    if (debouncedQuery) {
      const needle = debouncedQuery.trim().toLowerCase();
      if (needle) {
        result = result.filter((q) => {
          const hay = searchIndex.get(q);
          return hay ? hay.includes(needle) : false;
        });
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      result = result.filter((q) => {
        const t = new Date(q.createdAt).getTime();
        return t >= start && t <= end;
      });
    }

    return result;
  }, [quotes, filterStatus, debouncedQuery, startDate, endDate, searchIndex]);

  const resetFilters = () => {
    setFilterStatus("all");
    setStartDate(null);
    setEndDate(null);
  };

  return {
    query,
    setQuery,
    filterStatus,
    setFilterStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredQuotes,
    resetFilters,
  };
}
