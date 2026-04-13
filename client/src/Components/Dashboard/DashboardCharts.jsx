import React, { useEffect, useState } from "react";
import "./DashboardCharts.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const baseUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

const ChartPanel = ({ title, table, dateColumn }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [interval, setInterval] = useState("day");
  const [dataSet, setDataSet] = useState({ day: { labels: [], data: [] }, month: { labels: [], data: [] }, year: { labels: [], data: [] } });
  const [graphType, setGraphType] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to get Financial Year start date (April 1st)
  const getFYStartDate = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    let fyStartYear = today.getFullYear();
    
    // If current month is before April (0-2: Jan, Feb, Mar), FY started in previous year
    if (currentMonth < 3) {
      fyStartYear = today.getFullYear() - 1;
    }
    
    // Return April 1st of the appropriate year
    return new Date(fyStartYear, 3, 1).toISOString().split("T")[0];
  };

  useEffect(() => {
    const fyStart = getFYStartDate();
    const today = new Date().toISOString().split("T")[0];
    setFromDate(fyStart);
    setToDate(today);
    // initial load for FY data
    applyFilter(fyStart, today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInterval = async (intv, fDate, tDate) => {
    const url = `${baseUrl}/api/chart-data?table=${encodeURIComponent(table)}&dateColumn=${encodeURIComponent(dateColumn)}&fromDate=${encodeURIComponent(fDate)}&toDate=${encodeURIComponent(tDate)}&interval=${encodeURIComponent(intv)}`;
    console.log(`[${title}] Fetching chart data:`, { table, dateColumn, fromDate: fDate, toDate: tDate, interval: intv });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch chart data: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log(`[${title}] Response:`, data);
    return data;
  };

  const applyFilter = async (fDate = fromDate, tDate = toDate) => {
    if (!fDate || !tDate) {
      setError("Please select both From and To dates");
      return;
    }
    try {
      setLoading(true);
      setError("");
      console.log(`[${title}] Applying filter:`, { fDate, tDate });
      const [dayData, monthData, yearData] = await Promise.all([
        fetchInterval("day", fDate, tDate),
        fetchInterval("month", fDate, tDate),
        fetchInterval("year", fDate, tDate),
      ]);
      console.log(`[${title}] All data loaded:`, { dayData, monthData, yearData });
      setDataSet({ day: dayData, month: monthData, year: yearData });
    } catch (err) {
      console.error(`[${title}] Error fetching chart data:`, err);
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const current = dataSet[interval] || { labels: [], data: [] };
  const chartData = (current.labels || []).map((lbl, i) => ({ name: lbl, value: (current.data && current.data[i]) || 0 }));

  return (
    <div className="chart-card">
      <h3>{title}</h3>

      {error && <div style={{ color: "#dc3545", padding: "8px", marginBottom: "10px", backgroundColor: "#f8d7da", borderRadius: "4px" }}>⚠️ {error}</div>}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <label style={{ fontWeight: 600 }}>From:</label>
        <input type="date" className="cal1" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <label style={{ fontWeight: 600 }}>To:</label>
        <input type="date" className="cal1" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="btn-apply" onClick={() => applyFilter(fromDate, toDate)} disabled={loading}>
          {loading ? "⏳ Loading..." : "Apply"}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <select className="select1" value={interval} onChange={(e) => setInterval(e.target.value)}>
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button className={`btn1 ${graphType === 1 ? 'active' : ''}`} onClick={() => setGraphType(1)}>📊 Bar</button>
          <button className={`btn2 ${graphType === 2 ? 'active' : ''}`} onClick={() => setGraphType(2)}>📈 Line</button>
          <button className={`btn3 ${graphType === 3 ? 'active' : ''}`} onClick={() => setGraphType(3)}>📊 Histogram</button>
          <button className={`btn4 ${graphType === 4 ? 'active' : ''}`} onClick={() => setGraphType(4)}>📉 Chart</button>
        </div>
      </div>

      <div className="combinedGraphContainer">
        {loading ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p>Loading chart data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <p style={{ color: "#999", margin: 0 }}>No data available for selected period</p>
            <small style={{ color: "#bbb", margin: 0 }}>Range: {fromDate} to {toDate}</small>
          </div>
        ) : graphType === 2 || graphType === 4 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ fill: "#8884d8", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const DashboardCharts = () => {
  const [showCharts, setShowCharts] = useState(false);

  return (
    <>
      <button 
        className="visual-dashboard-btn"
        onClick={() => setShowCharts(!showCharts)}
        style={{
          display: "block",
          margin: "20px auto",
          padding: "12px 30px",
          fontSize: "16px",
          fontWeight: "600",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
        onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
      >
        {showCharts ? "Hide Charts" : "Visual Dashboard"}
      </button>

      {showCharts && (
        <div className="dashboard-charts-grid">
          <ChartPanel title="Leads" table="db_enq" dateColumn="createdAt" />
          <ChartPanel title="Quotations" table="db_quote" dateColumn="createdAt" />
          <ChartPanel title="Order" table="db_oa" dateColumn="createdAt" />
          <ChartPanel title="Invoice" table="db_invoice" dateColumn="createdAt" />
        </div>
      )}
    </>
  );
};

export default DashboardCharts;
