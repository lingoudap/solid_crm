import React, { useState } from "react";
import "./css/OverdueFilter.css";

/**
 * OverdueFilter Component
 * Provides filtering options for overdue follow-ups
 *
 * Props:
 * - onFilter: Function - Callback when filter changes
 * - stats: Object - Overdue statistics
 */

const OverdueFilter = ({ onFilter, stats = {} }) => {
  const [filters, setFilters] = useState({
    showOverdueOnly: false,
    priorityLevel: "all", // all, critical, high, medium
    daysOverdue: "all", // all, today, week, month
  });

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    // Call parent callback
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const resetFilters = () => {
    const defaultFilters = {
      showOverdueOnly: false,
      priorityLevel: "all",
      daysOverdue: "all",
    };
    setFilters(defaultFilters);
    if (onFilter) {
      onFilter(defaultFilters);
    }
  };

  return (
    <div className="overdue-filter">
      <div className="filter-header">
        <h3>🚨 Overdue Filters</h3>
        {(filters.showOverdueOnly ||
          filters.priorityLevel !== "all" ||
          filters.daysOverdue !== "all") && (
          <button className="reset-button" onClick={resetFilters}>
            Reset
          </button>
        )}
      </div>

      {/* Show Overdue Only Toggle */}
      <div className="filter-section">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.showOverdueOnly}
            onChange={(e) =>
              handleFilterChange("showOverdueOnly", e.target.checked)
            }
          />
          <span>Show Overdue Only</span>
        </label>
      </div>

      {/* Priority Level Filter */}
      <div className="filter-section">
        <label className="filter-label">Priority Level</label>
        <div className="filter-options">
          <button
            className={`filter-option ${filters.priorityLevel === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("priorityLevel", "all")}
          >
            All
          </button>
          <button
            className={`filter-option critical ${filters.priorityLevel === "critical" ? "active" : ""}`}
            onClick={() => handleFilterChange("priorityLevel", "critical")}
            title={`Critical: ${stats.criticalOverdue || 0}`}
          >
            🔴 Critical ({stats.criticalOverdue || 0})
          </button>
          <button
            className={`filter-option high ${filters.priorityLevel === "high" ? "active" : ""}`}
            onClick={() => handleFilterChange("priorityLevel", "high")}
            title={`High: ${stats.highPriorityOverdue || 0}`}
          >
            🟠 High ({stats.highPriorityOverdue || 0})
          </button>
          <button
            className={`filter-option medium ${filters.priorityLevel === "medium" ? "active" : ""}`}
            onClick={() => handleFilterChange("priorityLevel", "medium")}
            title={`Medium: ${stats.mediumOverdue || 0}`}
          >
            🟡 Medium ({stats.mediumOverdue || 0})
          </button>
        </div>
      </div>

      {/* Days Overdue Filter */}
      <div className="filter-section">
        <label className="filter-label">Days Overdue</label>
        <div className="filter-options">
          <button
            className={`filter-option ${filters.daysOverdue === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("daysOverdue", "all")}
          >
            All
          </button>
          <button
            className={`filter-option ${filters.daysOverdue === "today" ? "active" : ""}`}
            onClick={() => handleFilterChange("daysOverdue", "today")}
          >
            Today
          </button>
          <button
            className={`filter-option ${filters.daysOverdue === "week" ? "active" : ""}`}
            onClick={() => handleFilterChange("daysOverdue", "week")}
          >
            This Week
          </button>
          <button
            className={`filter-option ${filters.daysOverdue === "month" ? "active" : ""}`}
            onClick={() => handleFilterChange("daysOverdue", "month")}
          >
            This Month
          </button>
          <button
            className={`filter-option ${filters.daysOverdue === "older" ? "active" : ""}`}
            onClick={() => handleFilterChange("daysOverdue", "older")}
          >
            Older
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="filter-summary">
        <div className="summary-item">
          <span className="label">Total Overdue:</span>
          <span className="value critical">{stats.totalOverdue || 0}</span>
        </div>
        {stats.criticalOverdue > 0 && (
          <div className="summary-item alert">
            <span className="label">🔴 Critical:</span>
            <span className="value">{stats.criticalOverdue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverdueFilter;
