// server/services/dashboardAnalyticsService.js
import FollowUpEnhanced from "../models/FollowUpEnhanced.js";
import Notification from "../models/Notification.js";

/**
 * Dashboard Analytics Service
 * Aggregation queries for follow-up analytics and insights
 */

// ==========================================
// CORE METRICS
// ==========================================

export async function getDashboardMetrics() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalFollowUps,
      pendingCount,
      completedCount,
      overdueCount,
      todaysFollowUps,
      upcomingFollowUps,
      conversionRate,
      avgCompletionTime
    ] = await Promise.all([
      FollowUpEnhanced.countDocuments({}),
      FollowUpEnhanced.countDocuments({ status: "Pending" }),
      FollowUpEnhanced.countDocuments({ status: "Completed" }),
      FollowUpEnhanced.countDocuments({
        status: "Pending",
        followUpDate: { $lt: today },
        isOverdue: true
      }),
      FollowUpEnhanced.countDocuments({
        status: "Pending",
        followUpDate: { $gte: today, $lt: tomorrow }
      }),
      FollowUpEnhanced.countDocuments({
        status: "Pending",
        followUpDate: { $gte: tomorrow }
      }),
      getConversionRate(),
      getAverageCompletionTime()
    ]);

    return {
      metrics: {
        totalFollowUps,
        pending: pendingCount,
        completed: completedCount,
        overdue: overdueCount,
        today: todaysFollowUps,
        upcoming: upcomingFollowUps,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        avgCompletionTime: avgCompletionTime
      },
      timestamp: new Date()
    };
  } catch (error) {
    console.error("❌ Error fetching dashboard metrics:", error);
    throw error;
  }
}

// ==========================================
// CONVERSION RATE
// ==========================================

export async function getConversionRate() {
  try {
    const pipeline = [
      {
        $facet: {
          total: [{ $count: "count" }],
          completed: [
            { $match: { status: "Completed" } },
            { $count: "count" }
          ]
        }
      },
      {
        $project: {
          total: { $arrayElemAt: ["$total.count", 0] },
          completed: { $arrayElemAt: ["$completed.count", 0] }
        }
      },
      {
        $project: {
          conversionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$total"] }, 100] }
            ]
          }
        }
      }
    ];

    const result = await FollowUpEnhanced.aggregate(pipeline);
    return result[0]?.conversionRate || 0;
  } catch (error) {
    console.error("❌ Error calculating conversion rate:", error);
    return 0;
  }
}

// ==========================================
// AVERAGE COMPLETION TIME
// ==========================================

export async function getAverageCompletionTime() {
  try {
    const pipeline = [
      {
        $match: {
          status: "Completed",
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          daysToComplete: {
            $divide: [
              { $subtract: ["$completedAt", "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageDays: { $avg: "$daysToComplete" }
        }
      }
    ];

    const result = await FollowUpEnhanced.aggregate(pipeline);
    return Math.round(result[0]?.averageDays || 0);
  } catch (error) {
    console.error("❌ Error calculating average completion time:", error);
    return 0;
  }
}

// ==========================================
// DAILY ACTIVITY TREND (Last 30 days)
// ==========================================

export async function getDailyActivityTrend() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          overdue: {
            $sum: { $cond: [{ $eq: ["$isOverdue", true] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const result = await FollowUpEnhanced.aggregate(pipeline);
    
    return result.map(item => ({
      date: item._id,
      total: item.total,
      completed: item.completed,
      pending: item.pending,
      overdue: item.overdue
    }));
  } catch (error) {
    console.error("❌ Error fetching daily activity trend:", error);
    return [];
  }
}

// ==========================================
// STATUS DISTRIBUTION
// ==========================================

export async function getStatusDistribution() {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          percentage: { $sum: 1 }
        }
      },
      {
        $facet: {
          items: [{ $project: { status: "$_id", count: 1, _id: 0 } }],
          total: [{ $group: { _id: null, total: { $sum: "$count" } } }]
        }
      },
      {
        $project: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    percentage: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ["$$item.count", { $arrayElemAt: ["$total.total", 0] }] },
                            100
                          ]
                        },
                        2
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ];

    const result = await FollowUpEnhanced.aggregate(pipeline);
    return result[0]?.items || [];
  } catch (error) {
    console.error("❌ Error fetching status distribution:", error);
    return [];
  }
}

// ==========================================
// USER PERFORMANCE
// ==========================================

export async function getUserPerformance() {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          overdue: {
            $sum: { $cond: [{ $eq: ["$isOverdue", true] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          assignedTo: "$_id",
          total: 1,
          completed: 1,
          pending: 1,
          overdue: 1,
          completionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$completed", "$total"] },
                  100
                ]
              },
              2
            ]
          },
          _id: 0
        }
      },
      {
        $sort: { completed: -1 }
      },
      {
        $limit: 10
      }
    ];

    const result = await FollowUpEnhanced.aggregate(pipeline);
    return result;
  } catch (error) {
    console.error("❌ Error fetching user performance:", error);
    return [];
  }
}

// ==========================================
// CONVERSION ANALYTICS (By Type)
// ==========================================

export async function getConversionAnalytics() {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$relatedType",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          type: "$_id",
          total: 1,
          completed: 1,
          conversionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$completed", "$total"] },
                  100
                ]
              },
              2
            ]
          },
          pending: { $subtract: ["$total", "$completed"] },
          _id: 0
        }
      }
    ];

    const result = await FollowUpEnhanced.aggregate(pipeline);
    return result;
  } catch (error) {
    console.error("❌ Error fetching conversion analytics:", error);
    return [];
  }
}

// ==========================================
// UPCOMING PRIORITIES
// ==========================================

export async function getUpcomingPriorities(limit = 10) {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const pipeline = [
      {
        $match: {
          status: "Pending",
          followUpDate: {
            $gte: now,
            $lte: thirtyDaysFromNow
          }
        }
      },
      {
        $sort: { followUpDate: 1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 1,
          title: 1,
          followUpDate: 1,
          relatedType: 1,
          relatedId: 1,
          notes: 1,
          daysUntil: {
            $ceil: [
              {
                $divide: [
                  { $subtract: ["$followUpDate", now] },
                  1000 * 60 * 60 * 24
                ]
              }
            ]
          }
        }
      }
    ];

    const result = await FollowUpEnhanced.aggregate(pipeline);
    return result;
  } catch (error) {
    console.error("❌ Error fetching upcoming priorities:", error);
    return [];
  }
}

// ==========================================
// OVERDUE ANALYSIS
// ==========================================

export async function getOverdueAnalysis() {
  try {
    const now = new Date();

    const pipeline = [
      {
        $match: {
          status: "Pending",
          followUpDate: { $lt: now },
          isOverdue: true
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              {
                $lt: [
                  { $subtract: [now, "$followUpDate"] },
                  1000 * 60 * 60 * 24
                ]
              },
              "today",
              {
                $cond: [
                  {
                    $lt: [
                      { $subtract: [now, "$followUpDate"] },
                      1000 * 60 * 60 * 24 * 7
                    ]
                  },
                  "thisWeek",
                  {
                    $cond: [
                      {
                        $lt: [
                          { $subtract: [now, "$followUpDate"] },
                          1000 * 60 * 60 * 24 * 30
                        ]
                      },
                      "thisMonth",
                      "older"
                    ]
                  }
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const result = await FollowUpEnhanced.aggregate(pipeline);
    
    return {
      today: result.find(r => r._id === "today")?.count || 0,
      thisWeek: result.find(r => r._id === "thisWeek")?.count || 0,
      thisMonth: result.find(r => r._id === "thisMonth")?.count || 0,
      older: result.find(r => r._id === "older")?.count || 0
    };
  } catch (error) {
    console.error("❌ Error fetching overdue analysis:", error);
    return { today: 0, thisWeek: 0, thisMonth: 0, older: 0 };
  }
}

export default {
  getDashboardMetrics,
  getConversionRate,
  getAverageCompletionTime,
  getDailyActivityTrend,
  getStatusDistribution,
  getUserPerformance,
  getConversionAnalytics,
  getUpcomingPriorities,
  getOverdueAnalysis
};
