# Overdue Management - Quick Reference

## 5-Minute Setup

### Backend
```javascript
// server/index.js
import overdueFollowUpService from "./services/overdueFollowUpService.js";
import overdueRoutes from "./routes/overdueRoutes.js";

// Initialize (this starts the cron job)
overdueFollowUpService.initializeOverdueDetection(io);

// Add routes
app.use("/api/overdue", overdueRoutes);
```

### Frontend
```javascript
// App.js
import OverdueDashboard from "./Components/FollowUps/OverdueDashboard";

<OverdueDashboard />  // Add to dashboard
```

---

## Common Usage

### Get Overdue Follow-Ups
```javascript
const { fetchOverdue, followUps } = useOverdue();

useEffect(() => {
  fetchOverdue({ limit: 20, skip: 0 });
}, []);

// followUps = array of overdue items
```

### Show Dashboard
```javascript
import OverdueDashboard from "./Components/FollowUps/OverdueDashboard";

<OverdueDashboard />
```

### Mark as Resolved
```javascript
const { resolveOverdue } = useOverdue();

resolveOverdue(followUpId);
```

### Show Badge in Table
```javascript
import OverdueBadge from "./Components/FollowUps/OverdueBadge";

<OverdueBadge 
  isOverdue={followUp.isOverdue}
  daysOverdue={followUp.daysOverdue}
  priority={followUp.overdueStatus?.priority}
/>
```

### Filter Overdue Items
```javascript
import OverdueFilter from "./Components/FollowUps/OverdueFilter";

const [filters, setFilters] = useState({});

<OverdueFilter 
  onFilter={setFilters}
  stats={stats}
/>
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/overdue` | Get overdue list |
| GET | `/api/overdue/stats` | Get statistics |
| GET | `/api/overdue/dashboard` | Get dashboard data |
| GET | `/api/overdue/count` | Get count only |
| POST | `/api/overdue/:id/resolve` | Mark as resolved |
| PATCH | `/api/overdue/:id` | Update status |
| PATCH | `/api/overdue/bulk/action` | Bulk update |

---

## Hook: useOverdue()

```javascript
const {
  followUps,              // [{ _id, title, isOverdue, daysOverdue, ... }]
  stats,                  // { totalOverdue, criticalOverdue, ... }
  dashboard,              // { stats, recentOverdue, alertLevel }
  loading,                // boolean
  error,                  // error message or null
  fetchOverdue(),         // fetch with filters
  fetchOverdueStats(),    // get statistics
  fetchDashboardSummary(),// get dashboard data
  resolveOverdue(id),     // mark as resolved
  updateOverdue(id, action), // escalate, snooze, resolve
  bulkUpdateOverdue(ids, action), // bulk action
} = useOverdue();
```

---

## Components

### OverdueBadge
```jsx
<OverdueBadge 
  isOverdue={true}
  daysOverdue={5}
  priority="high"
  compact={false}
/>
// Output: ⚠️ 5 days overdue
```

### OverdueFilter
```jsx
<OverdueFilter 
  stats={{
    totalOverdue: 12,
    criticalOverdue: 2,
    highPriorityOverdue: 5,
    mediumOverdue: 5
  }}
  onFilter={(filters) => console.log(filters)}
/>
```

### OverdueDashboard
```jsx
<OverdueDashboard />
// Shows:
// - Alert banner
// - Statistics cards
// - Recent overdue items
// - Quick actions
```

---

## Data Model

### isOverdue Field
```javascript
{
  isOverdue: Boolean,        // true if past due date
  daysOverdue: Number,       // how many days overdue
  overdueStatus: {
    markedAt: Date,          // when marked overdue
    daysOverdue: Number,     // days (cached)
    priority: "critical"|"high"|"medium",
    lastNotified: Date,      // last alert sent
    resolvedAt: Date,        // when resolved
    escalatedAt: Date,       // when escalated
    snoozedUntil: Date,      // snooze deadline
  },
  autoCreateNextReminder: Boolean,
  linkedFollowUpId: ObjectId, // reference to previous
}
```

---

## Priority Levels

| Level | Days | Color | Action |
|-------|------|-------|--------|
| Critical | 7+ | 🔴 | Escalate immediately |
| High | 3-7 | 🟠 | Urgent follow-up |
| Medium | 0-3 | 🟡 | Standard follow-up |

---

## Notifications

Overdue creates notifications:
- Type: `overdue_alert`
- Sound: `overdue_alert.mp3` (critical only)
- Action: Link to follow-up
- Sent via: Socket.IO, browser notification

---

## Auto-Detection

**Cron Job**: Runs every minute
**Detects**: Past due + pending/in-progress status
**Actions**:
1. Mark as overdue
2. Set priority (based on days)
3. Create notification
4. Send to assigned user
5. Auto-create next if enabled

---

## Bulk Actions

```javascript
const { bulkUpdateOverdue } = useOverdue();

// Resolve multiple
bulkUpdateOverdue(["id1", "id2", "id3"], "resolve");

// Escalate multiple
bulkUpdateOverdue(["id1", "id2"], "escalate");

// Snooze multiple
bulkUpdateOverdue(["id1"], "snooze"); // 24 hours
```

---

## Troubleshooting

**Overdue detection not working?**
- [ ] Check `overdueFollowUpService.initializeOverdueDetection(io)` in server/index.js
- [ ] Verify database connection
- [ ] Check server logs for errors

**Dashboard not showing?**
- [ ] Verify auth token in localStorage
- [ ] Check `/api/overdue/dashboard` responds
- [ ] Verify `useOverdue()` is called

**Notifications not sending?**
- [ ] Check Socket.IO is connected
- [ ] Verify notifications are in database
- [ ] Check browser console errors

---

## Files Created

**Backend:**
- `server/services/overdueFollowUpService.js` (650 lines)
- `server/routes/overdueRoutes.js` (200 lines)
- Enhanced `server/models/FollowUpEnhanced.js`

**Frontend:**
- `client/src/hooks/useOverdue.js` (300 lines)
- `client/src/Components/FollowUps/OverdueBadge.jsx` (50 lines)
- `client/src/Components/FollowUps/OverdueFilter.jsx` (150 lines)
- `client/src/Components/FollowUps/OverdueDashboard.jsx` (200 lines)
- CSS files (1,200 lines total)

**Documentation:**
- `OVERDUE_MANAGEMENT_GUIDE.md` (comprehensive guide)
- `OVERDUE_QUICK_REFERENCE.md` (this file)

---

## Integration Checklist

- [ ] Copy `overdueFollowUpService.js` to `server/services/`
- [ ] Copy `overdueRoutes.js` to `server/routes/`
- [ ] Update `FollowUpEnhanced.js` model
- [ ] Add initialization to `server/index.js`
- [ ] Copy all frontend components
- [ ] Copy CSS files
- [ ] Copy hook to `client/src/hooks/`
- [ ] Add `<OverdueDashboard />` to dashboard
- [ ] Test overdue detection
- [ ] Verify notifications send
- [ ] Test bulk actions

---

## Performance

- **Auto-detection**: Every minute (configurable)
- **Database**: Optimized with compound indexes
- **API responses**: Paginated (default limit: 20)
- **Notifications**: Real-time via Socket.IO
- **Dashboard**: Auto-refreshes every 5 minutes

---

## Next Steps

- Add email notifications
- Create overdue reports
- Auto-escalate to manager
- Implement SLA tracking
- Add custom snooze durations

---

For detailed information, see `OVERDUE_MANAGEMENT_GUIDE.md`
