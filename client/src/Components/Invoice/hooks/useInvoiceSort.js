import { useCallback, useMemo, useState } from "react";

const STATUS_ORDER = {
  Draft: 1,
  Sent: 2,
  Paid: 3,
  Overdue: 4,
  Cancelled: 5,
};

function getSortKey(inv, sortBy) {
  switch (sortBy) {
    case "invoiceNumber":
      // Numeric trailing portion sorts more sensibly than lexicographic.
      return Number(String(inv.invoiceNumber || "").replace(/\D/g, "") || 0);
    case "customerName":
      return (inv.customerName || inv.customerId?.name || "").toLowerCase();
    case "totalAmount":
      return Number(inv.totalAmount || 0);
    case "status":
      return STATUS_ORDER[inv.status] || 0;
    case "dueDate":
      return new Date(inv.dueDate || 0).getTime();
    case "invoiceDate":
    default:
      return new Date(inv.invoiceDate || inv.createdAt || 0).getTime();
  }
}

export function useInvoiceSort(items) {
  const [sortBy, setSortBy] = useState("invoiceDate");
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
    const decorated = items.map((inv) => [inv, getSortKey(inv, sortBy)]);
    decorated.sort(([, a], [, b]) => {
      if (a < b) return sortOrder === "asc" ? -1 : 1;
      if (a > b) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return decorated.map(([inv]) => inv);
  }, [items, sortBy, sortOrder]);

  return { sortBy, sortOrder, handleSort, sortedItems };
}
