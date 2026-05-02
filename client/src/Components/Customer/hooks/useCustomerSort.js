import { useCallback, useMemo, useState } from "react";

function getSortKey(c, sortBy) {
  switch (sortBy) {
    case "name":
      return (c.name || "").toLowerCase();
    case "phone":
      return c.phone || "";
    case "email":
      return (c.email || "").toLowerCase();
    case "state":
      return (c.state || "").toLowerCase();
    case "createdAt":
    default:
      return new Date(c.createdAt || 0).getTime();
  }
}

export function useCustomerSort(items) {
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
    const decorated = items.map((c) => [c, getSortKey(c, sortBy)]);
    decorated.sort(([, a], [, b]) => {
      if (a < b) return sortOrder === "asc" ? -1 : 1;
      if (a > b) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return decorated.map(([c]) => c);
  }, [items, sortBy, sortOrder]);

  return { sortBy, sortOrder, handleSort, sortedItems };
}
