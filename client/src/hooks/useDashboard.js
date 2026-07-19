// client/src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function useDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [userPerformance, setUserPerformance] = useState([]);
  const [conversionAnalytics, setConversionAnalytics] = useState([]);
  const [upcomingPriorities, setUpcomingPriorities] = useState([]);
  const [overdueAnalysis, setOverdueAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompleteAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Dashboard hook - Token check:", token ? "✅ Token exists" : "❌ No token");
      
      if (!token) {
        throw new Error("Not logged in. Please login to view the dashboard.");
      }

      console.log("📡 Fetching dashboard analytics from:", `${API_BASE}/api/dashboard/complete-analytics`);
      
      const response = await fetch(`${API_BASE}/api/dashboard/complete-analytics`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("📊 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Dashboard data received:", data);

      if (data.success) {
        setMetrics(data.data.metrics);
        setDailyActivity(data.data.dailyActivity);
        setStatusDistribution(data.data.statusDistribution);
        setUserPerformance(data.data.userPerformance);
        setConversionAnalytics(data.data.conversionAnalytics);
        setUpcomingPriorities(data.data.upcomingPriorities);
        setOverdueAnalysis(data.data.overdueAnalysis);
      } else {
        throw new Error("API returned success: false");
      }
    } catch (err) {
      console.error("❌ Error fetching dashboard analytics:", err.message);
      console.error("📍 Error stack:", err.stack);
      setError(err.message || "Failed to fetch dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/dashboard/metrics`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) setMetrics(data.data.metrics);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  }, []);

  useEffect(() => {
    fetchCompleteAnalytics();
  }, [fetchCompleteAnalytics]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchCompleteAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCompleteAnalytics]);

  return {
    metrics,
    dailyActivity,
    statusDistribution,
    userPerformance,
    conversionAnalytics,
    upcomingPriorities,
    overdueAnalysis,
    loading,
    error,
    refetch: fetchCompleteAnalytics,
    refreshMetrics: fetchMetrics
  };
}
