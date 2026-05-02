import React from "react";

export default function LeadsStats({ stats }) {
  return (
    <div className="leads-stats-bar">
      <div className="stat-item">
        <span className="stat-label">Total</span>
        <span className="stat-value">{stats.total}</span>
      </div>
      <div className="stat-item stat-new">
        <span className="stat-label">New</span>
        <span className="stat-value">{stats.new}</span>
      </div>
      <div className="stat-item stat-active">
        <span className="stat-label">Active</span>
        <span className="stat-value">{stats.active}</span>
      </div>
      <div className="stat-item stat-converted">
        <span className="stat-label">Converted</span>
        <span className="stat-value">{stats.converted}</span>
      </div>
      <div className="stat-item stat-lost">
        <span className="stat-label">Lost</span>
        <span className="stat-value">{stats.lost}</span>
      </div>
    </div>
  );
}
