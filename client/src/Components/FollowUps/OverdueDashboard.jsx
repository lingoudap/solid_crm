import React, { useEffect } from "react";
import useOverdue from "../../hooks/useOverdue";
import "./css/OverdueDashboard.css";

/**
 * OverdueDashboard Component
 * Displays overdue statistics and management options
 */

const OverdueDashboard = () => {
  const {
    dashboard,
    loading,
    error,
    fetchDashboardSummary,
    updateOverdue,
    bulkUpdateOverdue,
  } = useOverdue();

  useEffect(() => {
    fetchDashboardSummary();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardSummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardSummary]);

  if (loading) {
    return (
      <div className="overdue-dashboard loading">
        <div className="spinner"></div>
        <p>Loading overdue data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overdue-dashboard error">
        <p>❌ Error: {error}</p>
      </div>
    );
  }

  const stats = dashboard.stats || {};
  const recentOverdue = dashboard.recentOverdue || [];
  const alertLevel = dashboard.alertLevel || "clear";

  const getAlertIcon = () => {
    switch (alertLevel) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      default:
        return "✅";
    }
  };

  const getAlertMessage = () => {
    if (stats.totalOverdue === 0) {
      return "All follow-ups are on track! 🎉";
    }
    if (stats.criticalOverdue > 0) {
      return `${stats.criticalOverdue} critical overdue follow-up${stats.criticalOverdue > 1 ? "s" : ""}`;
    }
    if (stats.highPriorityOverdue > 0) {
      return `${stats.highPriorityOverdue} high-priority overdue follow-up${stats.highPriorityOverdue > 1 ? "s" : ""}`;
    }
    return `${stats.totalOverdue} overdue follow-up${stats.totalOverdue > 1 ? "s" : ""}`;
  };

  return (
    <div className={`overdue-dashboard alert-${alertLevel}`}>
      {/* Alert Banner */}
      <div className="alert-banner">
        <span className="alert-icon">{getAlertIcon()}</span>
        <div className="alert-content">
          <h2>{getAlertMessage()}</h2>
          {stats.totalOverdue > 0 && (
            <p className="alert-detail">
              {stats.criticalOverdue > 0 && (
                <span>🔴 {stats.criticalOverdue} Critical • </span>
              )}
              {stats.highPriorityOverdue > 0 && (
                <span>🟠 {stats.highPriorityOverdue} High • </span>
              )}
              {stats.mediumOverdue > 0 && (
                <span>🟡 {stats.mediumOverdue} Medium</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats.totalOverdue > 0 && (
        <div className="stats-grid">
          <div className="stat-card critical">
            <div className="stat-number">{stats.criticalOverdue || 0}</div>
            <div className="stat-label">Critical</div>
            <div className="stat-description">7+ days overdue</div>
          </div>

          <div className="stat-card high">
            <div className="stat-number">{stats.highPriorityOverdue || 0}</div>
            <div className="stat-label">High Priority</div>
            <div className="stat-description">3-7 days overdue</div>
          </div>

          <div className="stat-card medium">
            <div className="stat-number">{stats.mediumOverdue || 0}</div>
            <div className="stat-label">Medium</div>
            <div className="stat-description">0-3 days overdue</div>
          </div>

          <div className="stat-card total">
            <div className="stat-number">{stats.totalOverdue}</div>
            <div className="stat-label">Total Overdue</div>
            <div className="stat-description">All overdue items</div>
          </div>
        </div>
      )}

      {/* Recent Overdue List */}
      {recentOverdue.length > 0 && (
        <div className="recent-overdue">
          <h3>Recent Overdue Follow-Ups</h3>
          <div className="overdue-list">
            {recentOverdue.map((followUp) => (
              <div key={followUp._id} className="overdue-item">
                <div className="item-header">
                  <h4>{followUp.title}</h4>
                  <span className={`priority-tag ${followUp.priority}`}>
                    {followUp.priority.toUpperCase()}
                  </span>
                </div>
                <div className="item-details">
                  <span className="detail">
                    📅 Due: {new Date(followUp.followUpDate).toLocaleDateString()}
                  </span>
                  <span className="detail overdue-info">
                    {followUp.overdueStatus?.daysOverdue} days overdue
                  </span>
                </div>
                <div className="item-actions">
                  <button
                    className="action-btn resolve"
                    onClick={() => updateOverdue(followUp._id, "resolve")}
                    title="Mark as resolved"
                  >
                    ✓ Resolve
                  </button>
                  <button
                    className="action-btn escalate"
                    onClick={() => updateOverdue(followUp._id, "escalate")}
                    title="Escalate priority"
                  >
                    ⬆ Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="list-footer">
            <a href="/follow-ups?filter=overdue" className="view-all-link">
              View All Overdue →
            </a>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalOverdue === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>All Caught Up!</h3>
          <p>You have no overdue follow-ups. Great job staying on top of things!</p>
        </div>
      )}
    </div>
  );
};

export default OverdueDashboard;
