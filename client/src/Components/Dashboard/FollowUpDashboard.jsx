// client/src/Components/Dashboard/FollowUpDashboard.jsx
import React, { useEffect, useState } from "react";
import { DashboardMetrics } from "./DashboardCard";
import {
  DailyActivityChart,
  StatusDistributionChart,
  ConversionAnalyticsChart,
  UserPerformanceChart,
  OverdueAnalysisChart
} from "./DashboardAnalyticsCharts";
import { useDashboard } from "../../hooks/useDashboard";
import "./FollowUpDashboard.css";

/**
 * Follow-Up Analytics Dashboard
 * Comprehensive analytics and insights for follow-up management
 */
export default function FollowUpDashboard() {
  const {
    metrics,
    dailyActivity,
    statusDistribution,
    userPerformance,
    conversionAnalytics,
    upcomingPriorities,
    overdueAnalysis,
    loading,
    error,
    refetch
  } = useDashboard();

  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  if (loading && !metrics) {
    return (
      <div className="dashboard-container loading-state">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>📊 Follow-Up Analytics Dashboard</h1>
          <p className="header-subtitle">Real-time insights and performance metrics</p>
        </div>
        
        <div className="header-actions">
          <button 
            className={`refresh-btn ${loading ? "loading" : ""}`}
            onClick={() => refetch()}
            title="Refresh data"
          >
            🔄 Refresh
          </button>
          
          <button 
            className={`auto-refresh-btn ${autoRefresh ? "active" : ""}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Toggle auto-refresh (5 min)"
          >
            {autoRefresh ? "⏱️ Auto" : "⏸️ Manual"}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {/* Key Metrics Cards */}
      <section className="dashboard-section">
        <h2 className="section-title">Key Metrics</h2>
        <DashboardMetrics metrics={metrics} loading={loading} />
      </section>

      {/* Charts Grid */}
      <section className="dashboard-section">
        <h2 className="section-title">Performance Analytics</h2>
        
        <div className="charts-grid-2">
          <DailyActivityChart 
            data={dailyActivity} 
            loading={loading}
          />
          <StatusDistributionChart 
            data={statusDistribution} 
            loading={loading}
          />
        </div>

        <div className="charts-grid-2">
          <ConversionAnalyticsChart 
            data={conversionAnalytics} 
            loading={loading}
          />
          <OverdueAnalysisChart 
            data={overdueAnalysis} 
            loading={loading}
          />
        </div>

        <div className="charts-grid-full">
          <UserPerformanceChart 
            data={userPerformance} 
            loading={loading}
          />
        </div>
      </section>

      {/* Upcoming Priorities */}
      {upcomingPriorities && upcomingPriorities.length > 0 && (
        <section className="dashboard-section">
          <h2 className="section-title">Upcoming Priorities</h2>
          <div className="priorities-table">
            <table>
              <thead>
                <tr>
                  <th>Due Date</th>
                  <th>Days Until</th>
                  <th>Type</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPriorities.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className={`priority-row priority-${Math.min(item.daysUntil, 3)}`}>
                    <td className="date-cell">
                      {new Date(item.followUpDate).toLocaleDateString()}
                    </td>
                    <td className="days-cell">
                      <span className={`days-badge days-${Math.min(item.daysUntil, 3)}`}>
                        {item.daysUntil} days
                      </span>
                    </td>
                    <td className="type-cell">{item.relatedType}</td>
                    <td className="notes-cell">{item.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Summary Stats */}
      {metrics && (
        <section className="dashboard-section dashboard-summary">
          <h2 className="section-title">Summary</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Conversion Rate</label>
              <value className="metric-value">{metrics.conversionRate || 0}%</value>
            </div>
            <div className="summary-item">
              <label>Avg. Completion Time</label>
              <value className="metric-value">{metrics.avgCompletionTime || 0} days</value>
            </div>
            <div className="summary-item">
              <label>Completion Rate</label>
              <value className="metric-value">
                {metrics.totalFollowUps > 0 
                  ? ((metrics.completed / metrics.totalFollowUps) * 100).toFixed(1) 
                  : 0}%
              </value>
            </div>
            <div className="summary-item">
              <label>Overdue Rate</label>
              <value className="metric-value danger">
                {metrics.totalFollowUps > 0 
                  ? ((metrics.overdue / metrics.totalFollowUps) * 100).toFixed(1) 
                  : 0}%
              </value>
            </div>
          </div>
        </section>
      )}

      {/* Last Updated */}
      <div className="dashboard-footer">
        <small>
          Last updated: {new Date().toLocaleTimeString()}
          {autoRefresh && " (Auto-refresh enabled)"}
        </small>
      </div>
    </div>
  );
}
