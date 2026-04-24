import { useCallback, useMemo, useState } from "react";
import { getFollowUpCount, getNextFollowUpDate } from "../utils/followUps";

const STATUS_ORDER = { New: 1, Active: 2, Converted: 3, Lost: 4 };

function getSortKey(q, sortBy) {
  switch (sortBy) {
    case "quoteNumber":
      return (q.quoteNumber || q.ref || "").toString().toLowerCase();
    case "customerName":
      return (q.customerName || "").toLowerCase();
    case "totalAmount":
      return parseFloat(q.totalAmount || q.amount || 0);
    case "status":
      return STATUS_ORDER[q.status] || 0;
    case "followups":
      return getFollowUpCount(q);
    case "nextFollowup": {
      const d = getNextFollowUpDate(q);
      return d ? new Date(d) : new Date(0);
    }
    case "createdAt":
    default:
      return new Date(q.createdAt || 0);
  }
}

export function useQuotationSort(items) {
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSort = useCallback(
    (column) => {
      if (sortBy === column) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(column);
        setSortOrder("asc");
      }
    },
    [sortBy]
  );

  const sortedItems = useMemo(() => {
    const decorated = items.map((q) => [q, getSortKey(q, sortBy)]);
    decorated.sort(([, a], [, b]) => {
      if (a < b) return sortOrder === "asc" ? -1 : 1;
      if (a > b) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return decorated.map(([q]) => q);
  }, [items, sortBy, sortOrder]);

  return { sortBy, sortOrder, handleSort, sortedItems };
}
