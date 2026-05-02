import { useCallback, useEffect, useState } from "react";
import INVOICE_CONFIG from "../config";

const API_BASE = INVOICE_CONFIG.API.BASE_URL.replace(/\/$/, "");

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/invoices`);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      setInvoices(await res.json());
    } catch (e) {
      console.error("Fetch invoices error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteById = useCallback(async (id) => {
    const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Failed to delete invoice");
    }
    return res.json().catch(() => ({}));
  }, []);

  const updateInvoice = useCallback(async (id, payload) => {
    const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.message || "Failed to update invoice");
    return body;
  }, []);

  const updateStatus = useCallback(async (id, status, remark = "") => {
    const res = await fetch(`${API_BASE}/api/invoices/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, remark }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.message || "Failed to update status");
    return body;
  }, []);

  const bulkDelete = useCallback(
    (ids) => Promise.all(ids.map((id) => deleteById(id))),
    [deleteById]
  );

  const bulkUpdateStatus = useCallback(
    (ids, status) => Promise.all(ids.map((id) => updateStatus(id, status))),
    [updateStatus]
  );

  return {
    invoices,
    loading,
    refetch,
    deleteById,
    updateInvoice,
    updateStatus,
    bulkDelete,
    bulkUpdateStatus,
  };
}
