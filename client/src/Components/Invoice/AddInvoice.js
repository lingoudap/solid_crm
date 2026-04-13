import React, { useState, useEffect } from 'react';
import './Invoice.css';

const AddInvoice = ({ onInvoiceAdded }) => {
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        customerId: '',
        orderId: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        totalAmount: '',
        taxAmount: '',
        notes: '',
        status: 'Draft'
    });

    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchCustomers();
        fetchOrders();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/customers`);
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching customers:', err);
        }
    };
    const [items, setItems] = useState([
        { itemName: "", qty: 1, unit: "", price: 0, discount: 0, tax: 0, subtotal: 0 },
    ]);
    const fetchOrders = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/orders`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${apiUrl}/api/invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create invoice');
            }

            setSuccess('Invoice created successfully!');
            setFormData({
                invoiceNumber: '',
                customerId: '',
                orderId: '',
                invoiceDate: new Date().toISOString().split('T')[0],
                dueDate: '',
                totalAmount: '',
                taxAmount: '',
                notes: '',
                status: 'Draft'
            });

            if (onInvoiceAdded) {
                onInvoiceAdded();
            }
        } catch (err) {
            setError(err.message || 'Error creating invoice');
            console.error('Error:', err);
        }
    };
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItems = [...items];
        updatedItems[index][name] = value;

        const price = parseFloat(updatedItems[index].price) || 0;
        const qty = parseFloat(updatedItems[index].qty) || 0;
        const discount = parseFloat(updatedItems[index].discount) || 0;
        const tax = parseFloat(updatedItems[index].tax) || 0;

        const amount = price * qty;
        const discounted = amount - (amount * discount) / 100;
        const taxed = discounted + (discounted * tax) / 100;

        updatedItems[index].subtotal = taxed.toFixed(2);
        setItems(updatedItems);
    };
    const addRow = () => {
        setItems([...items, { itemName: "", qty: 1, unit: "", price: 0, discount: 0, tax: 0, subtotal: 0 }]);
    };

    const removeRow = (index) => {
        const updated = [...items];
        updated.splice(index, 1);
        setItems(updated);
    };

    const totalAmount = items.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0);
    return (
        <div className="invoice-container">
            <div className="invoice-form">
                <h2 className="invoice-header">✏️ Create New Invoice</h2>

                {error && <div className="invoice-message error">❌ {error}</div>}
                {success && <div className="invoice-message success">✅ {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                        <div>
                            <label htmlFor="invoiceNumber">Invoice Number *</label>
                            <input
                                type="text"
                                id="invoiceNumber"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                                placeholder="INV-001"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="customerId">Customer *</label>
                            <select
                                id="customerId"
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a customer</option>
                                {customers.map(customer => (
                                    <option key={customer._id} value={customer._id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="orderId">Order (Optional)</label>
                            <select
                                id="orderId"
                                name="orderId"
                                value={formData.orderId}
                                onChange={handleChange}
                            >
                                <option value="">Select an order</option>
                                {orders.map(order => (
                                    <option key={order._id} value={order._id}>{order.orderNumber}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="invoiceDate">Invoice Date *</label>
                            <input
                                type="date"
                                id="invoiceDate"
                                name="invoiceDate"
                                value={formData.invoiceDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="dueDate">Due Date</label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent</option>
                                <option value="Paid">Paid</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="totalAmount">Total Amount *</label>
                            <input
                                type="number"
                                id="totalAmount"
                                name="totalAmount"
                                value={formData.totalAmount}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="taxAmount">Tax Amount</label>
                            <input
                                type="number"
                                id="taxAmount"
                                name="taxAmount"
                                value={formData.taxAmount}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional notes..."
                            rows="4"
                        />
                    </div>
                    {/* ================= Items Section ================= */}
                    <div className="items-section">
                        <h3>
                            📦 Invoice Line Items
                        </h3>

                        <table className="quotation-table">
                            <thead>
                                <tr>
                                    <th>Sr. No</th>
                                    <th>Item Name</th>
                                    <th>Qty</th>
                                    <th>Unit</th>
                                    <th>Price</th>
                                    <th>Discount %</th>
                                    <th>Tax %</th>
                                    <th>Subtotal</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td><input type="text" name="itemName" value={item.itemName} onChange={(e) => handleItemChange(index, e)} required /></td>
                                        <td><input type="number" name="qty" value={item.qty} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="text" name="unit" value={item.unit} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="number" name="price" value={item.price} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="number" name="discount" value={item.discount} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td><input type="number" name="tax" value={item.tax} onChange={(e) => handleItemChange(index, e)} /></td>
                                        <td>${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => removeRow(index)}
                                                className="invoice-button delete"
                                                disabled={items.length === 1}
                                            >
                                                ❌
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button type="button" className="invoice-button invoice-button-add" onClick={addRow}>
                            ➕ Add Item
                        </button>

                        <div className="invoice-total-section">
                            <div className="invoice-total-amount">
                                <span>Total:</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="invoice-button-group">
                        <button type="submit" className="invoice-button" style={{ backgroundColor: '#22c55e' }}>
                            💾 Save Invoice
                        </button>
                        <button type="reset" className="invoice-button" style={{ backgroundColor: '#6b7280' }}>
                            🔄 Clear
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddInvoice;
