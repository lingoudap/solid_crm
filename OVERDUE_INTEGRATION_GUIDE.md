# Overdue Management - Integration Guide

## Complete Integration Steps

### Part 1: Backend Setup (5 minutes)

#### Step 1: Update server/index.js

Add imports at the top:
```javascript
import overdueFollowUpService from "./services/overdueFollowUpService.js";
import overdueRoutes from "./routes/overdueRoutes.js";
```

Add initialization after Socket.IO setup:
```javascript
const io = require("socket.io")(server);

// Initialize overdue detection (IMPORTANT: must come after io is created)
overdueFollowUpService.initializeOverdueDetection(io);

// Add routes
app.use("/api/overdue", overdueRoutes);
```

#### Step 2: Verify FollowUpEnhanced Model

Already updated with:
- `isOverdue` field
- `overdueStatus` sub-schema
- `autoCreateNextReminder` field
- Enhanced indexes
- Auto-update logic in pre-save hook

---

### Part 2: Frontend Setup (10 minutes)

#### Step 1: Add useOverdue Hook

Create: `client/src/hooks/useOverdue.js`

This hook provides all overdue operations:
```javascript
const {
  stats,
  dashboard,
  fetchOverdueStats,
  fetchDashboardSummary,
  resolveOverdue,
  updateOverdue,
  bulkUpdateOverdue
} = useOverdue();
```

#### Step 2: Add Components to Dashboard

In your main dashboard component:
```javascript
import OverdueDashboard from "./Components/FollowUps/OverdueDashboard";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Add overdue dashboard widget */}
      <OverdueDashboard />
      
      {/* Rest of dashboard */}
    </div>
  );
}
```

---

### Part 3: FollowUp Table Integration (10 minutes)

#### Step 1: Add Overdue Badge to FollowUp Table

In your FollowUp table component:

```javascript
import OverdueBadge from "./FollowUps/OverdueBadge";

// In table render:
<table>
  <tbody>
    {followUps.map(followUp => (
      <tr key={followUp._id}>
        <td>{followUp.title}</td>
        <td>{new Date(followUp.followUpDate).toLocaleDateString()}</td>
        
        {/* Add overdue badge column */}
        <td>
          {followUp.isOverdue && (
            <OverdueBadge 
              isOverdue={true}
              daysOverdue={followUp.daysOverdue}
              priority={followUp.overdueStatus?.priority}
            />
          )}
          {!followUp.isOverdue && (
            <span style={{ color: "#27ae60" }}>✓ On Track</span>
          )}
        </td>
        
        {/* Rest of columns */}
        <td>{followUp.status}</td>
        <td>
          <button>View</button>
          <button>Edit</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

#### Step 2: Add Overdue Filter

```javascript
import OverdueFilter from "./FollowUps/OverdueFilter";
import useOverdue from "../hooks/useOverdue";

function FollowUpList() {
  const [filters, setFilters] = useState({});
  const { stats } = useOverdue();
  
  return (
    <div>
      {/* Add filter sidebar */}
      <aside>
        <OverdueFilter 
          stats={stats}
          onFilter={handleFilterChange}
        />
      </aside>
      
      {/* Table with filtered results */}
      <main>
        {/* FollowUp table here */}
      </main>
    </div>
  );
}
```

---

### Part 4: AddFollowUp Component Enhancement (15 minutes)

#### Add Auto-Create Next Reminder Option

In your AddFollowUp form:

```javascript
import { useState } from "react";

function AddFollowUp() {
  const [formData, setFormData] = useState({
    title: "",
    followUpDate: "",
    followUpTime: "",
    priority: "medium",
    assignedTo: "",
    notes: "",
    autoCreateNextReminder: false, // Add this field
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Existing fields */}
      <input 
        type="text"
        name="title"
        placeholder="Follow-up title"
        value={formData.title}
        onChange={handleChange}
      />

      <input 
        type="date"
        name="followUpDate"
        value={formData.followUpDate}
        onChange={handleChange}
      />

      <select name="priority" value={formData.priority} onChange={handleChange}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      {/* Add auto-create next reminder checkbox */}
      <div className="form-group">
        <label>
          <input 
            type="checkbox"
            name="autoCreateNextReminder"
            checked={formData.autoCreateNextReminder}
            onChange={handleChange}
          />
          <span className="label-text">
            🔄 Auto-create next reminder if overdue
            <small>(New follow-up will be scheduled for +7 days)</small>
          </span>
        </label>
      </div>

      <textarea 
        name="notes"
        placeholder="Notes"
        value={formData.notes}
        onChange={handleChange}
      />

      <button type="submit">Create Follow-Up</button>
    </form>
  );
}
```

---

### Part 5: FollowUp Details Page Enhancement (10 minutes)

Add action buttons to mark as resolved or escalate:

```javascript
import useOverdue from "../hooks/useOverdue";

function FollowUpDetail({ followUp }) {
  const { resolveOverdue, updateOverdue } = useOverdue();
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    setLoading(true);
    try {
      await resolveOverdue(followUp._id);
      // Refetch follow-up data
      alert("✅ Follow-up marked as resolved");
    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    setLoading(true);
    try {
      await updateOverdue(followUp._id, "escalate");
      alert("⬆ Follow-up escalated");
    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="follow-up-detail">
      <h1>{followUp.title}</h1>
      
      {/* Show overdue badge if applicable */}
      {followUp.isOverdue && (
        <div className="alert alert-danger">
          <strong>⚠️ This follow-up is overdue!</strong>
          <p>{followUp.overdueStatus?.daysOverdue} days overdue</p>
          <p>Priority: <strong>{followUp.overdueStatus?.priority}</strong></p>
        </div>
      )}

      {/* Follow-up details */}
      <dl>
        <dt>Due Date:</dt>
        <dd>{new Date(followUp.followUpDate).toLocaleDateString()}</dd>
        
        <dt>Status:</dt>
        <dd>{followUp.status}</dd>
        
        <dt>Priority:</dt>
        <dd>{followUp.priority}</dd>
        
        <dt>Assigned To:</dt>
        <dd>{followUp.assignedTo?.name}</dd>
      </dl>

      {/* Action buttons */}
      <div className="actions">
        <button onClick={() => navigateTo("/follow-ups/" + followUp._id + "/edit")}>
          ✏️ Edit
        </button>
        
        {followUp.isOverdue && (
          <>
            <button 
              onClick={handleResolve}
              disabled={loading}
              className="btn-success"
            >
              ✓ Mark as Resolved
            </button>
            
            <button 
              onClick={handleEscalate}
              disabled={loading}
              className="btn-warning"
            >
              ⬆ Escalate
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

### Part 6: Notification Integration (5 minutes)

Overdue alerts automatically integrate with the notification system:

```javascript
// Notifications are created automatically by overdueFollowUpService
// They appear in:
// 1. NotificationBell dropdown
// 2. Browser notifications (if enabled)
// 3. Toast alerts (for critical)
// 4. Sound alerts (configurable)

// No additional code needed - just ensure NotificationProvider is wrapped around app
```

---

## Testing the Integration

### Test 1: Create Overdue Follow-Up

```javascript
// Create a follow-up with past due date
const followUp = {
  title: "Test Overdue",
  followUpDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  status: "Pending"
};

// Save to database
await FollowUpEnhanced.create(followUp);

// Wait 1 minute for cron job to run
// Check database - should have isOverdue: true
```

### Test 2: Check API

```bash
# Get statistics
curl -X GET http://localhost:5000/api/overdue/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get dashboard
curl -X GET http://localhost:5000/api/overdue/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get list
curl -X GET http://localhost:5000/api/overdue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Check Frontend

1. Navigate to Dashboard
2. Should see OverdueDashboard widget
3. Should show statistics cards
4. Should show recent overdue items
5. Click "Resolve" button
6. Should be removed from list

### Test 4: Check Notifications

1. Create overdue follow-up
2. Wait 1 minute
3. Check NotificationBell
4. Should see "Overdue Alert" notification
5. Should hear sound (if enabled)
6. Check browser notification (if enabled)

---

## File Checklist

### Backend Files
- [ ] `server/services/overdueFollowUpService.js` (650 lines)
- [ ] `server/routes/overdueRoutes.js` (200 lines)
- [ ] `server/utils/logger.js` (created)
- [ ] Updated `server/models/FollowUpEnhanced.js`
- [ ] Updated `server/index.js` with initialization

### Frontend Files
- [ ] `client/src/hooks/useOverdue.js` (300 lines)
- [ ] `client/src/Components/FollowUps/OverdueBadge.jsx` (50 lines)
- [ ] `client/src/Components/FollowUps/OverdueFilter.jsx` (150 lines)
- [ ] `client/src/Components/FollowUps/OverdueDashboard.jsx` (200 lines)
- [ ] `client/src/Components/css/OverdueBadge.css` (200 lines)
- [ ] `client/src/Components/css/OverdueFilter.css` (400 lines)
- [ ] `client/src/Components/css/OverdueDashboard.css` (600 lines)

### Documentation
- [ ] `OVERDUE_MANAGEMENT_GUIDE.md` (comprehensive)
- [ ] `OVERDUE_QUICK_REFERENCE.md` (quick lookup)

---

## Environment Configuration

Add to `.env`:

```bash
# Optional: Override cron interval (minutes)
REMINDER_CHECK_INTERVAL=5

# Optional: Enable debug logging
DEBUG=false

# Optional: Custom sound file for overdue alerts
OVERDUE_SOUND_FILE=overdue_alert.mp3
```

---

## Performance Considerations

1. **Cron Job**: Runs every minute - minimal overhead
2. **Database**: Uses optimized indexes - fast queries
3. **Notifications**: Only sent when status changes
4. **API**: Paginated responses (default limit: 20)
5. **Frontend**: Auto-refresh every 5 minutes on dashboard

---

## Troubleshooting Integration

### Dashboard Widget Not Showing
```javascript
// Check 1: useOverdue hook is working
const { stats } = useOverdue();
console.log(stats); // Should show data

// Check 2: API endpoint is responding
fetch('/api/overdue/dashboard').then(r => r.json()).then(console.log);

// Check 3: Component is imported correctly
import OverdueDashboard from "./Components/FollowUps/OverdueDashboard";
```

### Overdue Not Detecting
```javascript
// Check 1: Service initialized
// In server/index.js:
overdueFollowUpService.initializeOverdueDetection(io);

// Check 2: Create test data
const testFollowUp = await FollowUpEnhanced.create({
  title: "Test",
  followUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  status: "Pending"
});

// Check 3: Wait 1 minute, then check
const updated = await FollowUpEnhanced.findById(testFollowUp._id);
console.log(updated.isOverdue); // Should be true
```

### Notifications Not Showing
```javascript
// Check 1: Notification created
const notifications = await Notification.find({ userId: userId });
console.log(notifications);

// Check 2: Socket connected
const status = notificationSocketClient.getStatus();
console.log(status.isConnected); // Should be true

// Check 3: Browser console errors
// Open browser DevTools → Console tab
// Look for red error messages
```

---

## Support Resources

1. **Full Guide**: See `OVERDUE_MANAGEMENT_GUIDE.md`
2. **Quick Reference**: See `OVERDUE_QUICK_REFERENCE.md`
3. **API Docs**: Check endpoint comments in `overdueRoutes.js`
4. **Hook Usage**: Review `useOverdue.js` JSDoc comments
5. **Component Props**: Check JSDoc in component files

---

## Next Steps After Integration

1. ✅ Complete integration checklist
2. ✅ Run all tests
3. ✅ Verify notifications work
4. ✅ Add to dashboard
5. ⏳ Deploy to production
6. ⏳ Monitor for issues
7. ⏳ Add email notifications (future)
8. ⏳ Add analytics reports (future)

---

## Production Readiness

Before deploying to production:

- [ ] Test with actual data volume
- [ ] Verify cron job doesn't cause performance issues
- [ ] Check database indexes are created
- [ ] Test notification delivery
- [ ] Verify API response times
- [ ] Check error handling
- [ ] Review security
- [ ] Test mobile responsiveness
- [ ] Verify dark mode works
- [ ] Check accessibility
