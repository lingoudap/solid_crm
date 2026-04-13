import { useState, useEffect, useRef } from 'react';
import './Reports.css';

const ReportDetails = ({ reportId, onBack }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [activeTab, setActiveTab] = useState('data');
  const [searchData, setSearchData] = useState('');
  const [dataPage, setDataPage] = useState(1);
  const [regenerating, setRegenerating] = useState(false);
  const dataPageSize = 25;
  const printRef = useRef(null);

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      setReport(data);
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

  const handleRegenerateReport = async () => {
    try {
      setRegenerating(true);
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/generate`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to regenerate report');
      const data = await response.json();
      setReport(data);
      showMessage('Report regenerated with latest data!', 'success');
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteReport = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete report');
      showMessage('Report deleted successfully', 'success');
      setTimeout(() => onBack(), 1500);
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      showMessage('Please enter a template name', 'error');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName })
      });
      if (!response.ok) throw new Error('Failed to save template');
      showMessage('Saved as template!', 'success');
      setTemplateName('');
      setShowTemplateForm(false);
      fetchReportDetails();
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    }
  };

  const downloadReportCSV = () => {
    if (!report?.generatedData?.data?.length) return;
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

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>${report.reportName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #333; }
          h1 { font-size: 24px; margin-bottom: 5px; }
          .print-meta { color: #666; font-size: 13px; margin-bottom: 20px; }
          .print-section { margin-bottom: 20px; }
          .print-section h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 2px solid #eee; padding-bottom: 5px; }
          .print-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 10px 0; }
          .print-grid div { padding: 8px; background: #f9f9f9; border-radius: 4px; }
          .print-grid strong { display: block; font-size: 11px; color: #999; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f5f5f5; font-weight: 600; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${report.reportName}</h1>
        <div class="print-meta">
          Type: ${report.reportType} | Generated: ${report.lastGeneratedAt ? new Date(report.lastGeneratedAt).toLocaleString() : 'N/A'} | Records: ${report.generatedData?.count || 0}
        </div>
        ${report.description ? `<p>${report.description}</p>` : ''}
        ${report.generatedData?.data ? `
          <table>
            <thead><tr>${Object.keys(report.generatedData.data[0] || {}).map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${report.generatedData.data.map(row => `<tr>${Object.values(row).map(v => `<td>${typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : typeof v === 'object' ? JSON.stringify(v) : v}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        ` : ''}
        <div style="margin-top: 30px; font-size: 11px; color: #999; text-align: center;">
          Generated from CRM Reports | ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const reportTypeLabels = {
    'sales-summary': { label: 'Sales Summary', icon: '💰', color: '#10b981' },
    'item-wise': { label: 'Item-wise', icon: '📦', color: '#f59e0b' },
    'customer-wise': { label: 'Customer-wise', icon: '👥', color: '#8b5cf6' },
    'date-wise': { label: 'Date-wise', icon: '📅', color: '#3b82f6' },
    'lead-conversion': { label: 'Lead Conversion', icon: '🎯', color: '#ef4444' },
    'quotation-status': { label: 'Quotation Status', icon: '📝', color: '#ec4899' },
  };

  const fieldLabels = {
    metric: 'Metric', value: 'Value', orderCount: 'Order Count', totalQuantity: 'Total Qty',
    averageOrderValue: 'Avg Order Value', item: 'Item', totalSales: 'Total Sales',
    averagePrice: 'Avg Price', customer: 'Customer', email: 'Email', phone: 'Phone',
    totalSpent: 'Total Spent', date: 'Date', totalLeads: 'Total Leads',
    convertedLeads: 'Converted', conversionRate: 'Conversion Rate', pendingLeads: 'Pending Leads',
    status: 'Status', count: 'Count', totalValue: 'Total Value',
  };

  // Data table filtering and pagination
  const tableData = report?.generatedData?.data || [];
  const filteredData = searchData
    ? tableData.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(searchData.toLowerCase())))
    : tableData;
  const totalDataPages = Math.ceil(filteredData.length / dataPageSize);
  const paginatedData = filteredData.slice((dataPage - 1) * dataPageSize, dataPage * dataPageSize);

  // Summary calculations
  const dataSummary = (() => {
    if (!tableData.length) return null;
    const numericFields = Object.keys(tableData[0]).filter(k => typeof tableData[0][k] === 'number');
    if (!numericFields.length) return null;
    const summary = {};
    numericFields.forEach(field => {
      const values = tableData.map(r => r[field]);
      summary[field] = {
        total: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });
    return summary;
  })();

  if (loading && !report) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner" />
        <p>Loading report details...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="reports-empty">
        <div className="empty-icon">❌</div>
        <h3>Report not found</h3>
        <button onClick={onBack} className="btn-wizard btn-back">Go Back</button>
      </div>
    );
  }

  const typeInfo = reportTypeLabels[report.reportType] || { label: report.reportType, icon: '📊', color: '#6b7280' };

  return (
    <div className="report-details-modern" ref={printRef}>
      {/* Breadcrumb & Header */}
      <div className="details-header-modern">
        <button onClick={onBack} className="btn-back-modern" title="Go back">
          ← Back to Reports
        </button>
        <div className="header-content">
          <div className="header-info">
            <div className="header-title-row">
              <h1>{report.reportName}</h1>
              <span className={`type-badge ${report.reportType}`}>
                {typeInfo.icon} {typeInfo.label}
              </span>
              {report.isTemplate && <span className="template-tag">Template</span>}
            </div>
            {report.description && <p className="header-description">{report.description}</p>}
          </div>
          <div className="header-actions">
            <button onClick={handleRegenerateReport} disabled={regenerating} className="btn-wizard btn-preview" title="Regenerate with fresh data">
              {regenerating ? 'Regenerating...' : '↻ Regenerate'}
            </button>
            <button onClick={downloadReportCSV} disabled={!report.generatedData?.data?.length} className="btn-wizard btn-download" title="Download CSV">
              ↓ CSV
            </button>
            <button onClick={handlePrint} className="btn-wizard btn-next" title="Print report">
              Print
            </button>
            <button onClick={() => setShowTemplateForm(!showTemplateForm)} disabled={report.isTemplate} className="btn-wizard btn-back" title="Save as template">
              ★ Template
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`report-message ${message.type}`}>
          <span>{message.type === 'success' ? '✓' : '✕'} {message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="msg-close">✕</button>
        </div>
      )}

      {/* Template Form */}
      {showTemplateForm && (
        <div className="template-form-inline">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name..."
            className="template-name-input"
          />
          <button onClick={handleSaveAsTemplate} className="btn-wizard btn-create">Save</button>
          <button onClick={() => { setShowTemplateForm(false); setTemplateName(''); }} className="btn-wizard btn-back">Cancel</button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="detail-stats">
        <div className="detail-stat">
          <span className="detail-stat-value">{report.generatedData?.count || 0}</span>
          <span className="detail-stat-label">Records</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-value">{report.selectedFields?.length || 'All'}</span>
          <span className="detail-stat-label">Fields</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-value">{report.includeGraphs ? report.graphType : 'None'}</span>
          <span className="detail-stat-label">Chart Type</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-value">{report.lastGeneratedAt ? new Date(report.lastGeneratedAt).toLocaleDateString() : 'N/A'}</span>
          <span className="detail-stat-label">Last Generated</span>
        </div>
        <div className="detail-stat">
          <span className="detail-stat-value">{new Date(report.createdAt).toLocaleDateString()}</span>
          <span className="detail-stat-label">Created</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>
          Data Table
        </button>
        <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
          Summary
        </button>
        <button className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
          Configuration
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="data-tab fade-in">
            {tableData.length > 0 ? (
              <>
                <div className="data-toolbar">
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      value={searchData}
                      onChange={(e) => { setSearchData(e.target.value); setDataPage(1); }}
                      placeholder="Search in data..."
                      className="search-input"
                    />
                    {searchData && <button className="search-clear" onClick={() => setSearchData('')}>✕</button>}
                  </div>
                  <span className="data-count">{filteredData.length} records</span>
                </div>

                <div className="table-wrapper-modern">
                  <table className="data-table-modern">
                    <thead>
                      <tr>
                        <th className="row-num">#</th>
                        {Object.keys(tableData[0]).map(header => (
                          <th key={header}>{fieldLabels[header] || header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="row-num">{(dataPage - 1) * dataPageSize + idx + 1}</td>
                          {Object.entries(row).map(([key, val], i) => (
                            <td key={i} className={typeof val === 'number' ? 'numeric' : ''}>
                              {typeof val === 'number'
                                ? val.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalDataPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={dataPage === 1} onClick={() => setDataPage(1)}>«</button>
                    <button className="page-btn" disabled={dataPage === 1} onClick={() => setDataPage(p => p - 1)}>‹</button>
                    <span className="page-info">Page {dataPage} of {totalDataPages}</span>
                    <button className="page-btn" disabled={dataPage === totalDataPages} onClick={() => setDataPage(p => p + 1)}>›</button>
                    <button className="page-btn" disabled={dataPage === totalDataPages} onClick={() => setDataPage(totalDataPages)}>»</button>
                  </div>
                )}
              </>
            ) : (
              <div className="reports-empty">
                <div className="empty-icon">📭</div>
                <h3>No data generated yet</h3>
                <p>Click "Regenerate" to generate report data</p>
              </div>
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="summary-tab fade-in">
            {dataSummary ? (
              <div className="summary-grid">
                {Object.entries(dataSummary).map(([field, stats]) => (
                  <div key={field} className="summary-card">
                    <h4>{fieldLabels[field] || field}</h4>
                    <div className="summary-stats">
                      <div className="summary-stat">
                        <span className="summary-stat-label">Total</span>
                        <span className="summary-stat-value">{stats.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="summary-stat">
                        <span className="summary-stat-label">Average</span>
                        <span className="summary-stat-value">{stats.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="summary-stat">
                        <span className="summary-stat-label">Min</span>
                        <span className="summary-stat-value">{stats.min.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="summary-stat">
                        <span className="summary-stat-label">Max</span>
                        <span className="summary-stat-value">{stats.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="reports-empty">
                <div className="empty-icon">📊</div>
                <h3>No numeric data to summarize</h3>
                <p>The summary tab shows aggregate statistics for numeric fields</p>
              </div>
            )}
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="config-tab fade-in">
            <div className="config-grid">
              <div className="config-section">
                <h4>Report Information</h4>
                <div className="config-items">
                  <div className="config-item"><span className="config-label">Report ID</span><span className="config-value">#{report.reportId}</span></div>
                  <div className="config-item"><span className="config-label">Type</span><span className="config-value">{typeInfo.icon} {typeInfo.label}</span></div>
                  <div className="config-item"><span className="config-label">Created</span><span className="config-value">{new Date(report.createdAt).toLocaleString()}</span></div>
                  <div className="config-item"><span className="config-label">Updated</span><span className="config-value">{new Date(report.updatedAt).toLocaleString()}</span></div>
                  <div className="config-item"><span className="config-label">Is Template</span><span className="config-value">{report.isTemplate ? 'Yes' : 'No'}</span></div>
                </div>
              </div>

              {report.filters && Object.values(report.filters).some(v => v) && (
                <div className="config-section">
                  <h4>Filters Applied</h4>
                  <div className="config-items">
                    {report.filters.dateFrom && <div className="config-item"><span className="config-label">Date From</span><span className="config-value">{new Date(report.filters.dateFrom).toLocaleDateString()}</span></div>}
                    {report.filters.dateTo && <div className="config-item"><span className="config-label">Date To</span><span className="config-value">{new Date(report.filters.dateTo).toLocaleDateString()}</span></div>}
                    {report.filters.customer && <div className="config-item"><span className="config-label">Customer</span><span className="config-value">{report.filters.customer}</span></div>}
                    {report.filters.item && <div className="config-item"><span className="config-label">Item</span><span className="config-value">{report.filters.item}</span></div>}
                    {report.filters.status && <div className="config-item"><span className="config-label">Status</span><span className="config-value">{report.filters.status}</span></div>}
                  </div>
                </div>
              )}

              <div className="config-section">
                <h4>Display Settings</h4>
                <div className="config-items">
                  {report.groupBy && <div className="config-item"><span className="config-label">Group By</span><span className="config-value">{report.groupBy}</span></div>}
                  <div className="config-item"><span className="config-label">Charts</span><span className="config-value">{report.includeGraphs ? `${report.graphType} chart` : 'Disabled'}</span></div>
                  <div className="config-item"><span className="config-label">Fields</span><span className="config-value">{report.selectedFields?.map(f => fieldLabels[f] || f).join(', ') || 'All fields'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="danger-zone">
        <h4>Danger Zone</h4>
        <p>Permanently delete this report and all its data.</p>
        <button onClick={handleDeleteReport} className="btn-wizard btn-danger">
          Delete Report
        </button>
      </div>
    </div>
  );
};

export default ReportDetails;
