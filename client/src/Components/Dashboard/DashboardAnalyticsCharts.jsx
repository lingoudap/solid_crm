// client/src/Components/Dashboard/DashboardAnalyticsCharts.jsx
import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from "recharts";
import "./DashboardAnalyticsCharts.css";

// Colors
const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  slate: "#64748B"
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.cyan
];

// ==========================================
// Daily Activity Trend Chart
// ==========================================

export function DailyActivityChart({ data, loading }) {
  if (loading) return <div className="chart-container loading">Loading chart...</div>;
  if (!data || data.length === 0) return <div className="chart-container">No data available</div>;

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3>Daily Activity Trend (30 Days)</h3>
        <p className="chart-subtitle">Follow-up activity over time</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip 
            contentStyle={{ 
              background: "#fff", 
              border: `1px solid ${COLORS.primary}`,
              borderRadius: "8px"
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="total"
            stroke={COLORS.primary}
            fillOpacity={1}
            fill="url(#colorTotal)"
            name="Total"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke={COLORS.success}
            fillOpacity={1}
            fill="url(#colorCompleted)"
            name="Completed"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==========================================
// Status Distribution Chart
// ==========================================

export function StatusDistributionChart({ data, loading }) {
  if (loading) return <div className="chart-container loading">Loading chart...</div>;
  if (!data || data.length === 0) return <div className="chart-container">No data available</div>;

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3>Status Distribution</h3>
        <p className="chart-subtitle">Follow-up status breakdown</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ status, percentage }) => `${status}: ${percentage}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toLocaleString()} />
        </PieChart>
      </ResponsiveContainer>

      <div className="chart-legend">
        {data.map((item, idx) => (
          <div key={idx} className="legend-item">
            <span 
              className="legend-color" 
              style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
            ></span>
            <span className="legend-text">
              {item.status} - {item.count} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Conversion Analytics Chart
// ==========================================

export function ConversionAnalyticsChart({ data, loading }) {
  if (loading) return <div className="chart-container loading">Loading chart...</div>;
  if (!data || data.length === 0) return <div className="chart-container">No data available</div>;

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3>Conversion Analytics</h3>
        <p className="chart-subtitle">By follow-up type</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="type" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip 
            contentStyle={{ 
              background: "#fff", 
              border: `1px solid ${COLORS.primary}`,
              borderRadius: "8px"
            }}
          />
          <Legend />
          <Bar dataKey="total" fill={COLORS.primary} name="Total" />
          <Bar dataKey="completed" fill={COLORS.success} name="Completed" />
          <Line 
            type="monotone" 
            dataKey="conversionRate" 
            stroke={COLORS.danger}
            name="Conversion Rate (%)"
            yAxisId="right"
            strokeWidth={2}
          />
          <YAxis yAxisId="right" orientation="right" stroke="#999" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==========================================
// User Performance Chart
// ==========================================

export function UserPerformanceChart({ data, loading }) {
  if (loading) return <div className="chart-container loading">Loading chart...</div>;
  if (!data || data.length === 0) return <div className="chart-container">No data available</div>;

  // Limit to top 8 users for better visibility
  const topUsers = data.slice(0, 8);

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3>User Performance (Top Performers)</h3>
        <p className="chart-subtitle">Completion rate by user</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={topUsers}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#999" />
          <YAxis dataKey="assignedTo" type="category" stroke="#999" width={140} />
          <Tooltip 
            contentStyle={{ 
              background: "#fff", 
              border: `1px solid ${COLORS.primary}`,
              borderRadius: "8px"
            }}
          />
          <Legend />
          <Bar dataKey="completed" fill={COLORS.success} name="Completed" />
          <Bar dataKey="pending" fill={COLORS.warning} name="Pending" />
          <Bar dataKey="overdue" fill={COLORS.danger} name="Overdue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==========================================
// Overdue Analysis Chart
// ==========================================

export function OverdueAnalysisChart({ data, loading }) {
  if (loading) return <div className="chart-container loading">Loading chart...</div>;
  if (!data) return <div className="chart-container">No data available</div>;

  const chartData = [
    { name: "Today", value: data.today, color: COLORS.danger },
    { name: "This Week", value: data.thisWeek, color: COLORS.warning },
    { name: "This Month", value: data.thisMonth, color: COLORS.warning },
    { name: "Older", value: data.older, color: COLORS.slate }
  ];

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3>Overdue Analysis</h3>
        <p className="chart-subtitle">Distribution by timeframe</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip 
            contentStyle={{ 
              background: "#fff", 
              border: `1px solid ${COLORS.danger}`,
              borderRadius: "8px"
            }}
          />
          <Bar dataKey="value" fill={COLORS.danger} name="Count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default {
  DailyActivityChart,
  StatusDistributionChart,
  ConversionAnalyticsChart,
  UserPerformanceChart,
  OverdueAnalysisChart
};
