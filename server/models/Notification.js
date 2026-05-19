import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Basic notification info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    followUpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FollowUpEnhanced",
      index: true,
    },
    reminderId: {
      type: String,
      index: true, // Cron job ID for cancellation
    },

    // Notification content
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    description: {
      type: String,
      maxlength: 1000,
    },

    // Notification type
    notificationType: {
      type: String,
      enum: [
        "reminder_15_min",
        "reminder_1_hour",
        "reminder_exact_time",
        "overdue_alert",
        "follow_up_update",
        "follow_up_complete",
        "follow_up_assigned",
        "system_alert",
      ],
      required: true,
      index: true,
    },

    // Priority level
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },

    // Notification status
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "dismissed"],
      default: "pending",
      index: true,
    },

    // Read/dismissed status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },

    isDismissed: {
      type: Boolean,
      default: false,
      index: true,
    },
    dismissedAt: {
      type: Date,
    },

    // Delivery methods
    deliveryMethods: {
      inApp: {
        enabled: {
          type: Boolean,
          default: true,
        },
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: {
          type: Date,
        },
        displayed: {
          type: Boolean,
          default: false,
        },
        displayedAt: {
          type: Date,
        },
      },
      browser: {
        enabled: {
          type: Boolean,
          default: true,
        },
        permission: {
          type: String,
          enum: ["granted", "denied", "default"],
          default: "default",
        },
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: {
          type: Date,
        },
      },
      email: {
        enabled: {
          type: Boolean,
          default: false,
        },
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: {
          type: Date,
        },
        bounced: {
          type: Boolean,
          default: false,
        },
      },
      sms: {
        enabled: {
          type: Boolean,
          default: false,
        },
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: {
          type: Date,
        },
      },
    },

    // Sound and visual alerts
    soundAlert: {
      type: Boolean,
      default: false,
    },
    soundFile: {
      type: String,
      default: "default_notification.mp3",
    },

    // Action button
    action: {
      label: {
        type: String,
      },
      url: {
        type: String,
      },
      type: {
        type: String,
        enum: ["open_follow_up", "open_customer", "mark_complete", "custom"],
      },
    },

    // Reminder timing (if applicable)
    reminderTiming: {
      type: String,
      enum: ["15_minutes_before", "1_hour_before", "exact_time", "overdue"],
    },

    // Related data
    relatedData: {
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
      followUpData: {
        title: String,
        dueDate: Date,
        status: String,
        priority: String,
      },
    },

    // Expiration (auto-delete old notifications)
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index
    },

    // Metadata
    metadata: {
      source: String, // "reminder_service", "user_action", "system"
      ipAddress: String,
      userAgent: String,
      customFields: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

// ==========================================
// INDEXES
// ==========================================

// Compound indexes for common queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, isDismissed: 1 });
notificationSchema.index({ userId: 1, notificationType: 1, createdAt: -1 });
notificationSchema.index({ followUpId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, priority: 1, status: 1 });

// TTL index for auto-deletion of old notifications (after 30 days)
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 } // 30 days
);

// ==========================================
// VIRTUAL FIELDS
// ==========================================

notificationSchema.virtual("isUnread").get(function () {
  return !this.isRead && !this.isDismissed;
});

notificationSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
});

notificationSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// ==========================================
// METHODS
// ==========================================

notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  this.status = "read";
  return this.save();
};

notificationSchema.methods.dismiss = async function () {
  this.isDismissed = true;
  this.dismissedAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsDelivered = async function (method = "inApp") {
  this.status = "delivered";
  if (this.deliveryMethods[method]) {
    this.deliveryMethods[method].delivered = true;
    this.deliveryMethods[method].deliveredAt = new Date();
  }
  return this.save();
};

notificationSchema.methods.toNotificationObject = function () {
  return {
    id: this._id,
    title: this.title,
    message: this.message,
    type: this.notificationType,
    priority: this.priority,
    isRead: this.isRead,
    isDismissed: this.isDismissed,
    soundAlert: this.soundAlert,
    action: this.action,
    createdAt: this.createdAt,
    timeAgo: this.timeAgo,
  };
};

// ==========================================
// STATIC METHODS
// ==========================================

notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    userId,
    isRead: false,
    isDismissed: false,
  });
};

notificationSchema.statics.getNotificationFeed = async function (
  userId,
  options = {}
) {
  const { limit = 20, skip = 0, types = [], priority = null } = options;

  const query = {
    userId,
    isDismissed: false,
  };

  if (types.length > 0) {
    query.notificationType = { $in: types };
  }

  if (priority) {
    query.priority = priority;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select("-metadata -relatedData.customFields")
    .lean();
};

notificationSchema.statics.getNotificationSummary = async function (userId) {
  const [unreadCount, reminderCount, alertCount, totalCount] = await Promise.all(
    [
      this.countDocuments({ userId, isRead: false, isDismissed: false }),
      this.countDocuments({
        userId,
        notificationType: {
          $in: [
            "reminder_15_min",
            "reminder_1_hour",
            "reminder_exact_time",
          ],
        },
        isDismissed: false,
      }),
      this.countDocuments({
        userId,
        priority: "critical",
        isDismissed: false,
      }),
      this.countDocuments({ userId, isDismissed: false }),
    ]
  );

  return {
    unreadCount,
    reminderCount,
    alertCount,
    totalCount,
  };
};

notificationSchema.statics.getCriticalReminders = async function (userId) {
  return this.find({
    userId,
    priority: "critical",
    isDismissed: false,
    notificationType: {
      $in: [
        "reminder_15_min",
        "reminder_1_hour",
        "reminder_exact_time",
        "overdue_alert",
      ],
    },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
};

notificationSchema.statics.markUserNotificationsAsRead = async function (userId) {
  return this.updateMany(
    { userId, isRead: false, isDismissed: false },
    {
      isRead: true,
      readAt: new Date(),
      status: "read",
    }
  );
};

notificationSchema.statics.deleteOldNotifications = async function (daysOld = 30) {
  const date = new Date();
  date.setDate(date.getDate() - daysOld);

  return this.deleteMany({
    createdAt: { $lt: date },
    isDismissed: true,
  });
};

notificationSchema.statics.getNotificationsByFollowUp = async function (followUpId) {
  return this.find({ followUpId })
    .sort({ createdAt: -1 })
    .select("-metadata");
};

notificationSchema.statics.createBulkNotifications = async function (
  notifications
) {
  return this.insertMany(notifications, { ordered: false });
};

export default mongoose.model("Notification", notificationSchema);
