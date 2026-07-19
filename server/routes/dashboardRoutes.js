// server/routes/dashboardRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import dashboardAnalyticsService from "../services/dashboardAnalyticsService.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// ==========================================
// GET ROUTES
// ==========================================

/**
 * GET /api/dashboard/metrics
 * Get all key metrics for dashboard
 */
router.get("/metrics", async (req, res) => {
  try {
    const metrics = await dashboardAnalyticsService.getDashboardMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error("❌ Error fetching metrics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard metrics"
    });
  }
});

/**
 * GET /api/dashboard/daily-activity
 * Get daily activity trend for last 30 days
 */
router.get("/daily-activity", async (req, res) => {
  try {
    const trend = await dashboardAnalyticsService.getDailyActivityTrend();
    res.json({
      success: true,
      data: trend
    });
  } catch (error) {
    console.error("❌ Error fetching daily activity:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch daily activity"
    });
  }
});

/**
 * GET /api/dashboard/status-distribution
 * Get follow-up status distribution
 */
router.get("/status-distribution", async (req, res) => {
  try {
    const distribution = await dashboardAnalyticsService.getStatusDistribution();
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error("❌ Error fetching status distribution:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch status distribution"
    });
  }
});

/**
 * GET /api/dashboard/user-performance
 * Get user performance metrics
 */
router.get("/user-performance", async (req, res) => {
  try {
    const performance = await dashboardAnalyticsService.getUserPerformance();
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error("❌ Error fetching user performance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user performance"
    });
  }
});

/**
 * GET /api/dashboard/conversion-analytics
 * Get conversion analytics by type
 */
router.get("/conversion-analytics", async (req, res) => {
  try {
    const analytics = await dashboardAnalyticsService.getConversionAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("❌ Error fetching conversion analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversion analytics"
    });
  }
});

/**
 * GET /api/dashboard/upcoming-priorities
 * Get upcoming follow-ups
 */
router.get("/upcoming-priorities", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const priorities = await dashboardAnalyticsService.getUpcomingPriorities(
      parseInt(limit)
    );
    res.json({
      success: true,
      data: priorities
    });
  } catch (error) {
    console.error("❌ Error fetching upcoming priorities:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch upcoming priorities"
    });
  }
});

/**
 * GET /api/dashboard/overdue-analysis
 * Get overdue follow-ups analysis
 */
router.get("/overdue-analysis", async (req, res) => {
  try {
    const analysis = await dashboardAnalyticsService.getOverdueAnalysis();
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error("❌ Error fetching overdue analysis:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch overdue analysis"
    });
  }
});

/**
 * GET /api/dashboard/complete-analytics
 * Get all analytics data at once (useful for dashboard load)
 */
router.get("/complete-analytics", async (req, res) => {
  try {
    const [
      metrics,
      dailyActivity,
      statusDistribution,
      userPerformance,
      conversionAnalytics,
      upcomingPriorities,
      overdueAnalysis
    ] = await Promise.all([
      dashboardAnalyticsService.getDashboardMetrics(),
      dashboardAnalyticsService.getDailyActivityTrend(),
      dashboardAnalyticsService.getStatusDistribution(),
      dashboardAnalyticsService.getUserPerformance(),
      dashboardAnalyticsService.getConversionAnalytics(),
      dashboardAnalyticsService.getUpcomingPriorities(10),
      dashboardAnalyticsService.getOverdueAnalysis()
    ]);

    res.json({
      success: true,
      data: {
        metrics: metrics.metrics,
        dailyActivity,
        statusDistribution,
        userPerformance,
        conversionAnalytics,
        upcomingPriorities,
        overdueAnalysis
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error("❌ Error fetching complete analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch complete analytics"
    });
  }
});

export default router;
