import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ItemWiseReport = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchItemWiseData();
    }, []);

    const fetchItemWiseData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/reports/item-wise');
            setItems(response.data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching item-wise report:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="item-wise-report">
            <h2>Item-wise Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Total Sales</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>${item.totalSales}</td>
                            <td>{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ItemWiseReport;