import cron from "node-cron";
import FollowUpEnhanced from "../models/FollowUpEnhanced.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { emitNotificationToUser } from "../socket/socketHandler.js";
import logger from "../utils/logger.js";

let overdueJobInstance = null;

/**
 * Overdue Follow-Up Management Service
 * Automatically detects, marks, and notifies users about overdue follow-ups
 */

export const overdueFollowUpService = {
  /**
   * Initialize overdue detection cron job
   * Runs every minute to detect missed follow-ups
   */
  initializeOverdueDetection: (io) => {
    if (overdueJobInstance) {
      logger.warn("⚠️  Overdue detection already initialized");
      return;
    }

    // Run every minute
    overdueJobInstance = cron.schedule("* * * * *", async () => {
      try {
        await overdueFollowUpService.detectAndMarkOverdue(io);
      } catch (error) {
        logger.error("❌ Error in overdue detection cron job:", error);
      }
    });

    logger.info("✅ Overdue follow-up detection initialized");
  },

  /**
   * Stop overdue detection
   */
  stopOverdueDetection: () => {
    if (overdueJobInstance) {
      overdueJobInstance.stop();
      overdueJobInstance = null;
      logger.info("🛑 Overdue detection stopped");
    }
  },

  /**
   * Main function: Detect and mark overdue follow-ups
   */
  detectAndMarkOverdue: async (io) => {
    try {
      const now = new Date();

      // Find all pending follow-ups past their due date
      const overdueFollowUps = await FollowUpEnhanced.find({
        dueDate: { $lt: now }, // Past due date
        status: { $in: ["pending", "in_progress"] }, // Not completed
        isOverdue: false, // Not already marked as overdue
      })
        .populate("assignedToId", "email name")
        .populate("customerId", "name email");

      if (overdueFollowUps.length === 0) {
        return; // No overdue follow-ups
      }

      logger.info(`🚨 Found ${overdueFollowUps.length} overdue follow-ups`);

      // Process each overdue follow-up
      for (const followUp of overdueFollowUps) {
        await overdueFollowUpService.processOverdueFollowUp(
          followUp,
          io
        );
      }
    } catch (error) {
      logger.error("❌ Error detecting overdue follow-ups:", error);
    }
  },

  /**
   * Process individual overdue follow-up
   */
  processOverdueFollowUp: async (followUp, io) => {
    try {
      const now = new Date();
      const daysOverdue = Math.floor(
        (now - new Date(followUp.dueDate)) / (1000 * 60 * 60 * 24)
      );

      // Calculate overdue severity
      let priority = "medium";
      if (daysOverdue >= 7) {
        priority = "critical"; // 7+ days overdue
      } else if (daysOverdue >= 3) {
        priority = "high"; // 3-7 days overdue
      }

      // Update follow-up with overdue status
      followUp.isOverdue = true;
      followUp.overdueStatus = {
        markedAt: now,
        daysOverdue,
        priority,
        lastNotified: now,
      };

      await followUp.save();

      // Create overdue notification
      const notification = new Notification({
        userId: followUp.assignedToId,
        followUpId: followUp._id,
        title: `🚨 Overdue: ${followUp.title}`,
        message: `This follow-up is ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} overdue. Due date was ${new Date(followUp.dueDate).toLocaleDateString()}.`,
        notificationType: "overdue_alert",
        priority,
        soundAlert: true,
        soundFile: "overdue_alert.mp3",
        relatedData: {
          customerId: followUp.customerId?._id,
          followUpData: {
            title: followUp.title,
            dueDate: followUp.dueDate,
            status: followUp.status,
            priority: followUp.priority,
          },
        },
        action: {
          label: "View Follow-Up",
          type: "open_follow_up",
          url: `/follow-ups/${followUp._id}`,
        },
      });

      await notification.save();

      // Send notification via Socket.IO
      if (io && followUp.assignedToId) {
        emitNotificationToUser(io, followUp.assignedToId, notification);
      }

      logger.info(
        `✅ Marked follow-up ${followUp._id} as overdue (${daysOverdue} days)`
      );

      // Auto-create next reminder if configured
      if (followUp.autoCreateNextReminder) {
        await overdueFollowUpService.createNextReminder(followUp);
      }
    } catch (error) {
      logger.error(
        `❌ Error processing overdue follow-up ${followUp._id}:`,
        error
      );
    }
  },

  /**
   * Mark follow-up as resolved (no longer overdue)
   */
  markAsResolved: async (followUpId, io) => {
    try {
      const followUp = await FollowUpEnhanced.findByIdAndUpdate(
        followUpId,
        {
          isOverdue: false,
          overdueStatus: {
            markedAt: new Date(),
            daysOverdue: 0,
            priority: "low",
            resolvedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!followUp) {
        throw new Error("Follow-up not found");
      }

      // Create resolution notification
      const notification = new Notification({
        userId: followUp.assignedToId,
        followUpId,
        title: `✅ Resolved: ${followUp.title}`,
        message: "This overdue follow-up has been marked as resolved.",
        notificationType: "follow_up_update",
        priority: "low",
        status: "delivered",
      });

      await notification.save();

      if (io) {
        emitNotificationToUser(io, followUp.assignedToId, notification);
      }

      logger.info(`✅ Follow-up ${followUpId} marked as resolved`);
      return followUp;
    } catch (error) {
      logger.error(`❌ Error marking follow-up as resolved:`, error);
      throw error;
    }
  },

  /**
   * Get overdue statistics for dashboard
   */
  getOverdueStats: async (userId = null) => {
    try {
      const query = {
        isOverdue: true,
        status: { $in: ["pending", "in_progress"] },
      };

      if (userId) {
        query.assignedToId = userId;
      }

      const [
        totalOverdue,
        criticalOverdue,
        highPriorityOverdue,
        overdueByDays,
      ] = await Promise.all([
        FollowUpEnhanced.countDocuments(query),
        FollowUpEnhanced.countDocuments({
          ...query,
          "overdueStatus.priority": "critical",
        }),
        FollowUpEnhanced.countDocuments({
          ...query,
          "overdueStatus.priority": "high",
        }),
        FollowUpEnhanced.aggregate([
          { $match: query },
          {
            $group: {
              _id: "$overdueStatus.daysOverdue",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      return {
        totalOverdue,
        criticalOverdue,
        highPriorityOverdue,
        mediumOverdue: totalOverdue - criticalOverdue - highPriorityOverdue,
        byDaysOverdue: overdueByDays.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error("❌ Error getting overdue statistics:", error);
      throw error;
    }
  },

  /**
   * Get overdue follow-ups with pagination
   */
  getOverdueFollowUps: async (filters = {}) => {
    try {
      const {
        userId = null,
        limit = 20,
        skip = 0,
        sortBy = "dueDate",
        sortOrder = 1,
      } = filters;

      const query = {
        isOverdue: true,
        status: { $in: ["pending", "in_progress"] },
      };

      if (userId) {
        query.assignedToId = userId;
      }

      const [overdueFollowUps, total] = await Promise.all([
        FollowUpEnhanced.find(query)
          .sort({ [sortBy]: sortOrder })
          .limit(limit)
          .skip(skip)
          .populate("assignedToId", "name email")
          .populate("customerId", "name email")
          .lean(),
        FollowUpEnhanced.countDocuments(query),
      ]);

      return {
        data: overdueFollowUps,
        pagination: {
          total,
          limit,
          skip,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("❌ Error getting overdue follow-ups:", error);
      throw error;
    }
  },

  /**
   * Bulk update overdue follow-ups
   */
  bulkUpdateOverdueStatus: async (followUpIds, action) => {
    try {
      let updateData = {};

      switch (action) {
        case "resolve":
          updateData = {
            isOverdue: false,
            "overdueStatus.resolvedAt": new Date(),
          };
          break;
        case "escalate":
          updateData = {
            "overdueStatus.priority": "critical",
            "overdueStatus.escalatedAt": new Date(),
          };
          break;
        case "snooze":
          updateData = {
            "overdueStatus.snoozedUntil": new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ), // 24 hours
          };
          break;
        default:
          throw new Error("Invalid action");
      }

      const result = await FollowUpEnhanced.updateMany(
        { _id: { $in: followUpIds } },
        updateData
      );

      logger.info(`✅ Bulk updated ${result.modifiedCount} overdue follow-ups`);
      return result;
    } catch (error) {
      logger.error("❌ Error bulk updating overdue follow-ups:", error);
      throw error;
    }
  },

  /**
   * Create next follow-up automatically
   */
  createNextReminder: async (previousFollowUp) => {
    try {
      const nextDate = new Date(previousFollowUp.dueDate);
      nextDate.setDate(nextDate.getDate() + 7); // Add 7 days

      const newFollowUp = new FollowUpEnhanced({
        customerId: previousFollowUp.customerId,
        assignedToId: previousFollowUp.assignedToId,
        title: `Follow-up: ${previousFollowUp.title} (Rescheduled)`,
        dueDate: nextDate,
        priority: previousFollowUp.priority,
        status: "pending",
        notes: `Auto-created reminder from overdue follow-up: ${previousFollowUp._id}\n\nOriginal notes:\n${previousFollowUp.notes}`,
        linkedFollowUpId: previousFollowUp._id,
        autoCreateNextReminder: previousFollowUp.autoCreateNextReminder,
      });

      await newFollowUp.save();

      logger.info(
        `✅ Auto-created next reminder: ${newFollowUp._id}`
      );

      return newFollowUp;
    } catch (error) {
      logger.error("❌ Error creating next reminder:", error);
      throw error;
    }
  },

  /**
   * Get overdue summary for dashboard
   */
  getDashboardSummary: async (userId = null) => {
    try {
      const stats = await overdueFollowUpService.getOverdueStats(userId);
      const overdueList = await overdueFollowUpService.getOverdueFollowUps({
        userId,
        limit: 5,
      });

      return {
        stats,
        recentOverdue: overdueList.data,
        alertLevel:
          stats.criticalOverdue > 0
            ? "critical"
            : stats.highPriorityOverdue > 0
            ? "high"
            : stats.totalOverdue > 0
            ? "medium"
            : "clear",
      };
    } catch (error) {
      logger.error("❌ Error getting dashboard summary:", error);
      throw error;
    }
  },
};

export default overdueFollowUpService;
