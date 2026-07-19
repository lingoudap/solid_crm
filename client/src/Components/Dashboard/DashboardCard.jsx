// client/src/Components/Dashboard/DashboardCard.jsx
import React from "react";
import "./DashboardCard.css";

export function MetricCard({ 
  icon, 
  label, 
  value, 
  subtext, 
  color, 
  trend,
  onClick 
}) {
  return (
    <div 
      className="metric-card" 
      style={{ "--card-color": color }}
      onClick={onClick}
    >
      <div className="metric-card-header">
        <div className="metric-icon">{icon}</div>
        <div className="metric-label">{label}</div>
      </div>
      
      <div className="metric-value">{value}</div>
      
      {subtext && <div className="metric-subtext">{subtext}</div>}
      
      {trend && (
        <div className={`metric-trend ${trend > 0 ? "positive" : trend < 0 ? "negative" : ""}`}>
          {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

export function DashboardMetrics({ metrics, loading }) {
  if (loading) {
    return <div className="dashboard-metrics loading">Loading metrics...</div>;
  }

  if (!metrics) {
    return <div className="dashboard-metrics error">No metrics available</div>;
  }

  const overduePercentage = metrics.totalFollowUps > 0 
    ? ((metrics.overdue / metrics.totalFollowUps) * 100).toFixed(1) 
    : 0;

  const completionPercentage = metrics.totalFollowUps > 0
    ? ((metrics.completed / metrics.totalFollowUps) * 100).toFixed(1)
    : 0;

  return (
    <div className="dashboard-metrics">
      <MetricCard
        icon="📊"
        label="Total Follow-Ups"
        value={metrics.totalFollowUps}
        color="#3B82F6"
      />
      
      <MetricCard
        icon="⏳"
        label="Pending"
        value={metrics.pending}
        subtext={`${((metrics.pending / metrics.totalFollowUps) * 100).toFixed(1)}% of total`}
        color="#F59E0B"
        trend={0}
      />
      
      <MetricCard
        icon="✅"
        label="Completed"
        value={metrics.completed}
        subtext={`${completionPercentage}% completion rate`}
        color="#10B981"
        trend={5}
      />
      
      <MetricCard
        icon="🔴"
        label="Overdue"
        value={metrics.overdue}
        subtext={`${overduePercentage}% overdue`}
        color="#EF4444"
        trend={-2}
      />
      
      <MetricCard
        icon="📅"
        label="Today's Follow-Ups"
        value={metrics.today}
        subtext={`Due today`}
        color="#8B5CF6"
      />
      
      <MetricCard
        icon="🚀"
        label="Upcoming"
        value={metrics.upcoming}
        subtext={`Scheduled`}
        color="#06B6D4"
      />
    </div>
  );
}

export default MetricCard;
