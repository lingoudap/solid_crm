import mongoose from "mongoose";

/**
 * Follow-Up Activity Timeline Schema for Professional CRM System
 * Tracks all activities related to a follow-up: calls, meetings, messages, notes, etc.
 * Designed for comprehensive audit trail and timeline visualization
 */

// Sub-schema for call activity
const callActivitySchema = new mongoose.Schema(
  {
    duration: {
      type: Number,
      required: true, // in seconds
    },
    outcome: {
      type: String,
      enum: ["answered", "missed", "no_answer", "declined", "voicemail"],
      required: true,
    },
    callType: {
      type: String,
      enum: ["inbound", "outbound", "conference"],
      default: "outbound",
    },
    participants: [
      {
        name: String,
        phone: String,
        email: String,
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    recordingUrl: String,
    notes: String,
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
    },
  },
  { _id: false }
);

// Sub-schema for meeting activity
const meetingActivitySchema = new mongoose.Schema(
  {
    meetingType: {
      type: String,
      enum: ["in_person", "video_call", "phone", "virtual_meeting"],
      required: true,
    },
    duration: Number, // in minutes
    attendees: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        email: String,
        role: String, // e.g., "organizer", "participant"
      },
    ],
    location: String,
    meetingLink: String, // For video calls
    agenda: String,
    summary: String,
    outcomes: [String],
    nextSteps: [String],
    attachmentsFromMeeting: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: Date,
      },
    ],
  },
  { _id: false }
);

// Sub-schema for email activity
const emailActivitySchema = new mongoose.Schema(
  {
    subject: String,
    recipients: [
      {
        email: String,
        name: String,
        type: {
          type: String,
          enum: ["to", "cc", "bcc"],
          default: "to",
        },
      },
    ],
    emailBody: String,
    attachments: [
      {
        fileName: String,
        fileSize: Number,
        fileType: String,
      },
    ],
    direction: {
      type: String,
      enum: ["sent", "received"],
      required: true,
    },
    opened: Boolean,
    openedAt: Date,
    clickedLinks: [
      {
        link: String,
        clickedAt: Date,
        clickCount: Number,
      },
    ],
    status: {
      type: String,
      enum: ["sent", "failed", "bounced", "spam"],
      default: "sent",
    },
  },
  { _id: false }
);

// Sub-schema for WhatsApp activity
const whatsappActivitySchema = new mongoose.Schema(
  {
    messageType: {
      type: String,
      enum: ["text", "image", "document", "audio", "video", "voice_note"],
      required: true,
    },
    messageBody: String,
    recipientPhone: String,
    recipientName: String,
    direction: {
      type: String,
      enum: ["sent", "received"],
      required: true,
    },
    messageStatus: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    readAt: Date,
    mediaUrl: String,
    mediaCaption: String,
    groupChat: Boolean,
    conversationId: String,
    messageThreadId: String,
  },
  { _id: false }
);

// Sub-schema for note activity
const noteActivitySchema = new mongoose.Schema(
  {
    noteType: {
      type: String,
      enum: ["internal", "external", "client_visible"],
      default: "internal",
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [String],
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],
  },
  { _id: false }
);

// Sub-schema for status change activity
const statusChangeActivitySchema = new mongoose.Schema(
  {
    previousStatus: String,
    newStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rescheduled", "Cancelled"],
      required: true,
    },
    reason: String,
    changeReason: {
      type: String,
      enum: ["schedule_change", "user_request", "auto_reschedule", "completion", "cancellation"],
    },
  },
  { _id: false }
);

// Sub-schema for attachment activity
const attachmentActivitySchema = new mongoose.Schema(
  {
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number, // in bytes
    description: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloadedAt: Date,
  },
  { _id: false }
);

// Main Follow-Up Activity Schema
const followUpActivitySchema = new mongoose.Schema(
  {
    // Reference to Follow-Up
    followUpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FollowUp",
      required: true,
      index: true,
    },

    // Reference to related entity (Lead, Customer, Quotation, Order)
    relatedType: {
      type: String,
      enum: ["Lead", "Quotation", "Customer", "Order"],
      required: true,
      index: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Activity Type & Category
    activityType: {
      type: String,
      enum: [
        "follow_up_created",
        "status_changed",
        "note_added",
        "call_made",
        "meeting_scheduled",
        "whatsapp_sent",
        "email_sent",
        "attachment_added",
        "user_assigned",
        "priority_changed",
        "reminder_set",
        "reminder_triggered",
        "follow_up_rescheduled",
        "follow_up_completed",
      ],
      required: true,
      index: true,
    },

    // Activity category for grouping
    category: {
      type: String,
      enum: ["communication", "status", "note", "file", "assignment", "reminder", "system"],
      required: true,
      index: true,
    },

    // User who performed the activity
    performedBy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: String,
      email: String,
      avatar: String,
    },

    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    activityDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Activity-specific data (one will be populated based on activityType)
    callActivity: callActivitySchema,
    meetingActivity: meetingActivitySchema,
    emailActivity: emailActivitySchema,
    whatsappActivity: whatsappActivitySchema,
    noteActivity: noteActivitySchema,
    statusChangeActivity: statusChangeActivitySchema,
    attachmentActivity: attachmentActivitySchema,

    // General activity metadata
    title: {
      type: String,
      required: true,
    },
    description: String,
    icon: String, // emoji or icon identifier
    color: String, // color for timeline visualization

    // Impact & Sentiment
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
    },
    impact: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },

    // Visibility & Access
    visibility: {
      type: String,
      enum: ["internal", "customer_visible"],
      default: "internal",
    },

    // Related users (for mentions, assignments, etc.)
    relatedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Tags for organization
    tags: [String],

    // Activity source
    source: {
      type: String,
      enum: ["manual", "api", "integration", "automation", "webhook"],
      default: "manual",
    },

    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Is this activity a system action?
    isSystemAction: {
      type: Boolean,
      default: false,
    },

    // Edit history
    editHistory: [
      {
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        editedAt: Date,
        previousValue: mongoose.Schema.Types.Mixed,
        reason: String,
      },
    ],

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "followup_activities",
  }
);

// =========================
// Indexes for Performance
// =========================

// Core query indexes
followUpActivitySchema.index({ followUpId: 1, timestamp: -1 }); // Timeline for a follow-up
followUpActivitySchema.index({ relatedId: 1, relatedType: 1, timestamp: -1 }); // All activities for entity
followUpActivitySchema.index({ performedBy: 1, timestamp: -1 }); // User activity log
followUpActivitySchema.index({ activityType: 1, timestamp: -1 }); // Activities by type
followUpActivitySchema.index({ category: 1, timestamp: -1 }); // Activities by category

// Composite indexes for common queries
followUpActivitySchema.index({ followUpId: 1, category: 1, timestamp: -1 }); // Specific category for follow-up
followUpActivitySchema.index({ relatedId: 1, activityType: 1 }); // Entity specific activities
followUpActivitySchema.index({ timestamp: -1, activityType: 1 }); // Recent activities
followUpActivitySchema.index({ performedBy: 1, activityDate: 1 }); // User daily activity
followUpActivitySchema.index({ activityDate: 1, category: 1 }); // Activities by date and category

// Indexes for analytics
followUpActivitySchema.index({ timestamp: 1, sentiment: 1 }); // Sentiment analysis
followUpActivitySchema.index({ timestamp: 1, impact: 1 }); // Impact analysis
followUpActivitySchema.index({ followUpId: 1, sentiment: 1 }); // Follow-up sentiment

// Text index for full-text search
followUpActivitySchema.index({
  title: "text",
  description: "text",
  "noteActivity.content": "text",
  "callActivity.notes": "text",
  "meetingActivity.summary": "text",
  "emailActivity.subject": "text",
  "whatsappActivity.messageBody": "text",
});

// =========================
// Virtuals
// =========================

// Virtual for time since activity
followUpActivitySchema.virtual("timeSinceActivity").get(function () {
  const now = new Date();
  const diff = now - this.timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours === 0) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
});

// Virtual to format activity date
followUpActivitySchema.virtual("formattedDate").get(function () {
  return this.timestamp.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: this.timestamp.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
});

// Virtual to format activity time
followUpActivitySchema.virtual("formattedTime").get(function () {
  return this.timestamp.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Virtual for activity icon based on type
followUpActivitySchema.virtual("activityIcon").get(function () {
  const iconMap = {
    follow_up_created: "📋",
    status_changed: "🔄",
    note_added: "📝",
    call_made: "☎️",
    meeting_scheduled: "📅",
    whatsapp_sent: "💬",
    email_sent: "📧",
    attachment_added: "📎",
    user_assigned: "👤",
    priority_changed: "⭐",
    reminder_set: "🔔",
    reminder_triggered: "🔔",
    follow_up_rescheduled: "📅",
    follow_up_completed: "✅",
  };
  return iconMap[this.activityType] || "📌";
});

// =========================
// Hooks
// =========================

// Auto-set icon and color based on activityType
followUpActivitySchema.pre("save", function (next) {
  // Set default icon based on activity type
  if (!this.icon) {
    const iconMap = {
      follow_up_created: "📋",
      status_changed: "🔄",
      note_added: "📝",
      call_made: "☎️",
      meeting_scheduled: "📅",
      whatsapp_sent: "💬",
      email_sent: "📧",
      attachment_added: "📎",
      user_assigned: "👤",
      priority_changed: "⭐",
      reminder_set: "🔔",
      reminder_triggered: "🔔",
      follow_up_rescheduled: "📅",
      follow_up_completed: "✅",
    };
    this.icon = iconMap[this.activityType] || "📌";
  }

  // Set default color based on category
  if (!this.color) {
    const colorMap = {
      communication: "#3b82f6",
      status: "#f59e0b",
      note: "#8b5cf6",
      file: "#10b981",
      assignment: "#ec4899",
      reminder: "#f97316",
      system: "#6b7280",
    };
    this.color = colorMap[this.category] || "#3b82f6";
  }

  next();
});

// =========================
// Statics & Instance Methods
// =========================

/**
 * Get timeline for a specific follow-up
 */
followUpActivitySchema.statics.getFollowUpTimeline = function (followUpId, options = {}) {
  const { limit = 100, skip = 0, startDate, endDate } = options;

  const query = { followUpId };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return this.find(query)
    .populate("performedBy", "name email avatar")
    .populate("relatedUsers", "name email avatar")
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Get all activities for an entity (Lead, Customer, etc.)
 */
followUpActivitySchema.statics.getEntityTimeline = function (relatedType, relatedId, options = {}) {
  const { limit = 100, skip = 0, activityTypes = [] } = options;

  const query = { relatedType, relatedId };
  if (activityTypes.length > 0) {
    query.activityType = { $in: activityTypes };
  }

  return this.find(query)
    .populate("performedBy", "name email avatar")
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Get activities by category
 */
followUpActivitySchema.statics.getByCategory = function (followUpId, category, limit = 50) {
  return this.find({ followUpId, category })
    .populate("performedBy", "name email avatar")
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Get recent activities
 */
followUpActivitySchema.statics.getRecentActivities = function (options = {}) {
  const { limit = 50, hours = 24, activityTypes = [] } = options;

  const query = {
    timestamp: {
      $gte: new Date(Date.now() - hours * 60 * 60 * 1000),
    },
  };

  if (activityTypes.length > 0) {
    query.activityType = { $in: activityTypes };
  }

  return this.find(query)
    .populate("performedBy", "name email avatar")
    .populate("relatedUsers", "name email avatar")
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Get activity summary for a follow-up (counts by type)
 */
followUpActivitySchema.statics.getActivitySummary = function (followUpId) {
  return this.aggregate([
    { $match: { followUpId: new mongoose.Types.ObjectId(followUpId) } },
    {
      $group: {
        _id: "$activityType",
        count: { $sum: 1 },
        lastActivity: { $max: "$timestamp" },
      },
    },
    {
      $sort: { lastActivity: -1 },
    },
  ]);
};

/**
 * Get activity statistics for date range
 */
followUpActivitySchema.statics.getActivityStats = function (followUpId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        followUpId: new mongoose.Types.ObjectId(followUpId),
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          category: "$category",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.date": 1 },
    },
  ]);
};

/**
 * Log a new activity
 */
followUpActivitySchema.statics.logActivity = async function (activityData) {
  const activity = new this(activityData);
  return activity.save();
};

/**
 * Delete activities older than X days
 */
followUpActivitySchema.statics.deleteOldActivities = function (daysOld = 365) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({ timestamp: { $lt: cutoffDate } });
};

/**
 * Instance method: Add edit to activity
 */
followUpActivitySchema.methods.addEdit = function (editedBy, previousValue, reason) {
  this.editHistory.push({
    editedBy,
    editedAt: new Date(),
    previousValue,
    reason,
  });
  return this.save();
};

/**
 * Instance method: Mark as customer visible
 */
followUpActivitySchema.methods.markCustomerVisible = function () {
  this.visibility = "customer_visible";
  return this.save();
};

/**
 * Instance method: Get formatted activity summary
 */
followUpActivitySchema.methods.getSummary = function () {
  const base = {
    _id: this._id,
    type: this.activityType,
    category: this.category,
    title: this.title,
    description: this.description,
    timestamp: this.timestamp,
    formattedDate: this.formattedDate,
    formattedTime: this.formattedTime,
    icon: this.icon,
    color: this.color,
    performedBy: {
      name: this.performedBy.name,
      email: this.performedBy.email,
      avatar: this.performedBy.avatar,
    },
  };

  // Add activity-specific details
  if (this.callActivity) {
    base.details = {
      duration: this.callActivity.duration,
      outcome: this.callActivity.outcome,
      type: this.callActivity.callType,
    };
  } else if (this.emailActivity) {
    base.details = {
      subject: this.emailActivity.subject,
      direction: this.emailActivity.direction,
      opened: this.emailActivity.opened,
    };
  } else if (this.whatsappActivity) {
    base.details = {
      type: this.whatsappActivity.messageType,
      direction: this.whatsappActivity.direction,
      status: this.whatsappActivity.messageStatus,
    };
  } else if (this.noteActivity) {
    base.details = {
      content: this.noteActivity.content.substring(0, 100),
      type: this.noteActivity.noteType,
    };
  }

  return base;
};

// Export model
export default mongoose.model("FollowUpActivity", followUpActivitySchema);
