import { useCallback, useEffect, useState } from "react";

const API_BASE =
  (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Fetch customers error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteById = useCallback(async (id) => {
    const res = await fetch(`${API_BASE}/api/customers/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to delete customer");
    }
    return res.json().catch(() => ({}));
  }, []);

  const updateCustomer = useCallback(async (id, payload) => {
    const res = await fetch(`${API_BASE}/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Failed to update customer");
    return body;
  }, []);

  const bulkDelete = useCallback(
    async (ids) => {
      await Promise.all(ids.map((id) => deleteById(id)));
    },
    [deleteById]
  );

  return {
    customers,
    isLoading,
    refetch,
    deleteById,
    updateCustomer,
    bulkDelete,
  };
}
