# Follow-Up Reminder Notification System - Complete Setup Guide

## Overview

The Follow-Up Reminder Notification System is an automated feature that sends notifications to users at scheduled times for follow-up tasks. This system includes:

1. **Automated Cron Job** - Runs every minute to detect upcoming and overdue follow-ups
2. **Notification Model** - Stores notifications in MongoDB with auto-expiration after 30 days
3. **REST API** - Complete CRUD endpoints for notification management
4. **Frontend UI** - Beautiful notification center with filtering, pagination, and real-time updates
5. **Dashboard Integration** - Notification bell icon with unread count badge in the header

---

## Architecture

### Backend Components

#### 1. **Notification Model** (`server/models/Notification.js`)
Stores all notifications with the following fields:
- `userId` - User who receives the notification
- `followUpId` - Reference to the follow-up task
- `type` - Notification type: `followup_reminder` | `followup_overdue` | `followup_completed`
- `title` - Short notification title (e.g., "📢 Follow-up reminder in 1h")
- `message` - Detailed message with follow-up details
- `scheduledTime` - When the follow-up is scheduled
- `isRead` / `readAt` - Track if user has read the notification
- `emailSent` - Track if email was sent (for future implementation)
- `createdAt` / `expires` - Auto-delete after 30 days (TTL index)

#### 2. **Cron Job** (`server/cron/followupCron.js`)
Automatic scheduler runs every minute:

**Reminder Detection:**
- Finds follow-ups where `followUpDate` is within the next 60 minutes (1 hour before)
- Only processes follow-ups with status "Pending"
- Prevents duplicate notifications using `isReminderSent` flag
- Creates notifications with time remaining: "📢 Follow-up reminder in Xh Ym"

**Overdue Detection:**
- Finds follow-ups past their scheduled time (within 5-minute buffer)
- Creates notifications: "⚠️ Overdue Follow-up (X days)"
- Uses `isOverdueNotificationSent` flag to prevent duplicates

**User Notification:**
- Queries all users with notifications enabled in settings
- Creates one notification per user for multi-user scenarios
- Automatically updates FollowUp document with sent flags

#### 3. **Notification Routes** (`server/routes/notificationRoutes.js`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:userId` | Get paginated notifications with unread count |
| PUT | `/:notificationId/read` | Mark single notification as read |
| PUT | `/:userId/read-all` | Mark all notifications as read |
| DELETE | `/:notificationId` | Delete single notification |
| DELETE | `/:userId/clear-read` | Delete all read notifications (cleanup) |
| GET | `/:userId/unread-count` | Get unread notification count |
| GET | `/:userId/by-type/:type` | Filter notifications by type |

All endpoints:
- Use ES6 module syntax (import/export)
- Return populated relationships
- Sort results by creation date (newest first)
- Handle errors with appropriate status codes

#### 4. **FollowUp Model Updates**
Added two tracking fields to prevent duplicate notifications:
```javascript
isReminderSent: Boolean        // Prevents duplicate upcoming reminder notifications
isOverdueNotificationSent: Boolean  // Prevents duplicate overdue notifications
```

---

## Frontend Components

### 1. **NotificationBadge** (`client/src/Components/Notifications/NotificationBadge.jsx`)

Header integration component that displays:
- 🔔 Bell icon with unread count badge
- Click to open/close notification panel
- Auto-polls unread count every 5 seconds
- Persists across page navigation

**Props:**
- `userId` - Current logged-in user ID (required)

**Usage in HomePage:**
```jsx
<NotificationBadge userId={loggedInUser?._id || loggedInUser?.id} />
```

### 2. **NotificationCenter** (`client/src/Components/Notifications/NotificationCenter.jsx`)

Full-featured notification panel with:

**Features:**
- **Filtering** - View All / Reminders / Overdue notifications
- **Pagination** - 10 notifications per page with Previous/Next navigation
- **Actions**:
  - Mark single notification as read (checkmark button)
  - Delete notification (trash button)
  - Mark all as unread (bulk action)
  - Clear all read notifications (cleanup)
- **Real-time Updates** - Polls server every 30 seconds for new notifications
- **Time Display** - Shows relative time (e.g., "5m ago", "2h ago")
- **Empty States** - Shows friendly messages when no notifications exist
- **Responsive Design** - Adapts to different screen sizes

**Props:**
- `userId` - Current user ID (required)
- `isOpen` - Panel visibility state
- `onClose` - Callback when closing panel

### 3. **Styling** (`client/src/Components/Notifications/NotificationCenter.css`)

Professional styling includes:
- **Colors**: Gradient header (purple to blue), semantic status colors
- **Animations**: 
  - Slide-in effect when opening panel
  - Pulse animation on unread badges
  - Hover effects on interactive elements
- **Responsive Breakpoints**:
  - Desktop: 380px wide panel
  - Tablet: 70vh height
  - Mobile: Full-width with adjusted padding
- **States**:
  - Unread notifications: Blue left border + light blue background
  - Hover effects: Subtle color changes and scale transforms
  - Loading state: "⏳ Loading..." message
  - Empty state: "😌 No notifications" message

---

## How It Works - Step by Step

### 1. **User Creates/Schedules a Follow-Up**
```
User → Create Follow-Up → Save to DB
                          ↓
                    followUpDate: "2024-03-15 10:00"
                    status: "Pending"
```

### 2. **Cron Job Runs Every Minute**
```
Cron → Query upcoming follow-ups (next 60 min)
   ↓
Query overdue follow-ups (>0 min past schedule)
   ↓
Check isReminderSent/isOverdueNotificationSent flags
   ↓
Create notifications for enabled users
   ↓
Update FollowUp document with sent flags
```

### 3. **Notification Created in Database**
```
Notification Document:
{
  userId: "user123",
  followUpId: "followup456",
  type: "followup_reminder",
  title: "📢 Follow-up reminder in 1h",
  message: "Reminder: Follow-up scheduled for ABC Company\n...",
  scheduledTime: "2024-03-15T10:00:00Z",
  isRead: false,
  createdAt: "2024-03-15T08:50:00Z",
  expires: "2024-04-14T08:50:00Z"  // Auto-deletes in 30 days
}
```

### 4. **User Sees Bell Icon with Badge**
```
Header → NotificationBadge
      ↓
   Check /api/notifications/{userId}/unread-count
      ↓
   Display count on bell icon (e.g., "3")
      ↓
   Re-check every 5 seconds
```

### 5. **User Clicks Notification Bell**
```
Click → Open NotificationCenter
     ↓
Fetch /api/notifications/{userId}?limit=10&skip=0
     ↓
Display notification list with:
   - Filtered by type (All/Reminders/Overdue)
   - Relative time display
   - Action buttons (mark read, delete)
```

### 6. **User Interacts with Notification**
```
Option A: Mark as Read
         → PUT /api/notifications/{notificationId}/read
         → Update UI immediately
         → Decrease unread count badge

Option B: Delete
         → DELETE /api/notifications/{notificationId}
         → Remove from list
         → Decrease unread count

Option C: Clear All Read
         → DELETE /api/notifications/{userId}/clear-read
         → Remove all read notifications
         → Keep unread intact
```

---

## API Endpoint Examples

### Get Notifications with Unread Count
```bash
GET /api/notifications/user123?limit=10&skip=0

Response:
{
  "notifications": [
    {
      "_id": "notif123",
      "userId": "user123",
      "followUpId": "followup456",
      "type": "followup_reminder",
      "title": "📢 Follow-up reminder in 1h",
      "message": "Reminder: Follow-up for ABC Company...",
      "isRead": false,
      "createdAt": "2024-03-15T08:50:00Z"
    },
    ...
  ],
  "unreadCount": 3
}
```

### Get Unread Count
```bash
GET /api/notifications/user123/unread-count

Response:
{
  "unreadCount": 3
}
```

### Mark as Read
```bash
PUT /api/notifications/notif123/read

Response:
{
  "message": "Notification marked as read",
  "notification": {
    "_id": "notif123",
    "isRead": true,
    "readAt": "2024-03-15T09:00:00Z"
  }
}
```

### Filter by Type
```bash
GET /api/notifications/user123/by-type/followup_reminder?limit=10

Response:
{
  "notifications": [
    // Only followup_reminder types
  ]
}
```

---

## Configuration & Settings

### Cron Job Timing (in `followupCron.js`)

```javascript
// Current Settings:
const REMINDER_WINDOW = 60 * 60 * 1000;  // 1 hour before
const BUFFER_TIME = 5 * 60 * 1000;        // 5 minute buffer for duplicates

// Runs every minute:
cron.schedule("* * * * *", async () => {
  // Check and send notifications
});
```

### Notification TTL (in `Notification.js`)

```javascript
// Auto-delete after 30 days:
expires: {
  type: Date,
  default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  expires: 2592000  // 30 days in seconds
}
```

### Real-time Polling (in `NotificationBadge.jsx`)

```javascript
// Updates unread count every 5 seconds:
const interval = setInterval(fetchUnreadCount, 5000);

// Full notifications every 30 seconds:
const refreshInterval = setInterval(fetchNotifications, 30000);
```

---

## Testing the System

### 1. **Create a Test Follow-Up**
- Go to Follow-Up module
- Create a follow-up scheduled for 1 hour from current time
- Set status to "Pending"

### 2. **Wait for Cron Job**
- Cron runs every minute (check server logs)
- Should create notification within 1 minute

### 3. **Verify Notification**
- Check notification badge (should show count)
- Click bell icon to open panel
- Should see "📢 Follow-up reminder in Xh Ym"

### 4. **Test Interactions**
- Click checkmark to mark as read
- Click trash to delete
- Use filter buttons to show specific types
- Test pagination if >10 notifications

### 5. **Test Real-time Updates**
- Open notification panel in multiple tabs
- Mark notification as read in one tab
- Check if other tabs update (within 5-30 seconds)

---

## Troubleshooting

### No Notifications Appearing

1. **Check Cron Job is Running**
   - Look for cron messages in server logs
   - Verify `followupCron.js` is imported in `server/index.js`

2. **Check Follow-up Status**
   - Follow-up must have status = "Pending"
   - scheduled time must be within 1 hour from now

3. **Check Database**
   - Verify `Notification` collection exists
   - Check if documents are being inserted

4. **Check User Settings**
   - Verify user has notifications enabled in settings
   - Check if userId matches logged-in user

### Duplicate Notifications

1. **Verify Flags Are Set**
   - Check `isReminderSent` and `isOverdueNotificationSent` fields in FollowUp

2. **Clear Old Notifications**
   - Delete from Notification collection manually
   - Re-test cron job

### Notifications Not Updating

1. **Check Polling Interval**
   - Badge polls every 5 seconds
   - Panel polls every 30 seconds
   - May not be instant

2. **Clear Browser Cache**
   - Hard refresh page (Ctrl+Shift+R)
   - Delete localStorage if needed

3. **Check API Endpoints**
   - Verify `/api/notifications/` routes are registered
   - Test endpoints with Postman/curl

---

## Future Enhancements

### Planned Features
- ✅ Email notifications (structure ready, nodemailer needed)
- ⬜ WebSocket real-time notifications (instant updates)
- ⬜ Notification preferences per user (email/in-app/both)
- ⬜ Notification templates with custom messages
- ⬜ Mark as important/starred
- ⬜ Snooze notifications

### Email Notification Setup
```javascript
// Install: npm install nodemailer
import nodemailer from "nodemailer";

const sendEmail = async (userEmail, notification) => {
  // Send notification via email
  // Update emailSent flag
};
```

---

## Server Integration Checklist

✅ **Notification Model** - Created in `server/models/Notification.js`
✅ **Cron Job** - Enhanced in `server/cron/followupCron.js`
✅ **Notification Routes** - Created in `server/routes/notificationRoutes.js`
✅ **FollowUp Schema Updates** - Added tracking fields
✅ **Server Registration** - Routes registered in `server/index.js`
✅ **Notification Import** - Added to `server/index.js`

---

## Frontend Integration Checklist

✅ **NotificationBadge Component** - Created with unread polling
✅ **NotificationCenter Component** - Full notification UI with all features
✅ **NotificationCenter CSS** - Professional styling with animations
✅ **HomePage Integration** - NotificationBadge added to header
✅ **User ID Passing** - `loggedInUser._id` passed to NotificationBadge

---

## File Structure

```
server/
├── models/
│   ├── Notification.js (NEW)
│   └── FollowUp.js (UPDATED - added flags)
├── cron/
│   └── followupCron.js (UPDATED)
├── routes/
│   └── notificationRoutes.js (NEW)
└── index.js (UPDATED - registered routes)

client/src/Components/
└── Notifications/ (NEW FOLDER)
    ├── NotificationBadge.jsx (NEW)
    ├── NotificationCenter.jsx (NEW)
    └── NotificationCenter.css (NEW)

HomePage.js (UPDATED - integrated NotificationBadge)
```

---

## Performance Considerations

### Database Indexes
- TTL index on `Notification.expires` - Auto-cleans old data
- Index on `userId` - Fast user notification queries
- Index on `followUpId` - Fast follow-up lookups

### Polling Strategy
- Badge: Every 5 seconds (light query, just unread count)
- Panel: Every 30 seconds (heavier query, full notifications)
- Cron: Every minute (scheduled task)

### Notification Cleanup
- Automatic deletion after 30 days via TTL
- Manual cleanup available via "Clear Read" button
- Prevents database bloat

---

## Support & Documentation

For issues or questions:
1. Check server logs for cron job execution
2. Verify notification routes respond correctly
3. Check browser console for frontend errors
4. Inspect Network tab for API call issues
5. Review this guide for configuration options

---

## Summary

The Follow-Up Reminder Notification System provides:
- **Automated** reminder scheduling via cron job
- **Real-time** notification updates with polling
- **User-friendly** UI with filtering and pagination
- **Reliable** duplicate prevention via tracking flags
- **Scalable** architecture with TTL-based cleanup
- **Extensible** foundation for email/WebSocket enhancements

Users will now receive timely reminders for follow-up tasks, improving productivity and deadline management.
