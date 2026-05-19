import React, { useState, useCallback, useMemo, useEffect } from "react";
import "./FollowUpTable.css";

/**
 * Professional CRM Follow-Up Table Component
 * Features: Pagination, Search, Sorting, Filtering, Bulk Selection, Export
 */

// =====================================================
// Status Badge Component
// =====================================================
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" },
    "In Progress": { bg: "bg-blue-100", text: "text-blue-800", icon: "🔄" },
    Completed: { bg: "bg-green-100", text: "text-green-800", icon: "✅" },
    Rescheduled: { bg: "bg-purple-100", text: "text-purple-800", icon: "📅" },
    Cancelled: { bg: "bg-gray-100", text: "text-gray-800", icon: "❌" },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span className={`badge badge-status ${config.bg} ${config.text}`}>
      {config.icon} {status}
    </span>
  );
};

// =====================================================
// Priority Badge Component
// =====================================================
const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    critical: { bg: "bg-red-100", text: "text-red-800", icon: "🔴" },
    high: { bg: "bg-orange-100", text: "text-orange-800", icon: "🟠" },
    medium: { bg: "bg-blue-100", text: "text-blue-800", icon: "🔵" },
    low: { bg: "bg-gray-100", text: "text-gray-800", icon: "⚪" },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`badge badge-priority ${config.bg} ${config.text}`}>
      {config.icon} {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// =====================================================
// Row Actions Component
// =====================================================
const RowActions = ({ followUp, onEdit, onDelete, onComplete, onReschedule, onViewTimeline }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="row-actions">
      <button
        className="action-btn action-btn-primary"
        onClick={() => onEdit(followUp)}
        title="Edit follow-up"
      >
        ✎
      </button>

      <button
        className={`action-btn ${
          followUp.status === "Completed" ? "action-btn-disabled" : "action-btn-success"
        }`}
        onClick={() => onComplete(followUp._id)}
        disabled={followUp.status === "Completed"}
        title="Mark as completed"
      >
        ✓
      </button>

      <button
        className="action-btn action-btn-info"
        onClick={() => onReschedule(followUp)}
        title="Reschedule follow-up"
      >
        📅
      </button>

      <button
        className="action-btn action-btn-info"
        onClick={() => onViewTimeline(followUp)}
        title="View timeline"
      >
        📈
      </button>

      <div className="dropdown">
        <button
          className="action-btn action-btn-menu"
          onClick={() => setShowMenu(!showMenu)}
          title="More options"
        >
          ⋮
        </button>
        {showMenu && (
          <div className="dropdown-menu">
            <button
              className="dropdown-item dropdown-item-danger"
              onClick={() => {
                onDelete(followUp._id);
                setShowMenu(false);
              }}
            >
              Delete
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                navigator.clipboard.writeText(followUp._id);
                setShowMenu(false);
              }}
            >
              Copy ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// Filter Controls Component
// =====================================================
const FilterControls = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterPriority,
  onPriorityChange,
  onReset,
}) => {
  return (
    <div className="filter-controls">
      <div className="filter-group">
        <input
          type="text"
          placeholder="🔍 Search by customer name, email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Rescheduled">Rescheduled</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="filter-group">
        <select
          value={filterPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <button onClick={onReset} className="btn-reset">
        Reset Filters
      </button>
    </div>
  );
};

// =====================================================
// Loading Skeleton Component
// =====================================================
const LoadingSkeleton = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="skeleton-row">
        <td>
          <div className="skeleton skeleton-checkbox"></div>
        </td>
        <td>
          <div className="skeleton skeleton-text skeleton-name"></div>
        </td>
        <td>
          <div className="skeleton skeleton-text skeleton-short"></div>
        </td>
        <td>
          <div className="skeleton skeleton-text skeleton-date"></div>
        </td>
        <td>
          <div className="skeleton skeleton-text skeleton-short"></div>
        </td>
        <td>
          <div className="skeleton skeleton-badge"></div>
        </td>
        <td>
          <div className="skeleton skeleton-badge"></div>
        </td>
        <td>
          <div className="skeleton skeleton-text skeleton-short"></div>
        </td>
        <td>
          <div className="skeleton skeleton-text"></div>
        </td>
        <td>
          <div className="skeleton skeleton-text skeleton-date"></div>
        </td>
        <td>
          <div className="skeleton skeleton-actions"></div>
        </td>
      </tr>
    ))}
  </>
);

// =====================================================
// Empty State Component
// =====================================================
const EmptyState = ({ searchQuery, filterStatus, filterPriority }) => (
  <div className="empty-state">
    <div className="empty-state-icon">📭</div>
    <h3>No Follow-Ups Found</h3>
    <p>
      {searchQuery || filterStatus || filterPriority
        ? "Try adjusting your filters or search criteria"
        : "No follow-ups created yet. Create one to get started!"}
    </p>
    {(searchQuery || filterStatus || filterPriority) && (
      <p className="empty-state-hint">Current filters: {[searchQuery, filterStatus, filterPriority].filter(Boolean).join(", ")}</p>
    )}
  </div>
);

// =====================================================
// Pagination Component
// =====================================================
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, total }) => (
  <div className="pagination">
    <div className="pagination-info">
      Showing 1-{itemsPerPage} of {total} items
    </div>

    <div className="pagination-controls">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        ← Previous
      </button>

      <div className="page-numbers">
        {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`page-number ${currentPage === pageNum ? "active" : ""}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Next →
      </button>

      <select
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
        className="items-per-page"
      >
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
        <option value={100}>100 per page</option>
      </select>
    </div>
  </div>
);

// =====================================================
// Main Follow-Up Table Component
// =====================================================
const FollowUpTable = ({
  followUps = [],
  loading = false,
  onEdit = () => {},
  onDelete = () => {},
  onComplete = () => {},
  onReschedule = () => {},
  onViewTimeline = () => {},
  onExportCSV = () => {},
  onBulkDelete = () => {},
  onBulkStatusChange = () => {},
}) => {
  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortField, setSortField] = useState("followUpDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filtering Logic
  const filteredFollowUps = useMemo(() => {
    return followUps.filter((followUp) => {
      const matchesSearch =
        !searchQuery ||
        followUp.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        followUp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        followUp.remark?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filterStatus || followUp.status === filterStatus;
      const matchesPriority = !filterPriority || followUp.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [followUps, searchQuery, filterStatus, filterPriority]);

  // Sorting Logic
  const sortedFollowUps = useMemo(() => {
    const sorted = [...filteredFollowUps].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle nested fields
      if (sortField === "assignedUser") {
        aVal = a.assignedTo?.name || "";
        bVal = b.assignedTo?.name || "";
      }

      // Handle dates
      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();

      // Handle strings
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredFollowUps, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedFollowUps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFollowUps = sortedFollowUps.slice(startIndex, endIndex);

  // Handle Column Sort
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }, [sortField, sortOrder]);

  // Handle Select All
  const handleSelectAll = useCallback((e) => {
    if (e.target.checked) {
      const newSelected = new Set(paginatedFollowUps.map((fu) => fu._id));
      setSelectedIds(newSelected);
    } else {
      setSelectedIds(new Set());
    }
  }, [paginatedFollowUps]);

  // Handle Individual Row Select
  const handleRowSelect = useCallback((id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }, [selectedIds]);

  // Handle Filter Reset
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setFilterStatus("");
    setFilterPriority("");
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, []);

  // Handle CSV Export
  const handleExportCSV = useCallback(() => {
    const headers = [
      "Customer Name",
      "Type",
      "Follow-Up Date",
      "Time",
      "Status",
      "Priority",
      "Assigned User",
      "Last Remark",
      "Next Follow-Up",
    ];

    const rows = (selectedIds.size > 0 ? paginatedFollowUps.filter((fu) => selectedIds.has(fu._id)) : sortedFollowUps).map(
      (followUp) => [
        followUp.customerName || "N/A",
        followUp.relatedType || "N/A",
        followUp.followUpDate ? new Date(followUp.followUpDate).toLocaleDateString() : "N/A",
        followUp.followUpTime || "N/A",
        followUp.status || "N/A",
        followUp.priority || "N/A",
        followUp.assignedTo?.name || "Unassigned",
        followUp.remark || "N/A",
        followUp.nextFollowUp?.followUpDate
          ? new Date(followUp.nextFollowUp.followUpDate).toLocaleDateString()
          : "N/A",
      ]
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `followups_${new Date().getTime()}.csv`;
    link.click();

    onExportCSV?.();
  }, [sortedFollowUps, paginatedFollowUps, selectedIds, onExportCSV]);

  // Format Date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format Time
  const formatTime = (time) => {
    if (!time) return "N/A";
    return time; // Assuming already in HH:MM format
  };

  // Calculate days until
  const daysUntil = (date) => {
    if (!date) return null;
    const diff = new Date(date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="followup-table-container">
      {/* Header Section */}
      <div className="table-header-section">
        <div className="table-header-top">
          <h2 className="table-title">Follow-Ups</h2>
          <div className="header-actions">
            {selectedIds.size > 0 && (
              <div className="bulk-actions">
                <span className="selected-count">{selectedIds.size} selected</span>
                <button
                  className="btn btn-danger-outline"
                  onClick={() => {
                    onBulkDelete?.(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }}
                >
                  Delete Selected
                </button>
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={handleExportCSV}
              title="Export to CSV"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <FilterControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onPriorityChange={setFilterPriority}
          onReset={handleResetFilters}
        />
      </div>

      {/* Results Info */}
      <div className="results-info">
        {filteredFollowUps.length > 0 && (
          <p>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredFollowUps.length)} of{" "}
            {filteredFollowUps.length} follow-ups
          </p>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="followup-table">
          <thead className="table-header-sticky">
            <tr>
              <th className="col-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.size === paginatedFollowUps.length && paginatedFollowUps.length > 0}
                  onChange={handleSelectAll}
                  title="Select all on this page"
                />
              </th>
              <th
                className="sortable col-customer"
                onClick={() => handleSort("customerName")}
              >
                Customer {sortField === "customerName" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="sortable col-type"
                onClick={() => handleSort("relatedType")}
              >
                Type {sortField === "relatedType" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="sortable col-date"
                onClick={() => handleSort("followUpDate")}
              >
                Follow-Up Date {sortField === "followUpDate" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="sortable col-time"
                onClick={() => handleSort("followUpTime")}
              >
                Time {sortField === "followUpTime" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="sortable col-status"
                onClick={() => handleSort("status")}
              >
                Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="sortable col-priority"
                onClick={() => handleSort("priority")}
              >
                Priority {sortField === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="sortable col-assigned"
                onClick={() => handleSort("assignedUser")}
              >
                Assigned {sortField === "assignedUser" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="col-remark">Last Remark</th>
              <th
                className="sortable col-next"
                onClick={() => handleSort("nextFollowUp")}
              >
                Next Follow-Up {sortField === "nextFollowUp" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingSkeleton rows={itemsPerPage} />
            ) : paginatedFollowUps.length > 0 ? (
              paginatedFollowUps.map((followUp) => (
                <tr key={followUp._id} className="table-row">
                  <td className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(followUp._id)}
                      onChange={() => handleRowSelect(followUp._id)}
                    />
                  </td>
                  <td className="col-customer">
                    <div className="customer-info">
                      <div className="customer-name">{followUp.customerName || "N/A"}</div>
                      <div className="customer-email">{followUp.email || ""}</div>
                    </div>
                  </td>
                  <td className="col-type">{followUp.relatedType || "N/A"}</td>
                  <td className="col-date">
                    {formatDate(followUp.followUpDate)}
                    {daysUntil(followUp.followUpDate) !== null && (
                      <span className="days-until">
                        ({daysUntil(followUp.followUpDate) > 0
                          ? `in ${daysUntil(followUp.followUpDate)}d`
                          : "overdue"})
                      </span>
                    )}
                  </td>
                  <td className="col-time">{formatTime(followUp.followUpTime)}</td>
                  <td className="col-status">
                    <StatusBadge status={followUp.status} />
                  </td>
                  <td className="col-priority">
                    <PriorityBadge priority={followUp.priority} />
                  </td>
                  <td className="col-assigned">
                    <span className="assigned-user">
                      {followUp.assignedTo?.name || "Unassigned"}
                    </span>
                  </td>
                  <td className="col-remark">
                    <span className="remark-text" title={followUp.remark}>
                      {followUp.remark ? followUp.remark.substring(0, 30) + "..." : "N/A"}
                    </span>
                  </td>
                  <td className="col-next">
                    {followUp.nextFollowUp?.followUpDate
                      ? formatDate(followUp.nextFollowUp.followUpDate)
                      : "N/A"}
                  </td>
                  <td className="col-actions">
                    <RowActions
                      followUp={followUp}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onComplete={onComplete}
                      onReschedule={onReschedule}
                      onViewTimeline={onViewTimeline}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="empty-cell">
                  <EmptyState
                    searchQuery={searchQuery}
                    filterStatus={filterStatus}
                    filterPriority={filterPriority}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredFollowUps.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          total={filteredFollowUps.length}
        />
      )}
    </div>
  );
};

export default FollowUpTable;
