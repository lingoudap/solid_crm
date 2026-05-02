import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 300;

// Build a single lowercase haystack per row, once per `leads` change. Searching
// then becomes a cheap String.includes instead of JSON.stringify on every
// keystroke. Only fields a user would realistically search are indexed.
function buildSearchIndex(leads) {
  const map = new WeakMap();
  for (const l of leads) {
    const parts = [
      l.name,
      l.email,
      l.phone,
      l.address,
      l.state,
      l.Source,
      l.status,
      l._id,
    ];
    map.set(l, parts.filter(Boolean).join("  ").toLowerCase());
  }
  return map;
}

export function useLeadFilters(leads) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [filterName, setFilterName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  // Wire the global search bar (header input) into local query state.
  useEffect(() => {
    const input = document.getElementById("global-search");
    if (!input) return;
    const handler = (e) => setQuery(e.target.value);
    input.addEventListener("input", handler);
    return () => input.removeEventListener("input", handler);
  }, []);

  const searchIndex = useMemo(() => buildSearchIndex(leads), [leads]);

  const uniqueSources = useMemo(() => {
    const set = new Set();
    for (const l of leads) if (l.Source) set.add(l.Source);
    return [...set].sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let result = leads;

    if (filterStatus !== "all") {
      result = result.filter((l) => l.status === filterStatus);
    }

    if (filterSource !== "all") {
      result = result.filter((l) => l.Source === filterSource);
    }

    if (filterName.trim()) {
      const needle = filterName.trim().toLowerCase();
      result = result.filter((l) =>
        (l.name || "").toLowerCase().includes(needle)
      );
    }

    if (debouncedQuery) {
      const needle = debouncedQuery.trim().toLowerCase();
      if (needle) {
        result = result.filter((l) => {
          const hay = searchIndex.get(l);
          return hay ? hay.includes(needle) : false;
        });
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      result = result.filter((l) => {
        const t = new Date(l.createdAt).getTime();
        return t >= start && t <= end;
      });
    }

    return result;
  }, [
    leads,
    filterStatus,
    filterSource,
    filterName,
    debouncedQuery,
    startDate,
    endDate,
    searchIndex,
  ]);

  const resetFilters = () => {
    setFilterStatus("all");
    setFilterSource("all");
    setFilterName("");
    setStartDate(null);
    setEndDate(null);
  };

  return {
    query,
    setQuery,
    filterStatus,
    setFilterStatus,
    filterSource,
    setFilterSource,
    filterName,
    setFilterName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredLeads,
    uniqueSources,
    resetFilters,
  };
}
