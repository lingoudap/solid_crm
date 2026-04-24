import { useState, useEffect, useCallback } from "react";
import { getApiBase } from "../utils/apiBase";

export function useQuotations() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/quotations`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setQuotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteById = useCallback(async (id) => {
    const res = await fetch(`${getApiBase()}/api/quotations/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to delete quotation");
    }
    return res.json();
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    const res = await fetch(`${getApiBase()}/api/quotations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to update status");
    }
    return res.json();
  }, []);

  const updateQuotation = useCallback(async (id, payload) => {
    const res = await fetch(`${getApiBase()}/api/quotations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to update quotation");
    }
    return res.json();
  }, []);

  return {
    quotes,
    loading,
    refetch,
    deleteById,
    updateStatus,
    updateQuotation,
  };
}
