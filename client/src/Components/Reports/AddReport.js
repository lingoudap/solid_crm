import React, { useState } from 'react';
import './Reports.css';

const AddReport = ({ onRefreshParent }) => {
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('sales-summary');
  const [description, setDescription] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customer, setCustomer] = useState('');
  const [item, setItem] = useState('');
  const [status, setStatus] = useState('');
  const [groupBy, setGroupBy] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [includeGraphs, setIncludeGraphs] = useState(true);
  const [graphType, setGraphType] = useState('bar');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    { value: 'sales-summary', label: 'Sales Summary' },
    { value: 'item-wise', label: 'Item-wise Report' },
    { value: 'customer-wise', label: 'Customer-wise Report' },
    { value: 'date-wise', label: 'Date-wise Report' },
    { value: 'lead-conversion', label: 'Lead Conversion' },
    { value: 'quotation-status', label: 'Quotation Status' },
  ];

  const availableFields = {
    'sales-summary': ['metric', 'value', 'orderCount', 'totalQuantity', 'averageOrderValue'],
    'item-wise': ['item', 'totalQuantity', 'totalSales', 'orderCount', 'averagePrice'],
    'customer-wise': ['customer', 'email', 'phone', 'totalSpent', 'orderCount', 'totalQuantity'],
    'date-wise': ['date', 'totalSales', 'orderCount', 'totalQuantity'],
    'lead-conversion': ['metric', 'totalLeads', 'convertedLeads', 'conversionRate', 'pendingLeads'],
    'quotation-status': ['status', 'count', 'totalValue'],
  };

  const handleFieldToggle = (field) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch('http://localhost:5000/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          reportName: reportName || 'Preview Report',
          reportType,
          description,
          filters: { dateFrom, dateTo, customer, item, status },
          selectedFields: selectedFields.length > 0 ? selectedFields : availableFields[reportType],
          groupBy,
          includeGraphs,
          graphType
        })
      });

      if (!response.ok) throw new Error('Failed to generate preview');
      
      const data = await response.json();
      setPreviewData(data.generatedData);
      setShowPreview(true);
      setMessage('✅ Report preview generated successfully!');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportName.trim()) {
      setMessage('❌ Please enter a report name');
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await fetch('http://localhost:5000/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          reportName,
          reportType,
          description,
          filters: { dateFrom, dateTo, customer, item, status },
          selectedFields: selectedFields.length > 0 ? selectedFields : availableFields[reportType],
          groupBy,
          includeGraphs,
          graphType
        })
      });

      if (!response.ok) throw new Error('Failed to create report');

      setMessage('✅ Report created successfully!');
      setReportName('');
      setDescription('');
      setDateFrom('');
      setDateTo('');
      setCustomer('');
      setItem('');
      setStatus('');
      setSelectedFields([]);
      setGroupBy('');
      setShowPreview(false);

      if (onRefreshParent) onRefreshParent();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!previewData || !previewData.data) return;

    const headers = Object.keys(previewData.data[0]);
    const csv = [
      headers.join(','),
      ...previewData.data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName || 'report'}.csv`;
    a.click();
  };

  return (
    <div className="add-report-container">
      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-section">
          <h3>📋 Report Details</h3>
          
          <div className="form-group">
            <label>Report Name *</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g., Monthly Sales Report"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Report Type *</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Group By</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="">None</option>
                <option value="customer">Customer</option>
                <option value="item">Item</option>
                <option value="date">Date</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this report..."
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>🔍 Filters</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Filter by customer..."
              />
            </div>

            <div className="form-group">
              <label>Item</label>
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="Filter by item..."
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📊 Display Settings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeGraphs}
                  onChange={(e) => setIncludeGraphs(e.target.checked)}
                />
                Include Graphs
              </label>
            </div>

            {includeGraphs && (
              <div className="form-group">
                <label>Graph Type</label>
                <select value={graphType} onChange={(e) => setGraphType(e.target.value)}>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>📌 Select Fields to Display</label>
            <div className="field-selector">
              {availableFields[reportType].map(field => (
                <label key={field} className="field-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => handleFieldToggle(field)}
                  />
                  <span>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {message && <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</div>}

        <div className="button-group">
          <button type="button" onClick={handlePreview} disabled={loading} className="btn-preview">
            👁️ Preview Report
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? '⏳ Creating...' : '✅ Create Report'}
          </button>
        </div>
      </form>

      {showPreview && previewData && (
        <div className="report-preview">
          <div className="preview-header">
            <h3>📊 Report Preview</h3>
            <button onClick={() => setShowPreview(false)} className="btn-close">✕</button>
          </div>

          <div className="preview-info">
            <p><strong>Report Type:</strong> {reportTypes.find(t => t.value === reportType)?.label}</p>
            <p><strong>Total Records:</strong> {previewData.data?.length || 0}</p>
            <p><strong>Generated:</strong> {new Date(previewData.generatedAt).toLocaleString()}</p>
          </div>

          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  {previewData.data?.[0] && Object.keys(previewData.data[0]).map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.data?.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.data?.length > 10 && (
              <p className="preview-note">Showing 10 of {previewData.data.length} records</p>
            )}
          </div>

          <div className="preview-actions">
            <button onClick={downloadCSV} className="btn-download">📥 Download as CSV</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddReport;
