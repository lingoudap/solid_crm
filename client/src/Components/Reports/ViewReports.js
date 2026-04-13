import { useState, useEffect, useMemo } from 'react';
import './Reports.css';

const ViewReports = ({ onViewReport }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const pageSize = 9;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/reports/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    if (type !== 'error') setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete report');
      showMessage('Report deleted successfully', 'success');
      setDeleteConfirm(null);
      fetchReports();
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    }
  };

  const downloadReportCSV = (report) => {
    if (!report.generatedData || !report.generatedData.data || report.generatedData.data.length === 0) return;
    const headers = Object.keys(report.generatedData.data[0]);
    const csv = [
      headers.join(','),
      ...report.generatedData.data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reportTypeLabels = {
    'sales-summary': { label: 'Sales Summary', icon: '💰' },
    'item-wise': { label: 'Item-wise', icon: '📦' },
    'customer-wise': { label: 'Customer-wise', icon: '👥' },
    'date-wise': { label: 'Date-wise', icon: '📅' },
    'lead-conversion': { label: 'Lead Conversion', icon: '🎯' },
    'quotation-status': { label: 'Quotation Status', icon: '📝' },
  };

  // Filter, search, sort
  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.reportName.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        r.reportType.toLowerCase().includes(q)
      );
    }

    if (filterType) {
      result = result.filter(r => r.reportType === filterType);
    }

    result.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'reportName':
          valA = a.reportName.toLowerCase();
          valB = b.reportName.toLowerCase();
          break;
        case 'reportType':
          valA = a.reportType;
          valB = b.reportType;
          break;
        case 'records':
          valA = a.generatedData?.count || 0;
          valB = b.generatedData?.count || 0;
          break;
        default:
          valA = new Date(a.createdAt);
          valB = new Date(b.createdAt);
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [reports, searchQuery, filterType, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = filteredReports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterType, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const typeCount = {};
    let totalRecords = 0;
    let templateCount = 0;
    reports.forEach(r => {
      typeCount[r.reportType] = (typeCount[r.reportType] || 0) + 1;
      totalRecords += r.generatedData?.count || 0;
      if (r.isTemplate) templateCount++;
    });
    return { total: reports.length, typeCount, totalRecords, templateCount };
  }, [reports]);

  const getTypeDistribution = () => {
    const types = Object.keys(reportTypeLabels);
    return types.map(t => ({
      type: t,
      ...reportTypeLabels[t],
      count: stats.typeCount[t] || 0,
    }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  if (loading && reports.length === 0) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner" />
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="view-reports-container">
      {/* Stats Bar */}
      <div className="reports-stats-bar">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Reports</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalRecords.toLocaleString()}</span>
          <span className="stat-label">Total Records</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.templateCount}</span>
          <span className="stat-label">Templates</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{Object.keys(stats.typeCount).length}</span>
          <span className="stat-label">Report Types</span>
        </div>
      </div>

      {/* Type Distribution */}
      {reports.length > 0 && (
        <div className="type-distribution">
          {getTypeDistribution().filter(t => t.count > 0).map(t => (
            <button
              key={t.type}
              className={`type-pill ${filterType === t.type ? 'active' : ''}`}
              onClick={() => setFilterType(filterType === t.type ? '' : t.type)}
            >
              <span>{t.icon}</span> {t.label} <span className="pill-count">{t.count}</span>
            </button>
          ))}
          {filterType && (
            <button className="type-pill clear-pill" onClick={() => setFilterType('')}>
              Clear filter ✕
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="reports-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports..."
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        <div className="toolbar-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="toolbar-select">
            <option value="createdAt">Date Created</option>
            <option value="reportName">Name</option>
            <option value="reportType">Type</option>
            <option value="records">Records</option>
          </select>

          <button
            className="sort-toggle"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ▦
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>

          <button onClick={fetchReports} className="btn-toolbar-refresh" title="Refresh">
            ↻
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`report-message ${message.type}`}>
          <span>{message.type === 'success' ? '✓' : '✕'} {message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="msg-close">✕</button>
        </div>
      )}

      {/* Results info */}
      {(searchQuery || filterType) && (
        <div className="results-info">
          Showing {filteredReports.length} of {reports.length} reports
          {searchQuery && <span> matching "{searchQuery}"</span>}
          {filterType && <span> of type "{reportTypeLabels[filterType]?.label}"</span>}
        </div>
      )}

      {/* Empty State */}
      {reports.length === 0 ? (
        <div className="reports-empty">
          <div className="empty-icon">📊</div>
          <h3>No reports yet</h3>
          <p>Create your first report from the "Add" tab to start analyzing your data</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="reports-empty">
          <div className="empty-icon">🔍</div>
          <h3>No matching reports</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button className="btn-wizard btn-back" onClick={() => { setSearchQuery(''); setFilterType(''); }}>
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="reports-grid">
              {paginatedReports.map(report => (
                <div key={report._id} className="report-card-modern" onClick={() => onViewReport && onViewReport(report._id)}>
                  <div className="card-top-accent" data-type={report.reportType} />
                  <div className="card-header-modern">
                    <div className="card-title-row">
                      <h3>{report.reportName}</h3>
                      {report.isTemplate && <span className="template-tag">Template</span>}
                    </div>
                    <span className={`type-badge ${report.reportType}`}>
                      {reportTypeLabels[report.reportType]?.icon} {reportTypeLabels[report.reportType]?.label}
                    </span>
                  </div>

                  <div className="card-body-modern">
                    <p className="card-description">{report.description || 'No description provided'}</p>
                    <div className="card-meta">
                      <div className="meta-item">
                        <span className="meta-label">Created</span>
                        <span className="meta-value">{formatDate(report.createdAt)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Records</span>
                        <span className="meta-value">{(report.generatedData?.count || 0).toLocaleString()}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Last Generated</span>
                        <span className="meta-value">{formatDate(report.lastGeneratedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions-modern" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewReport && onViewReport(report._id)}
                      className="card-action-btn view"
                      title="View details"
                    >
                      View
                    </button>
                    <button
                      onClick={() => downloadReportCSV(report)}
                      className="card-action-btn download"
                      disabled={!report.generatedData}
                      title="Download CSV"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(report._id)}
                      className="card-action-btn delete"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="reports-list">
              <div className="list-header">
                <span className="list-col name">Report Name</span>
                <span className="list-col type">Type</span>
                <span className="list-col records">Records</span>
                <span className="list-col date">Created</span>
                <span className="list-col date">Last Generated</span>
                <span className="list-col actions">Actions</span>
              </div>
              {paginatedReports.map(report => (
                <div key={report._id} className="list-row" onClick={() => onViewReport && onViewReport(report._id)}>
                  <span className="list-col name">
                    {report.reportName}
                    {report.isTemplate && <span className="template-tag-sm">T</span>}
                  </span>
                  <span className="list-col type">
                    <span className={`type-badge-sm ${report.reportType}`}>
                      {reportTypeLabels[report.reportType]?.icon} {reportTypeLabels[report.reportType]?.label}
                    </span>
                  </span>
                  <span className="list-col records">{(report.generatedData?.count || 0).toLocaleString()}</span>
                  <span className="list-col date">{formatDate(report.createdAt)}</span>
                  <span className="list-col date">{formatDate(report.lastGeneratedAt)}</span>
                  <span className="list-col actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onViewReport && onViewReport(report._id)} className="list-action-btn" title="View">View</button>
                    <button onClick={() => downloadReportCSV(report)} className="list-action-btn" disabled={!report.generatedData} title="CSV">CSV</button>
                    <button onClick={() => setDeleteConfirm(report._id)} className="list-action-btn delete" title="Delete">Delete</button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First page"
              >
                «
              </button>
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                ‹
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                ›
              </button>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Last page"
              >
                »
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="confirm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Report</h3>
            <p>Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button onClick={() => setDeleteConfirm(null)} className="btn-wizard btn-back">Cancel</button>
              <button onClick={() => handleDeleteReport(deleteConfirm)} className="btn-wizard btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReports;
