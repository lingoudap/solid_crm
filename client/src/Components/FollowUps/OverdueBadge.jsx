import React from "react";
import "./css/OverdueBadge.css";

/**
 * OverdueBadge Component
 * Displays visual indicator for overdue follow-ups
 *
 * Props:
 * - isOverdue: Boolean - Whether the follow-up is overdue
 * - daysOverdue: Number - How many days overdue
 * - priority: String - Priority level (low, medium, high, critical)
 * - compact: Boolean - Compact size variant
 */

const OverdueBadge = ({ isOverdue, daysOverdue = 0, priority = "medium", compact = false }) => {
  if (!isOverdue) {
    return null;
  }

  const getPriorityClass = () => {
    if (daysOverdue >= 7) return "critical";
    if (daysOverdue >= 3) return "high";
    return "medium";
  };

  const priorityLevel = priority || getPriorityClass();

  const getDaysText = () => {
    if (daysOverdue === 0) return "Today";
    if (daysOverdue === 1) return "1 day";
    return `${daysOverdue} days`;
  };

  return (
    <span className={`overdue-badge ${priorityLevel} ${compact ? "compact" : ""}`}>
      <span className="badge-icon">⚠️</span>
      <span className="badge-text">
        {getDaysText()} overdue
      </span>
    </span>
  );
};

export default OverdueBadge;
