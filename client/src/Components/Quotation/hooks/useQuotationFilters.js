import { useState, useEffect, useMemo } from "react";

export function useQuotationFilters(quotes) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Wire the global search bar (header input) into local query state.
  useEffect(() => {
    const input = document.getElementById("global-search");
    const handler = (e) => setQuery(e.target.value);
    if (input) input.addEventListener("input", handler);
    return () => input && input.removeEventListener("input", handler);
  }, []);

  const filteredQuotes = useMemo(() => {
    let result = quotes;

    if (filterStatus !== "all") {
      result = result.filter((q) => q.status === filterStatus);
    }

    if (query) {
      const needle = query.toLowerCase();
      result = result.filter((q) =>
        JSON.stringify(q).toLowerCase().includes(needle)
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      result = result.filter((q) => {
        const date = new Date(q.createdAt);
        return date >= start && date <= end;
      });
    }

    return result;
  }, [quotes, filterStatus, query, startDate, endDate]);

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
