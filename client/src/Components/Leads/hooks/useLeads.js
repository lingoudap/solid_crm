import { useCallback, useEffect, useState } from "react";

const API_BASE =
  (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads`);
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error("Fetch leads error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteById = useCallback(async (id) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to delete lead");
    }
    return res.json().catch(() => ({}));
  }, []);

  const updateLead = useCallback(async (id, payload) => {
    const res = await fetch(`${API_BASE}/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Failed to update lead");
    return body;
  }, []);

  // Bulk ops parallelize the per-lead PUTs/DELETEs and rethrow if any fail.
  const bulkDelete = useCallback(
    async (ids) => {
      await Promise.all(ids.map((id) => deleteById(id)));
    },
    [deleteById]
  );

  const bulkUpdateStatus = useCallback(
    async (ids, newStatus) => {
      const byId = new Map(leads.map((l) => [l._id, l]));
      await Promise.all(
        ids.map((id) => {
          const lead = byId.get(id);
          if (!lead) return Promise.resolve();
          return updateLead(id, { ...lead, status: newStatus });
        })
      );
    },
    [leads, updateLead]
  );

  return {
    leads,
    isLoading,
    refetch,
    deleteById,
    updateLead,
    bulkDelete,
    bulkUpdateStatus,
  };
}
