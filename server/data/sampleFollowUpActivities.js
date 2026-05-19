/**
 * Sample Follow-Up Timeline Data
 * Realistic examples of various activity types
 * for testing and demonstration purposes
 */

const sampleFollowUpActivities = [
  // ==========================================
  // FOLLOW-UP CREATED
  // ==========================================
  {
    _id: "65a1234567890abcdef12345",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "follow_up_created",
    category: "system",
    performedBy: {
      _id: "user_001",
      name: "Ahmed Hassan",
      email: "ahmed@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-10T09:30:00Z"),
    formattedDate: "May 10, 2026",
    formattedTime: "09:30 AM",
    title: "Follow-up Created",
    description: "Initial follow-up created for new lead",
    sentiment: "neutral",
    impact: "medium",
    visibility: "internal",
    icon: "📋",
    color: "#3b82f6",
    metadata: {
      relatedType: "Lead",
      priority: "high",
    },
  },

  // ==========================================
  // CALL ACTIVITY
  // ==========================================
  {
    _id: "65a1234567890abcdef12346",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "call_made",
    category: "communication",
    performedBy: {
      _id: "user_001",
      name: "Ahmed Hassan",
      email: "ahmed@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-12T14:15:00Z"),
    formattedDate: "May 12, 2026",
    formattedTime: "14:15 PM",
    title: "Call - Answered",
    description: "Call made with duration 8 minutes",
    callActivity: {
      duration: 480, // 8 minutes
      outcome: "answered",
      callType: "outbound",
      participants: [
        {
          name: "Mohammed Al-Dosari",
          phone: "+966501234567",
          email: "m.dosari@example.com",
        },
      ],
      notes: "Discussed product features and pricing. Customer interested in implementation.",
      sentiment: "positive",
    },
    sentiment: "positive",
    impact: "high",
    icon: "☎️",
    color: "#ef4444",
    visibility: "internal",
    metadata: {
      duration: 480,
      outcome: "answered",
      participants: 1,
    },
  },

  // ==========================================
  // NOTE ACTIVITY
  // ==========================================
  {
    _id: "65a1234567890abcdef12347",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "note_added",
    category: "note",
    performedBy: {
      _id: "user_001",
      name: "Ahmed Hassan",
      email: "ahmed@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-12T14:45:00Z"),
    formattedDate: "May 12, 2026",
    formattedTime: "14:45 PM",
    title: "Note added",
    description: "Customer interested in the premium package",
    noteActivity: {
      noteType: "internal",
      content:
        "Customer showed great interest in our premium package during the call. Mentioned they have a budget allocated for Q3. Need to prepare a tailored quotation. Also noted that they will be on vacation from May 20-25, so best to follow up on May 27.",
      mentions: ["user_002"],
      tags: ["premium_package", "quotation_needed", "vacation"],
      attachments: [],
    },
    visibility: "internal",
    tags: ["premium_package", "quotation_needed"],
    relatedUsers: ["user_002"],
    icon: "📝",
    color: "#8b5cf6",
    metadata: {
      noteType: "internal",
      tagsCount: 3,
      mentions: 1,
    },
  },

  // ==========================================
  // STATUS CHANGED
  // ==========================================
  {
    _id: "65a1234567890abcdef12348",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "status_changed",
    category: "status",
    performedBy: {
      _id: "user_001",
      name: "Ahmed Hassan",
      email: "ahmed@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-13T10:00:00Z"),
    formattedDate: "May 13, 2026",
    formattedTime: "10:00 AM",
    title: "Status changed from Pending to In Progress",
    description: "Status updated to In Progress",
    statusChangeActivity: {
      previousStatus: "Pending",
      newStatus: "In Progress",
      reason: "Customer callback scheduled and quote preparation started",
      changeReason: "user_request",
    },
    sentiment: "neutral",
    impact: "high",
    icon: "🔄",
    color: "#f59e0b",
    visibility: "internal",
    metadata: {
      previousStatus: "Pending",
      newStatus: "In Progress",
    },
  },

  // ==========================================
  // EMAIL ACTIVITY
  // ==========================================
  {
    _id: "65a1234567890abcdef12349",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "email_sent",
    category: "communication",
    performedBy: {
      _id: "user_002",
      name: "Fatima Al-Otaibi",
      email: "f.alotaibi@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-13T11:30:00Z"),
    formattedDate: "May 13, 2026",
    formattedTime: "11:30 AM",
    title: "Email - Premium Package Details",
    description: "Email sent - 1 recipient(s)",
    emailActivity: {
      subject: "Premium Package Details & Customization Options",
      recipients: [
        {
          email: "m.dosari@example.com",
          name: "Mohammed Al-Dosari",
          type: "to",
        },
      ],
      emailBody:
        "Dear Mohammed,\n\nFollowing our discussion yesterday, I'm sending you the premium package details tailored for your company's needs...",
      direction: "sent",
      attachments: [
        {
          fileName: "Premium_Package_Proposal.pdf",
          fileSize: 2500000,
          fileType: "pdf",
        },
      ],
      status: "sent",
    },
    sentiment: "neutral",
    impact: "high",
    icon: "📧",
    color: "#06b6d4",
    visibility: "customer_visible",
    metadata: {
      recipientCount: 1,
      attachmentsCount: 1,
      subject: "Premium Package Details & Customization Options",
    },
  },

  // ==========================================
  // MEETING ACTIVITY
  // ==========================================
  {
    _id: "65a1234567890abcdef12350",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "meeting_scheduled",
    category: "communication",
    performedBy: {
      _id: "user_002",
      name: "Fatima Al-Otaibi",
      email: "f.alotaibi@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-15T16:20:00Z"),
    formattedDate: "May 15, 2026",
    formattedTime: "16:20 PM",
    title: "Meeting - Video Call",
    description: "Meeting held - 2 attendees",
    meetingActivity: {
      meetingType: "video_call",
      duration: 45,
      attendees: [
        {
          userId: "user_002",
          name: "Fatima Al-Otaibi",
          email: "f.alotaibi@company.com",
          role: "organizer",
        },
        {
          name: "Mohammed Al-Dosari",
          email: "m.dosari@example.com",
          role: "participant",
        },
      ],
      meetingLink: "https://meet.company.com/premium-demo-001",
      agenda: "Product demo and Q&A for premium package",
      summary: "Successful demo meeting. Customer asked detailed questions about integration capabilities and support SLA. Very engaged and positive feedback.",
      outcomes: [
        "Reviewed all premium features with demo environment",
        "Answered technical integration questions",
        "Discussed pricing and payment options",
        "Customer committed to making decision by May 28",
      ],
      nextSteps: [
        "Send meeting minutes and action items",
        "Prepare contract draft",
        "Schedule final approval meeting for May 26",
      ],
      attachmentsFromMeeting: [],
    },
    sentiment: "positive",
    impact: "high",
    icon: "📅",
    color: "#10b981",
    visibility: "customer_visible",
    metadata: {
      duration: 45,
      attendeeCount: 2,
      outcomes: 4,
    },
  },

  // ==========================================
  // WHATSAPP ACTIVITY
  // ==========================================
  {
    _id: "65a1234567890abcdef12351",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "whatsapp_sent",
    category: "communication",
    performedBy: {
      _id: "user_002",
      name: "Fatima Al-Otaibi",
      email: "f.alotaibi@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-16T09:45:00Z"),
    formattedDate: "May 16, 2026",
    formattedTime: "09:45 AM",
    title: "WhatsApp - Text",
    description: "Good morning! Thanks for the positive feedback on yesterday's demo. I've prepared...",
    whatsappActivity: {
      messageType: "text",
      messageBody:
        "Good morning! Thanks for the positive feedback on yesterday's demo. I've prepared the meeting minutes and contract draft. Will you be available for the final approval meeting on May 26? Looking forward to our partnership!",
      recipientPhone: "+966501234567",
      recipientName: "Mohammed Al-Dosari",
      direction: "sent",
      messageStatus: "read",
      readAt: new Date("2026-05-16T10:15:00Z"),
    },
    sentiment: "positive",
    impact: "medium",
    icon: "💬",
    color: "#14b8a6",
    visibility: "internal",
    metadata: {
      messageType: "text",
      recipientPhone: "+966501234567",
    },
  },

  // ==========================================
  // PRIORITY CHANGED
  // ==========================================
  {
    _id: "65a1234567890abcdef12352",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "priority_changed",
    category: "status",
    performedBy: {
      _id: "user_001",
      name: "Ahmed Hassan",
      email: "ahmed@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-16T14:00:00Z"),
    formattedDate: "May 16, 2026",
    formattedTime: "14:00 PM",
    title: "Priority Changed to Critical",
    description: "Priority upgraded due to customer's positive response and commitment timeline",
    sentiment: "positive",
    impact: "high",
    icon: "⭐",
    color: "#f59e0b",
    visibility: "internal",
    metadata: {
      previousPriority: "high",
      newPriority: "critical",
      reason: "strong_customer_interest",
    },
  },

  // ==========================================
  // ATTACHMENT ACTIVITY
  // ==========================================
  {
    _id: "65a1234567890abcdef12353",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "attachment_added",
    category: "file",
    performedBy: {
      _id: "user_002",
      name: "Fatima Al-Otaibi",
      email: "f.alotaibi@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-16T15:30:00Z"),
    formattedDate: "May 16, 2026",
    formattedTime: "15:30 PM",
    title: "Attachment added",
    description: "Contract_Draft_Premium_Package.docx",
    attachmentActivity: {
      fileName: "Contract_Draft_Premium_Package.docx",
      fileUrl: "/attachments/contract_draft_001.docx",
      fileType: "docx",
      fileSize: 150000,
      description: "Draft contract for customer review before final approval meeting",
      uploadedBy: "user_002",
      downloadCount: 2,
      lastDownloadedAt: new Date("2026-05-16T16:45:00Z"),
    },
    sentiment: "neutral",
    impact: "medium",
    icon: "📎",
    color: "#10b981",
    visibility: "customer_visible",
    metadata: {
      fileName: "Contract_Draft_Premium_Package.docx",
      fileSize: 150000,
      downloads: 2,
    },
  },

  // ==========================================
  // REMINDER TRIGGERED
  // ==========================================
  {
    _id: "65a1234567890abcdef12354",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "reminder_triggered",
    category: "reminder",
    performedBy: {
      _id: "system",
      name: "System",
      email: "system@company.com",
    },
    timestamp: new Date("2026-05-26T08:00:00Z"),
    formattedDate: "May 26, 2026",
    formattedTime: "08:00 AM",
    title: "Reminder Triggered",
    description: "Final approval meeting scheduled for today",
    sentiment: "neutral",
    impact: "high",
    icon: "🔔",
    color: "#f97316",
    visibility: "internal",
    isSystemAction: true,
    metadata: {
      reminderType: "notification",
      reminderBefore: 1,
    },
  },

  // ==========================================
  // FOLLOW-UP COMPLETED
  // ==========================================
  {
    _id: "65a1234567890abcdef12355",
    followUpId: "followup_001",
    relatedType: "Lead",
    relatedId: "lead_001",
    activityType: "follow_up_completed",
    category: "status",
    performedBy: {
      _id: "user_001",
      name: "Ahmed Hassan",
      email: "ahmed@company.com",
      avatar: null,
    },
    timestamp: new Date("2026-05-27T11:30:00Z"),
    formattedDate: "May 27, 2026",
    formattedTime: "11:30 AM",
    title: "Follow-up Completed",
    description: "Contract signed and partnership approved",
    sentiment: "positive",
    impact: "high",
    icon: "✅",
    color: "#10b981",
    visibility: "internal",
    metadata: {
      outcome: "positive",
      completionReason: "contract_signed",
      nextAction: "schedule_onboarding",
    },
  },
];

/**
 * Function to seed sample activities
 * Usage: seedFollowUpActivities()
 */
export const seedFollowUpActivities = async (FollowUpActivity) => {
  try {
    // Clear existing activities for this follow-up
    await FollowUpActivity.deleteMany({ followUpId: "followup_001" });

    // Insert sample activities
    const inserted = await FollowUpActivity.insertMany(sampleFollowUpActivities);
    console.log(`✅ Seeded ${inserted.length} sample activities`);
    return inserted;
  } catch (error) {
    console.error("Error seeding activities:", error);
    throw error;
  }
};

/**
 * Function to create a minimal single activity
 */
export const createSampleActivity = (type = "note_added", followUpId = "followup_001") => {
  const baseActivity = {
    followUpId,
    relatedType: "Lead",
    relatedId: "lead_001",
    performedBy: {
      _id: "user_001",
      name: "Ahmed Hassan",
      email: "ahmed@company.com",
    },
    timestamp: new Date(),
    visibility: "internal",
  };

  const activityTypes = {
    note_added: {
      ...baseActivity,
      activityType: "note_added",
      category: "note",
      title: "Note added",
      description: "Sample note",
      noteActivity: {
        noteType: "internal",
        content: "This is a sample note for testing purposes.",
        mentions: [],
        tags: ["sample"],
      },
    },
    call_made: {
      ...baseActivity,
      activityType: "call_made",
      category: "communication",
      title: "Call - Answered",
      description: "Sample call activity",
      callActivity: {
        duration: 300,
        outcome: "answered",
        callType: "outbound",
        notes: "Good conversation, customer interested",
      },
    },
    email_sent: {
      ...baseActivity,
      activityType: "email_sent",
      category: "communication",
      title: "Email - Sample Subject",
      description: "Sample email sent",
      emailActivity: {
        subject: "Sample Email Subject",
        recipients: [{ email: "customer@example.com" }],
        direction: "sent",
        status: "sent",
      },
    },
  };

  return activityTypes[type] || activityTypes.note_added;
};

export default sampleFollowUpActivities;
