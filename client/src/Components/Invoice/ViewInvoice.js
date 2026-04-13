import React, { useState, useEffect } from 'react';
import './Invoice.css';

const ViewInvoice = ({ onRefreshParent }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/invoices`);
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error fetching invoices');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const res = await fetch(`${apiUrl}/api/invoices/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete invoice');
        setInvoices(invoices.filter(inv => inv._id !== id));
        if (onRefreshParent) onRefreshParent();
      } catch (err) {
        setError(err.message || 'Error deleting invoice');
      }
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="invoice-container"><p>Loading invoices...</p></div>;

  return (
    <div className="invoice-container">
      <h2 className="invoice-header">View Invoices</h2>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="🔍 Search by invoice number or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button
          onClick={fetchInvoices}
          className="invoice-button"
          style={{ backgroundColor: '#17a2b8' }}
        >
          Refresh
        </button>
      </div>

      {filteredInvoices.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>No invoices found.</p>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice._id}>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.customerName || 'N/A'}</td>
                <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
                <td>${parseFloat(invoice.totalAmount || 0).toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor:
                      invoice.status === 'Paid' ? '#d4edda' :
                      invoice.status === 'Overdue' ? '#f8d7da' :
                      invoice.status === 'Cancelled' ? '#e2e3e5' : '#d1ecf1',
                    color:
                      invoice.status === 'Paid' ? '#155724' :
                      invoice.status === 'Overdue' ? '#721c24' :
                      invoice.status === 'Cancelled' ? '#383d41' : '#0c5460'
                  }}>
                    {invoice.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(invoice._id)}
                    className="invoice-button delete"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewInvoice;
