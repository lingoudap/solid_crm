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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
    // initial load for today's data
    applyFilter(today, today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInterval = async (intv, fDate, tDate) => {
    const url = `${baseUrl}/api/chart-data?table=${encodeURIComponent(table)}&dateColumn=${encodeURIComponent(dateColumn)}&fromDate=${encodeURIComponent(fDate)}&toDate=${encodeURIComponent(tDate)}&interval=${encodeURIComponent(intv)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch chart data");
    return res.json();
  };

  const applyFilter = async (fDate = fromDate, tDate = toDate) => {
    if (!fDate || !tDate) {
      alert("Please select both From and To dates");
      return;
    }
    try {
      const [dayData, monthData, yearData] = await Promise.all([
        fetchInterval("day", fDate, tDate),
        fetchInterval("month", fDate, tDate),
        fetchInterval("year", fDate, tDate),
      ]);
      setDataSet({ day: dayData, month: monthData, year: yearData });
    } catch (err) {
      console.error("Error fetching chart data:", err);
    }
  };

  const current = dataSet[interval] || { labels: [], data: [] };
  const chartData = (current.labels || []).map((lbl, i) => ({ name: lbl, value: (current.data && current.data[i]) || 0 }));

  return (
    <div className="chart-card">
      <h3 style={{ textAlign: "center", marginBottom: 8 }}>{title}</h3>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <label style={{ fontWeight: 600 }}>From:</label>
        <input type="date" className="cal1" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <label style={{ fontWeight: 600 }}>To:</label>
        <input type="date" className="cal1" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="btn-apply" onClick={() => applyFilter(fromDate, toDate)}>Apply</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <select className="select1" value={interval} onChange={(e) => setInterval(e.target.value)}>
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn1" onClick={() => setGraphType(1)}>Bar Graph</button>
          <button className="btn2" onClick={() => setGraphType(2)}>Line Graph</button>
          <button className="btn3" onClick={() => setGraphType(3)}>Histogram</button>
          <button className="btn4" onClick={() => setGraphType(4)}>Line Chart</button>
        </div>
      </div>

      <div className="combinedGraphContainer" style={{ height: 260 }}>
        {graphType === 2 || graphType === 4 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
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
              <Bar dataKey="value" fill="#ff9aa2" />
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
          <ChartPanel title="Leads" table="db_enq" dateColumn="enqdate" />
          <ChartPanel title="Quotations" table="db_quote" dateColumn="quotedate" />
          <ChartPanel title="Order" table="db_oa" dateColumn="oadate" />
          <ChartPanel title="Invoice" table="db_invoice" dateColumn="oadate" />
        </div>
      )}
    </>
  );
};

export default DashboardCharts;
