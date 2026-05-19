import express from "express";
import FollowUpActivity from "../models/FollowUpActivity.js";
import FollowUp from "../models/FollowUpEnhanced.js";

/**
 * Follow-Up Activity Timeline Routes
 * Handles logging, retrieving, and managing follow-up activities
 */

const router = express.Router();

// =========================
// ACTIVITY LOGGING ENDPOINTS
// =========================

/**
 * POST /api/followup-activities/log
 * Log a new activity for a follow-up
 * Required: followUpId, activityType, performedBy, title
 */
router.post("/log", async (req, res) => {
  try {
    const {
      followUpId,
      activityType,
      category,
      performedBy,
      title,
      description,
      callActivity,
      meetingActivity,
      emailActivity,
      whatsappActivity,
      noteActivity,
      statusChangeActivity,
      attachmentActivity,
      sentiment,
      impact,
      visibility,
      tags,
      metadata,
    } = req.body;

    // Validate required fields
    if (!followUpId || !activityType || !performedBy) {
      return res.status(400).json({
        success: false,
        message: "followUpId, activityType, and performedBy are required",
      });
    }

    // Get follow-up details
    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    // Create activity
    const activity = new FollowUpActivity({
      followUpId,
      relatedType: followUp.relatedType,
      relatedId: followUp.relatedId,
      activityType,
      category: category || "system",
      performedBy,
      title: title || activityType.replace(/_/g, " "),
      description,
      callActivity,
      meetingActivity,
      emailActivity,
      whatsappActivity,
      noteActivity,
      statusChangeActivity,
      attachmentActivity,
      sentiment,
      impact,
      visibility: visibility || "internal",
      tags,
      metadata,
    });

    await activity.save();

    // Populate references
    await activity.populate("performedBy", "name email avatar");
    await activity.populate("relatedUsers", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: activity,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    res.status(500).json({
      success: false,
      message: "Error logging activity",
      error: error.message,
    });
  }
});

/**
 * POST /api/followup-activities/:followUpId/call
 * Log a call activity
 */
router.post("/:followUpId/call", async (req, res) => {
  try {
    const { followUpId } = req.params;
    const { duration, outcome, callType, participants, notes, sentiment, performedBy } = req.body;

    if (!duration || !outcome || !performedBy) {
      return res.status(400).json({
        success: false,
        message: "duration, outcome, and performedBy are required",
      });
    }

    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    const activity = new FollowUpActivity({
      followUpId,
      relatedType: followUp.relatedType,
      relatedId: followUp.relatedId,
      activityType: "call_made",
      category: "communication",
      performedBy,
      title: `Call - ${outcome}`,
      description: `Call made with duration ${Math.round(duration / 60)} minutes`,
      callActivity: {
        duration,
        outcome,
        callType: callType || "outbound",
        participants,
        notes,
        sentiment,
      },
      sentiment,
      metadata: { duration, outcome },
    });

    await activity.save();
    await activity.populate("performedBy", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Call activity logged",
      data: activity,
    });
  } catch (error) {
    console.error("Error logging call:", error);
    res.status(500).json({
      success: false,
      message: "Error logging call",
      error: error.message,
    });
  }
});

/**
 * POST /api/followup-activities/:followUpId/meeting
 * Log a meeting activity
 */
router.post("/:followUpId/meeting", async (req, res) => {
  try {
    const { followUpId } = req.params;
    const {
      meetingType,
      duration,
      attendees,
      location,
      meetingLink,
      agenda,
      summary,
      outcomes,
      nextSteps,
      performedBy,
    } = req.body;

    if (!meetingType || !performedBy) {
      return res.status(400).json({
        success: false,
        message: "meetingType and performedBy are required",
      });
    }

    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    const activity = new FollowUpActivity({
      followUpId,
      relatedType: followUp.relatedType,
      relatedId: followUp.relatedId,
      activityType: "meeting_scheduled",
      category: "communication",
      performedBy,
      title: `Meeting - ${meetingType}`,
      description: summary || "Meeting held",
      meetingActivity: {
        meetingType,
        duration,
        attendees,
        location,
        meetingLink,
        agenda,
        summary,
        outcomes,
        nextSteps,
      },
      metadata: { duration, attendeeCount: attendees?.length || 0 },
    });

    await activity.save();
    await activity.populate("performedBy", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Meeting activity logged",
      data: activity,
    });
  } catch (error) {
    console.error("Error logging meeting:", error);
    res.status(500).json({
      success: false,
      message: "Error logging meeting",
      error: error.message,
    });
  }
});

/**
 * POST /api/followup-activities/:followUpId/email
 * Log an email activity
 */
router.post("/:followUpId/email", async (req, res) => {
  try {
    const { followUpId } = req.params;
    const { subject, recipients, emailBody, direction, attachments, performedBy, status } =
      req.body;

    if (!subject || !direction || !performedBy) {
      return res.status(400).json({
        success: false,
        message: "subject, direction, and performedBy are required",
      });
    }

    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    const activity = new FollowUpActivity({
      followUpId,
      relatedType: followUp.relatedType,
      relatedId: followUp.relatedId,
      activityType: "email_sent",
      category: "communication",
      performedBy,
      title: `Email - ${subject}`,
      description: `Email ${direction} - ${recipients?.length || 0} recipient(s)`,
      emailActivity: {
        subject,
        recipients,
        emailBody,
        direction,
        attachments,
        status: status || "sent",
      },
      metadata: { recipientCount: recipients?.length || 0, subject },
    });

    await activity.save();
    await activity.populate("performedBy", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Email activity logged",
      data: activity,
    });
  } catch (error) {
    console.error("Error logging email:", error);
    res.status(500).json({
      success: false,
      message: "Error logging email",
      error: error.message,
    });
  }
});

/**
 * POST /api/followup-activities/:followUpId/whatsapp
 * Log a WhatsApp activity
 */
router.post("/:followUpId/whatsapp", async (req, res) => {
  try {
    const { followUpId } = req.params;
    const {
      messageType,
      messageBody,
      recipientPhone,
      recipientName,
      direction,
      mediaUrl,
      mediaCaption,
      performedBy,
      messageStatus,
    } = req.body;

    if (!messageType || !direction || !performedBy) {
      return res.status(400).json({
        success: false,
        message: "messageType, direction, and performedBy are required",
      });
    }

    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    const activity = new FollowUpActivity({
      followUpId,
      relatedType: followUp.relatedType,
      relatedId: followUp.relatedId,
      activityType: "whatsapp_sent",
      category: "communication",
      performedBy,
      title: `WhatsApp - ${messageType}`,
      description: messageBody ? messageBody.substring(0, 100) : "Message sent",
      whatsappActivity: {
        messageType,
        messageBody,
        recipientPhone,
        recipientName,
        direction,
        mediaUrl,
        mediaCaption,
        messageStatus: messageStatus || "sent",
      },
      metadata: { recipientPhone, messageType },
    });

    await activity.save();
    await activity.populate("performedBy", "name email avatar");

    res.status(201).json({
      success: true,
      message: "WhatsApp activity logged",
      data: activity,
    });
  } catch (error) {
    console.error("Error logging WhatsApp:", error);
    res.status(500).json({
      success: false,
      message: "Error logging WhatsApp activity",
      error: error.message,
    });
  }
});

/**
 * POST /api/followup-activities/:followUpId/note
 * Log a note activity
 */
router.post("/:followUpId/note", async (req, res) => {
  try {
    const { followUpId } = req.params;
    const { content, noteType, mentions, tags, attachments, performedBy, visibility } = req.body;

    if (!content || !performedBy) {
      return res.status(400).json({
        success: false,
        message: "content and performedBy are required",
      });
    }

    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    const activity = new FollowUpActivity({
      followUpId,
      relatedType: followUp.relatedType,
      relatedId: followUp.relatedId,
      activityType: "note_added",
      category: "note",
      performedBy,
      title: "Note added",
      description: content.substring(0, 100),
      noteActivity: {
        content,
        noteType: noteType || "internal",
        mentions,
        tags,
        attachments,
      },
      visibility: visibility || "internal",
      tags,
      relatedUsers: mentions,
    });

    await activity.save();
    await activity.populate("performedBy", "name email avatar");
    await activity.populate("relatedUsers", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Note activity logged",
      data: activity,
    });
  } catch (error) {
    console.error("Error logging note:", error);
    res.status(500).json({
      success: false,
      message: "Error logging note",
      error: error.message,
    });
  }
});

/**
 * POST /api/followup-activities/:followUpId/status-change
 * Log a status change activity
 */
router.post("/:followUpId/status-change", async (req, res) => {
  try {
    const { followUpId } = req.params;
    const { previousStatus, newStatus, reason, changeReason, performedBy } = req.body;

    if (!previousStatus || !newStatus || !performedBy) {
      return res.status(400).json({
        success: false,
        message: "previousStatus, newStatus, and performedBy are required",
      });
    }

    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    const activity = new FollowUpActivity({
      followUpId,
      relatedType: followUp.relatedType,
      relatedId: followUp.relatedId,
      activityType: "status_changed",
      category: "status",
      performedBy,
      title: `Status changed from ${previousStatus} to ${newStatus}`,
      description: reason || `Status updated to ${newStatus}`,
      statusChangeActivity: {
        previousStatus,
        newStatus,
        reason,
        changeReason,
      },
      impact: "high",
    });

    await activity.save();
    await activity.populate("performedBy", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Status change activity logged",
      data: activity,
    });
  } catch (error) {
    console.error("Error logging status change:", error);
    res.status(500).json({
      success: false,
      message: "Error logging status change",
      error: error.message,
    });
  }
});

// =========================
// TIMELINE RETRIEVAL ENDPOINTS
// =========================

/**
 * GET /api/followup-activities/:followUpId/timeline
 * Get complete timeline for a specific follow-up
 * Query params: limit, skip, startDate, endDate
 */
router.get("/:followUpId/timeline", async (req, res) => {
  try {
    const { followUpId } = req.params;
    const { limit = 100, skip = 0, startDate, endDate } = req.query;

    const activities = await FollowUpActivity.getFollowUpTimeline(followUpId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      startDate,
      endDate,
    });

    const total = await FollowUpActivity.countDocuments({ followUpId });

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error retrieving timeline:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving timeline",
      error: error.message,
    });
  }
});

/**
 * GET /api/followup-activities/:followUpId/grouped
 * Get timeline grouped by date
 */
router.get("/:followUpId/grouped", async (req, res) => {
  try {
    const { followUpId } = req.params;

    const activities = await FollowUpActivity.findOne({ followUpId })
      .find({ followUpId })
      .populate("performedBy", "name email avatar")
      .sort({ timestamp: -1 });

    // Group activities by date
    const grouped = {};
    activities.forEach((activity) => {
      const dateKey = activity.formattedDate;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });

    res.json({
      success: true,
      data: grouped,
      total: activities.length,
    });
  } catch (error) {
    console.error("Error retrieving grouped timeline:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving grouped timeline",
      error: error.message,
    });
  }
});

/**
 * GET /api/followup-activities/:followUpId/category/:category
 * Get timeline activities by specific category
 */
router.get("/:followUpId/category/:category", async (req, res) => {
  try {
    const { followUpId, category } = req.params;
    const { limit = 50 } = req.query;

    const activities = await FollowUpActivity.getByCategory(
      followUpId,
      category,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: activities,
      category,
      total: activities.length,
    });
  } catch (error) {
    console.error("Error retrieving category activities:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving activities",
      error: error.message,
    });
  }
});

/**
 * GET /api/followup-activities/:followUpId/summary
 * Get activity summary for a follow-up (counts by type)
 */
router.get("/:followUpId/summary", async (req, res) => {
  try {
    const { followUpId } = req.params;

    const summary = await FollowUpActivity.getActivitySummary(followUpId);
    const total = summary.reduce((sum, item) => sum + item.count, 0);

    res.json({
      success: true,
      data: summary,
      total,
    });
  } catch (error) {
    console.error("Error retrieving activity summary:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving summary",
      error: error.message,
    });
  }
});

/**
 * GET /api/followup-activities/:followUpId/stats
 * Get detailed activity statistics
 */
router.get("/:followUpId/stats", async (req, res) => {
  try {
    const { followUpId } = req.params;
    const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } =
      req.query;

    const stats = await FollowUpActivity.getActivityStats(followUpId, startDate, endDate);

    // Calculate summary
    const totalActivities = stats.reduce((sum, item) => sum + item.count, 0);
    const categoryCounts = {};
    stats.forEach((item) => {
      const cat = item._id.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + item.count;
    });

    res.json({
      success: true,
      data: {
        timeline: stats,
        summary: {
          total: totalActivities,
          byCategory: categoryCounts,
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving activity stats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving statistics",
      error: error.message,
    });
  }
});

/**
 * GET /api/followup-activities/entity/:relatedType/:relatedId
 * Get all activities for an entity (Lead, Customer, etc.)
 */
router.get("/entity/:relatedType/:relatedId", async (req, res) => {
  try {
    const { relatedType, relatedId } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const activities = await FollowUpActivity.getEntityTimeline(relatedType, relatedId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await FollowUpActivity.countDocuments({
      relatedType,
      relatedId,
    });

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error("Error retrieving entity timeline:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving entity timeline",
      error: error.message,
    });
  }
});

/**
 * GET /api/followup-activities/recent
 * Get recent activities across all follow-ups
 */
router.get("/", async (req, res) => {
  try {
    const { limit = 50, hours = 24 } = req.query;

    const activities = await FollowUpActivity.getRecentActivities({
      limit: parseInt(limit),
      hours: parseInt(hours),
    });

    res.json({
      success: true,
      data: activities,
      total: activities.length,
    });
  } catch (error) {
    console.error("Error retrieving recent activities:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving recent activities",
      error: error.message,
    });
  }
});

// =========================
// ACTIVITY MANAGEMENT ENDPOINTS
// =========================

/**
 * GET /api/followup-activities/:activityId
 * Get a specific activity
 */
router.get("/:activityId", async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await FollowUpActivity.findById(activityId).populate(
      "performedBy relatedUsers",
      "name email avatar"
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Error retrieving activity:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving activity",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/followup-activities/:activityId
 * Update an activity
 */
router.patch("/:activityId", async (req, res) => {
  try {
    const { activityId } = req.params;
    const { visibility, tags, metadata, editedBy } = req.body;

    const activity = await FollowUpActivity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (visibility) {
      activity.visibility = visibility;
    }
    if (tags) {
      activity.tags = tags;
    }
    if (metadata) {
      activity.metadata = { ...activity.metadata, ...metadata };
    }

    await activity.save();
    await activity.populate("performedBy relatedUsers", "name email avatar");

    res.json({
      success: true,
      message: "Activity updated",
      data: activity,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({
      success: false,
      message: "Error updating activity",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/followup-activities/:activityId
 * Delete an activity
 */
router.delete("/:activityId", async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await FollowUpActivity.findByIdAndDelete(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.json({
      success: true,
      message: "Activity deleted successfully",
      data: activity,
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting activity",
      error: error.message,
    });
  }
});

export default router;
