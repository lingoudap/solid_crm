# 🚀 Reports Feature - Quick Start Guide for Developers

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React)                    │
├─────────────────────────────────────────────────────┤
│  HomePage.js                                        │
│  ├─ Imports: AddReport, ViewReports                │
│  ├─ Sidebar Integration                            │
│  └─ Route: Reports → Add/View                      │
│                                                     │
│  Components/Reports/                               │
│  ├─ AddReport.js (Create & Preview)               │
│  │  ├─ Form with 6 report types                   │
│  │  ├─ Advanced filters                           │
│  │  ├─ Field selection                            │
│  │  ├─ Graph settings                             │
│  │  └─ CSV export                                 │
│  │                                                │
│  ├─ ViewReports.js (View & Manage)                │
│  │  ├─ Display saved reports                      │
│  │  ├─ Regenerate functionality                   │
│  │  ├─ Template management                        │
│  │  ├─ CSV download                               │
│  │  └─ Details modal                              │
│  │                                                │
│  └─ Reports.css (Styling)                         │
│     ├─ Forms styling                              │
│     ├─ Cards layout                               │
│     ├─ Tables styling                             │
│     └─ Dark mode support                          │
│                                                    │
└─────────────────────────────────────────────────────┘
            ↓ HTTP Requests (JSON)
┌─────────────────────────────────────────────────────┐
│              API Layer (Express Routes)             │
├─────────────────────────────────────────────────────┤
│  /api/reports/create          [POST]               │
│  /api/reports/user/:userId    [GET]                │
│  /api/reports/:reportId       [GET/PUT/DELETE]     │
│  /api/reports/:reportId/generate  [POST]           │
│  /api/reports/:reportId/template  [POST]           │
│  /api/reports/templates/:userId   [GET]            │
│                                                    │
└─────────────────────────────────────────────────────┘
            ↓ Query/Aggregation
┌─────────────────────────────────────────────────────┐
│          Report Engine (reportRoutes.js)            │
├─────────────────────────────────────────────────────┤
│  generateReportData()                              │
│  ├─ buildQuery() - Filters                         │
│  ├─ generateSalesSummary()                         │
│  ├─ generateItemWiseReport()                       │
│  ├─ generateCustomerWiseReport()                   │
│  ├─ generateDateWiseReport()                       │
│  ├─ generateLeadConversionReport()                 │
│  └─ generateQuotationStatusReport()                │
│                                                    │
└─────────────────────────────────────────────────────┘
            ↓ CRUD Operations
┌─────────────────────────────────────────────────────┐
│          Database Layer (MongoDB)                  │
├─────────────────────────────────────────────────────┤
│  Report Model (Report.js)                          │
│  ├─ reportId (auto-increment)                      │
│  ├─ userId (foreign key)                           │
│  ├─ reportName, reportType                         │
│  ├─ filters, selectedFields, groupBy               │
│  ├─ includeGraphs, graphType                       │
│  ├─ isTemplate, templateName                       │
│  ├─ generatedData (cached results)                 │
│  └─ Timestamps (createdAt, updatedAt)              │
│                                                    │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Creating a Report

```
User Input (AddReport.js)
    ↓
Form Submission with:
  - reportName
  - reportType (sales-summary|item-wise|customer-wise|date-wise|lead-conversion|quotation-status)
  - filters (dateFrom, dateTo, customer, item, status)
  - selectedFields []
  - groupBy (optional)
  - includeGraphs (boolean)
  - graphType (bar|pie|line|area)
    ↓
POST /api/reports/create
    ↓
reportRoutes.js → generateReportData()
    ↓
Query MongoDB (Orders/Quotations/Leads)
    ↓
Apply Filters & Grouping
    ↓
Calculate Metrics
    ↓
Save Report with Generated Data
    ↓
Return Report to Frontend
    ↓
Display Success Message + Preview
```

### Viewing a Report

```
User clicks "View" (ViewReports.js)
    ↓
GET /api/reports/user/:userId (fetch all)
    ↓
Display Report Cards
    ↓
User clicks specific report
    ↓
Modal Opens with:
  - Report metadata
  - Data table (first 20 rows)
  - Download CSV button
  - Regenerate button
```

---

## Code Structure

### Backend File Organization

```
server/
├── models/
│   ├── Report.js          ← New: Report schema
│   ├── Order.js           (used by reports)
│   ├── Quotation.js       (used by reports)
│   ├── Leads.js           (used by reports)
│   └── Customer.js        (used by reports)
│
├── routes/
│   ├── reportRoutes.js    ← New: Report operations
│   └── [other routes]
│
├── index.js               ← Modified: Added report routes
└── config/
    └── db.js
```

### Frontend File Organization

```
client/src/
├── Components/
│   ├── Reports/           ← New folder
│   │   ├── AddReport.js       ← New: Create reports
│   │   ├── ViewReports.js     ← New: View reports
│   │   └── Reports.css        ← New: Styles
│   │
│   ├── Leads/
│   ├── Quotation/
│   ├── Order/
│   └── [other components]
│
├── HomePage.js            ← Modified: Added Reports integration
└── context/
    └── SettingsContext.js
```

---

## Key Functions Deep Dive

### 1. Report Generation Engine

```javascript
// reportRoutes.js - generateReportData()
async function generateReportData(reportType, filters, selectedFields, groupBy) {
  // 1. Build MongoDB query from filters
  const query = buildQuery(filters);
  
  // 2. Get appropriate data based on reportType
  switch(reportType) {
    case 'sales-summary':
      data = await generateSalesSummary(query, groupBy);
      break;
    case 'item-wise':
      data = await generateItemWiseReport(query);
      break;
    // ... other types
  }
  
  // 3. Filter selected fields
  if (selectedFields.length > 0) {
    data = data.map(item => {
      const filtered = {};
      selectedFields.forEach(field => {
        if (item.hasOwnProperty(field)) {
          filtered[field] = item[field];
        }
      });
      return filtered;
    });
  }
  
  return {
    type: reportType,
    count: data.length,
    data: data,
    generatedAt: new Date()
  };
}
```

### 2. Report Card Component

```javascript
// ViewReports.js - Report action handling
const handleRegenerateReport = async (reportId) => {
  // Fetches latest data and updates report
  const response = await fetch(
    `http://localhost:5000/api/reports/${reportId}/generate`,
    { method: 'POST' }
  );
  setSelectedReport(await response.json());
};

const downloadReportCSV = (report) => {
  // Converts report data to CSV format
  const headers = Object.keys(report.generatedData.data[0]);
  const csv = [
    headers.join(','),
    ...report.generatedData.data.map(
      row => headers.map(h => `"${row[h]}"`).join(',')
    )
  ].join('\n');
  
  // Triggers browser download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.reportName}.csv`;
  a.click();
};
```

### 3. Form Validation

```javascript
// AddReport.js - Pre-submission validation
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!reportName.trim()) {
    setMessage('❌ Please enter a report name');
    return;
  }
  
  // Proceed with API call if validation passes
};
```

---

## API Request/Response Examples

### Create Report Request

```bash
POST http://localhost:5000/api/reports/create
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "reportName": "March 2026 Sales",
  "reportType": "sales-summary",
  "description": "Monthly sales overview",
  "filters": {
    "dateFrom": "2026-03-01T00:00:00Z",
    "dateTo": "2026-03-31T23:59:59Z",
    "customer": "",
    "item": "",
    "status": ""
  },
  "selectedFields": ["metric", "value", "orderCount", "totalQuantity"],
  "groupBy": "customer",
  "includeGraphs": true,
  "graphType": "bar"
}
```

### Create Report Response

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "reportId": 1,
  "userId": "507f1f77bcf86cd799439011",
  "reportName": "March 2026 Sales",
  "reportType": "sales-summary",
  "description": "Monthly sales overview",
  "filters": { /* ... */ },
  "selectedFields": ["metric", "value", "orderCount", "totalQuantity"],
  "groupBy": "customer",
  "includeGraphs": true,
  "graphType": "bar",
  "generatedData": {
    "type": "sales-summary",
    "count": 5,
    "data": [
      {
        "customer": "Acme Corp",
        "metric": "Sales",
        "value": 50000,
        "orderCount": 15,
        "totalQuantity": 250
      },
      // ... more records
    ]
  },
  "generatedAt": "2026-02-24T10:30:00Z",
  "createdAt": "2026-02-24T10:30:00Z",
  "isTemplate": false
}
```

---

## Integration Points

### With Existing Modules

1. **Orders Data**: Used for sales reports
2. **Quotations**: Used for status and conversion reports
3. **Leads**: Used for conversion rate calculations
4. **Customers**: Used for customer-wise reports
5. **User Context**: For report ownership (userId)
6. **Settings**: For theme (dark/light mode in reports)

### Sidebar Navigation

```javascript
// HomePage.js
const modules = [
  "Lead", 
  "Quotation", 
  "Order", 
  "Customer", 
  "Follow-Up", 
  "ToDo", 
  "Reports",      // ← Newly added
  "Bulk Upload", 
  "Custom Prints", 
  "Settings"
];

// For modules with Add/View subnav:
{modules.map((mod) => (
  // ... Reports has Add and View options
  case "Reports":
    if (activeSub === "Add") return <AddReport />;
    if (activeSub === "View") return <ViewReports />;
))}
```

---

## Testing Checklist

- [ ] Create Sales Summary report
- [ ] Create Item-wise report
- [ ] Create Customer-wise report
- [ ] Apply date range filters
- [ ] Test grouping options
- [ ] Test field selection
- [ ] Preview report data
- [ ] Download as CSV
- [ ] View saved reports
- [ ] Regenerate report
- [ ] Save as template
- [ ] Delete report
- [ ] Test dark mode
- [ ] Test mobile responsiveness
- [ ] Test with no data (empty state)

---

## Environment Setup

### Required Packages

**Backend** (already included):
- mongoose
- express
- cors
- body-parser

**Frontend** (already included):
- react
- recharts (for future chart integration)

No additional npm packages needed!

---

## Debugging Tips

### Common Issues

**Issue**: Report preview shows no data
- Check filters are correct
- Verify date range includes data
- Ensure Orders collection has data

**Issue**: CSV download not working
- Check browser console for errors
- Verify report has generatedData
- Check CORS settings

**Issue**: Template not saving
- Verify userId is correct
- Check MongoDB connection
- Review network requests in DevTools

---

## Future Enhancement Ideas

```javascript
// Example: Add new report type
// 1. Update reportTypes array
const reportTypes = [
  // ...existing...
  { value: 'custom-pipeline', label: 'Custom Pipeline Report' }
];

// 2. Add to availableFields
availableFields['custom-pipeline'] = ['stage', 'count', 'value'];

// 3. Implement generator function
async function generateCustomPipelineReport(query) {
  // Logic here
  return data;
}

// 4. Add case in generateReportData()
case 'custom-pipeline':
  data = await generateCustomPipelineReport(query);
  break;
```

---

## Performance Considerations

1. **Data Caching**: Generated data is cached in generatedData field
2. **Field Filtering**: Only selected fields are included in response
3. **Grouping**: Reduces data size on export
4. **Pagination**: Currently shows first 20 in modal (can limit in future)
5. **Indexes**: reportId and userId are indexed for fast queries

---

## Security Notes

1. Reports are user-specific (userId tracking)
2. No data validation bypasses
3. MongoDB injection protected (using Mongoose)
4. CORS configured appropriately
5. File downloads are secured

---

**Last Updated**: February 24, 2026
**For Questions**: Refer to REPORTS_FEATURE_GUIDE.md
