import mongoose from "mongoose";
import FollowUp from "./FollowUpEnhanced.js";

/**
 * Sample Data for Enhanced Follow-Up Schema
 * These examples demonstrate real-world CRM follow-up scenarios
 */

const sampleFollowUpData = [
  {
    // Follow-up for a sales lead
    relatedType: "Lead",
    relatedId: new mongoose.Types.ObjectId("65a1234567890abcdef12345"),
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    followUpTime: "14:30",
    status: "Pending",
    communicationType: "call",
    priority: "high",
    assignedTo: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
    createdBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
    remark: "Follow up on quotation submission",
    conversationDetails: null,
    overdue: false,
    reminderSettings: {
      enabled: true,
      remindBefore: 1,
      reminderType: "notification",
      repeatReminder: "once",
    },
    nextFollowUp: {
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      followUpTime: "15:00",
      notes: "Check if customer reviewed proposal",
    },
    tags: ["sales", "hot-lead", "follow-up"],
    activityLogs: [
      {
        timestamp: new Date(),
        action: "created",
        performedBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
        description: "Follow-up created for lead Ahmed Hassan",
      },
    ],
    attachments: [],
    notes: {
      internal: "Customer is very interested, expecting positive response",
      external: "Thank you for reviewing our proposal",
    },
    outcome: "pending",
    customFields: {
      productInterest: "CRM Suite",
      budgetApproved: true,
      decisionMaker: "CEO",
    },
  },

  {
    // Overdue follow-up for a quotation
    relatedType: "Quotation",
    relatedId: new mongoose.Types.ObjectId("65a4234567890abcdef12348"),
    followUpDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    followUpTime: "10:00",
    status: "In Progress",
    communicationType: "email",
    priority: "critical",
    assignedTo: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
    createdBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
    remark: "Follow up on quotation - no response yet",
    conversationDetails: "Sent reminder email",
    overdue: true,
    daysOverdue: 5,
    reminderSettings: {
      enabled: true,
      remindBefore: 1,
      reminderType: "all",
      reminderSent: true,
      reminderSentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      repeatReminder: "daily",
    },
    followUpHistory: {
      previousFollowUpId: new mongoose.Types.ObjectId("65a5234567890abcdef12349"),
      previousStatus: "Pending",
      previousDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      rescheduleReason: "Customer requested more time",
    },
    nextFollowUp: {
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      followUpTime: "09:00",
      notes: "Final follow-up before marking as lost",
    },
    tags: ["quotation", "overdue", "urgent", "follow-up"],
    attachments: [
      {
        fileName: "quotation_revised.pdf",
        fileUrl: "https://crm.example.com/files/quotation_12345_revised.pdf",
        fileType: "pdf",
        fileSize: 245000,
        uploadedBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: "Revised quotation with discount",
      },
    ],
    activityLogs: [
      {
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        action: "created",
        performedBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
        description: "Follow-up created for quotation",
      },
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        action: "status_changed",
        performedBy: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
        previousValue: "Pending",
        newValue: "In Progress",
        description: "Started follow-up work",
      },
      {
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        action: "updated",
        performedBy: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
        description: "Sent reminder email to customer",
      },
    ],
    notes: {
      internal: "Customer has been delayed on other projects",
      external: null,
    },
    duration: 15, // minutes
    outcome: "neutral",
    leadScore: 65,
    conversionProbability: 55,
    nextActionRequired: "yes",
    customFields: {
      quotationValue: 50000,
      targetCompletionDate: "2026-06-15",
      companySize: "Mid-size",
    },
  },

  {
    // Completed follow-up with positive outcome
    relatedType: "Customer",
    relatedId: new mongoose.Types.ObjectId("65a6234567890abcdef1234a"),
    followUpDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    followUpTime: "11:30",
    status: "Completed",
    completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    communicationType: "video_call",
    priority: "high",
    assignedTo: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
    createdBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
    remark: "Product training and implementation walkthrough",
    conversationDetails:
      "Customer successfully completed product training. All team members trained. Ready for go-live. Discussed custom integrations and timeline.",
    overdue: false,
    reminderSettings: {
      enabled: true,
      remindBefore: 1,
      reminderType: "notification",
      reminderSent: true,
      reminderSentAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    nextFollowUp: {
      followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      followUpTime: "10:00",
      notes: "Check on go-live progress and provide post-implementation support",
    },
    tags: ["training", "implementation", "satisfied-customer", "success"],
    attachments: [
      {
        fileName: "training_feedback_form.pdf",
        fileUrl: "https://crm.example.com/files/training_feedback_12345.pdf",
        fileType: "pdf",
        fileSize: 125000,
        uploadedBy: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
        uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        description: "Customer feedback from training session",
      },
      {
        fileName: "implementation_roadmap.docx",
        fileUrl: "https://crm.example.com/files/roadmap_12345.docx",
        fileType: "document",
        fileSize: 350000,
        uploadedBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        description: "Agreed implementation timeline",
      },
    ],
    activityLogs: [
      {
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        action: "created",
        performedBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
        description: "Training follow-up scheduled",
      },
      {
        timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        action: "assigned",
        performedBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
        previousValue: null,
        newValue: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
        description: "Assigned to Senior Account Manager",
      },
      {
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        action: "completed",
        performedBy: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
        description: "Follow-up completed with positive outcome",
      },
    ],
    notes: {
      internal:
        "Excellent customer, very engaged, potential for expansion sales. Consider VIP account status.",
      external:
        "Thank you for your time and engagement. We are excited to support your success with our platform.",
    },
    duration: 45, // minutes
    outcome: "positive",
    leadScore: 95,
    conversionProbability: 100,
    nextActionRequired: "yes",
    customFields: {
      contractValue: 75000,
      renewalDate: "2027-06-01",
      csAccountManager: "Sarah Johnson",
      nps: 9,
    },
  },

  {
    // Rescheduled follow-up with multiple history
    relatedType: "Lead",
    relatedId: new mongoose.Types.ObjectId("65a7234567890abcdef1234b"),
    followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    followUpTime: "16:00",
    status: "Rescheduled",
    communicationType: "call",
    priority: "medium",
    assignedTo: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
    createdBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
    remark: "Check on budget approval status",
    overdue: false,
    reminderSettings: {
      enabled: true,
      remindBefore: 7,
      reminderType: "email",
      repeatReminder: "once",
    },
    followUpHistory: {
      previousFollowUpId: new mongoose.Types.ObjectId("65a8234567890abcdef1234c"),
      previousStatus: "Pending",
      previousDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      rescheduleReason: "Customer requested to push back meeting due to budget review cycle",
      rescheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rescheduledBy: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
    },
    nextFollowUp: {
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      followUpTime: "14:00",
      notes: "Depending on budget approval feedback",
    },
    tags: ["lead", "rescheduled", "budget"],
    attachments: [],
    activityLogs: [
      {
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        action: "created",
        performedBy: new mongoose.Types.ObjectId("65a3234567890abcdef12347"),
        description: "Initial follow-up created",
      },
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        action: "updated",
        performedBy: new mongoose.Types.ObjectId("65a2234567890abcdef12346"),
        description:
          "Rescheduled from 2026-05-16 to 2026-05-21 due to budget review cycle delay",
      },
    ],
    notes: {
      internal: "Contact: CFO Assistant. Budget finalized by end of month. High probability deal.",
      external: null,
    },
    outcome: "pending",
    leadScore: 78,
    conversionProbability: 72,
    nextActionRequired: "yes",
    customFields: {
      dealSize: "Enterprise",
      salesStage: "Negotiation",
      expectedCloseDate: "2026-07-31",
    },
  },
];

/**
 * Script to seed sample data
 * Usage: node seedFollowUpData.js
 */
export async function seedFollowUpData() {
  try {
    // Connect to MongoDB
    // await mongoose.connect(process.env.MONGO_URI);

    // Clear existing follow-ups (optional)
    // await FollowUp.deleteMany({});

    // Insert sample data
    const insertedData = await FollowUp.insertMany(sampleFollowUpData, { ordered: false });

    console.log(`✅ Successfully inserted ${insertedData.length} sample follow-up records`);

    return insertedData;
  } catch (error) {
    console.error("❌ Error seeding sample data:", error);
    throw error;
  } finally {
    // await mongoose.connection.close();
  }
}

export default sampleFollowUpData;
