/**
 * Enhanced Follow-Up Controller Implementation Examples
 * Demonstrates how to use the new FollowUp schema with Express
 */

import express from "express";
import FollowUp from "../models/FollowUpEnhanced.js";
import { validateInput } from "../middleware/validation.js";

const router = express.Router();

// =====================================================
// 1. CREATE FOLLOW-UP
// =====================================================

/**
 * POST /api/followups
 * Create a new follow-up
 * Required: relatedType, relatedId, followUpDate, createdBy
 * Optional: priority, assignedTo, tags, reminderSettings, customFields
 */
router.post("/", validateInput, async (req, res) => {
  try {
    const { relatedType, relatedId, followUpDate, followUpTime, createdBy } = req.body;

    // Validate required fields
    if (!relatedType || !relatedId || !followUpDate || !createdBy) {
      return res.status(400).json({
        error: "Missing required fields: relatedType, relatedId, followUpDate, createdBy",
      });
    }

    // Create follow-up
    const followUp = new FollowUp({
      relatedType,
      relatedId,
      followUpDate,
      followUpTime: followUpTime || "09:00",
      communicationType: req.body.communicationType || "call",
      priority: req.body.priority || "medium",
      assignedTo: req.body.assignedTo,
      createdBy,
      remark: req.body.remark,
      conversationDetails: req.body.conversationDetails,
      tags: req.body.tags || [],
      reminderSettings: req.body.reminderSettings || {
        enabled: true,
        remindBefore: 1,
        reminderType: "notification",
      },
      notes: {
        internal: req.body.internalNotes,
        external: req.body.externalNotes,
      },
      customFields: req.body.customFields || {},
    });

    // Track who created it in activity log
    followUp._performedBy = createdBy;

    await followUp.save();

    // Populate references before returning
    await followUp.populate("assignedTo createdBy");

    res.status(201).json({
      message: "Follow-up created successfully",
      data: followUp,
    });
  } catch (error) {
    console.error("Error creating follow-up:", error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 2. GET ALL FOLLOW-UPS (with filters & pagination)
// =====================================================

/**
 * GET /api/followups
 * Query Parameters:
 *   - status: "Pending", "In Progress", "Completed", "Rescheduled", "Cancelled"
 *   - priority: "low", "medium", "high", "critical"
 *   - assignedTo: userId
 *   - overdue: true/false
 *   - communicationType: "call", "email", "sms", "whatsapp", "in_person", "video_call"
 *   - search: full-text search
 *   - page: page number (default 1)
 *   - limit: items per page (default 20)
 *   - sort: field to sort by
 */
router.get("/", async (req, res) => {
  try {
    const {
      status,
      priority,
      assignedTo,
      overdue,
      communicationType,
      search,
      page = 1,
      limit = 20,
      sort = "-followUpDate",
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (overdue === "true") query.overdue = true;
    if (communicationType) query.communicationType = communicationType;

    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const followUps = await FollowUp.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await FollowUp.countDocuments(query);

    res.json({
      data: followUps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 3. GET OVERDUE FOLLOW-UPS (Dashboard)
// =====================================================

/**
 * GET /api/followups/dashboard/overdue
 * Returns overdue follow-ups grouped by priority
 */
router.get("/dashboard/overdue", async (req, res) => {
  try {
    const overdue = await FollowUp.getOverdueFollowUps({
      status: { $ne: "Completed" },
    });

    // Group by priority
    const grouped = {
      critical: overdue.filter((fu) => fu.priority === "critical"),
      high: overdue.filter((fu) => fu.priority === "high"),
      medium: overdue.filter((fu) => fu.priority === "medium"),
      low: overdue.filter((fu) => fu.priority === "low"),
    };

    res.json({
      total: overdue.length,
      byPriority: {
        critical: grouped.critical.length,
        high: grouped.high.length,
        medium: grouped.medium.length,
        low: grouped.low.length,
      },
      details: grouped,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 4. GET TODAY'S FOLLOW-UPS
// =====================================================

/**
 * GET /api/followups/today
 * Returns follow-ups due today, sorted by time
 */
router.get("/today", async (req, res) => {
  try {
    const todayFollowUps = await FollowUp.getDueTodayFollowUps();

    res.json({
      total: todayFollowUps.length,
      followUps: todayFollowUps,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 5. GET FOLLOW-UPS BY ASSIGNEE
// =====================================================

/**
 * GET /api/followups/user/:userId
 * Get all follow-ups assigned to a specific user
 * Query: status (optional)
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const followUps = await FollowUp.getByAssignee(userId, status || null);

    res.json({
      user: userId,
      total: followUps.length,
      followUps,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 6. GET SINGLE FOLLOW-UP WITH FULL DETAILS
// =====================================================

/**
 * GET /api/followups/:id
 * Returns complete follow-up with populated references
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const followUp = await FollowUp.findById(id);

    if (!followUp) {
      return res.status(404).json({ error: "Follow-up not found" });
    }

    res.json(followUp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 7. UPDATE FOLLOW-UP STATUS
// =====================================================

/**
 * PATCH /api/followups/:id/status
 * Update status with activity logging
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, outcome } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!status || !userId) {
      return res.status(400).json({ error: "Missing status or userId" });
    }

    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      return res.status(404).json({ error: "Follow-up not found" });
    }

    // Track the change
    const previousStatus = followUp.status;

    followUp._performedBy = userId;
    followUp.status = status;
    if (outcome) followUp.outcome = outcome;

    // Add activity log
    followUp.activityLogs.push({
      action: "status_changed",
      performedBy: userId,
      previousValue: previousStatus,
      newValue: status,
      description: `Status changed from ${previousStatus} to ${status}`,
    });

    if (status === "Completed") {
      followUp.completedAt = new Date();
    }

    await followUp.save();

    res.json({
      message: "Status updated successfully",
      data: followUp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 8. RESCHEDULE FOLLOW-UP
// =====================================================

/**
 * PATCH /api/followups/:id/reschedule
 * Reschedule a follow-up with full history tracking
 */
router.patch("/:id/reschedule", async (req, res) => {
  try {
    const { id } = req.params;
    const { followUpDate, followUpTime, reason, userId } = req.body;

    if (!followUpDate || !followUpTime || !reason || !userId) {
      return res.status(400).json({
        error: "Missing required fields: followUpDate, followUpTime, reason, userId",
      });
    }

    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      return res.status(404).json({ error: "Follow-up not found" });
    }

    await followUp.reschedule(new Date(followUpDate), followUpTime, reason, userId);

    res.json({
      message: "Follow-up rescheduled successfully",
      data: followUp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 9. COMPLETE FOLLOW-UP
// =====================================================

/**
 * PATCH /api/followups/:id/complete
 * Mark follow-up as completed with outcome
 */
router.patch("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome = "neutral", userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      return res.status(404).json({ error: "Follow-up not found" });
    }

    await followUp.complete(userId, outcome);

    res.json({
      message: "Follow-up completed successfully",
      data: followUp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 10. ADD COMMENT/NOTE
// =====================================================

/**
 * POST /api/followups/:id/comments
 * Add a comment to a follow-up
 */
router.post("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, userId } = req.body;

    if (!text || !userId) {
      return res.status(400).json({ error: "Missing text or userId" });
    }

    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      return res.status(404).json({ error: "Follow-up not found" });
    }

    await followUp.addComment(text, userId);

    res.json({
      message: "Comment added successfully",
      data: followUp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 11. ADD ATTACHMENT
// =====================================================

/**
 * POST /api/followups/:id/attachments
 * Add an attachment to a follow-up
 */
router.post("/:id/attachments", async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName, fileUrl, fileType, userId, description } = req.body;

    if (!fileName || !fileUrl || !userId) {
      return res.status(400).json({
        error: "Missing required fields: fileName, fileUrl, userId",
      });
    }

    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      return res.status(404).json({ error: "Follow-up not found" });
    }

    await followUp.addAttachment(fileName, fileUrl, fileType, userId, description);

    res.json({
      message: "Attachment added successfully",
      data: followUp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 12. ANALYTICS & REPORTING
// =====================================================

/**
 * GET /api/followups/analytics/overview
 * Get comprehensive analytics dashboard
 */
router.get("/analytics/overview", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get analytics by status
    const byStatus = await FollowUp.getAnalytics(start, end, "status");

    // Get analytics by outcome (for completed)
    const completed = await FollowUp.find({
      status: "Completed",
      createdAt: { $gte: start, $lte: end },
    });

    const byOutcome = {};
    completed.forEach((fu) => {
      byOutcome[fu.outcome] = (byOutcome[fu.outcome] || 0) + 1;
    });

    // Get top performers
    const topPerformers = await FollowUp.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $sort: { completed: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      period: { start, end },
      byStatus,
      byOutcome,
      topPerformers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 13. BULK OPERATIONS
// =====================================================

/**
 * PATCH /api/followups/bulk/assign
 * Assign multiple follow-ups to a user
 */
router.patch("/bulk/assign", async (req, res) => {
  try {
    const { ids, assignedTo, userId } = req.body;

    if (!ids || !assignedTo || !userId) {
      return res.status(400).json({
        error: "Missing required fields: ids, assignedTo, userId",
      });
    }

    const result = await FollowUp.updateMany(
      { _id: { $in: ids } },
      {
        assignedTo,
        $push: {
          activityLogs: {
            action: "assigned",
            performedBy: userId,
            description: `Assigned to ${assignedTo}`,
          },
        },
      }
    );

    res.json({
      message: "Follow-ups assigned successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/followups/bulk/priority
 * Update priority for multiple follow-ups
 */
router.patch("/bulk/priority", async (req, res) => {
  try {
    const { ids, priority, userId } = req.body;

    if (!ids || !priority || !userId) {
      return res.status(400).json({
        error: "Missing required fields: ids, priority, userId",
      });
    }

    const result = await FollowUp.updateMany(
      { _id: { $in: ids } },
      {
        priority,
        $push: {
          activityLogs: {
            action: "updated",
            performedBy: userId,
            description: `Priority changed to ${priority}`,
          },
        },
      }
    );

    res.json({
      message: "Priorities updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 14. DELETE FOLLOW-UP (Soft Delete)
// =====================================================

/**
 * DELETE /api/followups/:id
 * Soft delete a follow-up
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const followUp = await FollowUp.findByIdAndUpdate(
      id,
      {
        status: "Cancelled",
        $push: {
          activityLogs: {
            action: "updated",
            performedBy: userId,
            description: `Follow-up cancelled${reason ? ": " + reason : ""}`,
          },
        },
      },
      { new: true }
    );

    if (!followUp) {
      return res.status(404).json({ error: "Follow-up not found" });
    }

    res.json({
      message: "Follow-up deleted successfully",
      data: followUp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

/**
 * Usage Example in Express App:
 *
 * import followUpRoutes from './routes/followUpsEnhanced.js';
 * app.use('/api/followups', followUpRoutes);
 *
 * All routes are now available:
 * - POST   /api/followups
 * - GET    /api/followups
 * - GET    /api/followups/dashboard/overdue
 * - GET    /api/followups/today
 * - GET    /api/followups/user/:userId
 * - GET    /api/followups/:id
 * - PATCH  /api/followups/:id/status
 * - PATCH  /api/followups/:id/reschedule
 * - PATCH  /api/followups/:id/complete
 * - POST   /api/followups/:id/comments
 * - POST   /api/followups/:id/attachments
 * - GET    /api/followups/analytics/overview
 * - PATCH  /api/followups/bulk/assign
 * - PATCH  /api/followups/bulk/priority
 * - DELETE /api/followups/:id
 */
