import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import INVOICE_CONFIG from "../config";

function buildSearchIndex(invoices) {
  const map = new WeakMap();
  for (const inv of invoices) {
    const parts = [
      inv.invoiceNumber,
      inv.customerName,
      inv.customerId?.name,
      inv.status,
      inv.notes,
      inv._id,
      inv.orderId?.orderId
        ? `O-${String(inv.orderId.orderId).padStart(5, "0")}`
        : null,
      inv.orderId?.customerName,
    ];
    map.set(inv, parts.filter(Boolean).join("  ").toLowerCase());
  }
  return map;
}

export function useInvoiceFilters(invoices) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const debouncedQuery = useDebouncedValue(
    query,
    INVOICE_CONFIG.UI.SEARCH_DEBOUNCE_MS
  );

  // Wire the global search bar (header input) into local query state.
  useEffect(() => {
    const input = document.getElementById("global-search");
    if (!input) return;
    const handler = (e) => setQuery(e.target.value);
    input.addEventListener("input", handler);
    return () => input.removeEventListener("input", handler);
  }, []);

  const searchIndex = useMemo(() => buildSearchIndex(invoices), [invoices]);

  const filteredInvoices = useMemo(() => {
    let result = invoices;

    if (filterStatus !== "all") {
      result = result.filter((inv) => inv.status === filterStatus);
    }

    if (debouncedQuery) {
      const needle = debouncedQuery.trim().toLowerCase();
      if (needle) {
        result = result.filter((inv) => {
          const hay = searchIndex.get(inv);
          return hay ? hay.includes(needle) : false;
        });
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      result = result.filter((inv) => {
        const t = new Date(inv.invoiceDate || inv.createdAt).getTime();
        return t >= start && t <= end;
      });
    }

    return result;
  }, [invoices, filterStatus, debouncedQuery, startDate, endDate, searchIndex]);

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
    filteredInvoices,
    resetFilters,
  };
}
