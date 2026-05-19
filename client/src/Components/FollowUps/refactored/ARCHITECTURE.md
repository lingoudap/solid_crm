# Follow-Up Module - Refactored Architecture Guide

## 📋 Overview

The Follow-Up module has been completely refactored from a monolithic component into a scalable, modular, reusable architecture following React best practices.

### Key Improvements

✅ **Component Separation** - Broken down into focused, single-responsibility components  
✅ **Custom Hooks** - Centralized state management with `useFollowUps`  
✅ **API Layer Abstraction** - Dedicated service for all API calls  
✅ **Performance Optimization** - Memoization, debouncing, caching, pagination  
✅ **Error Handling** - Comprehensive error management throughout  
✅ **Loading States** - Proper loading indicators for all async operations  
✅ **Responsive Design** - Mobile-friendly CSS with media queries  
✅ **TypeScript-Ready** - Clean structure for easy TypeScript migration  

---

## 📁 Folder Structure

```
client/src/Components/FollowUps/refactored/
├── pages/
│   └── FollowUpPage.jsx          # Main container component
├── components/
│   ├── common/                    # Reusable UI components
│   │   ├── FollowUpTabs.jsx
│   │   ├── FollowUpTable.jsx
│   │   ├── FollowUpModal.jsx
│   │   ├── FollowUpFilters.jsx
│   │   └── FollowUpDrawer.jsx
│   └── features/                  # Feature-specific components
│       ├── DashboardCards.jsx
│       └── FollowUpTimeline.jsx
├── hooks/
│   └── useFollowUps.js            # Custom hook for state management
├── services/
│   └── followUpService.js         # API service layer
├── styles/
│   ├── followup-page.css
│   ├── followup-tabs.css
│   ├── followup-filters.css
│   ├── followup-table.css
│   ├── followup-modal.css
│   ├── followup-drawer.css
│   ├── dashboard-cards.css
│   └── followup-timeline.css
├── utils/
│   └── helpers.js                 # Utility functions
├── constants/
│   └── config.js                  # Configuration & constants
└── index.js                        # Central export point
```

---

## 🧩 Component Architecture

### Pages
- **FollowUpPage.jsx** - Main container orchestrating all subcomponents

### Common Components (Reusable)
- **FollowUpTabs** - Tab navigation between Leads/Quotations
- **FollowUpTable** - Displays entries or follow-ups in table format
- **FollowUpModal** - Form for creating/editing follow-ups
- **FollowUpFilters** - Advanced filtering and search controls
- **FollowUpDrawer** - Side drawer for detailed view

### Feature Components
- **DashboardCards** - Statistics cards with counts by status
- **FollowUpTimeline** - Timeline visualization of follow-ups

---

## 🎯 Custom Hook: `useFollowUps`

The `useFollowUps` hook manages all state and logic for the Follow-Up module.

### Features

- **Tab Management** - Active tab, counts
- **Data Management** - Follow-ups, entries, selected items
- **State Management** - Loading, error, submission states
- **Form Data** - Centralized form state
- **Modals & Drawers** - Open/close handlers
- **Filtering & Sorting** - Multiple filter criteria
- **Pagination** - Page and size management
- **Operations** - Create, read, update, delete
- **Caching** - 5-minute cache for tab counts

### Usage

```javascript
import { useFollowUps } from '../hooks/useFollowUps';

function MyComponent() {
  const {
    activeTab,
    setActiveTab,
    followUps,
    loading,
    error,
    openModal,
    createFollowUp,
    // ... more properties
  } = useFollowUps();

  return (
    // Component JSX
  );
}
```

---

## 🔌 API Service Layer

The `followUpService` provides a clean abstraction for all API calls.

### Key Methods

```javascript
// Follow-Up Operations
getFollowUps()                          // Get all follow-ups
createFollowUp(followUpData)            // Create new follow-up
updateFollowUp(id, updateData)          // Update existing
deleteFollowUp(id)                      // Delete follow-up
getFollowUpsWithDetails()                // Get with enriched data

// Related Entity Operations
getLeads()                              // Get all leads
getLeadById(id)                         // Get single lead
getQuotations()                         // Get all quotations
getQuotationById(id)                    // Get single quotation

// Batch Operations
getTabCounts()                          // Get counts for tabs
```

### Error Handling

All API calls include proper error handling and throw informative errors.

```javascript
try {
  const followUps = await followUpService.getFollowUps();
} catch (error) {
  console.error('Failed to fetch:', error.message);
}
```

---

## 📊 State Management

### Hook State Structure

```javascript
{
  // Tab & Navigation
  activeTab: 'leads' | 'quotations',
  tabCounts: { leads: 0, quotations: 0 },
  
  // Data
  followUps: [],
  entries: [],
  selectedEntry: null,
  selectedFollowUp: null,
  
  // Loading & Error
  loading: false,
  isLoadingTab: false,
  error: null,
  isSubmitting: false,
  submitSuccess: false,
  
  // Form
  formData: {
    followUpNote: '',
    followUpDate: '',
    followUpTime: '',
    conversationDetails: '',
    nextFollowUpDate: '',
    nextFollowUpTime: ''
  },
  
  // UI State
  isModalOpen: false,
  isDrawerOpen: false,
  isUpdateModalOpen: false,
  
  // Filters & Sort
  filterStatus: 'all',
  searchQuery: '',
  sortBy: 'date-desc',
  startDate: null,
  endDate: null,
  
  // Pagination
  currentPage: 1,
  pageSize: 10
}
```

---

## 🎨 Component Props

### FollowUpPage

```javascript
<FollowUpPage
  onCustomerAdded={() => {}}  // Callback when follow-up created
  viewMode="table"             // 'entries' | 'table' | 'timeline'
/>
```

### FollowUpTable

```javascript
<FollowUpTable
  entries={[]}                 // Array of items to display
  isLoading={false}            // Loading state
  type="entries"               // 'entries' | 'followups'
  onAddFollowUp={(entry) => {}}
  onEdit={(followUp) => {}}
  onDelete={(id) => {}}
  onView={(followUp) => {}}
  emptyMessage="No data"
/>
```

### FollowUpModal

```javascript
<FollowUpModal
  isOpen={true}
  onClose={() => {}}
  onSubmit={() => {}}
  selectedEntry={null}
  formData={{}}
  onFormDataChange={(data) => {}}
  isSubmitting={false}
  error={null}
  mode="create"                // 'create' | 'edit'
/>
```

---

## 🔄 Data Flow

### Create Follow-Up Flow

```
User clicks "Add Follow-Up"
    ↓
Modal Opens (openModal)
    ↓
User fills form (formData updates)
    ↓
User submits form
    ↓
Validation runs
    ↓
API call: createFollowUp(data)
    ↓
Success/Error handling
    ↓
Modal closes (closeModal)
    ↓
Data refreshed (fetchFollowUps)
    ↓
Callback fired (onCustomerAdded)
```

### Update Follow-Up Flow

```
User clicks "Edit" on follow-up
    ↓
Drawer opens with details (openDrawer)
    ↓
User clicks "Edit" button
    ↓
Modal opens with form (openUpdateModal)
    ↓
Form filled with existing data
    ↓
User updates data (formData updates)
    ↓
User submits
    ↓
API call: updateFollowUp(id, data)
    ↓
Success/Error handling
    ↓
Modal closes
    ↓
Data refreshed
```

---

## 🛡️ Error Handling

### API Error Handling

```javascript
// Service automatically throws errors
try {
  await followUpService.createFollowUp(data);
} catch (error) {
  setError(error.message);
}
```

### Validation

```javascript
// Form validation in modal
const validateForm = () => {
  const errors = {};
  
  if (!formData.followUpDate) {
    errors.followUpDate = 'Date is required';
  }
  
  return Object.keys(errors).length === 0;
};
```

---

## 📱 Responsive Design

All components are fully responsive with breakpoints at:
- **1024px** - Tablet (medium adjustments)
- **768px** - Mobile (major layout changes)
- **640px** - Small mobile (hide columns, adjust sizing)

Example CSS:
```css
@media (max-width: 768px) {
  .col-notes { display: none; }
  .action-buttons { flex-direction: column; }
}
```

---

## ⚡ Performance Optimizations

### 1. **Hook Optimization**
- `useCallback` for memoized functions
- `useRef` for cache management
- `useMemo` for computed values

### 2. **Caching**
- 5-minute cache for tab counts
- Cache invalidation on operations
- Manual refresh option

### 3. **Debouncing**
- Search input debounced to 300ms
- Prevents excessive API calls

### 4. **Pagination**
- Server-side friendly pagination
- Configurable page size
- Reset on filter changes

### 5. **Lazy Loading**
- Modals load only when opened
- Drawer loads details on demand

---

## 🔐 Data Validation

### Constants for Validation

```javascript
VALIDATION_RULES = {
  NOTE_MIN_LENGTH: 3,
  NOTE_MAX_LENGTH: 500,
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
  TIME_FORMAT: /^\d{2}:\d{2}$/
}
```

### Validation in Modal

- Client-side validation before submit
- Error messages displayed inline
- Disabled submit on validation failure

---

## 🎯 Status Management

### Follow-Up Statuses

```javascript
FOLLOW_UP_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  RESCHEDULED: 'Rescheduled',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled'
}
```

### Status Colors

```javascript
STATUS_COLORS = {
  'Pending': '#fbbf24',      // Yellow
  'Completed': '#34d399',    // Green
  'Rescheduled': '#60a5fa',  // Blue
  'Overdue': '#f87171',      // Red
  'Cancelled': '#9ca3af'     // Gray
}
```

---

## 🧮 Utility Functions

### Date Utilities
- `formatDate()` - Format date to string
- `formatTime()` - Format time only
- `formatDateTime()` - Format both
- `isDateInPast()` - Check if date passed
- `getDaysUntil()` - Days until follow-up
- `getRelativeTime()` - "in 2 days", "yesterday"

### Data Utilities
- `sortBy()` - Sort array by key
- `filterBy()` - Filter by criteria
- `groupBy()` - Group array
- `truncateText()` - Truncate with suffix
- `capitalize()` - Capitalize text

### Validation Utilities
- `isValidEmail()` - Email validation
- `isValidPhone()` - Phone validation

### Object Utilities
- `deepClone()` - Deep clone objects
- `mergeObjects()` - Merge two objects
- `isDeepEqual()` - Compare objects

---

## 📚 Constants

All configuration in `constants/config.js`:
- `API_BASE_URL` - API endpoint
- `FOLLOW_UP_TABS` - Tab configuration
- `FOLLOW_UP_STATUS` - Status definitions
- `SORT_OPTIONS` - Sorting options
- `PAGINATION` - Page size options
- `ERROR_MESSAGES` - Standard error text
- `SUCCESS_MESSAGES` - Success notifications

---

## 🚀 Usage Examples

### Import and Use Components

```javascript
import {
  FollowUpPage,
  useFollowUps,
  followUpService,
  formatDate
} from './FollowUps/refactored';

// Use in App.js
<FollowUpPage onCustomerAdded={() => refetch()} />
```

### Create Custom Hook Usage

```javascript
import useFollowUps from './hooks/useFollowUps';

function CustomFollowUpComponent() {
  const { followUps, loading, createFollowUp } = useFollowUps();
  
  return (
    <div>
      {loading ? 'Loading...' : followUps.length}
    </div>
  );
}
```

### Use Service Directly

```javascript
import followUpService from './services/followUpService';

async function handleCreate(data) {
  try {
    const result = await followUpService.createFollowUp(data);
    console.log('Created:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🔧 Customization Guide

### Change Default Page Size

Edit `constants/config.js`:
```javascript
PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,  // Changed from 10
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100]
}
```

### Add New Filter

In `FollowUpFilters.jsx`:
```javascript
<div className="filter-group">
  <label>Priority</label>
  <select onChange={(e) => onPriorityChange(e.target.value)}>
    <option value="all">All Priorities</option>
    <option value="high">High</option>
    <option value="medium">Medium</option>
    <option value="low">Low</option>
  </select>
</div>
```

### Customize Status Colors

Edit `constants/config.js` and `helpers.js`:
```javascript
STATUS_COLORS = {
  'Pending': '#YOUR_COLOR'
}
```

---

## 🐛 Debugging

### Enable Console Logs

The service logs all errors:
```javascript
// In followUpService.js
catch (error) {
  console.error('Error message:', error);
  throw error;
}
```

### Check State

```javascript
// In any component using hook
const { followUps, loading, error } = useFollowUps();

console.log('Follow-ups:', followUps);
console.log('Loading:', loading);
console.log('Error:', error);
```

---

## 📈 Future Enhancements

- [ ] Export to CSV/PDF
- [ ] Bulk operations
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Recurring follow-ups
- [ ] Custom fields
- [ ] WebSocket real-time updates
- [ ] Activity audit log
- [ ] Attachments support
- [ ] Integration with calendar

---

## 🎓 Best Practices

1. **Always use the custom hook** - Don't duplicate state management
2. **Use the service layer** - Don't call APIs directly from components
3. **Handle errors properly** - Show user-friendly error messages
4. **Show loading states** - Never leave users without feedback
5. **Validate forms** - Both client and server-side
6. **Use utility functions** - For dates, text, validation
7. **Keep components focused** - Single responsibility principle
8. **Memoize expensive operations** - Use useCallback and useMemo
9. **Close modals properly** - Prevent memory leaks
10. **Test responsiveness** - Check on multiple screen sizes

---

## 📞 Support

For questions or issues with the refactored Follow-Up module, refer to:
- Component-specific comments in the code
- This documentation guide
- Error messages and console logs
- API service error responses
