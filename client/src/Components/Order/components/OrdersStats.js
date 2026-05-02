import React from "react";

const STATS = [
  { key: "total", label: "Total" },
  { key: "new", label: "New" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersStats({ stats }) {
  return (
    <div className="ot-stats-bar">
      {STATS.map(({ key, label }) => (
        <div key={key} className={`ot-stat-item ot-stat-${key}`}>
          <span className="ot-stat-label">{label}</span>
          <span className="ot-stat-value">{stats[key] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
