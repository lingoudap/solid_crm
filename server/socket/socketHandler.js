import Notification from "../models/Notification.js";

/**
 * Socket.IO Event Handlers for Real-Time Notifications
 * Handles real-time notification delivery and user interactions
 */

export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;

    if (userId) {
      // Join user's personal room
      socket.join(userId);
      console.log(`✅ User ${userId} connected with socket ${socket.id}`);

      // Send unread count on connection
      handleGetUnreadCount(socket, userId);
    }

    // ==========================================
    // NOTIFICATION EVENTS
    // ==========================================

    /**
     * Mark notification as read
     */
    socket.on("mark_as_read", async (notificationId) => {
      try {
        const notification = await Notification.findById(notificationId);

        if (notification && notification.userId.toString() === userId) {
          await notification.markAsRead();

          // Emit updated unread count
          const unreadCount = await Notification.getUnreadCount(userId);
          socket.emit("unread_count", { count: unreadCount });

          // Emit read status update
          io.to(userId).emit("notification_read", {
            notificationId,
            readAt: notification.readAt,
          });

          console.log(`✅ Notification ${notificationId} marked as read`);
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        socket.emit("error", { message: "Failed to mark notification as read" });
      }
    });

    /**
     * Dismiss notification
     */
    socket.on("dismiss_notification", async (notificationId) => {
      try {
        const notification = await Notification.findById(notificationId);

        if (notification && notification.userId.toString() === userId) {
          await notification.dismiss();

          // Emit updated unread count
          const unreadCount = await Notification.getUnreadCount(userId);
          socket.emit("unread_count", { count: unreadCount });

          // Emit dismiss status update
          io.to(userId).emit("notification_dismissed", {
            notificationId,
            dismissedAt: notification.dismissedAt,
          });

          console.log(`✅ Notification ${notificationId} dismissed`);
        }
      } catch (error) {
        console.error("Error dismissing notification:", error);
        socket.emit("error", { message: "Failed to dismiss notification" });
      }
    });

    /**
     * Mark all notifications as read
     */
    socket.on("mark_all_as_read", async () => {
      try {
        const result = await Notification.updateMany(
          { userId, isRead: false, isDismissed: false },
          {
            isRead: true,
            readAt: new Date(),
          }
        );

        // Emit updated unread count (should be 0)
        socket.emit("unread_count", { count: 0 });
        io.to(userId).emit("all_marked_read", { count: result.modifiedCount });

        console.log(`✅ Marked ${result.modifiedCount} notifications as read`);
      } catch (error) {
        console.error("Error marking all as read:", error);
        socket.emit("error", { message: "Failed to mark all as read" });
      }
    });

    /**
     * Get notification feed
     */
    socket.on("get_notifications", async (options = {}) => {
      try {
        const { limit = 20, skip = 0, types = [], priority = null } = options;

        const notifications = await Notification.getNotificationFeed(userId, {
          limit,
          skip,
          types,
          priority,
        });

        const total = await Notification.countDocuments({
          userId,
          isDismissed: false,
        });

        socket.emit("notification_feed", {
          data: notifications,
          pagination: {
            total,
            limit,
            skip,
            pages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
        socket.emit("error", { message: "Failed to fetch notifications" });
      }
    });

    /**
     * Get notification summary
     */
    socket.on("get_notification_summary", async () => {
      try {
        const summary = await Notification.getNotificationSummary(userId);
        const unreadCount = await Notification.getUnreadCount(userId);

        socket.emit("notification_summary", {
          summary,
          unreadCount,
        });
      } catch (error) {
        console.error("Error fetching notification summary:", error);
        socket.emit("error", { message: "Failed to fetch summary" });
      }
    });

    /**
     * Get unread count
     */
    socket.on("get_unread_count", async () => {
      handleGetUnreadCount(socket, userId);
    });

    /**
     * Enable browser notifications
     */
    socket.on("enable_browser_notifications", async () => {
      try {
        // Update user notification preferences
        // This would be in User model or in notification preferences
        io.to(userId).emit("browser_notifications_enabled", {
          enabled: true,
        });
        console.log(`✅ Browser notifications enabled for user ${userId}`);
      } catch (error) {
        console.error("Error enabling browser notifications:", error);
        socket.emit("error", { message: "Failed to enable notifications" });
      }
    });

    /**
     * Disable browser notifications
     */
    socket.on("disable_browser_notifications", async () => {
      try {
        io.to(userId).emit("browser_notifications_disabled", {
          enabled: false,
        });
        console.log(`✅ Browser notifications disabled for user ${userId}`);
      } catch (error) {
        console.error("Error disabling browser notifications:", error);
        socket.emit("error", { message: "Failed to disable notifications" });
      }
    });

    /**
     * Get critical reminders
     */
    socket.on("get_critical_reminders", async () => {
      try {
        const criticalReminders = await Notification.getCriticalReminders(userId);

        socket.emit("critical_reminders", {
          data: criticalReminders,
          count: criticalReminders.length,
        });
      } catch (error) {
        console.error("Error fetching critical reminders:", error);
        socket.emit("error", { message: "Failed to fetch critical reminders" });
      }
    });

    /**
     * Request notification sound
     */
    socket.on("request_notification_sound", async (notificationId) => {
      try {
        const notification = await Notification.findById(notificationId);

        if (notification && notification.soundAlert) {
          socket.emit("play_notification_sound", {
            soundFile: notification.soundFile || "default_notification.mp3",
          });
        }
      } catch (error) {
        console.error("Error requesting sound:", error);
      }
    });

    /**
     * Notification action clicked
     */
    socket.on("notification_action_clicked", async (notificationId) => {
      try {
        const notification = await Notification.findById(notificationId);

        if (notification && notification.userId.toString() === userId) {
          // Mark as read
          notification.isRead = true;
          notification.readAt = new Date();
          await notification.save();

          // Emit event for analytics
          io.to(userId).emit("action_clicked", {
            notificationId,
            action: notification.action,
            timestamp: new Date(),
          });

          console.log(
            `✅ User clicked action on notification ${notificationId}`
          );
        }
      } catch (error) {
        console.error("Error logging notification action:", error);
      }
    });

    /**
     * Notification displayed (shown to user)
     */
    socket.on("notification_displayed", async (notificationId) => {
      try {
        const notification = await Notification.findById(notificationId);

        if (notification) {
          notification.deliveryMethods.inApp.displayed = true;
          notification.deliveryMethods.inApp.displayedAt = new Date();
          await notification.save();

          console.log(`✅ Notification ${notificationId} displayed to user`);
        }
      } catch (error) {
        console.error("Error logging notification display:", error);
      }
    });

    /**
     * Disconnection
     */
    socket.on("disconnect", () => {
      console.log(`❌ User ${userId} disconnected from socket ${socket.id}`);
    });
  });

  return io;
};

/**
 * Helper function to handle unread count request
 */
async function handleGetUnreadCount(socket, userId) {
  try {
    const unreadCount = await Notification.getUnreadCount(userId);
    socket.emit("unread_count", { count: unreadCount });
  } catch (error) {
    console.error("Error getting unread count:", error);
    socket.emit("error", { message: "Failed to get unread count" });
  }
}

/**
 * Emit notification to user via Socket.IO
 * Call this from reminder service or other backend services
 */
export const emitNotificationToUser = (io, userId, notification) => {
  io.to(userId.toString()).emit("new_notification", {
    id: notification._id,
    title: notification.title,
    message: notification.message,
    type: notification.notificationType,
    priority: notification.priority,
    soundAlert: notification.soundAlert,
    timestamp: notification.createdAt,
    action: notification.action,
  });
};

/**
 * Emit reminder to user
 */
export const emitReminderToUser = (io, userId, reminder) => {
  io.to(userId.toString()).emit("reminder_alert", {
    id: reminder._id,
    title: reminder.title,
    message: reminder.message,
    followUpId: reminder.followUpId,
    type: reminder.notificationType,
    priority: reminder.priority,
    soundAlert: reminder.soundAlert,
  });
};

/**
 * Broadcast notification to multiple users
 */
export const broadcastNotification = (io, userIds, notification) => {
  userIds.forEach((userId) => {
    emitNotificationToUser(io, userId, notification);
  });
};

/**
 * Emit update to notification feed
 */
export const updateNotificationFeed = (io, userId) => {
  io.to(userId.toString()).emit("notification_feed_updated", {
    timestamp: new Date(),
  });
};
