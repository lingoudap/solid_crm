import express from "express";
import overdueFollowUpService from "../services/overdueFollowUpService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// ==========================================
// GET ROUTES
// ==========================================

/**
 * GET /api/overdue
 * Get all overdue follow-ups for current user
 */
router.get("/", async (req, res) => {
  try {
    const { limit = 20, skip = 0, sortBy = "dueDate" } = req.query;

    const result = await overdueFollowUpService.getOverdueFollowUps({
      userId: req.user.id,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching overdue follow-ups:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/overdue/stats
 * Get overdue statistics for current user
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await overdueFollowUpService.getOverdueStats(req.user.id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching overdue stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/overdue/dashboard
 * Get dashboard summary for current user
 */
router.get("/dashboard", async (req, res) => {
  try {
    const summary = await overdueFollowUpService.getDashboardSummary(
      req.user.id
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/overdue/count
 * Get total overdue count for current user
 */
router.get("/count", async (req, res) => {
  try {
    const stats = await overdueFollowUpService.getOverdueStats(req.user.id);

    res.json({
      success: true,
      totalOverdue: stats.totalOverdue,
      critical: stats.criticalOverdue,
      high: stats.highPriorityOverdue,
    });
  } catch (error) {
    console.error("Error fetching overdue count:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// POST ROUTES
// ==========================================

/**
 * POST /api/overdue/:followUpId/resolve
 * Mark follow-up as resolved (no longer overdue)
 */
router.post("/:followUpId/resolve", async (req, res) => {
  try {
    const followUp = await overdueFollowUpService.markAsResolved(
      req.params.followUpId
    );

    res.json({
      success: true,
      data: followUp,
      message: "Follow-up marked as resolved",
    });
  } catch (error) {
    console.error("Error resolving overdue follow-up:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// PATCH ROUTES
// ==========================================

/**
 * PATCH /api/overdue/:followUpId
 * Update overdue follow-up status
 */
router.patch("/:followUpId", async (req, res) => {
  try {
    const { action } = req.body; // escalate, snooze, resolve

    if (!action) {
      return res
        .status(400)
        .json({ success: false, error: "Action is required" });
    }

    const result = await overdueFollowUpService.bulkUpdateOverdueStatus(
      [req.params.followUpId],
      action
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Follow-up ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error updating overdue follow-up:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/overdue/bulk
 * Bulk update overdue follow-ups
 */
router.patch("/bulk/action", async (req, res) => {
  try {
    const { followUpIds, action } = req.body;

    if (!followUpIds || !Array.isArray(followUpIds) || !action) {
      return res.status(400).json({
        success: false,
        error: "followUpIds array and action are required",
      });
    }

    const result = await overdueFollowUpService.bulkUpdateOverdueStatus(
      followUpIds,
      action
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} follow-ups ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error bulk updating overdue follow-ups:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
