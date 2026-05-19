import express from "express";
import Notification from "../models/Notification.js";
import FollowUpEnhanced from "../models/FollowUpEnhanced.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// MIDDLEWARE
// ==========================================

// Apply auth middleware to all routes
router.use(authMiddleware);

// ==========================================
// GET ROUTES
// ==========================================

/**
 * GET /api/notifications
 * Get paginated list of notifications for current user
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, type, priority, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      userId: req.user.id,
      isDismissed: false,
    };

    if (type) query.notificationType = type;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .select("-metadata -relatedData.customFields")
        .lean(),
      Notification.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/unread/count
 * Get unread notification count
 */
router.get("/unread/count", async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/summary
 * Get notification summary (unread, reminders, alerts)
 */
router.get("/summary", async (req, res) => {
  try {
    const summary = await Notification.getNotificationSummary(req.user.id);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching notification summary:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/critical
 * Get critical reminders and alerts
 */
router.get("/critical", async (req, res) => {
  try {
    const criticalReminders = await Notification.getCriticalReminders(req.user.id);

    res.json({
      success: true,
      data: criticalReminders,
      count: criticalReminders.length,
    });
  } catch (error) {
    console.error("Error fetching critical reminders:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/feed
 * Get notification feed with optional filters
 */
router.get("/feed", async (req, res) => {
  try {
    const { limit = 20, skip = 0, types, priority } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      types: types ? types.split(",") : [],
      priority: priority || null,
    };

    const notifications = await Notification.getNotificationFeed(
      req.user.id,
      options
    );

    const total = await Notification.countDocuments({
      userId: req.user.id,
      isDismissed: false,
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit: options.limit,
        skip: options.skip,
        pages: Math.ceil(total / options.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notification feed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/:id
 * Get single notification
 */
router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/follow-up/:followUpId
 * Get all notifications for a follow-up
 */
router.get("/follow-up/:followUpId", async (req, res) => {
  try {
    const notifications = await Notification.getNotificationsByFollowUp(
      req.params.followUpId
    );

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Error fetching follow-up notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// POST ROUTES
// ==========================================

/**
 * POST /api/notifications
 * Create a new notification
 */
router.post("/", async (req, res) => {
  try {
    const { title, message, notificationType, priority, followUpId, action } = req.body;

    if (!title || !message || !notificationType) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const notification = new Notification({
      userId: req.user.id,
      title,
      message,
      notificationType,
      priority: priority || "medium",
      followUpId,
      action,
      status: "pending",
    });

    await notification.save();

    res.status(201).json({
      success: true,
      data: notification,
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// PATCH ROUTES
// ==========================================

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/notifications/:id/dismiss
 * Dismiss notification
 */
router.patch("/:id/dismiss", async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }

    await notification.dismiss();

    res.json({
      success: true,
      data: notification,
      message: "Notification dismissed",
    });
  } catch (error) {
    console.error("Error dismissing notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.patch("/mark-all/read", async (req, res) => {
  try {
    const result = await Notification.markUserNotificationsAsRead(req.user.id);

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Marked ${result.modifiedCount} notifications as read`,
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/notifications/:id
 * Update notification
 */
router.patch("/:id", async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }

    const allowedFields = [
      "title",
      "message",
      "priority",
      "status",
      "soundAlert",
    ];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(notification, updates);
    await notification.save();

    res.json({
      success: true,
      data: notification,
      message: "Notification updated successfully",
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// DELETE ROUTES
// ==========================================

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/notifications/old
 * Delete old notifications (admin/system only)
 */
router.delete("/cleanup/old", async (req, res) => {
  try {
    const { daysOld = 30 } = req.query;

    const result = await Notification.deleteOldNotifications(parseInt(daysOld));

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} old notifications`,
    });
  } catch (error) {
    console.error("Error deleting old notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// PREFERENCE ROUTES
// ==========================================

/**
 * GET /api/notifications/preferences
 * Get user notification preferences (future implementation)
 */
router.get("/preferences", async (req, res) => {
  try {
    // This would typically come from User model or separate Preferences collection
    const preferences = {
      userId: req.user.id,
      emailNotifications: true,
      browserNotifications: true,
      soundAlerts: true,
      pushNotifications: true,
      reminderTiming: ["15_minutes_before", "1_hour_before", "exact_time"],
      quietHours: {
        enabled: false,
        start: "20:00",
        end: "08:00",
      },
    };

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/notifications/preferences
 * Update user notification preferences
 */
router.patch("/preferences", async (req, res) => {
  try {
    const { emailNotifications, browserNotifications, soundAlerts } = req.body;

    // This would typically update User model or separate Preferences collection
    const preferences = {
      userId: req.user.id,
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      browserNotifications: browserNotifications !== undefined ? browserNotifications : true,
      soundAlerts: soundAlerts !== undefined ? soundAlerts : true,
    };

    res.json({
      success: true,
      data: preferences,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
