import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 300;

function buildSearchIndex(customers) {
  const map = new WeakMap();
  for (const c of customers) {
    const parts = [c.name, c.email, c.phone, c.address, c.state, c._id];
    map.set(c, parts.filter(Boolean).join("  ").toLowerCase());
  }
  return map;
}

export function useCustomerFilters(customers) {
  const [query, setQuery] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  // Wire global header search bar
  useEffect(() => {
    const input = document.getElementById("global-search");
    if (!input) return;
    const handler = (e) => setQuery(e.target.value);
    input.addEventListener("input", handler);
    return () => input.removeEventListener("input", handler);
  }, []);

  const searchIndex = useMemo(() => buildSearchIndex(customers), [customers]);

  const uniqueStates = useMemo(() => {
    const set = new Set();
    for (const c of customers) if (c.state) set.add(c.state);
    return [...set].sort();
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (filterState !== "all") {
      result = result.filter((c) => c.state === filterState);
    }

    if (filterName.trim()) {
      const needle = filterName.trim().toLowerCase();
      result = result.filter((c) =>
        (c.name || "").toLowerCase().includes(needle)
      );
    }

    if (debouncedQuery) {
      const needle = debouncedQuery.trim().toLowerCase();
      if (needle) {
        result = result.filter((c) => {
          const hay = searchIndex.get(c);
          return hay ? hay.includes(needle) : false;
        });
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      result = result.filter((c) => {
        const t = new Date(c.createdAt).getTime();
        return t >= start && t <= end;
      });
    }

    return result;
  }, [
    customers,
    filterState,
    filterName,
    debouncedQuery,
    startDate,
    endDate,
    searchIndex,
  ]);

  const resetFilters = () => {
    setFilterState("all");
    setFilterName("");
    setStartDate(null);
    setEndDate(null);
  };

  return {
    query,
    setQuery,
    filterName,
    setFilterName,
    filterState,
    setFilterState,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredCustomers,
    uniqueStates,
    resetFilters,
  };
}
