import React, { useState, useEffect } from 'react';
import './Reports.css';

const ViewReports = ({ onRefreshParent }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState('');

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
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete report');

      setMessage('✅ Report deleted successfully');
      setShowDetails(false);
      fetchReports();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleRegenerateReport = async (reportId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/generate`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to regenerate report');

      const data = await response.json();
      setSelectedReport(data);
      setMessage('✅ Report regenerated successfully');
      fetchReports();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTemplate = async (reportId) => {
    if (!templateName.trim()) {
      setMessage('❌ Please enter a template name');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName })
      });

      if (!response.ok) throw new Error('Failed to save template');

      setMessage('✅ Report saved as template successfully');
      setTemplateName('');
      setShowTemplateForm(false);
      fetchReports();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const downloadReportCSV = (report) => {
    if (!report.generatedData || !report.generatedData.data) return;

    const headers = Object.keys(report.generatedData.data[0]);
    const csv = [
      headers.join(','),
      ...report.generatedData.data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportName}.csv`;
    a.click();
  };

  if (loading && reports.length === 0) {
    return <div className="loading">⏳ Loading reports...</div>;
  }

  return (
    <div className="view-reports-container">
      <div className="reports-header">
        <h2>📊 Saved Reports</h2>
        <button onClick={fetchReports} className="btn-refresh">🔄 Refresh</button>
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
          <button onClick={() => setMessage('')} style={{ marginLeft: '10px', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="empty-state">
          <p>📋 No reports created yet</p>
          <p style={{ fontSize: '14px', color: '#666' }}>Create your first report from the "Add Report" section</p>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map(report => (
            <div key={report._id} className="report-card">
              <div className="report-card-header">
                <h3>{report.reportName}</h3>
                <span className={`report-badge ${report.reportType}`}>{report.reportType}</span>
              </div>

              <div className="report-card-content">
                <p><strong>Description:</strong> {report.description || 'No description'}</p>
                <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Generated:</strong> {report.lastGeneratedAt ? new Date(report.lastGeneratedAt).toLocaleDateString() : 'Not generated yet'}</p>
                <p><strong>Records:</strong> {report.generatedData?.count || 0}</p>
                {report.isTemplate && <p className="template-badge">⭐ Template</p>}
              </div>

              <div className="report-card-actions">
                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setShowDetails(!showDetails);
                  }}
                  className="btn-small btn-view"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => handleRegenerateReport(report._id)}
                  className="btn-small btn-regenerate"
                  title="Regenerate with latest data"
                >
                  🔄 Regenerate
                </button>
                <button
                  onClick={() => downloadReportCSV(report)}
                  className="btn-small btn-download"
                  disabled={!report.generatedData}
                >
                  📥 CSV
                </button>
                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setShowTemplateForm(true);
                  }}
                  className="btn-small btn-template"
                  disabled={report.isTemplate}
                >
                  ⭐ Template
                </button>
                <button
                  onClick={() => handleDeleteReport(report._id)}
                  className="btn-small btn-delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetails && selectedReport && (
        <div className="report-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📊 Report Details: {selectedReport.reportName}</h3>
              <button onClick={() => setShowDetails(false)} className="btn-close">✕</button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div><strong>Report Type:</strong> {selectedReport.reportType}</div>
                <div><strong>Created By:</strong> {selectedReport.userId}</div>
                <div><strong>Generated At:</strong> {new Date(selectedReport.generatedAt).toLocaleString()}</div>
                <div><strong>Total Records:</strong> {selectedReport.generatedData?.count || 0}</div>
                <div><strong>Group By:</strong> {selectedReport.groupBy || 'None'}</div>
                <div><strong>Include Graphs:</strong> {selectedReport.includeGraphs ? 'Yes' : 'No'}</div>
              </div>

              {selectedReport.generatedData && selectedReport.generatedData.data && (
                <div className="table-wrapper">
                  <h4>📋 Report Data</h4>
                  <table className="report-table">
                    <thead>
                      <tr>
                        {selectedReport.generatedData.data[0] && Object.keys(selectedReport.generatedData.data[0]).map(header => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.generatedData.data.slice(0, 20).map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, i) => (
                            <td key={i}>
                              {typeof val === 'object' ? JSON.stringify(val) : 
                               typeof val === 'number' ? val.toFixed(2) : 
                               String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedReport.generatedData.data.length > 20 && (
                    <p className="table-note">Showing 20 of {selectedReport.generatedData.data.length} records</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTemplateForm && selectedReport && (
        <div className="template-form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⭐ Save as Template</h3>
              <button onClick={() => setShowTemplateForm(false)} className="btn-close">✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Monthly Sales Template"
                />
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => {
                    handleSaveAsTemplate(selectedReport._id);
                  }}
                  className="btn-submit"
                >
                  ✅ Save Template
                </button>
                <button
                  onClick={() => setShowTemplateForm(false)}
                  className="btn-cancel"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReports;
