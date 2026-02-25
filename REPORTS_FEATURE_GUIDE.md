# 📊 Custom Sales Reports - Complete Feature Documentation

## Overview
The Custom Reports module enables you to create, manage, and export comprehensive business reports with advanced filtering, grouping, and visualization options. This is a powerful tool for sales analysis, performance tracking, and decision-making.

---

## ✨ Key Features

### 1. **Multiple Report Types**
   - **Sales Summary**: High-level overview of total sales, order counts, and averages
   - **Item-wise Report**: Analyze sales performance by products/items
   - **Customer-wise Report**: Track customer spending and order history
   - **Date-wise Report**: Monitor sales trends over time periods
   - **Lead Conversion**: Track lead to customer conversion rates
   - **Quotation Status**: Monitor quotation pipeline and conversion

### 2. **Advanced Filtering**
   - Filter by date range (From/To dates)
   - Filter by customer name
   - Filter by item/product
   - Filter by status (Pending, Completed, Cancelled)
   - Combine multiple filters for precise data

### 3. **Data Grouping**
   - Group sales by **Customer** - see which customers generate most revenue
   - Group sales by **Item** - identify your top-selling products
   - Group sales by **Date** - track daily/periodic trends
   - Group sales by **Status** - monitor order fulfillment progress

### 4. **Field Selection**
   - Choose which data fields to display in your report
   - Each report type has relevant fields available
   - Customize columns to focus on key metrics

### 5. **Visualization Options**
   - Include or exclude graphs in reports
   - Choose graph type:
     - **Bar Chart** - Compare values across categories
     - **Pie Chart** - Show proportional distribution
     - **Line Chart** - Track trends over time
     - **Area Chart** - Display cumulative values

### 6. **Preview & Export**
   - **Live Preview** - See data before saving
   - **Download as CSV** - Export to Excel or Google Sheets
   - **Download as PDF** - Create formatted reports (future enhancement)

### 7. **Report Templates**
   - Save frequently used reports as templates
   - Quickly generate reports using saved templates
   - Templates retain all filters and settings

---

## 📋 Available Report Fields by Type

### Sales Summary
- `metric` - Type of metric
- `value` - Metric value
- `orderCount` - Number of orders
- `totalQuantity` - Total items sold
- `averageOrderValue` - Average amount per order

### Item-wise Report
- `item` - Product/Item name
- `totalQuantity` - Total units sold
- `totalSales` - Total revenue from item
- `orderCount` - Number of orders for item
- `averagePrice` - Average selling price

### Customer-wise Report
- `customer` - Customer name
- `email` - Customer email
- `phone` - Customer phone
- `totalSpent` - Total amount customer spent
- `orderCount` - Number of orders
- `totalQuantity` - Total items purchased

### Date-wise Report
- `date` - Report date
- `totalSales` - Revenue for the date
- `orderCount` - Number of orders
- `totalQuantity` - Items sold

### Lead Conversion Report
- `metric` - Report metric
- `totalLeads` - Total leads in period
- `convertedLeads` - Leads converted to customers
- `conversionRate` - Conversion percentage
- `pendingLeads` - Leads not yet converted

### Quotation Status Report
- `status` - Quotation status
- `count` - Number of quotations
- `totalValue` - Total value of quotations

---

## 🚀 How to Use

### Creating a New Report

1. **Navigate to Reports Module**
   - Click "📊 Reports" in the sidebar
   - Click "➕ Add Reports" to create new

2. **Fill Report Details**
   - **Report Name*** - Give your report a descriptive name
   - **Report Type*** - Select from 6 predefined types
   - **Description** - Add notes about the report purpose
   - **Group By** - Optionally organize data by customer/item/date/status

3. **Apply Filters** (Optional)
   - **Date From/To** - Specify the date range
   - **Customer Name** - Filter for specific customer
   - **Item** - Filter for specific product
   - **Status** - Filter by order status

4. **Display Settings**
   - Toggle "Include Graphs" to visualize data
   - Select graph type (Bar, Pie, Line, Area)
   - Choose which fields to display

5. **Preview & Save**
   - Click "👁️ Preview Report" to see data before saving
   - Download CSV from preview if needed
   - Click "✅ Create Report" to save

### Viewing & Managing Reports

1. **Access Saved Reports**
   - Click "Reports" → "🔎 View Reports"
   - See all saved reports in card layout

2. **Report Cards Show**
   - Report name and type
   - Creation date and last generated date
   - Number of records
   - Template badge (if saved as template)

3. **Report Actions**
   - **👁️ View** - See full report details and data
   - **🔄 Regenerate** - Update with latest data
   - **📥 CSV** - Download data as CSV file
   - **⭐ Template** - Save as reusable template
   - **🗑️ Delete** - Remove report

### Saving Reports as Templates

1. Open a report from View Reports
2. Click "⭐ Template" button
3. Enter template name
4. Click "✅ Save Template"
5. Use template to quickly generate similar reports

### Exporting Reports

1. From Preview or View Report:
   - Click "📥 Download as CSV"
   - File downloads as `reportname.csv`
   - Open in Excel or Google Sheets

---

## 📊 Report Type Guide

### Sales Summary Report
**Best for**: Overall performance metrics
- Shows total sales, number of orders, quantities
- Can group by customer or item
- Displays averages and totals
**Example Use**: Monthly sales overview by region or product line

### Item-wise Report
**Best for**: Product performance analysis
- Automatically groups by item
- Shows sales and order count per item
- Identifies top-selling products
**Example Use**: Which products generate most revenue?

### Customer-wise Report
**Best for**: Customer analysis and segmentation
- Shows spending by customer
- Lists all their contact details
- Helps identify VIP customers
**Example Use**: Find top customers and their purchase patterns

### Date-wise Report
**Best for**: Trend analysis
- Shows daily/period-wise sales
- Perfect for trend visualization
- Helps forecast future sales
**Example Use**: Identify sales peaks and valleys

### Lead Conversion Report
**Best for**: Sales pipeline analysis
- Tracks lead to customer conversion
- Shows conversion percentage
- Identifies bottlenecks in sales process
**Example Use**: How effective are our lead generation efforts?

### Quotation Status Report
**Best for**: Sales pipeline management
- Shows quotations at each stage
- Calculates pipeline value
- Identifies stalled quotations
**Example Use**: What's the status of active quotations?

---

## 🎯 Real-World Examples

### Example 1: Monthly Sales Report
1. Go to Add Report
2. Name: "March 2026 Sales Performance"
3. Type: Sales Summary
4. Date From: 2026-03-01, To: 2026-03-31
5. Group By: Customer
6. Include Graphs: Yes (Bar Chart)
7. Preview and Save

### Example 2: Top Products Analysis
1. Name: "Q1 2026 Top Products"
2. Type: Item-wise
3. Date From: 2026-01-01, To: 2026-03-31
4. Select Fields: item, totalSales, orderCount, totalQuantity
5. Include Graphs: Yes (Pie Chart)
6. Save as Template

### Example 3: Customer Performance Report
1. Name: "VIP Customer Analysis"
2. Type: Customer-wise
3. Filter: totalSpent > threshold (via CSV post-processing)
4. Include Graphs: Yes (Bar Chart)
5. Download as CSV and analyze in Excel

---

## 💾 Backend API Endpoints

```
GET    /api/reports/user/:userId          - Get all reports for user
GET    /api/reports/:reportId             - Get single report
POST   /api/reports/create                - Create new report
PUT    /api/reports/:reportId             - Update report
POST   /api/reports/:reportId/generate    - Regenerate report data
DELETE /api/reports/:reportId             - Delete report
POST   /api/reports/:reportId/template    - Save as template
GET    /api/reports/templates/:userId     - Get user's templates
```

---

## 🔧 Configuration & Customization

### Report Schema
Reports store the following information:
- Report name and type
- User ID (owner)
- Filters applied
- Selected fields to display
- Grouping preferences
- Graph settings
- Generated data snapshot
- Creation and update timestamps

### Adding New Report Types
To add custom report types:
1. Update `reportTypes` array in AddReport.js
2. Add new case in `generateReportData()` in reportRoutes.js
3. Define available fields in `availableFields` object
4. Implement data generation logic

---

## ⚙️ Technical Details

### Frontend Components
- **AddReport.js** - Create and preview reports
- **ViewReports.js** - View, regenerate, and manage saved reports
- **Reports.css** - Styling and responsive design

### Backend Components
- **Report.js** - Mongoose schema and model
- **reportRoutes.js** - Express API routes and data generation logic

### Database
- Reports stored in MongoDB
- Auto-incrementing reportId
- Indexed by userId for quick lookups
- Timestamps for audit trail

### Report Generation Logic
- Queries Orders, Quotations, and Leads collections
- Applies filters to narrow down data
- Groups results as specified
- Calculates metrics and aggregations
- Formats data for display

---

## 🎨 UI/UX Features

### Dark Mode Support
- Reports interface adapts to dark/light theme
- All tables and forms are theme-aware

### Responsive Design
- Mobile-friendly report cards
- Scalable tables
- Touch-friendly buttons

### User Feedback
- Success/error messages
- Loading indicators
- Empty states
- Confirmation dialogs for destructive actions

---

## 📈 Future Enhancements

Planned features:
- PDF export with formatting
- Email report delivery
- Scheduled reports (generate automatically)
- More graph types (gauge, scatter, maps)
- Advanced filtering UI
- Comparison of multiple time periods
- Custom calculated fields
- Report sharing and permissions
- Drill-down capability

---

## ❓ FAQ

**Q: Can I edit a report after creating it?**
A: Currently, you can delete and recreate. We're adding edit capability soon.

**Q: How far back can I generate reports?**
A: You can query any date range where data exists in the system.

**Q: Can I share reports with team members?**
A: Currently reports are personal. We're adding sharing features soon.

**Q: How many records can a report contain?**
A: No hard limit, but performance may degrade with very large datasets (>100K records).

**Q: Can I schedule automated reports?**
A: Not yet, but this is planned for a future release.

---

## 📞 Support

For issues or feature requests related to Reports:
1. Check this documentation first
2. Verify your data filters are correct
3. Try regenerating the report
4. Contact support with report type and error details

---

**Last Updated**: February 24, 2026
**Version**: 1.0
