import cron from "node-cron";
import Notification from "../models/Notification.js";
import FollowUp from "../models/FollowUpEnhanced.js";
import User from "../models/User.js";

/**
 * Reminder Service
 * Handles scheduling, triggering, and managing reminders for follow-ups
 * Uses node-cron for scheduling and Socket.IO for real-time notifications
 */

class ReminderService {
  constructor(io) {
    this.io = io;
    this.cronJobs = new Map();
    this.reminders = new Map();
  }

  /**
   * Initialize reminder system
   * Start background jobs for checking pending reminders
   */
  async initialize() {
    console.log("🔔 Initializing reminder service...");

    // Check for pending reminders every minute
    this.mainCronJob = cron.schedule("* * * * *", async () => {
      await this.checkPendingReminders();
    });

    // Check for overdue reminders every 5 minutes
    this.overdueCronJob = cron.schedule("*/5 * * * *", async () => {
      await this.checkOverdueReminders();
    });

    // Cleanup old notifications daily at 2 AM
    this.cleanupCronJob = cron.schedule("0 2 * * *", async () => {
      await this.cleanupOldNotifications();
    });

    console.log("✅ Reminder service initialized");
  }

  /**
   * Schedule a reminder for a follow-up
   * Creates notification records with reminder timings
   */
  async scheduleReminder(followUpId, userId, reminderTimings = []) {
    try {
      const followUp = await FollowUp.findById(followUpId).populate("assignedTo createdBy");
      const user = await User.findById(userId);

      if (!followUp || !user) {
        throw new Error("Follow-up or user not found");
      }

      // Default reminder timings if not provided
      const timings = reminderTimings.length > 0 ? reminderTimings : [
        { type: "minutes_before", value: 15, isActive: true },
        { type: "hours_before", value: 1, isActive: true },
      ];

      // Create notification record
      const notification = new Notification({
        followUpId,
        userId,
        notificationType: "reminder",
        title: `Reminder: Follow-up with ${followUp.customerName || "customer"}`,
        message: `Follow-up scheduled for ${new Date(followUp.followUpDate).toLocaleDateString()}`,
        description: followUp.remark || "",
        action: {
          label: "View Follow-Up",
          url: `/followups/${followUpId}`,
          followUpId,
        },
        relatedType: followUp.relatedType,
        relatedId: followUp.relatedId,
        customerName: followUp.customerName || "Customer",
        reminderTimings: timings,
        followUpDetails: {
          date: followUp.followUpDate,
          time: followUp.followUpTime,
          status: followUp.status,
          priority: followUp.priority,
          assignedTo: followUp.assignedTo,
        },
        priority: followUp.priority === "critical" ? "critical" : "high",
        category: "reminder",
      });

      // Calculate next reminder times
      await this.calculateNextReminderTime(notification, followUp);

      await notification.save();

      // Emit socket event
      this.io?.to(userId.toString()).emit("reminder_scheduled", {
        notificationId: notification._id,
        followUpId,
        nextReminderTime: notification.nextReminderTime,
      });

      return notification;
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      throw error;
    }
  }

  /**
   * Calculate next reminder time based on follow-up date and reminder timings
   */
  async calculateNextReminderTime(notification, followUp) {
    try {
      if (!notification.reminderTimings || notification.reminderTimings.length === 0) {
        return;
      }

      const followUpDateTime = new Date(followUp.followUpDate);
      const [hours, minutes] = (followUp.followUpTime || "09:00").split(":");
      followUpDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

      let nextReminderTime = null;
      const now = new Date();

      // Find the earliest reminder time
      notification.reminderTimings.forEach((timing) => {
        if (!timing.isActive) return;

        let reminderTime = new Date(followUpDateTime);

        switch (timing.type) {
          case "minutes_before":
            reminderTime.setMinutes(reminderTime.getMinutes() - timing.value);
            break;
          case "hours_before":
            reminderTime.setHours(reminderTime.getHours() - timing.value);
            break;
          case "days_before":
            reminderTime.setDate(reminderTime.getDate() - timing.value);
            break;
          case "at_exact_time":
            // Use exact follow-up time
            break;
        }

        if (reminderTime > now && (!nextReminderTime || reminderTime < nextReminderTime)) {
          nextReminderTime = reminderTime;
        }
      });

      notification.nextReminderTime = nextReminderTime;
    } catch (error) {
      console.error("Error calculating reminder time:", error);
    }
  }

  /**
   * Check for pending reminders and send notifications
   */
  async checkPendingReminders() {
    try {
      const pendingReminders = await Notification.getPendingReminders();

      for (const notification of pendingReminders) {
        await this.sendReminder(notification);
      }
    } catch (error) {
      console.error("Error checking pending reminders:", error);
    }
  }

  /**
   * Check for overdue follow-ups and send alerts
   */
  async checkOverdueReminders() {
    try {
      const now = new Date();
      const overdueFollowUps = await FollowUp.find({
        followUpDate: { $lt: now },
        status: { $ne: "Completed" },
        assignedTo: { $exists: true },
      });

      for (const followUp of overdueFollowUps) {
        // Check if overdue notification already exists
        const existingNotification = await Notification.findOne({
          followUpId: followUp._id,
          notificationType: "overdue",
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Created in last 24 hours
        });

        if (!existingNotification) {
          await this.createOverdueNotification(followUp);
        }
      }
    } catch (error) {
      console.error("Error checking overdue reminders:", error);
    }
  }

  /**
   * Send a reminder notification
   */
  async sendReminder(notification) {
    try {
      // Mark as sent
      await notification.markAsSent(["inApp", "browser"]);

      // Update last reminder time
      notification.lastReminderTime = new Date();
      await notification.save();

      // Emit socket event for real-time notification
      this.io?.to(notification.userId.toString()).emit("reminder_notification", {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.notificationType,
        followUpId: notification.followUpId,
        priority: notification.priority,
        soundAlert: notification.soundAlert,
        formattedDate: notification.formattedDate,
        timeSinceCreation: notification.timeSinceCreation,
      });

      // Schedule next reminder if applicable
      if (notification.reminderTimings && notification.reminderTimings.length > 1) {
        // TODO: Schedule next reminder based on timing configuration
      }

      console.log(`✅ Reminder sent for notification ${notification._id}`);
    } catch (error) {
      console.error("Error sending reminder:", error);
      await notification.retryDelivery().catch(() => {});
    }
  }

  /**
   * Create overdue notification for a follow-up
   */
  async createOverdueNotification(followUp) {
    try {
      const assignedTo = followUp.assignedTo;
      if (!assignedTo) return;

      const daysOverdue = Math.floor(
        (Date.now() - new Date(followUp.followUpDate)) / (1000 * 60 * 60 * 24)
      );

      const notification = new Notification({
        followUpId: followUp._id,
        userId: assignedTo,
        notificationType: "overdue",
        title: `⚠️ Overdue Follow-Up`,
        message: `Follow-up is ${daysOverdue} day(s) overdue - Action needed`,
        description: `This follow-up was scheduled for ${new Date(
          followUp.followUpDate
        ).toLocaleDateString()}`,
        action: {
          label: "Complete Now",
          url: `/followups/${followUp._id}`,
          followUpId: followUp._id,
        },
        relatedType: followUp.relatedType,
        relatedId: followUp.relatedId,
        customerName: followUp.customerName || "Customer",
        priority: "critical",
        category: "alert",
        soundAlert: true,
        followUpDetails: {
          date: followUp.followUpDate,
          time: followUp.followUpTime,
          status: followUp.status,
          priority: followUp.priority,
        },
      });

      await notification.save();

      // Emit critical notification
      this.io?.to(assignedTo.toString()).emit("critical_notification", {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: "overdue",
        priority: "critical",
      });

      console.log(`⚠️ Overdue notification created for follow-up ${followUp._id}`);
      return notification;
    } catch (error) {
      console.error("Error creating overdue notification:", error);
    }
  }

  /**
   * Create "due today" notification
   */
  async createDueTodayNotification(followUp) {
    try {
      const assignedTo = followUp.assignedTo;
      if (!assignedTo) return;

      // Check if notification already exists
      const existingNotification = await Notification.findOne({
        followUpId: followUp._id,
        notificationType: "due_today",
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (existingNotification) return;

      const notification = new Notification({
        followUpId: followUp._id,
        userId: assignedTo,
        notificationType: "due_today",
        title: `📅 Follow-Up Due Today`,
        message: `Follow-up due at ${followUp.followUpTime} with ${followUp.customerName}`,
        action: {
          label: "View",
          url: `/followups/${followUp._id}`,
          followUpId: followUp._id,
        },
        relatedType: followUp.relatedType,
        relatedId: followUp.relatedId,
        customerName: followUp.customerName || "Customer",
        priority: "high",
        category: "reminder",
        soundAlert: true,
        followUpDetails: {
          date: followUp.followUpDate,
          time: followUp.followUpTime,
          status: followUp.status,
          priority: followUp.priority,
        },
      });

      await notification.save();

      this.io?.to(assignedTo.toString()).emit("reminder_notification", {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: "due_today",
        priority: "high",
      });

      return notification;
    } catch (error) {
      console.error("Error creating due today notification:", error);
    }
  }

  /**
   * Check for due today follow-ups (runs at specified time)
   */
  scheduleDueTodayCheck() {
    // Run at 8 AM daily
    cron.schedule("0 8 * * *", async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayFollowUps = await FollowUp.find({
          followUpDate: {
            $gte: today,
            $lt: tomorrow,
          },
          status: { $ne: "Completed" },
          assignedTo: { $exists: true },
        });

        for (const followUp of todayFollowUps) {
          await this.createDueTodayNotification(followUp);
        }

        console.log(`📅 Checked ${todayFollowUps.length} follow-ups for today`);
      } catch (error) {
        console.error("Error in due today check:", error);
      }
    });
  }

  /**
   * Send browser notification (via Socket.IO)
   */
  async sendBrowserNotification(userId, notification) {
    try {
      this.io?.to(userId.toString()).emit("browser_notification", {
        title: notification.title,
        message: notification.message,
        icon: notification.icon || "/notification-icon.png",
        badge: notification.badge,
        tag: notification._id.toString(),
        requireInteraction: notification.priority === "critical",
      });

      // Update delivery method
      notification.deliveryMethods.browser.sent = true;
      notification.deliveryMethods.browser.sentAt = new Date();
      await notification.save();
    } catch (error) {
      console.error("Error sending browser notification:", error);
    }
  }

  /**
   * Cleanup old notifications
   */
  async cleanupOldNotifications() {
    try {
      const result = await Notification.cleanupOldNotifications(30);
      console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
    }
  }

  /**
   * Shutdown reminder service (cleanup cron jobs)
   */
  shutdown() {
    console.log("🛑 Shutting down reminder service...");
    if (this.mainCronJob) this.mainCronJob.stop();
    if (this.overdueCronJob) this.overdueCronJob.stop();
    if (this.cleanupCronJob) this.cleanupCronJob.stop();
    this.cronJobs.forEach((job) => job.stop());
    console.log("✅ Reminder service shutdown complete");
  }
}

export default ReminderService;
