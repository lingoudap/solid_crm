import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";

const router = express.Router();

/**
 * ⚠️ IMPORTANT: Specific routes MUST come BEFORE generic routes!
 * Otherwise /:userId will match before /:userId/unread-count
 */

/**
 * Get unread notifications count
 * GET /api/notifications/:userId/unread-count
 */
router.get("/:userId/unread-count", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📊 Fetching unread count for user:", userId);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const unreadCount = await Notification.countDocuments({
      userId: userObjectId,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

/**
 * Get notifications by type
 * GET /api/notifications/:userId/by-type/:type
 */
router.get("/:userId/by-type/:type", async (req, res) => {
  try {
    const { userId, type } = req.params;
    const { limit = 20 } = req.query;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const notifications = await Notification.find({ userId: userObjectId, type })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("followUpId", "notes followUpDate status");

    res.json({ notifications, type });
  } catch (err) {
    console.error("Error fetching notifications by type:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * Mark all notifications as read for a user
 * PUT /api/notifications/:userId/read-all
 */
router.put("/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const result = await Notification.updateMany(
      { userId: userObjectId, isRead: false },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

/**
 * Delete all read notifications for a user
 * DELETE /api/notifications/:userId/clear-read
 */
router.delete("/:userId/clear-read", async (req, res) => {
  try {
    const { userId } = req.params;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const result = await Notification.deleteMany({
      userId: userObjectId,
      isRead: true
    });

    res.json({
      message: "Read notifications deleted",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Error clearing read notifications:", err);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

/**
 * Mark notification as read
 * PUT /api/notifications/:notificationId/read
 */
router.put("/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

/**
 * Delete a notification
 * DELETE /api/notifications/:notificationId
 */
router.delete("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

/**
 * Send message to lead (create notification)
 * POST /api/notifications/send-lead-message
 */
router.post("/send-lead-message", async (req, res) => {
  try {
    const { leadId, message, title } = req.body;

    if (!leadId || !message) {
      return res.status(400).json({ error: "Lead ID and message are required" });
    }

    // Create notification for the lead
    const notification = new Notification({
      userId: leadId,
      type: "lead_message",
      title: title || "Lead Message",
      message: message,
      relatedTo: "Lead",
      relatedId: leadId,
      isRead: false,
      notificationTime: new Date()
    });

    const savedNotification = await notification.save();
    res.status(201).json({
      message: "✅ Message sent to lead successfully!",
      notification: savedNotification
    });
  } catch (err) {
    console.error("Error sending lead message:", err);
    res.status(500).json({ error: "Failed to send message to lead" });
  }
});

/**
 * Get all notifications for a user (MUST BE LAST!)
 * GET /api/notifications/:userId
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    console.log("📬 Fetching notifications for user:", userId);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const notifications = await Notification.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("followUpId", "notes followUpDate status")
      .populate("userId", "name email");

    const total = await Notification.countDocuments({ userId: userObjectId });
    const unreadCount = await Notification.countDocuments({ userId: userObjectId, isRead: false });

    res.json({
      notifications,
      total,
      unreadCount,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

export default router;
