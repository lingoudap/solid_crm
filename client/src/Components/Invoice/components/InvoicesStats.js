import React from "react";

const STATS = [
  { key: "total", label: "Total" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
  { key: "cancelled", label: "Cancelled" },
];

export default function InvoicesStats({ stats }) {
  return (
    <div className="iv-stats-bar">
      {STATS.map(({ key, label }) => (
        <div key={key} className={`iv-stat-item iv-stat-${key}`}>
          <span className="iv-stat-label">{label}</span>
          <span className="iv-stat-value">{stats[key] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
