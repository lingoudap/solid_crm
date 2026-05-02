import { useCallback, useMemo, useState } from "react";

const STATUS_ORDER = { New: 1, Active: 2, Converted: 3, Lost: 4 };

function getSortKey(l, sortBy) {
  switch (sortBy) {
    case "name":
      return (l.name || "").toLowerCase();
    case "phone":
      return l.phone || "";
    case "email":
      return (l.email || "").toLowerCase();
    case "source":
      return (l.Source || "").toLowerCase();
    case "status":
      return STATUS_ORDER[l.status] || 0;
    case "createdAt":
    default:
      return new Date(l.createdAt || 0).getTime();
  }
}

export function useLeadSort(items) {
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
    const decorated = items.map((l) => [l, getSortKey(l, sortBy)]);
    decorated.sort(([, a], [, b]) => {
      if (a < b) return sortOrder === "asc" ? -1 : 1;
      if (a > b) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return decorated.map(([l]) => l);
  }, [items, sortBy, sortOrder]);

  return { sortBy, sortOrder, handleSort, sortedItems };
}
