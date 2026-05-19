# Follow-Up Timeline - Quick Reference

## 🚀 5-Minute Setup

### Backend (Node.js/Express)

```javascript
// 1. Import model and routes
import FollowUpActivity from "./models/FollowUpActivity.js";
import followUpActivityRoutes from "./routes/followUpActivityRoutes.js";

// 2. Add routes
app.use("/api/followup-activities", followUpActivityRoutes);

// 3. Create indexes (run once)
await FollowUpActivity.collection.createIndexes();
```

### Frontend (React)

```javascript
import FollowUpTimeline from "./FollowUpTimeline";
import "./FollowUpTimeline.css";

// Use in your component
<FollowUpTimeline followUpId={followUpId} enableRealtime={true} />
```

---

## 📌 Key Concepts

| Concept | Purpose |
|---------|---------|
| **Activity Type** | What happened (call_made, email_sent, etc.) |
| **Category** | How to group it (communication, status, note, etc.) |
| **Sentiment** | Impact assessment (positive, neutral, negative) |
| **Visibility** | Who can see it (internal, customer_visible) |
| **Impact** | Importance level (high, medium, low) |

---

## 🔗 10 Most Important API Endpoints

### Logging

1. **Log Any Activity**
   ```
   POST /api/followup-activities/log
   ```

2. **Log Call**
   ```
   POST /api/followup-activities/:id/call
   ```

3. **Log Email**
   ```
   POST /api/followup-activities/:id/email
   ```

4. **Log Note**
   ```
   POST /api/followup-activities/:id/note
   ```

5. **Log Status Change**
   ```
   POST /api/followup-activities/:id/status-change
   ```

### Retrieving

6. **Get Timeline**
   ```
   GET /api/followup-activities/:id/timeline
   ```

7. **Get Grouped by Date**
   ```
   GET /api/followup-activities/:id/grouped
   ```

8. **Get Summary/Stats**
   ```
   GET /api/followup-activities/:id/summary
   ```

9. **Filter by Category**
   ```
   GET /api/followup-activities/:id/category/communication
   ```

10. **Get Entity Timeline**
    ```
    GET /api/followup-activities/entity/Lead/lead_id
    ```

---

## 💡 Common Tasks

### Log a Call
```javascript
fetch(`/api/followup-activities/${followUpId}/call`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    duration: 300,                    // seconds
    outcome: "answered",
    callType: "outbound",
    performedBy: { _id: userId, name: "Ahmed", email: "ahmed@company.com" },
    notes: "Customer interested in premium plan"
  })
});
```

### Log a Note
```javascript
fetch(`/api/followup-activities/${followUpId}/note`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "Discussed pricing and timeline",
    noteType: "internal",
    performedBy: { _id: userId, ... },
    tags: ["pricing", "timeline"]
  })
});
```

### Get Timeline
```javascript
const response = await fetch(
  `/api/followup-activities/${followUpId}/timeline?limit=50`
);
const { data: activities } = await response.json();
```

### Filter by Category
```javascript
const response = await fetch(
  `/api/followup-activities/${followUpId}/category/communication`
);
const { data: communications } = await response.json();
```

---

## 🎨 Component Props

```javascript
<FollowUpTimeline
  followUpId={string}              // ✅ Required - ID of follow-up
  loading={boolean}                // Loading state (default: false)
  activities={array}               // Pre-loaded activities (optional)
  enableRealtime={boolean}         // Auto-poll (default: false)
  apiBaseUrl={string}              // API URL (default: http://localhost:5000)
  onActivityUpdate={function}      // Callback on updates (optional)
/>
```

---

## 📊 Activity Types Quick Reference

```
SYSTEM: follow_up_created, status_changed, priority_changed, follow_up_completed
COMMUNICATION: call_made, email_sent, whatsapp_sent, meeting_scheduled
NOTES: note_added
FILES: attachment_added
ASSIGNMENT: user_assigned
REMINDER: reminder_set, reminder_triggered
```

---

## 🎨 Colors & Icons

| Activity | Icon | Color | Hex |
|----------|------|-------|-----|
| Call | ☎️ | Red | #ef4444 |
| Email | 📧 | Cyan | #06b6d4 |
| WhatsApp | 💬 | Teal | #14b8a6 |
| Meeting | 📅 | Green | #10b981 |
| Note | 📝 | Purple | #8b5cf6 |
| Status | 🔄 | Amber | #f59e0b |
| Reminder | 🔔 | Orange | #f97316 |
| Complete | ✅ | Green | #10b981 |

---

## ✅ Sample Activity Objects

### Call Activity
```javascript
{
  activityType: "call_made",
  callActivity: {
    duration: 300,
    outcome: "answered",
    callType: "outbound",
    notes: "Discussed project scope"
  }
}
```

### Email Activity
```javascript
{
  activityType: "email_sent",
  emailActivity: {
    subject: "Project Proposal",
    recipients: [{ email: "client@example.com" }],
    direction: "sent"
  }
}
```

### Note Activity
```javascript
{
  activityType: "note_added",
  noteActivity: {
    content: "Customer feedback: needs integration with CRM",
    noteType: "internal",
    tags: ["integration", "feedback"]
  }
}
```

### Status Change Activity
```javascript
{
  activityType: "status_changed",
  statusChangeActivity: {
    previousStatus: "Pending",
    newStatus: "In Progress",
    reason: "Quote sent and waiting for approval"
  }
}
```

---

## 🔍 Query Examples

### Fetch Activities for Last 7 Days
```javascript
const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const activities = await FollowUpActivity.find({
  followUpId,
  timestamp: { $gte: startDate }
}).sort({ timestamp: -1 });
```

### Get All Calls for a Follow-Up
```javascript
const calls = await FollowUpActivity.find({
  followUpId,
  activityType: "call_made"
}).populate("performedBy");
```

### Get Summary Statistics
```javascript
const stats = await FollowUpActivity.getActivitySummary(followUpId);
// Returns: [{ _id: "call_made", count: 3, lastActivity: Date }, ...]
```

### Get Recent Activities Across All Follow-Ups
```javascript
const recent = await FollowUpActivity.getRecentActivities({
  limit: 50,
  hours: 24
});
```

---

## 🔧 Environment Variables

```env
# .env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_REALTIME_POLLING=true
REACT_APP_POLLING_INTERVAL=5000
```

---

## 📱 Responsive Breakpoints

```css
Desktop:  1024px+   (full features)
Tablet:   768px-1024px (optimized)
Mobile:   < 640px   (compact)
```

---

## 🚨 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "followUpId not found" | Invalid or missing ID | Pass valid follow-up ID |
| "Timeline not loading" | Wrong API endpoint | Check API_BASE_URL |
| "CORS error" | CORS not configured | Add `app.use(cors())` |
| "Activities undefined" | Wrong response format | Check API response structure |
| "Filters not working" | Missing category | Ensure activities have categories |

---

## 📈 Performance Tips

1. **Pagination**: Use limit=50 for large datasets
2. **Filtering**: Apply filters server-side
3. **Caching**: Cache timeline data for 30 seconds
4. **Polling**: Set interval to 5-10 seconds for real-time
5. **Archiving**: Move activities older than 1 year to archive

---

## 🔐 Security Checklist

- [ ] Validate user permissions before fetching activities
- [ ] Mask sensitive data in customer-visible activities
- [ ] Implement rate limiting on logging endpoints
- [ ] Audit log all activity modifications
- [ ] Encrypt sensitive fields (phone, email)
- [ ] Validate all input data
- [ ] Implement JWT authentication
- [ ] Use HTTPS in production

---

## 📞 File Locations

```
Backend:
  /server/models/FollowUpActivity.js
  /server/routes/followUpActivityRoutes.js
  /server/data/sampleFollowUpActivities.js

Frontend:
  /client/src/Components/FollowUps/FollowUpTimeline.jsx
  /client/src/Components/FollowUps/FollowUpTimeline.css

Documentation:
  /TIMELINE_COMPLETE_GUIDE.md
  /TIMELINE_QUICK_REFERENCE.md
  /TIMELINE_API_REFERENCE.md
```

---

## 🎯 Next Steps

1. ✅ Install files
2. ✅ Create database indexes
3. ✅ Register API routes
4. ✅ Import React component
5. ✅ Add to your page
6. ✅ Start logging activities
7. ✅ Test timeline display
8. ✅ Enable real-time updates
9. ✅ Deploy to production

---

**Version:** 1.0.0  
**Created:** May 16, 2026  
**Status:** Ready to Use ✅
