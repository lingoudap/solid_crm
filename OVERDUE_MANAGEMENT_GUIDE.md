# Overdue Follow-Up Management System

## Overview

Automatic overdue follow-up detection and management system for the CRM. Detects missed follow-ups, sends notifications, and provides dashboard analytics.

## Features

✅ **Automatic Detection** - Cron job runs every minute  
✅ **Smart Notifications** - Alerts assigned users  
✅ **Priority Levels** - Critical (7+ days), High (3-7 days), Medium (0-3 days)  
✅ **Auto-create Next Reminder** - Reschedule missed follow-ups automatically  
✅ **Dashboard Widget** - Real-time overdue statistics  
✅ **Red Status Indicators** - Visual badges for overdue items  
✅ **Bulk Actions** - Resolve, escalate, or snooze multiple items  
✅ **Filtering & Analytics** - Filter by priority and days overdue  

---

## Backend Setup

### 1. Enhanced FollowUp Model (`server/models/FollowUpEnhanced.js`)

New fields added:

```javascript
isOverdue: Boolean,            // Current overdue status
daysOverdue: Number,           // How many days overdue
overdueStatus: {
  markedAt: Date,              // When marked as overdue
  daysOverdue: Number,         // Cached days
  priority: String,            // critical, high, medium
  lastNotified: Date,          // Last notification sent
  resolvedAt: Date,            // When resolved
  escalatedAt: Date,           // When escalated
  snoozedUntil: Date,          // Snooze deadline
}
autoCreateNextReminder: Boolean,  // Auto-create next follow-up
linkedFollowUpId: ObjectId,       // Link to original follow-up
```

### 2. Overdue Service (`server/services/overdueFollowUpService.js`)

Core service managing overdue detection and actions.

**Methods:**

```javascript
// Initialize detection (call in server/index.js)
initializeOverdueDetection(io)

// Detect and mark overdue
detectAndMarkOverdue(io)

// Process individual follow-up
processOverdueFollowUp(followUp, io)

// Mark as resolved
markAsResolved(followUpId, io)

// Get statistics
getOverdueStats(userId)

// Get overdue list with pagination
getOverdueFollowUps(filters)

// Bulk update multiple follow-ups
bulkUpdateOverdueStatus(followUpIds, action)

// Get dashboard summary
getDashboardSummary(userId)
```

### 3. API Routes (`server/routes/overdueRoutes.js`)

**GET Endpoints:**

```javascript
GET /api/overdue                    // List overdue follow-ups
GET /api/overdue/stats              // Get statistics
GET /api/overdue/dashboard          // Get dashboard summary
GET /api/overdue/count              // Get count only
```

**POST Endpoints:**

```javascript
POST /api/overdue/:followUpId/resolve  // Mark as resolved
```

**PATCH Endpoints:**

```javascript
PATCH /api/overdue/:followUpId       // Update status (escalate, snooze, resolve)
PATCH /api/overdue/bulk/action       // Bulk update multiple
```

### 4. Server Integration (`server/index.js`)

Add to your server initialization:

```javascript
import overdueFollowUpService from "./services/overdueFollowUpService.js";
import overdueRoutes from "./routes/overdueRoutes.js";

// Initialize overdue detection
overdueFollowUpService.initializeOverdueDetection(io);

// Add routes
app.use("/api/overdue", overdueRoutes);
```

---

## Frontend Components

### 1. useOverdue Hook (`client/src/hooks/useOverdue.js`)

Custom hook for managing overdue operations.

**Usage:**

```javascript
import useOverdue from "../hooks/useOverdue";

const {
  followUps,           // Array of overdue follow-ups
  stats,              // Statistics object
  dashboard,          // Dashboard summary
  loading,            // Loading state
  error,              // Error message
  fetchOverdue,       // Fetch follow-ups
  fetchOverdueStats,  // Fetch statistics
  fetchDashboardSummary, // Fetch summary
  fetchOverdueCount,  // Get count only
  resolveOverdue,     // Mark as resolved
  updateOverdue,      // Update status
  bulkUpdateOverdue,  // Bulk update
} = useOverdue();
```

### 2. OverdueBadge Component

Red badge showing overdue status.

**Props:**

```javascript
<OverdueBadge 
  isOverdue={true}
  daysOverdue={5}
  priority="high"
  compact={false}
/>
```

**Output:** ⚠️ 5 days overdue

### 3. OverdueFilter Component

Filter panel for overdue follow-ups.

**Props:**

```javascript
<OverdueFilter 
  onFilter={(filters) => {}}
  stats={{
    totalOverdue: 12,
    criticalOverdue: 2,
    highPriorityOverdue: 5,
    mediumOverdue: 5
  }}
/>
```

**Filters:**
- Show Overdue Only (toggle)
- Priority Level (all, critical, high, medium)
- Days Overdue (all, today, week, month, older)

### 4. OverdueDashboard Component

Dashboard widget showing statistics and recent overdue items.

**Usage:**

```javascript
<OverdueDashboard />
```

**Features:**
- Alert banner with total count
- Statistics cards (critical, high, medium, total)
- Recent overdue items (top 5)
- Quick actions (resolve, escalate)
- Empty state when all clear

---

## Integration Steps

### Step 1: Backend Integration

```javascript
// server/index.js
import overdueFollowUpService from "./services/overdueFollowUpService.js";
import overdueRoutes from "./routes/overdueRoutes.js";

// In your io/server setup
overdueFollowUpService.initializeOverdueDetection(io);

// Add to Express app
app.use("/api/overdue", overdueRoutes);
```

### Step 2: Frontend Hook Integration

```javascript
// In your FollowUp component
import useOverdue from "../hooks/useOverdue";

const MyComponent = () => {
  const { 
    followUps, 
    stats, 
    loading,
    fetchOverdueStats 
  } = useOverdue();

  useEffect(() => {
    fetchOverdueStats();
  }, []);

  return (
    <div>
      <OverdueDashboard />
      <OverdueFilter stats={stats} onFilter={handleFilter} />
    </div>
  );
};
```

### Step 3: Add to FollowUp Table

```javascript
// In your FollowUpTable component
import OverdueBadge from "./OverdueBadge";

<td>
  {followUp.isOverdue && (
    <OverdueBadge 
      isOverdue={true}
      daysOverdue={followUp.daysOverdue}
      priority={followUp.overdueStatus?.priority}
    />
  )}
</td>
```

---

## Cron Job Logic

**Runs:** Every minute  
**Time:** Configurable via `REMINDER_CHECK_INTERVAL` env variable

**Process:**

1. Find all follow-ups with `dueDate < now` and status pending/in_progress
2. Calculate days overdue
3. Determine priority (critical if 7+ days, high if 3-7 days, medium if 0-3 days)
4. Mark as overdue in database
5. Create notification record
6. Send Socket.IO notification to assigned user
7. Play sound alert for critical
8. Auto-create next reminder if enabled

---

## Priority Levels

| Level | Days Overdue | Color | Action |
|-------|-------------|-------|--------|
| Critical | 7+ | 🔴 Red | Immediate escalation |
| High | 3-7 | 🟠 Orange | High priority action |
| Medium | 0-3 | 🟡 Yellow | Standard follow-up |

---

## Notification Types

**Overdue Alert** - Sent when follow-up marked as overdue
- Title: `🚨 Overdue: [FollowUp Title]`
- Type: `overdue_alert`
- Sound: `overdue_alert.mp3` (configurable)
- Priority: Based on days overdue

---

## API Examples

### Get Overdue Follow-Ups

```bash
curl -X GET http://localhost:5000/api/overdue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Response
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Follow-up: Client Meeting",
      "followUpDate": "2026-05-10",
      "isOverdue": true,
      "daysOverdue": 9,
      "priority": "critical",
      "overdueStatus": {
        "markedAt": "2026-05-19T10:30:00Z",
        "daysOverdue": 9,
        "priority": "critical",
        "lastNotified": "2026-05-19T10:30:00Z"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "skip": 0,
    "pages": 1
  }
}
```

### Get Statistics

```bash
curl -X GET http://localhost:5000/api/overdue/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response
{
  "success": true,
  "data": {
    "totalOverdue": 12,
    "criticalOverdue": 2,
    "highPriorityOverdue": 5,
    "mediumOverdue": 5,
    "byDaysOverdue": {
      "1": 2,
      "3": 3,
      "5": 4,
      "9": 2,
      "15": 1
    }
  }
}
```

### Mark as Resolved

```bash
curl -X POST http://localhost:5000/api/overdue/FOLLOW_UP_ID/resolve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Response
{
  "success": true,
  "data": { ... },
  "message": "Follow-up marked as resolved"
}
```

### Bulk Update

```bash
curl -X PATCH http://localhost:5000/api/overdue/bulk/action \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followUpIds": ["id1", "id2", "id3"],
    "action": "escalate"
  }'

# Response
{
  "success": true,
  "modifiedCount": 3,
  "message": "3 follow-ups escalated successfully"
}
```

---

## Notifications Integration

Overdue alerts work with the notification system:

```javascript
// Notification created with type "overdue_alert"
{
  userId: assignedUserId,
  followUpId: followUpId,
  title: "🚨 Overdue: [Title]",
  message: "This follow-up is X days overdue...",
  notificationType: "overdue_alert",
  priority: "critical|high|medium",
  soundAlert: true,
  action: {
    label: "View Follow-Up",
    type: "open_follow_up",
    url: "/follow-ups/{followUpId}"
  }
}

// Sent via:
- Socket.IO real-time
- Browser notification (if enabled)
- Sound alert (if critical)
```

---

## Dashboard Usage

**Add to your main dashboard:**

```javascript
import OverdueDashboard from "./Components/FollowUps/OverdueDashboard";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <OverdueDashboard />
      {/* Other dashboard content */}
    </div>
  );
}
```

**What it shows:**
- Alert banner with total overdue count
- Statistics cards (critical, high, medium, total)
- Recent overdue items (top 5)
- Quick action buttons (resolve, escalate)
- Link to view all overdue follow-ups

---

## Auto-Create Next Reminder

When `autoCreateNextReminder` is enabled:

1. Original follow-up marked as overdue
2. New follow-up automatically created
3. New due date: +7 days from original date
4. Linked to original via `linkedFollowUpId`
5. Same customer and assigned user

**Enable in AddFollowUp form:**

```javascript
<label>
  <input 
    type="checkbox" 
    name="autoCreateNextReminder"
  />
  Auto-create next reminder if overdue
</label>
```

---

## Configuration

### Environment Variables

```bash
# Optional: Override default cron interval (minutes)
REMINDER_CHECK_INTERVAL=5

# Notification sound file
OVERDUE_SOUND_FILE=overdue_alert.mp3
```

### Customize Priority Thresholds

Edit in `overdueFollowUpService.js`:

```javascript
let priority = "medium";
if (daysOverdue >= 10) {       // Change from 7
  priority = "critical";
} else if (daysOverdue >= 5) { // Change from 3
  priority = "high";
}
```

---

## Performance Optimization

**Indexes Created:**
- `{priority: 1, isOverdue: 1}`
- `{followUpDate: 1, isOverdue: 1, status: 1}`
- `{overdueStatus.priority: 1, isOverdue: 1}`

**Query Optimization:**
- Lean queries for list operations
- Compound indexes for complex filtering
- Pagination with default limit: 20

---

## Troubleshooting

### Overdue Detection Not Working

1. Check cron job is initialized:
   ```javascript
   // server/index.js must have:
   overdueFollowUpService.initializeOverdueDetection(io);
   ```

2. Verify database connection is active

3. Check server logs for errors

4. Test manually:
   ```bash
   curl -X GET http://localhost:5000/api/overdue/stats
   ```

### Notifications Not Sending

1. Verify Socket.IO is connected
2. Check user has `isOverdue: true` in database
3. Verify notification model is properly set up
4. Check browser console for errors

### Dashboard Not Showing Count

1. Ensure `/api/overdue/dashboard` endpoint is working
2. Check authentication token is valid
3. Verify `useOverdue` hook is called with proper initialization

---

## Statistics Dashboard

The dashboard provides insight into overdue trends:

- **Total Overdue**: All non-completed follow-ups past due date
- **Critical**: 7+ days overdue (requires immediate action)
- **High**: 3-7 days overdue (needs urgent follow-up)
- **Medium**: 0-3 days overdue (standard follow-up)

---

## File Structure

```
server/
  services/
    overdueFollowUpService.js    (650 lines)
  routes/
    overdueRoutes.js             (200 lines)
  models/
    FollowUpEnhanced.js          (enhanced with overdue fields)

client/
  hooks/
    useOverdue.js                (300 lines)
  Components/
    FollowUps/
      OverdueBadge.jsx           (50 lines)
      OverdueFilter.jsx          (150 lines)
      OverdueDashboard.jsx       (200 lines)
    css/
      OverdueBadge.css           (200 lines)
      OverdueFilter.css          (400 lines)
      OverdueDashboard.css       (600 lines)
```

---

## Next Steps

- [ ] Add email notifications for critical overdue
- [ ] Create overdue analytics report
- [ ] Add bulk re-assign feature
- [ ] Implement auto-escalation to manager
- [ ] Create export functionality
- [ ] Add webhook support for integrations

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Verify API endpoints are responding
4. Check browser console for client errors
