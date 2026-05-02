import React from "react";

export default function CustomersStats({ stats }) {
  return (
    <div className="leads-stats-bar">
      <div className="stat-item">
        <span className="stat-label">Total</span>
        <span className="stat-value">{stats.total}</span>
      </div>
      <div className="stat-item stat-new">
        <span className="stat-label">This Week</span>
        <span className="stat-value">{stats.thisWeek}</span>
      </div>
      <div className="stat-item stat-active">
        <span className="stat-label">This Month</span>
        <span className="stat-value">{stats.thisMonth}</span>
      </div>
      <div className="stat-item stat-converted">
        <span className="stat-label">With Email</span>
        <span className="stat-value">{stats.withEmail}</span>
      </div>
      <div className="stat-item stat-lost">
        <span className="stat-label">States</span>
        <span className="stat-value">{stats.uniqueStates}</span>
      </div>
    </div>
  );
}
