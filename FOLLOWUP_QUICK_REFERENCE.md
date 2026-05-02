# Follow-Up Component - Quick Reference Guide

## 🚀 What Changed?

**Dropdown → Tabs** with count badges, loading state, and improved UX

---

## 📋 File Locations

| File | Location | Changes |
|------|----------|---------|
| **Component** | `client/src/Components/FollowUps/AddFollowUp.js` | ✅ Complete refactor |
| **Styles** | `client/src/Components/FollowUps/AddFollowUp.css` | ✅ New tab styles + animations |

---

## 🎨 Visual Guide

### Tab Interface
```
┌─────────────────────────────────────────────────┐
│ Add Follow-Up                                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  Leads (12) │ Quotations (8)                    │
│  ━━━━━━━━   │                                   │
│             │ (Underline = active)              │
│                                                  │
│  📊 Table loads here                            │
│  (Updates based on active tab)                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Active Tab Style
- **Text Color:** Blue (#3b82f6)
- **Bottom Border:** Blue
- **Background:** Light blue (#eff6ff)
- **Badge:** Blue background, white text

### Inactive Tab Style
- **Text Color:** Gray (#6b7280)
- **Bottom Border:** Transparent
- **Background:** Transparent
- **Badge:** Light gray background, dark text

---

## 🔧 Key Features

### 1. Tab Navigation
```jsx
<button
  onClick={() => handleTabChange(tabId)}
  className={`followup-tab ${activeTab === tabId ? "active" : ""}`}
>
  <span className="tab-label">{label}</span>
  <span className="tab-count">{count}</span>
</button>
```

### 2. Loading State
```jsx
{isLoadingTab && (
  <div className="loading-indicator">
    <div className="spinner"></div>
    <span>Loading Leads...</span>
  </div>
)}
```

### 3. Count Badges
- Fetch on mount: `fetchTabCounts()`
- Update state: `tabCounts = { leads: 12, quotations: 8 }`
- Display: `<span className="tab-count">{tabCounts[tabId]}</span>`

### 4. Dynamic API Calls
```
Leads Tab     → GET /api/leads
Quotations Tab → GET /api/quotations
```

---

## 📊 State Management Diagram

```
┌─────────────────────────────────────┐
│ Component Mount                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ fetchTabCounts()                    │
│ setTabCounts({ leads: N, quots: M}) │
│ setActiveTab("leads")               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ useEffect([activeTab])              │
│ fetchEntriesByTab("leads")          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ setIsLoadingTab(true)               │
│ Fetch /api/leads                    │
│ setIsLoadingTab(false)              │
│ setEntries([...])                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Table Renders                       │
│ User sees data                      │
└─────────────────────────────────────┘
```

---

## 🎯 Core Functions

### `handleTabChange(tabId)`
```jsx
const handleTabChange = (tabId) => {
  setActiveTab(tabId);  // Triggers useEffect
};
```
**When:** User clicks a tab
**What:** Changes active tab and triggers data fetch

### `fetchEntriesByTab(tabId)`
```jsx
const fetchEntriesByTab = async (tabId) => {
  setIsLoadingTab(true);
  const tab = TABS.find(t => t.id === tabId);
  const res = await fetch(`${apiBase}/api/${tab.apiPath}`);
  const data = await res.json();
  setEntries(Array.isArray(data) ? data : []);
  setIsLoadingTab(false);
};
```
**When:** `activeTab` changes (via useEffect)
**What:** Fetches data for the selected tab

### `fetchTabCounts()`
```jsx
const fetchTabCounts = async () => {
  const leadRes = await fetch(`${apiBase}/api/leads`);
  const quotRes = await fetch(`${apiBase}/api/quotations`);
  
  const leadData = await leadRes.json();
  const quotData = await quotRes.json();

  setTabCounts({
    leads: Array.isArray(leadData) ? leadData.length : 0,
    quotations: Array.isArray(quotData) ? quotData.length : 0
  });
};
```
**When:** Component mounts (via useEffect)
**What:** Fetches count for all tabs for badges

### `submitFollowUp()`
```jsx
const submitFollowUp = async () => {
  const relatedType = activeTab === "leads" ? "Lead" : "Quotation";
  
  await fetch(`${apiBase}/api/followups`, {
    method: "POST",
    body: JSON.stringify({
      relatedType,
      relatedId: selectedEntry._id,
      followUpDate,
      notes: followUpNote,
      status: "Pending"
    })
  });
  
  resetForm();
};
```
**When:** User clicks "Save" in modal
**What:** Submits follow-up data to API

### `resetForm()`
```jsx
const resetForm = () => {
  setSelectedEntry(null);
  setFollowUpNote("");
  setFollowUpDate("");
  setFollowUpTime("");
};
```
**When:** After successful submission or cancel
**What:** Clears modal and form state

---

## 📱 Responsive Breakpoints

| Screen Size | Changes |
|-------------|---------|
| **≥1024px** | Full layout, normal spacing |
| **768px-1023px** | Adjusted padding, compact font |
| **600px-767px** | Single column forms |
| **480px-599px** | Touch-friendly buttons (44px) |
| **<480px** | Mobile optimized, scrollable tabs |

---

## 🔍 CSS Classes Reference

### Tab Classes
```css
.followup-tabs-container       /* Outer container */
.followup-tabs                 /* Tabs wrapper */
.followup-tab                  /* Individual tab button */
.followup-tab.active           /* Active tab state */
.followup-tab:hover            /* Hover effect */
.tab-label                     /* Tab text */
.tab-count                     /* Count badge */
```

### Loading Classes
```css
.loading-indicator             /* Loading container */
.spinner                       /* Spinning animation */
@keyframes spin                /* Spinner animation */
```

### Modal Classes
```css
.modal-bg                      /* Modal background overlay */
.modal-box                     /* Modal container */
.modal-title                   /* Modal heading */
.modal-row                     /* Row with 2 fields */
.modal-field                   /* Single field container */
.modal-field-full              /* Full-width field */
.modal-label                   /* Field label */
.modal-input                   /* Text/Date/Time inputs */
.modal-textarea                /* Textarea */
.modal-buttons                 /* Button container */
.modal-button                  /* Base button */
.modal-button-save             /* Save button */
.modal-button-cancel           /* Cancel button */
```

---

## 🧪 Testing Checklist

### Tab Functionality
- [ ] Tabs visible on page load
- [ ] Leads tab active by default
- [ ] Count badges show correct numbers
- [ ] Clicking tab changes active state (blue highlighting)
- [ ] Loading indicator appears when switching tabs
- [ ] Table data updates based on active tab

### Data Display
- [ ] Leads table shows lead data
- [ ] Quotations table shows quotation data
- [ ] Column headers adjust (Name vs Title)
- [ ] Email and Phone display correctly
- [ ] Empty state message shows when no data

### Modal Functionality
- [ ] Click "Add Follow-Up" opens modal
- [ ] Modal shows correct entry name
- [ ] Date picker works
- [ ] Time picker works
- [ ] Textarea accepts input
- [ ] Save button submits form
- [ ] Cancel button closes modal
- [ ] Form resets after submit

### Responsive Design
- [ ] Desktop: Tabs horizontally aligned
- [ ] Tablet: Tabs compact but readable
- [ ] Mobile: Tabs scrollable horizontally
- [ ] Mobile: Modal full width with padding
- [ ] Mobile: Input fonts 16px (no zoom)
- [ ] Mobile: Touch targets 44px minimum

### Error Handling
- [ ] Form validation works (alert on empty)
- [ ] API errors handled gracefully
- [ ] Loading state cancels properly
- [ ] Network errors show "No items" message

---

## 🚨 Common Issues & Solutions

### Issue: Tabs not switching
**Solution:** Check `handleTabChange()` is called onClick
```jsx
onClick={() => handleTabChange(tabId)}  // ✅ Correct
onClick={() => setActiveTab(tabId)}     // ✅ Also works
```

### Issue: Count badges show 0
**Solution:** Ensure API endpoints return arrays
```jsx
// API should return array
GET /api/leads → [{ _id, name, email, phone }, ...]
GET /api/quotations → [{ _id, title, email, phone }, ...]
```

### Issue: Loading spinner won't stop
**Solution:** Check finally block in `fetchEntriesByTab()`
```jsx
finally {
  setIsLoadingTab(false);  // ✅ Must set to false
}
```

### Issue: Modal fields not updating
**Solution:** Check onChange handlers
```jsx
<input 
  value={followUpDate}
  onChange={(e) => setFollowUpDate(e.target.value)}  // ✅ Correct
/>
```

---

## 🔄 Adding More Tabs (Future)

To add a new tab (e.g., Customers):

```jsx
const TABS = [
  { id: "leads", label: "Leads", apiPath: "leads" },
  { id: "quotations", label: "Quotations", apiPath: "quotations" },
  { id: "customers", label: "Customers", apiPath: "customers" }  // NEW
];

// fetchTabCounts() will automatically fetch customer count
// handleTabChange() will automatically fetch customer data
```

---

## 📦 Props & Dependencies

### Component Props
```jsx
<FollowUpPage 
  onCustomerAdded={() => {
    // Callback after successful follow-up submission
  }}
/>
```

### External Dependencies
- React (useState, useEffect)
- react-dom (for rendering)
- No external UI libraries needed

### API Dependencies
- `/api/leads` (GET)
- `/api/quotations` (GET)
- `/api/followups` (POST)

---

## ✅ Production Checklist

- [ ] All tabs fetch correctly
- [ ] Count badges display accurate numbers
- [ ] Loading state shows during fetches
- [ ] Modal validation works
- [ ] Error messages display properly
- [ ] Mobile responsiveness tested
- [ ] Touch interactions work
- [ ] No console errors
- [ ] API endpoints verified
- [ ] Callback (`onCustomerAdded`) fires correctly
- [ ] Performance acceptable (no lag on switch)
- [ ] Accessibility: keyboard navigation works

---

## 📚 Related Documentation

- Full refactor details: `FOLLOWUP_COMPONENT_REFACTOR.md`
- Before/After comparison: `FOLLOWUP_BEFORE_AFTER.md`
- This guide: `FOLLOWUP_QUICK_REFERENCE.md`

---

**Need Help?** Check the full documentation or console for error messages.

---

Last Updated: April 29, 2026
