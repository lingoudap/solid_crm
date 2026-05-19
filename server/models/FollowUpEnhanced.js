import mongoose from "mongoose";

/**
 * Enhanced Follow-Up Schema for Professional CRM System
 * Includes priority management, task assignment, activity tracking, and analytics
 */

// Sub-schema for reminder settings
const reminderSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    remindBefore: {
      // Remind X days before follow-up
      type: Number,
      enum: [1, 7, 14, 30],
      default: 1,
    },
    reminderType: {
      type: String,
      enum: ["email", "sms", "notification", "all"],
      default: "notification",
    },
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: Date,
    repeatReminder: {
      type: String,
      enum: ["once", "daily", "weekly"],
      default: "once",
    },
  },
  { _id: false }
);

// Sub-schema for activity logs
const activityLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    action: {
      type: String,
      enum: ["created", "updated", "status_changed", "assigned", "reopened", "commented", "completed"],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    description: String,
  },
  { _id: false }
);

// Sub-schema for attachments
const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: String, // e.g., "pdf", "image", "document"
    fileSize: Number, // in bytes
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: { type: Date, default: Date.now },
    description: String,
  },
  { _id: false }
);

// Sub-schema for follow-up history/chain
const followUpHistorySchema = new mongoose.Schema(
  {
    previousFollowUpId: mongoose.Schema.Types.ObjectId,
    previousStatus: String,
    previousDate: Date,
    rescheduleReason: String,
    rescheduledAt: Date,
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

// Main Follow-Up Schema
const followUpSchema = new mongoose.Schema(
  {
    // Core Follow-Up Information
    relatedType: {
      type: String,
      enum: ["Lead", "Quotation", "Customer", "Order"],
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "relatedType",
    },

    // Follow-Up Schedule & Status
    followUpDate: {
      type: Date,
      required: [true, "Follow-up date is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Follow-up date must be in the future",
      },
    },
    followUpTime: {
      type: String,
      validate: {
        validator: function (value) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        },
        message: "Follow-up time must be in HH:MM format",
      },
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rescheduled", "Cancelled"],
      default: "Pending",
      index: true,
    },
    completedAt: Date,

    // Basic Information
    communicationType: {
      type: String,
      enum: ["call", "email", "sms", "whatsapp", "in_person", "video_call"],
      default: "call",
      index: true,
    },
    remark: {
      type: String,
      maxlength: 2000,
    },
    conversationDetails: {
      type: String,
      maxlength: 5000,
    },

    // Advanced CRM Fields
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Follow-Up Chain & History
    nextFollowUp: {
      followUpDate: Date,
      followUpTime: String,
      notes: String,
    },
    followUpHistory: followUpHistorySchema,

    // Overdue & Reminders
    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },
    daysOverdue: {
      type: Number,
      default: 0,
    },
    overdueStatus: {
      markedAt: Date,
      daysOverdue: Number,
      priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
      },
      lastNotified: Date,
      resolvedAt: Date,
      escalatedAt: Date,
      snoozedUntil: Date,
    },
    reminderSettings: reminderSettingsSchema,
    autoCreateNextReminder: {
      type: Boolean,
      default: false,
    },
    linkedFollowUpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FollowUpEnhanced",
    },

    // Tags & Categorization
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],

    // Attachments & Files
    attachments: [attachmentSchema],

    // Activity & Audit Trail
    activityLogs: [activityLogSchema],

    // Metadata for Analytics
    duration: Number, // in minutes
    outcome: {
      type: String,
      enum: ["positive", "neutral", "negative", "pending"],
      default: "pending",
    },
    leadScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    conversionProbability: {
      type: Number,
      min: 0,
      max: 100,
    },
    nextActionRequired: {
      type: String,
      enum: ["yes", "no", "pending"],
      default: "pending",
    },
    notes: {
      internal: String, // Notes not visible to customer
      external: String, // Notes visible to customer
    },
    customFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

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
    collection: "followups",
  }
);

// =========================
// Indexes for Performance
// =========================

// Composite indexes for common queries
followUpSchema.index({ relatedId: 1, relatedType: 1 }); // Find all follow-ups for an entity
followUpSchema.index({ assignedTo: 1, status: 1 }); // Assigned follow-ups for a user
followUpSchema.index({ followUpDate: 1, status: 1 }); // Due follow-ups
followUpSchema.index({ priority: 1, isOverdue: 1 }); // High priority overdue follow-ups
followUpSchema.index({ createdAt: -1 }); // Chronological sorting
followUpSchema.index({ followUpDate: 1, isOverdue: 1, status: 1 }); // Complex filtering
followUpSchema.index({ tags: 1 }); // Tag-based filtering
followUpSchema.index({ "reminderSettings.enabled": 1, followUpDate: 1 }); // Reminder queries
followUpSchema.index({ createdBy: 1, createdAt: -1 }); // User activity tracking
followUpSchema.index({ "activityLogs.performedBy": 1 }); // Activity auditing
followUpSchema.index({ "overdueStatus.priority": 1, isOverdue: 1 }); // Overdue analytics

// Text index for full-text search
followUpSchema.index({
  remark: "text",
  conversationDetails: "text",
  "notes.internal": "text",
  "notes.external": "text",
});

// =========================
// Virtuals
// =========================

// Virtual for days until follow-up
followUpSchema.virtual("daysUntil").get(function () {
  const now = new Date();
  const diff = this.followUpDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual to check if follow-up is due today
followUpSchema.virtual("isDueToday").get(function () {
  const today = new Date();
  return (
    this.followUpDate.getFullYear() === today.getFullYear() &&
    this.followUpDate.getMonth() === today.getMonth() &&
    this.followUpDate.getDate() === today.getDate()
  );
});

// Note: isOverdue is now an actual field, not a virtual

// Virtual to get age in days
followUpSchema.virtual("ageInDays").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// =========================
// Middleware / Hooks
// =========================

// Update overdue status before save
followUpSchema.pre("save", function (next) {
  const now = new Date();
  
  // Auto-update overdue based on followUpDate
  if (this.status !== "Completed" && this.followUpDate < now && !this.isOverdue) {
    this.isOverdue = true;
    const daysOverdue = Math.floor((now - this.followUpDate) / (1000 * 60 * 60 * 24));
    this.daysOverdue = daysOverdue;
    
    // Initialize overdueStatus if not already set
    if (!this.overdueStatus) {
      this.overdueStatus = {
        markedAt: now,
        daysOverdue,
        priority: daysOverdue >= 7 ? "critical" : daysOverdue >= 3 ? "high" : "medium",
        lastNotified: now,
      };
    }
  } else if (this.status === "Completed" && this.isOverdue) {
    this.isOverdue = false;
    this.daysOverdue = 0;
  }

  // Add activity log for updates
  if (!this.isNew) {
    const activityLog = {
      action: "updated",
      performedBy: this._performedBy, // This should be set in controller
      timestamp: new Date(),
    };
    this.activityLogs.push(activityLog);
  }

  next();
});

// Populate references on find
followUpSchema.pre(/^find/, function (next) {
  this.populate("assignedTo", "name email phone")
    .populate("createdBy", "name email")
    .populate("activityLogs.performedBy", "name email")
    .populate("attachments.uploadedBy", "name email")
    .populate("relatedId");

  next();
});

// Virtual fields should be included in JSON
followUpSchema.set("toJSON", { virtuals: true });
followUpSchema.set("toObject", { virtuals: true });

// =========================
// Statics & Methods
// =========================

// Static method to get overdue follow-ups
followUpSchema.statics.getOverdueFollowUps = function (filters = {}) {
  const query = {
    followUpDate: { $lt: new Date() },
    status: { $ne: "Completed" },
    ...filters,
  };
  return this.find(query).sort({ followUpDate: 1 });
};

// Static method to get follow-ups due today
followUpSchema.statics.getDueTodayFollowUps = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.find({
    followUpDate: { $gte: today, $lt: tomorrow },
    status: { $ne: "Completed" },
  }).sort({ followUpTime: 1 });
};

// Static method to get follow-ups by assignee with status
followUpSchema.statics.getByAssignee = function (userId, status = null) {
  const query = { assignedTo: userId };
  if (status) query.status = status;
  return this.find(query).sort({ followUpDate: 1 });
};

// Static method to get analytics data
followUpSchema.statics.getAnalytics = function (startDate, endDate, groupBy = "status") {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 },
        avgDaysOverdue: { $avg: "$daysOverdue" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Instance method to reschedule follow-up
followUpSchema.methods.reschedule = async function (newDate, newTime, reason, rescheduledBy) {
  // Store current state in history
  this.followUpHistory = {
    previousFollowUpId: this._id,
    previousStatus: this.status,
    previousDate: this.followUpDate,
    rescheduleReason: reason,
    rescheduledAt: new Date(),
    rescheduledBy: rescheduledBy,
  };

  // Update follow-up
  this.followUpDate = newDate;
  this.followUpTime = newTime;
  this.status = "Rescheduled";
  this.overdue = false;

  // Add to activity log
  this.activityLogs.push({
    action: "updated",
    performedBy: rescheduledBy,
    description: `Follow-up rescheduled from ${this.followUpHistory.previousDate} to ${newDate}. Reason: ${reason}`,
  });

  return this.save();
};

// Instance method to complete follow-up
followUpSchema.methods.complete = async function (completedBy, outcome = "neutral") {
  this.status = "Completed";
  this.completedAt = new Date();
  this.outcome = outcome;

  this.activityLogs.push({
    action: "completed",
    performedBy: completedBy,
    description: `Follow-up completed with outcome: ${outcome}`,
  });

  return this.save();
};

// Instance method to add comment
followUpSchema.methods.addComment = function (text, commentedBy) {
  const comment = {
    timestamp: new Date(),
    action: "commented",
    performedBy: commentedBy,
    description: text,
  };

  this.activityLogs.push(comment);
  return this.save();
};

// Instance method to add attachment
followUpSchema.methods.addAttachment = function (fileName, fileUrl, fileType, uploadedBy, description = "") {
  const attachment = {
    fileName,
    fileUrl,
    fileType,
    uploadedBy,
    description,
    uploadedAt: new Date(),
  };

  this.attachments.push(attachment);
  this.activityLogs.push({
    timestamp: new Date(),
    action: "updated",
    performedBy: uploadedBy,
    description: `Attachment added: ${fileName}`,
  });

  return this.save();
};

export default mongoose.model("FollowUp", followUpSchema);
