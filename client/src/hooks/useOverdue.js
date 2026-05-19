import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing overdue follow-up operations
 */

export const useOverdue = () => {
  const [overdueData, setOverdueData] = useState({
    followUps: [],
    stats: {
      totalOverdue: 0,
      criticalOverdue: 0,
      highPriorityOverdue: 0,
      mediumOverdue: 0,
      byDaysOverdue: {},
    },
    dashboard: {
      stats: {},
      recentOverdue: [],
      alertLevel: "clear",
    },
    loading: false,
    error: null,
  });

  // Fetch all overdue follow-ups
  const fetchOverdue = useCallback(async (filters = {}) => {
    try {
      setOverdueData((prev) => ({ ...prev, loading: true }));

      const params = new URLSearchParams({
        limit: filters.limit || 20,
        skip: filters.skip || 0,
        sortBy: filters.sortBy || "followUpDate",
      });

      const response = await fetch(`/api/overdue?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setOverdueData((prev) => ({
          ...prev,
          followUps: data.data,
          loading: false,
        }));
      }
    } catch (error) {
      setOverdueData((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  }, []);

  // Fetch overdue statistics
  const fetchOverdueStats = useCallback(async () => {
    try {
      const response = await fetch("/api/overdue/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setOverdueData((prev) => ({
          ...prev,
          stats: data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching overdue stats:", error);
    }
  }, []);

  // Fetch dashboard summary
  const fetchDashboardSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/overdue/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setOverdueData((prev) => ({
          ...prev,
          dashboard: data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    }
  }, []);

  // Get overdue count
  const fetchOverdueCount = useCallback(async () => {
    try {
      const response = await fetch("/api/overdue/count", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        return {
          total: data.totalOverdue,
          critical: data.critical,
          high: data.high,
        };
      }
    } catch (error) {
      console.error("Error fetching overdue count:", error);
    }
  }, []);

  // Resolve overdue follow-up
  const resolveOverdue = useCallback(async (followUpId) => {
    try {
      const response = await fetch(`/api/overdue/${followUpId}/resolve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        // Remove from overdue list
        setOverdueData((prev) => ({
          ...prev,
          followUps: prev.followUps.filter((f) => f._id !== followUpId),
        }));
        return data.data;
      }
    } catch (error) {
      console.error("Error resolving overdue follow-up:", error);
      throw error;
    }
  }, []);

  // Update overdue follow-up (escalate, snooze, etc.)
  const updateOverdue = useCallback(async (followUpId, action) => {
    try {
      const response = await fetch(`/api/overdue/${followUpId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh data
        await fetchOverdue();
        await fetchOverdueStats();
        return data;
      }
    } catch (error) {
      console.error("Error updating overdue follow-up:", error);
      throw error;
    }
  }, [fetchOverdue, fetchOverdueStats]);

  // Bulk update overdue follow-ups
  const bulkUpdateOverdue = useCallback(async (followUpIds, action) => {
    try {
      const response = await fetch("/api/overdue/bulk/action", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ followUpIds, action }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh data
        await fetchOverdue();
        await fetchOverdueStats();
        return data;
      }
    } catch (error) {
      console.error("Error bulk updating overdue follow-ups:", error);
      throw error;
    }
  }, [fetchOverdue, fetchOverdueStats]);

  return {
    ...overdueData,
    fetchOverdue,
    fetchOverdueStats,
    fetchDashboardSummary,
    fetchOverdueCount,
    resolveOverdue,
    updateOverdue,
    bulkUpdateOverdue,
  };
};

export default useOverdue;
