import { useCallback, useEffect, useState } from "react";
import ORDER_CONFIG from "../config";

const API_BASE = ORDER_CONFIG.API.BASE_URL.replace(/\/$/, "");

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      setOrders(await res.json());
    } catch (e) {
      console.error("Fetch orders error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteById = useCallback(async (id) => {
    const res = await fetch(`${API_BASE}/api/orders/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to delete order");
    }
    return res.json().catch(() => ({}));
  }, []);

  const updateOrder = useCallback(async (id, payload) => {
    const res = await fetch(`${API_BASE}/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Failed to update order");
    return body;
  }, []);

  const updateStatus = useCallback(async (id, status, remark = "") => {
    const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, remark }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Failed to update status");
    return body;
  }, []);

  // Bulk ops parallelize the per-order requests and rethrow if any fail.
  const bulkDelete = useCallback(
    (ids) => Promise.all(ids.map((id) => deleteById(id))),
    [deleteById]
  );

  const bulkUpdateStatus = useCallback(
    (ids, status) => Promise.all(ids.map((id) => updateStatus(id, status))),
    [updateStatus]
  );

  return {
    orders,
    loading,
    refetch,
    deleteById,
    updateOrder,
    updateStatus,
    bulkDelete,
    bulkUpdateStatus,
  };
}
