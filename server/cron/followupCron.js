import cron from "node-cron";
import FollowUp from "../models/FollowUpEnhanced.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/**
 * Follow-up Reminder Cron Job
 * Runs every minute to check for upcoming follow-ups
 * Sends reminders 1 hour before and on the scheduled time
 */
const followUpReminder = () => {
  console.log("⏰ Initializing follow-up reminder cron job...");

  cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log(`\n🕐 [${now.toLocaleTimeString()}] Cron job running...`);

    try {
      // Debug: Show total follow-ups in database
      const totalFollowUps = await FollowUp.countDocuments();
      const pendingFollowUps = await FollowUp.countDocuments({ status: "Pending" });
      console.log(`📊 Total follow-ups in DB: ${totalFollowUps}, Pending: ${pendingFollowUps}`);

      // If there are pending follow-ups, show their dates for debugging
      if (pendingFollowUps > 0) {
        const allPending = await FollowUp.find({ status: "Pending" }).select("followUpDate isReminderSent isOverdueNotificationSent relatedType");
        allPending.forEach((fu, i) => {
          console.log(`  📌 Pending #${i + 1}: date=${fu.followUpDate?.toISOString()}, local=${fu.followUpDate?.toLocaleString()}, reminderSent=${fu.isReminderSent}, overdueSent=${fu.isOverdueNotificationSent}, type=${fu.relatedType}`);
        });
      }

      // Window: from 5 minutes ago to 1 hour from now
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      console.log(`📅 Checking for follow-ups between ${fiveMinutesAgo.toLocaleString()} and ${oneHourFromNow.toLocaleString()}`);

      // Find pending follow-ups that are due soon
      const upcomingFollowUps = await FollowUp.find({
        followUpDate: { $gte: fiveMinutesAgo, $lte: oneHourFromNow },
        status: "Pending",
        isReminderSent: { $ne: true }
      }).populate({
        path: "relatedId",
        refPath: "relatedType"
      });

      console.log(`✅ Found ${upcomingFollowUps.length} upcoming follow-ups`);

      if (upcomingFollowUps.length > 0) {
        for (const followUp of upcomingFollowUps) {
          console.log(`  - Follow-up due at: ${followUp.followUpDate.toLocaleString()}, related: ${followUp.relatedType}`);
          await sendFollowUpReminder(followUp, now);
        }
      }

      // Check for overdue follow-ups (past the scheduled time and still pending)
      const overdueFollowUps = await FollowUp.find({
        followUpDate: { $lt: fiveMinutesAgo },
        status: "Pending",
        isOverdueNotificationSent: { $ne: true }
      }).populate({
        path: "relatedId",
        refPath: "relatedType"
      });

      console.log(`⚠️ Found ${overdueFollowUps.length} overdue follow-ups`);

      if (overdueFollowUps.length > 0) {
        for (const followUp of overdueFollowUps) {
          await sendOverdueFollowUpNotification(followUp);
        }
      }

    } catch (error) {
      console.error("❌ Follow-up Cron Error:", error.message, error);
    }
  });
};

/**
 * Send reminder notification for upcoming follow-ups
 */
const sendFollowUpReminder = async (followUp, now) => {
  try {
    const relatedObject = followUp.relatedId;
    const relatedName = relatedObject?.customerName || relatedObject?.name || "Unknown Lead";

    if (!relatedObject) {
      console.log(`⚠️ No related object found for follow-up ${followUp._id}, using fallback name`);
    }

    // Get time until follow-up
    const timeUntil = followUp.followUpDate - now;
    const hoursUntil = Math.floor(timeUntil / (60 * 60 * 1000));
    const minutesUntil = Math.floor((timeUntil % (60 * 60 * 1000)) / (60 * 1000));

    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users to notify`);

    if (users.length === 0) {
      console.log("⚠️ No users found in database");
      return;
    }

    for (const user of users) {
      // Check if notification already exists for this user
      const existingNotification = await Notification.findOne({
        userId: user._id,
        followUpId: followUp._id,
        type: "followup_reminder"
      });

      if (existingNotification) {
        console.log(`⏭️ Notification already exists for user ${user.email}`);
        continue;
      }

      const title = timeUntil > 0
        ? (hoursUntil > 0
          ? `📢 Follow-up reminder in ${hoursUntil}h ${minutesUntil}m`
          : `📢 Follow-up reminder in ${minutesUntil} minutes`)
        : `📢 Follow-up is NOW!`;

      const message = `Reminder: Follow-up scheduled for ${relatedName} at ${followUp.followUpDate.toLocaleString()}\n${followUp.notes || "No notes"}`;

      // Create notification
      await Notification.create({
        userId: user._id,
        followUpId: followUp._id,
        type: "followup_reminder",
        title,
        message,
        relatedTo: followUp.relatedType,
        relatedId: followUp.relatedId?._id || followUp.relatedId,
        relatedName,
        scheduledTime: followUp.followUpDate,
        reminderType: "in_app"
      });

      console.log(`✅ Notification created for ${user.email}: ${title}`);
    }

    // Mark follow-up as reminder sent
    await FollowUp.findByIdAndUpdate(followUp._id, { isReminderSent: true });
    console.log(`📌 Marked follow-up ${followUp._id} as reminder sent`);

  } catch (error) {
    console.error("❌ Error sending follow-up reminder:", error.message, error);
  }
};

/**
 * Send overdue notification for follow-ups that haven't been completed
 */
const sendOverdueFollowUpNotification = async (followUp) => {
  try {
    const relatedObject = followUp.relatedId;
    const relatedName = relatedObject?.customerName || relatedObject?.name || "Unknown Lead";

    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users for overdue notification`);

    if (users.length === 0) return;

    const msOverdue = new Date() - followUp.followUpDate;
    const hoursOverdue = Math.floor(msOverdue / (60 * 60 * 1000));
    const daysOverdue = Math.floor(msOverdue / (24 * 60 * 60 * 1000));

    for (const user of users) {
      // Check if overdue notification already exists
      const existingNotification = await Notification.findOne({
        userId: user._id,
        followUpId: followUp._id,
        type: "followup_overdue"
      });

      if (existingNotification) {
        console.log(`⏭️ Overdue notification already exists for ${user.email}`);
        continue;
      }

      const title = daysOverdue > 0
        ? `⚠️ Overdue Follow-up (${daysOverdue} day${daysOverdue > 1 ? 's' : ''})`
        : `⚠️ Overdue Follow-up (${hoursOverdue}h ago)`;

      const message = `Follow-up for ${relatedName} was scheduled at ${followUp.followUpDate.toLocaleString()} and is overdue. Please complete or reschedule.\n${followUp.notes || "No notes"}`;

      await Notification.create({
        userId: user._id,
        followUpId: followUp._id,
        type: "followup_overdue",
        title,
        message,
        relatedTo: followUp.relatedType,
        relatedId: relatedObject?._id || followUp.relatedId,
        relatedName,
        scheduledTime: followUp.followUpDate,
        reminderType: "in_app"
      });

      console.log(`⚠️ Overdue notification created for ${user.email}: ${title}`);
    }

    // Mark as notification sent
    await FollowUp.findByIdAndUpdate(followUp._id, { isOverdueNotificationSent: true });
    console.log(`📌 Marked follow-up ${followUp._id} as overdue notification sent`);

  } catch (error) {
    console.error("❌ Error sending overdue notification:", error.message, error);
  }
};

export default followUpReminder;
