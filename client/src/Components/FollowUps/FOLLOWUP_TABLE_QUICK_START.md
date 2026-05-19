# Follow-Up Table Component - Quick Reference

## 📋 Overview

Professional, feature-rich React table component for managing CRM follow-ups with advanced filtering, pagination, sorting, and more.

**File Locations:**
- Component: `FollowUpTableComponent.jsx`
- Styles: `FollowUpTable.css`
- Guide: `FOLLOWUP_TABLE_GUIDE.js`

---

## 🚀 Quick Start (2 minutes)

### 1. Import Component
```javascript
import FollowUpTable from "./FollowUpTableComponent";
```

### 2. Add to Your Component
```javascript
<FollowUpTable
  followUps={followUps}
  loading={loading}
  onEdit={(followUp) => console.log("Edit:", followUp)}
  onDelete={(id) => console.log("Delete:", id)}
  onComplete={(id) => console.log("Complete:", id)}
  onReschedule={(followUp) => console.log("Reschedule:", followUp)}
  onViewTimeline={(followUp) => console.log("Timeline:", followUp)}
/>
```

### 3. Fetch Data
```javascript
useEffect(() => {
  fetch("/api/followups")
    .then((res) => res.json())
    .then((data) => setFollowUps(data.data))
    .catch((err) => console.error(err));
}, []);
```

---

## 📊 Features & Capabilities

### ✅ Core Features
| Feature | Description |
|---------|-------------|
| **Pagination** | 10/20/50/100 items per page |
| **Search** | Full-text search by name, email, remarks |
| **Sorting** | Click column headers to sort |
| **Filtering** | By status, priority |
| **Bulk Selection** | Select multiple rows |
| **Bulk Actions** | Delete or status change selected |
| **CSV Export** | Download table data as CSV |
| **Sticky Header** | Header stays visible when scrolling |
| **Responsive** | Mobile, tablet, desktop optimized |
| **Loading States** | Skeleton loaders while fetching |
| **Empty States** | Helpful message when no data |

### 🎨 Visual Features
| Feature | Details |
|---------|---------|
| **Status Badges** | 5 colors for different statuses |
| **Priority Badges** | 4 colors (critical/high/medium/low) |
| **Row Actions** | Edit, Complete, Reschedule, Timeline, Delete |
| **Hover Effects** | Visual feedback on interactive elements |
| **Icons** | Emoji-based quick visual recognition |
| **Animations** | Smooth transitions and skeleton loading |

---

## 📦 Props

### Required Props
```javascript
{
  followUps: Array,  // Array of follow-up objects
}
```

### Optional Props
```javascript
{
  loading: Boolean,           // Show skeleton loaders
  onEdit: Function,           // (followUp) => {}
  onDelete: Function,         // (id) => {}
  onComplete: Function,       // (id) => {}
  onReschedule: Function,     // (followUp) => {}
  onViewTimeline: Function,   // (followUp) => {}
  onExportCSV: Function,      // () => {}
  onBulkDelete: Function,     // (ids) => {}
  onBulkStatusChange: Function // (ids, status) => {}
}
```

### Follow-Up Object Structure
```javascript
{
  _id: String,                           // Unique ID
  customerName: String,                  // Customer name
  email: String,                         // Customer email
  relatedType: String,                   // "Lead", "Quotation", "Customer", "Order"
  followUpDate: Date|String,             // ISO date string
  followUpTime: String,                  // "HH:MM" format
  status: String,                        // "Pending", "In Progress", "Completed", "Rescheduled", "Cancelled"
  priority: String,                      // "low", "medium", "high", "critical"
  assignedTo: {                          // User object (optional)
    _id: String,
    name: String,
    email: String
  },
  remark: String,                        // Brief note
  nextFollowUp: {                        // Next scheduled (optional)
    followUpDate: Date|String,
    followUpTime: String
  }
}
```

---

## 🔧 Basic Usage Examples

### Simple Implementation
```javascript
import React, { useState, useEffect } from "react";
import FollowUpTable from "./FollowUpTableComponent";

function FollowUpPage() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/followups")
      .then((res) => res.json())
      .then((data) => setFollowUps(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <FollowUpTable
      followUps={followUps}
      loading={loading}
      onEdit={(fu) => alert("Edit: " + fu.customerName)}
      onDelete={(id) => alert("Delete: " + id)}
      onComplete={(id) => alert("Complete: " + id)}
      onReschedule={(fu) => alert("Reschedule: " + fu.customerName)}
      onViewTimeline={(fu) => alert("Timeline: " + fu.customerName)}
    />
  );
}

export default FollowUpPage;
```

### With Modal Integration
```javascript
import Modal from "react-modal";

function FollowUpPageWithModal() {
  const [followUps, setFollowUps] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);

  const handleEdit = (followUp) => {
    setSelectedFollowUp(followUp);
    setModalOpen(true);
  };

  const handleSave = async (updatedData) => {
    const response = await fetch(`/api/followups/${selectedFollowUp._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    // Refresh table...
    setModalOpen(false);
  };

  return (
    <>
      <FollowUpTable followUps={followUps} onEdit={handleEdit} />
      {modalOpen && (
        <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)}>
          <EditFollowUpModal followUp={selectedFollowUp} onSave={handleSave} />
        </Modal>
      )}
    </>
  );
}
```

### With React Query (Recommended)
```javascript
import { useQuery, useMutation, useQueryClient } from "react-query";

function FollowUpPage() {
  const queryClient = useQueryClient();

  const { data: followUps = [], isLoading } = useQuery("followups", () =>
    fetch("/api/followups").then((res) => res.json())
  );

  const deleteMutation = useMutation((id) =>
    fetch(`/api/followups/${id}`, { method: "DELETE" })
  );

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => queryClient.invalidateQueries("followups"),
    });
  };

  return (
    <FollowUpTable
      followUps={followUps.data || []}
      loading={isLoading}
      onDelete={handleDelete}
    />
  );
}
```

---

## 🎨 Styling

### Using Provided CSS
The component comes with complete styling in `FollowUpTable.css`:

```javascript
import "./FollowUpTable.css";
import FollowUpTable from "./FollowUpTableComponent";
```

**CSS Features:**
- ✅ Modern, professional design
- ✅ Dark mode compatible
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Accessible color contrasts
- ✅ Smooth animations
- ✅ Print-friendly styles

### Customizing Styles

**Override CSS variables:**
```css
:root {
  --primary-color: #3b82f6;
  --success-color: #34d399;
  --danger-color: #ef4444;
  --text-primary: #111827;
  /* ... more variables ... */
}
```

**Or modify specific classes:**
```css
.badge-status {
  /* Your custom styles */
}

.table-row:hover {
  /* Your custom hover effect */
}
```

---

## 🔍 Search & Filter Examples

### Search Functionality
- Searches: Customer name, email, remarks
- Real-time filtering
- Case-insensitive
- Press "Reset Filters" to clear

### Status Filter
```
Options: Pending, In Progress, Completed, Rescheduled, Cancelled
```

### Priority Filter
```
Options: Low, Medium, High, Critical
```

### Combining Filters
The component automatically combines all active filters:
```
Customer Name = "Ahmed" AND Status = "Pending" AND Priority = "High"
```

---

## 📱 Responsive Behavior

### Desktop (1024px+)
- All columns visible
- Full-width table
- All features enabled
- Hover effects active

### Tablet (768px - 1024px)
- Some columns hidden (non-essential)
- Adjusted spacing
- All features enabled
- Touch-friendly buttons

### Mobile (< 640px)
- Only essential columns shown
- Simplified layout
- Stacked buttons
- Touch-optimized
- Scrollable table

---

## 📊 Column Details

| Column | Sortable | Searchable | Filterable | Width |
|--------|----------|-----------|-----------|-------|
| Customer Name | ✅ | ✅ | ✅ | 15% |
| Type | ✅ | ❌ | ❌ | 10% |
| Follow-Up Date | ✅ | ❌ | ❌ | 12% |
| Time | ✅ | ❌ | ❌ | 8% |
| Status | ✅ | ❌ | ✅ | 10% |
| Priority | ✅ | ❌ | ✅ | 10% |
| Assigned User | ✅ | ❌ | ❌ | 12% |
| Last Remark | ❌ | ✅ | ❌ | 15% |
| Next Follow-Up | ✅ | ❌ | ❌ | 12% |
| Actions | ❌ | ❌ | ❌ | 8% |

---

## 🎯 Actions (Row Buttons)

### Edit (✎)
```javascript
onEdit={(followUp) => {
  // Open edit modal
  // Show follow-up details
}}
```

### Complete (✓)
```javascript
onComplete={(id) => {
  // Mark as completed
  // Set outcome
  // Update status
})
```

### Reschedule (📅)
```javascript
onReschedule((followUp) => {
  // Open reschedule modal
  // Change follow-up date/time
})
```

### Timeline (📈)
```javascript
onViewTimeline((followUp) => {
  // Show follow-up history
  // Display timeline view
})
```

### More Options (⋮)
```
- Delete
- Copy ID
```

---

## 💾 CSV Export

### What Gets Exported?
Columns included:
- Customer Name
- Type
- Follow-Up Date
- Time
- Status
- Priority
- Assigned User
- Last Remark
- Next Follow-Up

### Export Selection
- **No selection**: Exports all visible rows
- **Rows selected**: Exports only selected rows

### File Format
```
CSV (Comma-Separated Values)
Filename: followups_[timestamp].csv
Encoding: UTF-8
```

### Example CSV Output
```
"Customer Name","Type","Follow-Up Date","Time","Status","Priority","Assigned User","Last Remark","Next Follow-Up"
"Ahmed Hassan","Lead","May 20, 2026","14:30","Pending","High","John Doe","Check interest","May 27, 2026"
"Fatima Al-Dosari","Quotation","May 19, 2026","10:00","In Progress","Critical","Jane Smith","Send reminder","May 22, 2026"
```

---

## 🔄 Bulk Operations

### Select Multiple Rows
1. Click checkbox in individual rows
2. Or check the header checkbox to select all on current page

### Bulk Delete
```javascript
onBulkDelete={(ids) => {
  // Delete all selected follow-ups
  ids.forEach(id => deleteFollowUp(id));
}}
```

### Bulk Status Change
```javascript
onBulkStatusChange={(ids, newStatus) => {
  // Update status for all selected
  ids.forEach(id => updateStatus(id, newStatus));
}}
```

---

## 🔃 Sorting

### Click Column Headers to Sort
- **First click**: Ascending (A→Z)
- **Second click**: Descending (Z→A)
- **Arrow indicator**: Shows current sort direction (↑/↓)

### Default Sort
- Field: `followUpDate`
- Order: Ascending (earliest first)

### Multi-field Sorting
Current implementation: Single field
To add multi-field: Modify the `sortedFollowUps` logic

---

## ⚡ Performance Optimization

### Built-in Optimizations
```javascript
- useMemo for filtered & sorted data
- useCallback for event handlers
- Pagination reduces rendered rows
- Virtual scrolling ready
```

### For Large Datasets (1000+ items)
```javascript
// Use pagination
<FollowUpTable itemsPerPage={50} />

// Consider virtual scrolling library
import { FixedSizeList } from 'react-window';

// Implement server-side filtering
onSearchChange={(query) => fetchFromServer(query)}
```

---

## 🛠️ Customization Examples

### Custom Badge Colors
```javascript
// Modify FollowUpTable.css
.bg-yellow-100 {
  background-color: #your-color;
}
```

### Custom Column Renderer
```javascript
const customRenders = {
  customerName: (value) => (
    <a href={`/customer/${value}`}>{value}</a>
  ),
  priority: (value) => {
    const icons = { high: "🔴", medium: "🟡", low: "🟢" };
    return `${icons[value]} ${value}`;
  }
};
```

### Custom Empty State
```javascript
// Modify the EmptyState component
<div className="custom-empty">
  <img src="/empty.svg" />
  <h3>No Follow-Ups</h3>
</div>
```

---

## 🧪 Testing

### Test Sample Data
```javascript
const testFollowUps = [
  {
    _id: "1",
    customerName: "John Doe",
    email: "john@example.com",
    relatedType: "Lead",
    followUpDate: new Date(Date.now() + 3*24*60*60*1000),
    followUpTime: "14:30",
    status: "Pending",
    priority: "high",
    assignedTo: { _id: "u1", name: "Jane Smith" },
    remark: "Test remark",
  }
];

<FollowUpTable followUps={testFollowUps} />
```

### Mock API Responses
```javascript
jest.mock('fetch');
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: testFollowUps })
  })
);
```

---

## 📱 Browser Support

✅ Chrome (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Edge (latest)
✅ Mobile browsers

---

## 🚀 Production Checklist

- [ ] Import component and CSS
- [ ] Set up API endpoints
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Implement action handlers
- [ ] Test on mobile devices
- [ ] Test search & filters
- [ ] Test sorting
- [ ] Test pagination
- [ ] Test CSV export
- [ ] Test bulk operations
- [ ] Performance test with real data
- [ ] User acceptance testing
- [ ] Deploy to production

---

## 🆘 Troubleshooting

### Table Not Showing
```javascript
// Check 1: CSS import
import "./FollowUpTable.css";

// Check 2: Data prop
console.log(followUps); // Should be an array

// Check 3: Required fields in data
// Must have: _id, customerName, followUpDate, status, priority
```

### Sorting Not Working
```javascript
// Check: Field names match object keys
// Example: sortField = "followUpDate" (not "date")
```

### Search Not Working
```javascript
// Check: Data has searchable fields
// Searches: customerName, email, remark

// Debug:
console.log(filteredFollowUps);
```

### Performance Issues
```javascript
// Use pagination
<FollowUpTable itemsPerPage={50} />

// Reduce data: Only fetch visible fields
// Use useMemo for expensive computations
```

---

## 📚 File Structure

```
FollowUps/
├── FollowUpTableComponent.jsx      (Main component - 550 lines)
├── FollowUpTable.css               (Styles - 800+ lines)
├── FOLLOWUP_TABLE_GUIDE.js         (Examples & integration)
└── FOLLOWUP_QUICK_START.md         (This file)
```

---

**Ready to use! Start with the "Quick Start" section above.** 🚀

For detailed examples, see `FOLLOWUP_TABLE_GUIDE.js`
For complete API reference, see component comments
For styling customization, see `FollowUpTable.css`
