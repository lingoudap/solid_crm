# Notification System - Quick Reference

## Setup (5 minutes)

### Backend
```javascript
// 1. Add to server/index.js
import reminderService from "./services/reminderService.js";
import { setupSocketHandlers } from "./socket/socketHandler.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const io = require("socket.io")(server);
setupSocketHandlers(io);
reminderService.initializeReminderScheduler();
app.use("/api/notifications", notificationRoutes);

// 2. Add .env
SOCKET_PORT=5000
REMINDER_CHECK_INTERVAL=5
```

### Frontend
```javascript
// 1. Wrap App with NotificationProvider
import { NotificationProvider } from "./context/notificationContext";

<NotificationProvider>
  <App />
</NotificationProvider>

// 2. Initialize Socket.IO
import { useNotificationSocket } from "./hooks/useNotifications";

useNotificationSocket(user?.id, user?.token);

// 3. Add NotificationBell to header
import NotificationBell from "./Components/Notifications/NotificationBell";

<NotificationBell />
```

---

## Common Usage Patterns

### Get Notifications
```javascript
const { notifications, unreadCount } = useNotifications();
```

### Mark as Read
```javascript
const { markAsRead } = useNotifications();
markAsRead(notificationId);
```

### Show Toast
```javascript
const { success, error } = useToast();
success("Title", "Message");
error("Error", "Something went wrong");
```

### Browser Notification
```javascript
const { show, requestPermission } = useBrowserNotifications();
const granted = await requestPermission();
if (granted) show("Hello", { body: "Content" });
```

### Get Unread Count
```javascript
const unreadCount = useUnreadCount();
```

### Get Critical Reminders
```javascript
const criticalReminders = useCriticalReminders();
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread/count` | Get unread count |
| GET | `/api/notifications/summary` | Get summary stats |
| GET | `/api/notifications/critical` | Get critical reminders |
| POST | `/api/notifications` | Create notification |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| DELETE | `/api/notifications/:id` | Delete |

---

## Socket.IO Events

### Send to Server
```javascript
socket.emit("mark_as_read", notificationId);
socket.emit("mark_all_as_read");
socket.emit("dismiss_notification", notificationId);
socket.emit("get_notifications", { limit: 20 });
socket.emit("get_notification_summary");
```

### Receive from Server
```javascript
socket.on("new_notification", (notification) => {});
socket.on("reminder_alert", (reminder) => {});
socket.on("unread_count", ({ count }) => {});
socket.on("notification_feed", (data) => {});
```

---

## Notification Types
- `reminder_15_min` - 15 minutes before
- `reminder_1_hour` - 1 hour before
- `reminder_exact_time` - At exact time
- `overdue_alert` - Past due
- `follow_up_update` - Follow-up updated
- `follow_up_complete` - Follow-up completed
- `follow_up_assigned` - Assigned to you
- `system_alert` - System message

---

## Priority Levels
- `low` - Gray
- `medium` - Orange
- `high` - Red-Orange  
- `critical` - Red

---

## Hooks Reference

```javascript
// Main hook - everything
const context = useNotifications();

// Initialize Socket
useNotificationSocket(userId, token);

// Get unread count (auto-refresh every 30s)
const count = useUnreadCount();

// Get summary
const { unreadCount, reminderCount, alertCount } = useNotificationSummary();

// Get critical reminders
const reminders = useCriticalReminders();

// Get paginated feed
const { notifications, page, setPage } = useNotificationFeed();

// Browser notifications
const { show, requestPermission } = useBrowserNotifications();

// Sound
const { play } = useNotificationSound();

// Actions
const { markAsRead, markAllAsRead, dismiss } = useNotificationActions();

// Filter by type and priority
const filtered = useFilteredNotifications("reminder_15_min", "critical");

// Group by type
const grouped = useGroupedNotifications();

// Statistics
const stats = useNotificationStats();
```

---

## Component Props

### NotificationBell
No props required - reads from context

### ReminderPopup
```javascript
<ReminderPopup
  reminder={reminderObject}
  onClose={() => {}}
  onComplete={(id) => {}}
  onSnooze={(id, minutes) => {}}
/>
```

### ToastNotification
```javascript
<ToastNotification
  title="Title"
  message="Message"
  type="success" // success, error, warning, info, reminder
  duration={5000} // ms, 0 = no auto-close
  action={{ label: "Undo", onClick: () => {} }}
/>
```

---

## Configuration

### Reminder Timings
Edit `reminderService.js`:
```javascript
const REMINDER_TIMINGS = {
  FIFTEEN_MIN: 15 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  EXACT_TIME: 0,
};
```

### Check Interval
In `.env`:
```
REMINDER_CHECK_INTERVAL=5 # minutes
```

---

## File Locations

| Component | Path |
|-----------|------|
| reminderService | `server/services/reminderService.js` |
| socketHandler | `server/socket/socketHandler.js` |
| Notification model | `server/models/Notification.js` |
| Routes | `server/routes/notificationRoutes.js` |
| Socket client | `client/src/services/notificationSocketClient.js` |
| Context | `client/src/context/notificationContext.js` |
| Hooks | `client/src/hooks/useNotifications.js` |
| Bell | `client/src/Components/Notifications/NotificationBell.jsx` |
| Popup | `client/src/Components/Notifications/ReminderPopup.jsx` |
| Toast | `client/src/Components/Notifications/ToastNotification.jsx` |

---

## Debugging

```javascript
// Check socket status
const status = notificationSocketClient.getStatus();
console.log(status);
// { isConnected: true, socketId: "...", reconnectAttempts: 0 }

// Check browser notification permission
console.log(Notification.permission); // granted, denied, default

// Test notification
const { show } = useBrowserNotifications();
show("Test", { body: "Test message" });

// Check MongoDB
db.notifications.find({ userId: ObjectId("...") });
```

---

## Performance Tips

1. Use `useUnreadCount()` for real-time badge updates
2. Use `useCriticalReminders()` for important alerts
3. Paginate notification feeds with `limit` parameter
4. Dismiss old notifications to keep list clean
5. Use Sound only for critical notifications
6. Browser notifications work offline (once granted)

---

## Common Issues

**Notifications not appearing?**
- Check Socket connection: `notificationSocketClient.getStatus()`
- Check browser permission: `Notification.permission`
- Verify API endpoints in browser DevTools

**Reminders not triggering?**
- Check Node-cron logs
- Verify Follow-Up due dates
- Check `REMINDER_CHECK_INTERVAL` setting

**Sound not playing?**
- Check file exists in `public/sounds/`
- Check browser audio settings
- Test with `useNotificationSound()`

---

## Integration Example

```javascript
import { NotificationProvider } from "./context/notificationContext";
import { useNotificationSocket } from "./hooks/useNotifications";
import NotificationBell from "./Components/Notifications/NotificationBell";

function App() {
  const user = useAuth();

  return (
    <NotificationProvider>
      <AppContent user={user} />
    </NotificationProvider>
  );
}

function AppContent({ user }) {
  useNotificationSocket(user?.id, user?.token);

  return (
    <header>
      <h1>My App</h1>
      <NotificationBell />
    </header>
  );
}
```

---

## Next Steps

- [x] Backend setup (reminderService, socketHandler, routes, model)
- [x] Frontend setup (context, hooks, components)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Notification templates
- [ ] Quiet hours
- [ ] Analytics

See NOTIFICATION_SYSTEM_GUIDE.md for complete documentation.
