import { useCallback, useMemo, useState } from "react";

const STATUS_ORDER = {
  New: 1,
  Processing: 2,
  Shipped: 3,
  Delivered: 4,
  Cancelled: 5,
};

function getSortKey(o, sortBy) {
  switch (sortBy) {
    case "orderNumber":
      return Number(o.orderId || 0);
    case "customerName":
      return (o.customerName || "").toLowerCase();
    case "totalAmount":
      return Number(o.totalAmount || 0);
    case "status":
      return STATUS_ORDER[o.status] || 0;
    case "createdAt":
    default:
      return new Date(o.createdAt || 0).getTime();
  }
}

export function useOrderSort(items) {
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
    const decorated = items.map((o) => [o, getSortKey(o, sortBy)]);
    decorated.sort(([, a], [, b]) => {
      if (a < b) return sortOrder === "asc" ? -1 : 1;
      if (a > b) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return decorated.map(([o]) => o);
  }, [items, sortBy, sortOrder]);

  return { sortBy, sortOrder, handleSort, sortedItems };
}
