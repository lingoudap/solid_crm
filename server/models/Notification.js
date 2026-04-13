import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  followUpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FollowUp"
  },
  type: {
    type: String,
    enum: ["followup_reminder", "followup_overdue", "followup_completed", "lead_message"],
    default: "followup_reminder"
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTo: {
    type: String
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedName: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  notificationTime: {
    type: Date,
    default: Date.now
  },
  scheduledTime: {
    type: Date // When the follow-up is scheduled
  },
  reminderType: {
    type: String,
    enum: ["email", "in_app", "both"],
    default: "both"
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
});

export default mongoose.model("Notification", notificationSchema);
