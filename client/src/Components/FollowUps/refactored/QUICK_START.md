# Follow-Up Module - Quick Start Guide

## 🚀 Quick Integration

### 1. Import the Component

```javascript
import FollowUpPage from './FollowUps/refactored/pages/FollowUpPage';

function App() {
  return (
    <FollowUpPage 
      onCustomerAdded={() => console.log('Follow-up created!')}
      viewMode="table"
    />
  );
}
```

### 2. Use the Hook Directly

```javascript
import useFollowUps from './FollowUps/refactored/hooks/useFollowUps';

function MyComponent() {
  const {
    followUps,
    loading,
    error,
    createFollowUp,
    updateFollowUp
  } = useFollowUps();

  return (
    <div>
      {loading ? 'Loading...' : `Found ${followUps.length} follow-ups`}
    </div>
  );
}
```

### 3. Use the Service Directly

```javascript
import followUpService from './FollowUps/refactored/services/followUpService';

async function example() {
  try {
    // Get all follow-ups
    const followUps = await followUpService.getFollowUps();

    // Create follow-up
    const newFollowUp = await followUpService.createFollowUp({
      relatedType: 'Lead',
      relatedId: 'lead123',
      followUpDate: new Date().toISOString(),
      notes: 'Follow up tomorrow',
      status: 'Pending'
    });

    // Update follow-up
    const updated = await followUpService.updateFollowUp('followup123', {
      conversationDetails: 'Had a great conversation...',
      nextFollowUpDate: new Date().toISOString()
    });

    // Delete follow-up
    await followUpService.deleteFollowUp('followup123');
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

---

## 📊 Common Tasks

### Show Follow-Ups List

```javascript
import { FollowUpPage } from './FollowUps/refactored';

<FollowUpPage viewMode="table" />
```

### Show Timeline View

```javascript
<FollowUpPage viewMode="timeline" />
```

### Fetch and Display Follow-Ups

```javascript
import useFollowUps from './FollowUps/refactored/hooks/useFollowUps';

function FollowUpsList() {
  const { followUps, loading, fetchFollowUps } = useFollowUps();

  useEffect(() => {
    fetchFollowUps();
  }, []);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <ul>
      {followUps.map(fu => (
        <li key={fu._id}>{fu.entityName} - {fu.status}</li>
      ))}
    </ul>
  );
}
```

### Create a Follow-Up

```javascript
import useFollowUps from './FollowUps/refactored/hooks/useFollowUps';

function CreateFollowUp() {
  const {
    formData,
    setFormData,
    selectedEntry,
    setSelectedEntry,
    createFollowUp
  } = useFollowUps();

  const handleCreate = async () => {
    const success = await createFollowUp();
    if (success) {
      console.log('Created successfully!');
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCreate();
    }}>
      <input
        type="date"
        value={formData.followUpDate}
        onChange={(e) => setFormData({
          ...formData,
          followUpDate: e.target.value
        })}
      />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Filter Follow-Ups

```javascript
import useFollowUps from './FollowUps/refactored/hooks/useFollowUps';

function FilteredFollowUps() {
  const {
    setFilterStatus,
    setSearchQuery,
    getFilteredFollowUps
  } = useFollowUps();

  return (
    <>
      <select onChange={(e) => setFilterStatus(e.target.value)}>
        <option value="all">All</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>
      
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <pre>{JSON.stringify(getFilteredFollowUps(), null, 2)}</pre>
    </>
  );
}
```

---

## 🔍 Component Reference

### FollowUpPage
Main container component
```javascript
<FollowUpPage 
  onCustomerAdded={callback}
  viewMode="table" // 'entries' | 'table' | 'timeline'
/>
```

### FollowUpTable
Display table of follow-ups
```javascript
<FollowUpTable
  entries={followUps}
  isLoading={loading}
  type="followups"
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
/>
```

### FollowUpModal
Create/edit form modal
```javascript
<FollowUpModal
  isOpen={isOpen}
  mode="create"
  onClose={closeModal}
  onSubmit={submitForm}
  formData={data}
  onFormDataChange={setData}
/>
```

### FollowUpFilters
Filter and search controls
```javascript
<FollowUpFilters
  filterStatus={status}
  onFilterStatusChange={setStatus}
  searchQuery={query}
  onSearchChange={setQuery}
  sortBy={sort}
  onSortChange={setSort}
/>
```

### FollowUpDrawer
Detailed side drawer
```javascript
<FollowUpDrawer
  isOpen={isOpen}
  followUp={followUp}
  onClose={closeDrawer}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### DashboardCards
Statistics dashboard
```javascript
<DashboardCards
  followUps={followUps}
  isLoading={loading}
/>
```

### FollowUpTimeline
Timeline visualization
```javascript
<FollowUpTimeline
  followUps={followUps}
  isLoading={loading}
  onSelect={selectFollowUp}
/>
```

---

## 🎨 Utility Functions

### Date Functions
```javascript
import { 
  formatDate, 
  formatTime, 
  getRelativeTime,
  getDaysUntil 
} from './FollowUps/refactored/utils/helpers';

formatDate(new Date())              // "Jan 15, 2024"
formatTime(new Date())              // "02:30 PM"
getRelativeTime(futureDate)         // "in 2 days"
getDaysUntil(targetDate)            // 5 (days)
```

### String Functions
```javascript
import { 
  truncateText, 
  capitalize,
  getInitials 
} from './FollowUps/refactored/utils/helpers';

truncateText("Long text...", 10)    // "Long text..."
capitalize("john")                  // "John"
getInitials("John Doe")             // "JD"
```

### Array Functions
```javascript
import { 
  sortBy, 
  filterBy, 
  groupBy 
} from './FollowUps/refactored/utils/helpers';

sortBy(array, 'name', 'asc')
filterBy(array, { status: 'Pending' })
groupBy(array, 'status')
```

---

## 📋 Constants

### Tab Configuration
```javascript
import { FOLLOW_UP_TABS } from './FollowUps/refactored/constants/config';

// [{ id: 'leads', label: 'Leads', ... }, ...]
```

### Status Values
```javascript
import { FOLLOW_UP_STATUS } from './FollowUps/refactored/constants/config';

FOLLOW_UP_STATUS.PENDING      // 'Pending'
FOLLOW_UP_STATUS.COMPLETED    // 'Completed'
```

### Error Messages
```javascript
import { ERROR_MESSAGES } from './FollowUps/refactored/constants/config';

ERROR_MESSAGES.REQUIRED_FIELDS
ERROR_MESSAGES.INVALID_DATE
ERROR_MESSAGES.SUBMIT_ERROR
```

---

## 🔐 API Endpoints Used

```
GET    /api/followups              # Get all follow-ups
POST   /api/followups              # Create follow-up
PUT    /api/followups/:id          # Update follow-up
DELETE /api/followups/:id          # Delete follow-up

GET    /api/leads                  # Get leads
GET    /api/leads/:id              # Get single lead
GET    /api/quotations             # Get quotations
GET    /api/quotations/:id         # Get single quotation
```

---

## 💾 Data Structure

### Follow-Up Object
```javascript
{
  _id: 'ObjectId',
  relatedType: 'Lead' | 'Quotation',
  relatedId: 'ObjectId',
  followUpDate: 'ISO Date',
  notes: 'string',
  status: 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled' | 'Cancelled',
  conversationDetails: 'string',
  nextFollowUpDate: 'ISO Date',
  createdAt: 'ISO Date',
  updatedAt: 'ISO Date',
  
  // Enriched fields
  entityName: 'string',
  entityEmail: 'string',
  entityPhone: 'string'
}
```

### Form Data Structure
```javascript
{
  followUpNote: 'string',           // For creation
  followUpDate: 'YYYY-MM-DD',       // For creation
  followUpTime: 'HH:mm',            // For creation
  conversationDetails: 'string',    // For updates
  nextFollowUpDate: 'YYYY-MM-DD',   // Optional reschedule
  nextFollowUpTime: 'HH:mm'         // Optional reschedule
}
```

---

## 🎯 State Management Patterns

### Get Current Data
```javascript
const { followUps } = useFollowUps();
```

### Filter Data
```javascript
const { getFilteredFollowUps } = useFollowUps();
const filtered = getFilteredFollowUps();
```

### Sort Data
```javascript
const { getSortedFollowUps, setSortBy } = useFollowUps();
const sorted = getSortedFollowUps();
setSortBy('date-asc');
```

### Paginate Data
```javascript
const {
  getPaginatedFollowUps,
  currentPage,
  setCurrentPage,
  getTotalPages
} = useFollowUps();

const pageData = getPaginatedFollowUps();
const maxPages = getTotalPages();
```

---

## 🛠️ Error Handling Patterns

### Catch Errors
```javascript
const { error, setError } = useFollowUps();

if (error) {
  return <div className="error">{error}</div>;
}
```

### Handle Async Operations
```javascript
const { createFollowUp, isSubmitting } = useFollowUps();

const handleSubmit = async () => {
  const success = await createFollowUp();
  if (success) {
    // Success
  }
};
```

### Loading States
```javascript
const { loading, isLoadingTab, isSubmitting } = useFollowUps();

if (loading) return <Spinner />;
if (isLoadingTab) return <TabSpinner />;
if (isSubmitting) return <SubmitSpinner />;
```

---

## 📱 Responsive Considerations

All components are mobile-responsive:
- Tablets (1024px): Minor layout adjustments
- Phones (768px): Hide non-essential columns, stack buttons
- Small phones (640px): Simplified layout, full-width elements

---

## 🚨 Common Issues & Solutions

### Issue: Hook called outside component
**Solution**: Ensure hook is called directly in component, not in loops/conditions

### Issue: Stale closures
**Solution**: Use `useCallback` for memoized callbacks

### Issue: Memory leaks
**Solution**: Clean up modals/drawers properly with `onClose`

### Issue: Infinite re-renders
**Solution**: Check useEffect dependencies, avoid circular updates

### Issue: Cache not updating
**Solution**: Call `fetchFollowUps(true)` with `forceRefresh = true`

---

## 📚 File Organization

```
Before (Monolithic):
├── AddFollowUp.js        (1 file, 300+ lines)
└── ViewFollowUp.js

After (Modular):
├── pages/FollowUpPage.jsx              (main logic)
├── components/common/ (5 reusable)     (isolated UI)
├── components/features/ (2 features)   (feature-specific)
├── hooks/useFollowUps.js               (state & logic)
├── services/followUpService.js         (API calls)
├── utils/helpers.js                    (utilities)
├── constants/config.js                 (configuration)
└── styles/ (8 CSS files)               (scoped styling)
```

---

## ✅ Checklist for Usage

- [ ] Import FollowUpPage in your app
- [ ] Pass `onCustomerAdded` callback
- [ ] Set appropriate `viewMode`
- [ ] Include all CSS files
- [ ] Ensure API endpoints are correct
- [ ] Test on mobile devices
- [ ] Check error handling
- [ ] Verify loading states
- [ ] Test filters and search
- [ ] Validate form inputs

---

## 🔗 Related Files

- Backend API: `/server/routes/followUps.js`
- Models: `/server/models/FollowUp.js`
- Original: `/client/src/Components/FollowUps/AddFollowUp.js`
- Documentation: `/client/src/Components/FollowUps/refactored/ARCHITECTURE.md`
