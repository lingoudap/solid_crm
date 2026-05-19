/**
 * FollowUpFilters Component
 * Advanced filtering and search functionality
 */

import React, { useCallback } from 'react';
import { debounce } from '../../utils/helpers';
import { FOLLOW_UP_STATUS, SORT_OPTIONS } from '../../constants/config';
import '../../../styles/followup-filters.css';

const FollowUpFilters = ({
  filterStatus,
  onFilterStatusChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onReset
}) => {
  // Debounced search handler
  const handleSearchDebounce = useCallback(
    debounce((query) => {
      onSearchChange(query);
    }, 300),
    [onSearchChange]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    handleSearchDebounce(value);
  };

  const handleReset = () => {
    onFilterStatusChange('all');
    onSearchChange('');
    onStartDateChange(null);
    onEndDateChange(null);
    onSortChange('date-desc');
    if (onReset) onReset();
  };

  return (
    <div className="followup-filters">
      <div className="filters-row">
        {/* Search */}
        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search by name, email, or notes..."
            defaultValue={searchQuery}
            onChange={handleSearchChange}
            className="filter-input search-input"
          />
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            {Object.entries(FOLLOW_UP_STATUS).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="filter-group">
          <label htmlFor="sort">Sort By</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filters-row">
        {/* Start Date */}
        <div className="filter-group">
          <label htmlFor="startDate">From Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              onStartDateChange(date);
            }}
            className="filter-input"
          />
        </div>

        {/* End Date */}
        <div className="filter-group">
          <label htmlFor="endDate">To Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              onEndDateChange(date);
            }}
            className="filter-input"
          />
        </div>

        {/* Reset Button */}
        <div className="filter-group button-group">
          <button
            onClick={handleReset}
            className="filter-button reset-button"
            title="Reset all filters"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpFilters;
