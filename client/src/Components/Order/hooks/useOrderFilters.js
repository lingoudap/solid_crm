import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import ORDER_CONFIG from "../config";

// Build a single lowercase haystack per row, once per `orders` change.
function buildSearchIndex(orders) {
  const map = new WeakMap();
  for (const o of orders) {
    const parts = [
      o.customerName,
      o.email,
      o.phone,
      o.address,
      o.state,
      o.status,
      o.orderNumber,
      o._id,
      o.sourceQuotationId?.customerName,
      o.sourceQuotationId?.quotationId
        ? `Q-${String(o.sourceQuotationId.quotationId).padStart(5, "0")}`
        : null,
      ...(Array.isArray(o.items) ? o.items.map((i) => i.itemName) : []),
    ];
    map.set(o, parts.filter(Boolean).join("  ").toLowerCase());
  }
  return map;
}

export function useOrderFilters(orders) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const debouncedQuery = useDebouncedValue(
    query,
    ORDER_CONFIG.UI.SEARCH_DEBOUNCE_MS
  );

  // Wire the global search bar (header input) into local query state.
  useEffect(() => {
    const input = document.getElementById("global-search");
    if (!input) return;
    const handler = (e) => setQuery(e.target.value);
    input.addEventListener("input", handler);
    return () => input.removeEventListener("input", handler);
  }, []);

  const searchIndex = useMemo(() => buildSearchIndex(orders), [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (filterStatus !== "all") {
      result = result.filter((o) => o.status === filterStatus);
    }

    if (debouncedQuery) {
      const needle = debouncedQuery.trim().toLowerCase();
      if (needle) {
        result = result.filter((o) => {
          const hay = searchIndex.get(o);
          return hay ? hay.includes(needle) : false;
        });
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      result = result.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= start && t <= end;
      });
    }

    return result;
  }, [orders, filterStatus, debouncedQuery, startDate, endDate, searchIndex]);

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
    filteredOrders,
    resetFilters,
  };
}
