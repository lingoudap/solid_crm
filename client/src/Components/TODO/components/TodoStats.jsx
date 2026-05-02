import React from "react";

export default function TodoStats({ stats }) {
  return (
    <div className="stats">
      <div className="stat-item">
        <span>Total</span>
        <span>{stats.total}</span>
      </div>
      <div className="stat-item">
        <span>Completed</span>
        <span>{stats.completed}</span>
      </div>
      <div className="stat-item">
        <span>Pending</span>
        <span>{stats.pending}</span>
      </div>
      <div className="stat-item">
        <span>Overdue</span>
        <span className={stats.overdue > 0 ? "overdue" : ""}>
          {stats.overdue}
        </span>
      </div>
    </div>
  );
}
