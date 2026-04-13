import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema({
  relatedType: { type: String, enum: ["Lead", "Quotation"], required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "relatedType" }, // references Lead or Quotation
  followUpDate: { type: Date, required: true },
  notes: { type: String },
  status: { type: String, enum: ["Pending", "Running", "Completed"], default: "Pending" },
  conversationDetails: { type: String }, // What was discussed during the follow-up
  nextFollowUpDate: { type: Date }, // If rescheduled, the new date for the follow-up
  isReminderSent: { type: Boolean, default: false }, // Track if reminder notification was sent
  isOverdueNotificationSent: { type: Boolean, default: false }, // Track if overdue notification was sent
  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("FollowUp", followUpSchema);
