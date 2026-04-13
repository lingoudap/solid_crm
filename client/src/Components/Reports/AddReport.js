import React, { useState, useEffect, useMemo } from 'react';
import './Reports.css';

const AddReport = ({ onRefreshParent }) => {
  const [step, setStep] = useState(1);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
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
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [errors, setErrors] = useState({});

  const totalSteps = 4;

  const reportTypes = [
    { value: 'sales-summary', label: 'Sales Summary', icon: '💰', desc: 'Overview of total sales, revenue, and order metrics' },
    { value: 'item-wise', label: 'Item-wise Report', icon: '📦', desc: 'Breakdown of sales by individual items/products' },
    { value: 'customer-wise', label: 'Customer-wise Report', icon: '👥', desc: 'Customer spending patterns and order history' },
    { value: 'date-wise', label: 'Date-wise Report', icon: '📅', desc: 'Daily/periodic sales trends and patterns' },
    { value: 'lead-conversion', label: 'Lead Conversion', icon: '🎯', desc: 'Lead funnel analysis and conversion rates' },
    { value: 'quotation-status', label: 'Quotation Status', icon: '📝', desc: 'Status distribution and value of quotations' },
  ];

  const availableFields = {
    'sales-summary': ['metric', 'value', 'orderCount', 'totalQuantity', 'averageOrderValue'],
    'item-wise': ['item', 'totalQuantity', 'totalSales', 'orderCount', 'averagePrice'],
    'customer-wise': ['customer', 'email', 'phone', 'totalSpent', 'orderCount', 'totalQuantity'],
    'date-wise': ['date', 'totalSales', 'orderCount', 'totalQuantity'],
    'lead-conversion': ['metric', 'totalLeads', 'convertedLeads', 'conversionRate', 'pendingLeads'],
    'quotation-status': ['status', 'count', 'totalValue'],
  };

  const fieldLabels = {
    metric: 'Metric', value: 'Value', orderCount: 'Order Count', totalQuantity: 'Total Qty',
    averageOrderValue: 'Avg Order Value', item: 'Item', totalSales: 'Total Sales',
    averagePrice: 'Avg Price', customer: 'Customer', email: 'Email', phone: 'Phone',
    totalSpent: 'Total Spent', date: 'Date', totalLeads: 'Total Leads',
    convertedLeads: 'Converted', conversionRate: 'Conversion Rate', pendingLeads: 'Pending Leads',
    status: 'Status', count: 'Count', totalValue: 'Total Value',
  };

  const datePresets = [
    { label: 'Today', getValue: () => { const d = new Date().toISOString().split('T')[0]; return { from: d, to: d }; } },
    { label: 'Last 7 Days', getValue: () => { const to = new Date(); const from = new Date(to); from.setDate(from.getDate() - 7); return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }; } },
    { label: 'Last 30 Days', getValue: () => { const to = new Date(); const from = new Date(to); from.setDate(from.getDate() - 30); return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }; } },
    { label: 'This Month', getValue: () => { const now = new Date(); return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] }; } },
    { label: 'Last Month', getValue: () => { const now = new Date(); const from = new Date(now.getFullYear(), now.getMonth() - 1, 1); const to = new Date(now.getFullYear(), now.getMonth(), 0); return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }; } },
    { label: 'This Quarter', getValue: () => { const now = new Date(); const q = Math.floor(now.getMonth() / 3); return { from: new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] }; } },
    { label: 'This Year', getValue: () => { const now = new Date(); return { from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] }; } },
    { label: 'Custom', getValue: () => null },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (reportType && selectedFields.length === 0) {
      setSelectedFields([...availableFields[reportType]]);
    }
  }, [reportType]);

  const fetchTemplates = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/reports/templates/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const applyTemplate = (templateId) => {
    const template = templates.find(t => t._id === templateId);
    if (!template) return;
    setReportType(template.reportType);
    setDescription(template.description || '');
    setGroupBy(template.groupBy || '');
    setSelectedFields(template.selectedFields || []);
    setIncludeGraphs(template.includeGraphs !== false);
    setGraphType(template.graphType || 'bar');
    if (template.filters) {
      setCustomer(template.filters.customer || '');
      setItem(template.filters.item || '');
      setStatus(template.filters.status || '');
    }
    setSelectedTemplate(templateId);
    showMessage('Template applied! Customize as needed.', 'info');
  };

  const applyDatePreset = (preset) => {
    const val = preset.getValue();
    if (val) {
      setDateFrom(val.from);
      setDateTo(val.to);
    }
  };

  const handleFieldToggle = (field) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const selectAllFields = () => {
    if (reportType) setSelectedFields([...availableFields[reportType]]);
  };

  const deselectAllFields = () => setSelectedFields([]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    if (type !== 'error') setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    if (stepNum === 1) {
      if (!reportName.trim()) newErrors.reportName = 'Report name is required';
      if (!reportType) newErrors.reportType = 'Please select a report type';
    }
    if (stepNum === 3) {
      if (selectedFields.length === 0) newErrors.fields = 'Select at least one field';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const getRequestBody = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
      userId: user.id,
      reportName,
      reportType,
      description,
      filters: { dateFrom, dateTo, customer, item, status },
      selectedFields: selectedFields.length > 0 ? selectedFields : availableFields[reportType],
      groupBy,
      includeGraphs,
      graphType,
      sortBy,
      sortOrder,
    };
  };

  const handlePreview = async () => {
    if (!validateStep(1)) { setStep(1); return; }
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...getRequestBody(), reportName: reportName || 'Preview Report' })
      });
      if (!response.ok) throw new Error('Failed to generate preview');
      const data = await response.json();
      setPreviewData(data.generatedData);
      setShowPreview(true);
      showMessage('Report preview generated successfully!', 'success');
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) { setStep(1); return; }
    if (!validateStep(3)) { setStep(3); return; }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getRequestBody())
      });
      if (!response.ok) throw new Error('Failed to create report');

      showMessage('Report created successfully!', 'success');
      resetForm();
      if (onRefreshParent) onRefreshParent();
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setReportName('');
    setReportType('');
    setDescription('');
    setDateFrom('');
    setDateTo('');
    setCustomer('');
    setItem('');
    setStatus('');
    setSelectedFields([]);
    setGroupBy('');
    setShowPreview(false);
    setPreviewData(null);
    setSelectedTemplate('');
    setErrors({});
  };

  const downloadCSV = () => {
    if (!previewData || !previewData.data || previewData.data.length === 0) return;
    const headers = Object.keys(previewData.data[0]);
    const csv = [
      headers.join(','),
      ...previewData.data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName || 'report'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stepProgress = useMemo(() => (step / totalSteps) * 100, [step]);

  const stepLabels = ['Report Info', 'Filters', 'Fields & Display', 'Review & Create'];

  return (
    <div className="add-report-container">
      {/* Header */}
      <div className="report-wizard-header">
        <h2>Create New Report</h2>
        {templates.length > 0 && (
          <div className="template-selector">
            <select
              value={selectedTemplate}
              onChange={(e) => applyTemplate(e.target.value)}
              className="template-dropdown"
            >
              <option value="">Load from template...</option>
              {templates.map(t => (
                <option key={t._id} value={t._id}>{t.templateName || t.reportName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stepper */}
      <div className="stepper">
        <div className="stepper-progress-bar">
          <div className="stepper-progress-fill" style={{ width: `${stepProgress}%` }} />
        </div>
        <div className="stepper-steps">
          {stepLabels.map((label, idx) => (
            <div
              key={idx}
              className={`stepper-step ${step === idx + 1 ? 'active' : ''} ${step > idx + 1 ? 'completed' : ''}`}
              onClick={() => { if (idx + 1 < step || validateStep(step)) setStep(idx + 1); }}
            >
              <div className="step-number">
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`report-message ${message.type}`}>
          <span>{message.type === 'success' ? '✓' : message.type === 'error' ? '✕' : 'i'} {message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="msg-close">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="report-form">
        {/* Step 1: Report Info */}
        {step === 1 && (
          <div className="wizard-step fade-in">
            <div className="step-title">
              <h3>Report Details</h3>
              <p className="step-subtitle">Choose a report type and give it a name</p>
            </div>

            <div className="form-group">
              <label>Report Name <span className="required">*</span></label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => { setReportName(e.target.value); setErrors(prev => ({ ...prev, reportName: '' })); }}
                placeholder="e.g., Q1 Sales Performance Report"
                className={errors.reportName ? 'input-error' : ''}
              />
              {errors.reportName && <span className="field-error">{errors.reportName}</span>}
            </div>

            <div className="form-group">
              <label>Report Type <span className="required">*</span></label>
              {errors.reportType && <span className="field-error">{errors.reportType}</span>}
              <div className="report-type-grid">
                {reportTypes.map(type => (
                  <div
                    key={type.value}
                    className={`report-type-card ${reportType === type.value ? 'selected' : ''}`}
                    onClick={() => { setReportType(type.value); setSelectedFields([]); setErrors(prev => ({ ...prev, reportType: '' })); }}
                  >
                    <span className="type-icon">{type.icon}</span>
                    <strong>{type.label}</strong>
                    <p>{type.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Description <span className="optional">(optional)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context or notes about this report..."
                rows="3"
              />
              <span className="char-count">{description.length}/500</span>
            </div>
          </div>
        )}

        {/* Step 2: Filters */}
        {step === 2 && (
          <div className="wizard-step fade-in">
            <div className="step-title">
              <h3>Apply Filters</h3>
              <p className="step-subtitle">Narrow down data with date ranges and criteria</p>
            </div>

            <div className="filter-section">
              <label className="section-label">Date Range</label>
              <div className="date-presets">
                {datePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`preset-btn ${preset.label === 'Custom' ? 'preset-custom' : ''}`}
                    onClick={() => applyDatePreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>From</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>To</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>
              {dateFrom && dateTo && (
                <button type="button" className="clear-dates-btn" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                  Clear dates
                </button>
              )}
            </div>

            <div className="filter-section">
              <label className="section-label">Additional Filters</label>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Search by customer..."
                  />
                </div>
                <div className="form-group">
                  <label>Item / Product</label>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    placeholder="Search by item..."
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="filter-section">
              <label className="section-label">Grouping & Sorting</label>
              <div className="form-row">
                <div className="form-group">
                  <label>Group By</label>
                  <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                    <option value="">No Grouping</option>
                    <option value="customer">Customer</option>
                    <option value="item">Item</option>
                    <option value="date">Date</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="">Default</option>
                    {reportType && availableFields[reportType]?.map(f => (
                      <option key={f} value={f}>{fieldLabels[f] || f}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sort Order</label>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active filters summary */}
            {(dateFrom || dateTo || customer || item || status) && (
              <div className="active-filters-bar">
                <span className="filters-label">Active filters:</span>
                {dateFrom && <span className="filter-chip">{dateFrom} <button type="button" onClick={() => setDateFrom('')}>✕</button></span>}
                {dateTo && <span className="filter-chip">to {dateTo} <button type="button" onClick={() => setDateTo('')}>✕</button></span>}
                {customer && <span className="filter-chip">Customer: {customer} <button type="button" onClick={() => setCustomer('')}>✕</button></span>}
                {item && <span className="filter-chip">Item: {item} <button type="button" onClick={() => setItem('')}>✕</button></span>}
                {status && <span className="filter-chip">Status: {status} <button type="button" onClick={() => setStatus('')}>✕</button></span>}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Fields & Display */}
        {step === 3 && (
          <div className="wizard-step fade-in">
            <div className="step-title">
              <h3>Fields & Display Settings</h3>
              <p className="step-subtitle">Choose what data to show and how to visualize it</p>
            </div>

            {reportType && (
              <div className="form-group">
                <div className="fields-header">
                  <label>Select Columns <span className="required">*</span></label>
                  <div className="field-actions">
                    <button type="button" onClick={selectAllFields} className="field-action-btn">Select All</button>
                    <button type="button" onClick={deselectAllFields} className="field-action-btn">Deselect All</button>
                  </div>
                </div>
                {errors.fields && <span className="field-error">{errors.fields}</span>}
                <div className="field-selector-modern">
                  {availableFields[reportType].map(field => (
                    <label key={field} className={`field-chip ${selectedFields.includes(field) ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field)}
                        onChange={() => handleFieldToggle(field)}
                      />
                      <span>{fieldLabels[field] || field}</span>
                    </label>
                  ))}
                </div>
                <span className="field-count">{selectedFields.length} of {availableFields[reportType].length} fields selected</span>
              </div>
            )}

            <div className="visualization-section">
              <label className="section-label">Visualization</label>
              <div className="form-group">
                <label className="toggle-label">
                  <div className={`toggle-switch ${includeGraphs ? 'on' : ''}`} onClick={() => setIncludeGraphs(!includeGraphs)}>
                    <div className="toggle-thumb" />
                  </div>
                  <span>Include Charts</span>
                </label>
              </div>

              {includeGraphs && (
                <div className="graph-type-selector">
                  {[
                    { value: 'bar', label: 'Bar', icon: '📊' },
                    { value: 'line', label: 'Line', icon: '📈' },
                    { value: 'pie', label: 'Pie', icon: '🥧' },
                    { value: 'area', label: 'Area', icon: '📉' },
                  ].map(g => (
                    <div
                      key={g.value}
                      className={`graph-option ${graphType === g.value ? 'selected' : ''}`}
                      onClick={() => setGraphType(g.value)}
                    >
                      <span className="graph-icon">{g.icon}</span>
                      <span>{g.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review & Create */}
        {step === 4 && (
          <div className="wizard-step fade-in">
            <div className="step-title">
              <h3>Review & Create</h3>
              <p className="step-subtitle">Verify your report configuration before creating</p>
            </div>

            <div className="review-card">
              <div className="review-section">
                <h4>Report Details</h4>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Name</span>
                    <span className="review-value">{reportName}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Type</span>
                    <span className="review-value">
                      {reportTypes.find(t => t.value === reportType)?.icon} {reportTypes.find(t => t.value === reportType)?.label}
                    </span>
                  </div>
                  {description && (
                    <div className="review-item full-width">
                      <span className="review-label">Description</span>
                      <span className="review-value">{description}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="review-section">
                <h4>Filters</h4>
                <div className="review-grid">
                  {dateFrom && <div className="review-item"><span className="review-label">From</span><span className="review-value">{dateFrom}</span></div>}
                  {dateTo && <div className="review-item"><span className="review-label">To</span><span className="review-value">{dateTo}</span></div>}
                  {customer && <div className="review-item"><span className="review-label">Customer</span><span className="review-value">{customer}</span></div>}
                  {item && <div className="review-item"><span className="review-label">Item</span><span className="review-value">{item}</span></div>}
                  {status && <div className="review-item"><span className="review-label">Status</span><span className="review-value">{status}</span></div>}
                  {groupBy && <div className="review-item"><span className="review-label">Group By</span><span className="review-value">{groupBy}</span></div>}
                  {!dateFrom && !dateTo && !customer && !item && !status && !groupBy && (
                    <p className="no-filters-text">No filters applied — all data will be included</p>
                  )}
                </div>
              </div>

              <div className="review-section">
                <h4>Display</h4>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Fields</span>
                    <span className="review-value">{selectedFields.map(f => fieldLabels[f] || f).join(', ')}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Charts</span>
                    <span className="review-value">{includeGraphs ? `Yes (${graphType})` : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="wizard-nav">
          <div className="nav-left">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn-wizard btn-back">
                ← Previous
              </button>
            )}
            <button type="button" onClick={resetForm} className="btn-wizard btn-reset">
              Reset
            </button>
          </div>
          <div className="nav-right">
            <button type="button" onClick={handlePreview} disabled={loading || !reportType} className="btn-wizard btn-preview">
              {loading ? 'Generating...' : 'Preview'}
            </button>
            {step < totalSteps ? (
              <button type="button" onClick={nextStep} className="btn-wizard btn-next">
                Next →
              </button>
            ) : (
              <button type="submit" disabled={loading} className="btn-wizard btn-create">
                {loading ? 'Creating...' : 'Create Report'}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="preview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}>
          <div className="preview-modal">
            <div className="preview-modal-header">
              <div>
                <h3>Report Preview</h3>
                <p className="preview-meta">
                  {reportTypes.find(t => t.value === reportType)?.label} — {previewData.data?.length || 0} records — Generated {new Date(previewData.generatedAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setShowPreview(false)} className="btn-close-modal">✕</button>
            </div>

            <div className="preview-modal-body">
              {previewData.data && previewData.data.length > 0 ? (
                <div className="preview-table-wrapper">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th className="row-num">#</th>
                        {Object.keys(previewData.data[0]).map(header => (
                          <th key={header}>{fieldLabels[header] || header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.slice(0, 20).map((row, idx) => (
                        <tr key={idx}>
                          <td className="row-num">{idx + 1}</td>
                          {Object.values(row).map((val, i) => (
                            <td key={i}>
                              {typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) :
                               typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.data.length > 20 && (
                    <p className="preview-note">Showing 20 of {previewData.data.length} records</p>
                  )}
                </div>
              ) : (
                <div className="empty-preview">
                  <p>No data found matching your criteria</p>
                  <p className="empty-hint">Try adjusting your filters or date range</p>
                </div>
              )}
            </div>

            <div className="preview-modal-footer">
              <button onClick={downloadCSV} className="btn-wizard btn-download" disabled={!previewData.data?.length}>
                Download CSV
              </button>
              <button onClick={() => setShowPreview(false)} className="btn-wizard btn-back">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddReport;
