# Enhanced Follow-Up MongoDB Schema - Complete Guide

## 📋 Table of Contents
1. [Schema Overview](#schema-overview)
2. [Field Descriptions](#field-descriptions)
3. [Data Types & Validation](#data-types--validation)
4. [Indexes for Performance](#indexes-for-performance)
5. [Virtual Fields](#virtual-fields)
6. [Methods & Statics](#methods--statics)
7. [Usage Examples](#usage-examples)
8. [Analytics Capabilities](#analytics-capabilities)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)

---

## Schema Overview

The enhanced Follow-Up schema is designed for enterprise-grade CRM systems with support for:
- Complex task management and assignment
- Multi-step follow-up chains and history
- Priority-based scheduling
- Activity auditing and compliance
- Analytics and reporting
- Reminder management
- File attachments

### Key Improvements Over Original Schema

| Feature | Original | Enhanced |
|---------|----------|----------|
| Status Options | 3 | 5 |
| User Assignment | ❌ | ✅ |
| Priority Levels | ❌ | ✅ (4 levels) |
| Activity Tracking | ❌ | ✅ (15+ log types) |
| Attachments | ❌ | ✅ |
| Reminders | Partial | ✅ (Advanced) |
| Follow-up Chains | Partial | ✅ (Complete history) |
| Custom Fields | ❌ | ✅ |
| Analytics Ready | No | ✅ Yes |
| Overdue Tracking | Manual | ✅ (Automatic) |
| Communication Types | 1 (implied) | ✅ (6 types) |
| Full Text Search | ❌ | ✅ |

---

## Field Descriptions

### Core Follow-Up Information

#### `relatedType` (String, Required)
**Purpose**: Determines what entity this follow-up is related to
```javascript
enum: ["Lead", "Quotation", "Customer", "Order"]
```
**Why**: Allows one schema to handle follow-ups for multiple entity types
**Usage**: Use with `refPath: "relatedType"` for polymorphic references

#### `relatedId` (ObjectId, Required)
**Purpose**: References the specific entity (Lead, Quotation, Customer, or Order)
**Format**: MongoDB ObjectId
**Indexes**: Yes (composite with relatedType)
**Usage**: Fetch all follow-ups for an entity
```javascript
db.followups.find({ relatedId: ObjectId("65a1234567890abcdef12345") })
```

### Follow-Up Schedule & Status

#### `followUpDate` (Date, Required)
**Purpose**: The scheduled date for the follow-up
**Validation**: Must be in the future
**Format**: ISO 8601 Date
**Indexes**: Yes (composite with status)
**Usage**: Find overdue or upcoming follow-ups
```javascript
db.followups.find({ followUpDate: { $lt: new Date() } }) // Overdue
```

#### `followUpTime` (String, Optional)
**Purpose**: Specific time for the follow-up
**Format**: HH:MM (24-hour format)
**Validation**: Regex pattern: `^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$`
**Example**: "14:30", "09:00"
**Usage**: Schedule call/meeting blocks

#### `status` (String, Enum)
**Possible Values**:
- `"Pending"` - Not yet started (default)
- `"In Progress"` - Currently being worked on
- `"Completed"` - Successfully finished
- `"Rescheduled"` - Moved to different date
- `"Cancelled"` - No longer needed

**Indexes**: Yes
**Analytics**: Critical for reporting
```javascript
// Get all pending follow-ups
db.followups.find({ status: "Pending" })
```

#### `completedAt` (Date, Optional)
**Purpose**: Timestamp when follow-up was marked as completed
**Auto-Set**: By `complete()` method
**Usage**: Calculate time-to-completion metrics

### Basic Information

#### `communicationType` (String, Enum)
**Purpose**: Method used for the follow-up communication
```
Enum: ["call", "email", "sms", "whatsapp", "in_person", "video_call"]
```
**Default**: "call"
**Indexes**: Yes (useful for channel analytics)
**Usage**: Filter follow-ups by communication method
```javascript
// Get all pending calls
db.followups.find({ communicationType: "call", status: "Pending" })
```

#### `remark` (String, Optional)
**Purpose**: Brief summary of the follow-up purpose
**Max Length**: 2000 characters
**Full-Text Indexed**: Yes
**Example**: "Follow up on quotation submission"

#### `conversationDetails` (String, Optional)
**Purpose**: Detailed notes about what was discussed
**Max Length**: 5000 characters
**Full-Text Indexed**: Yes
**Example**: "Customer mentioned budget approval pending. Interested in Q3 implementation."

### Advanced CRM Fields

#### `priority` (String, Enum)
**Purpose**: Importance level for task management
```
Enum: ["low", "medium", "high", "critical"]
```
**Default**: "medium"
**Indexes**: Yes (for high-priority filtering)
**Usage**: 
```javascript
// Get all critical overdue follow-ups
db.followups.find({ 
  priority: "critical", 
  overdue: true 
})
```
**Why Important**: Helps teams focus on most important tasks

#### `assignedTo` (ObjectId, Reference to User)
**Purpose**: User responsible for this follow-up
**Reference**: User collection
**Indexes**: Yes (composite with status)
**Null Behavior**: Can be unassigned initially
**Usage**: Track workload per team member
```javascript
// Get all pending follow-ups assigned to a user
db.followups.find({ 
  assignedTo: ObjectId("65a2234567890abcdef12346"),
  status: "Pending" 
})
```

#### `createdBy` (ObjectId, Reference to User)
**Purpose**: User who created the follow-up
**Reference**: User collection
**Indexes**: Yes (audit trail)
**Required**: Yes
**Usage**: Track who created what
```javascript
// Get all follow-ups created by a user
db.followups.find({ createdBy: ObjectId("65a3234567890abcdef12347") })
```

### Follow-Up Chain & History

#### `nextFollowUp` (Nested Document)
**Purpose**: Plan the next follow-up before current one is done
**Fields**:
```javascript
{
  followUpDate: Date,
  followUpTime: String,
  notes: String
}
```
**Usage**: Pre-plan follow-up chain without creating multiple records yet
```javascript
// Create initial follow-up with next one planned
const followUp = new FollowUp({
  followUpDate: new Date(),
  nextFollowUp: {
    followUpDate: new Date(Date.now() + 7*24*60*60*1000),
    notes: "Check on decision"
  }
});
```

#### `followUpHistory` (Nested Document)
**Purpose**: Track what happened to previous scheduled follow-ups
**Fields**:
```javascript
{
  previousFollowUpId: ObjectId,
  previousStatus: String,
  previousDate: Date,
  rescheduleReason: String,
  rescheduledAt: Date,
  rescheduledBy: ObjectId
}
```
**Usage**: Understand follow-up journey
```javascript
// Find all rescheduled follow-ups
db.followups.find({ "followUpHistory.previousFollowUpId": { $exists: true } })
```

### Overdue & Reminders

#### `overdue` (Boolean)
**Purpose**: Tracks if follow-up is past its scheduled date
**Default**: false
**Auto-Updated**: Yes (in pre-save middleware)
**Indexes**: Yes (critical for dashboards)
**Usage**: 
```javascript
// Get all overdue follow-ups
db.followups.find({ overdue: true, status: { $ne: "Completed" } })
```

#### `daysOverdue` (Number)
**Purpose**: How many days past the scheduled date
**Auto-Calculated**: Yes
**Usage**: Severity measurement
```javascript
// Get most overdue follow-ups
db.followups.find({ overdue: true }).sort({ daysOverdue: -1 })
```

#### `reminderSettings` (Nested Document)
**Purpose**: Configure automatic reminders for follow-ups
**Structure**:
```javascript
{
  enabled: Boolean,                    // Default: true
  remindBefore: Number (1,7,14,30),  // Days before follow-up
  reminderType: String,                // "email", "sms", "notification", "all"
  reminderSent: Boolean,               // Default: false
  reminderSentAt: Date,                // When reminder was sent
  repeatReminder: String               // "once", "daily", "weekly"
}
```
**Usage**: Configure reminder behavior per follow-up
```javascript
// Create follow-up with email reminder 7 days before
const followUp = new FollowUp({
  followUpDate: new Date(Date.now() + 30*24*60*60*1000),
  reminderSettings: {
    enabled: true,
    remindBefore: 7,
    reminderType: "email",
    repeatReminder: "once"
  }
});
```
**Index**: Composite with followUpDate for efficient reminder queries

### Tags & Attachments

#### `tags` (Array of Strings)
**Purpose**: Flexible categorization system
**Max Length Per Tag**: 50 characters
**Full-Text**: Indexed individually
**Examples**: ["hot-lead", "follow-up", "sales", "urgent"]
**Usage**: Filter follow-ups by category
```javascript
// Get all follow-ups tagged with "sales"
db.followups.find({ tags: "sales" })
```
**Why**: More flexible than fixed categories

#### `attachments` (Array of Nested Documents)
**Purpose**: Store files related to follow-up
**Structure Per Attachment**:
```javascript
{
  fileName: String,           // "proposal.pdf"
  fileUrl: String,            // Full URL to file
  fileType: String,           // "pdf", "docx", "image"
  fileSize: Number,           // In bytes
  uploadedBy: ObjectId,       // Reference to User
  uploadedAt: Date,           // When uploaded
  description: String         // What file is about
}
```
**Usage**: Attach documents without separate storage
```javascript
// Add attachment using method
followUp.addAttachment(
  "proposal.pdf",
  "https://crm.example.com/files/proposal_123.pdf",
  "pdf",
  userId,
  "Updated proposal with discount"
);
```

### Activity & Audit Trail

#### `activityLogs` (Array of Nested Documents)
**Purpose**: Complete audit trail of all changes
**Structure Per Log**:
```javascript
{
  timestamp: Date,
  action: Enum,               // "created", "updated", "status_changed", 
                              // "assigned", "reopened", "commented", "completed"
  performedBy: ObjectId,      // Reference to User
  previousValue: Mixed,       // Old value (if applicable)
  newValue: Mixed,            // New value (if applicable)
  description: String         // Human-readable description
}
```
**Auto-Logging**: Enabled for most changes via middleware
**Usage**: Track complete change history
```javascript
// Get all changes made to a follow-up
db.followups.findById(id).then(fu => console.log(fu.activityLogs))

// Find all follow-ups modified by a user
db.followups.find({ "activityLogs.performedBy": userId })
```
**Compliance**: Supports audit requirements

### Metadata for Analytics

#### `duration` (Number)
**Purpose**: How long the follow-up took (in minutes)
**Usage**: Calculate productivity metrics
```javascript
// Average follow-up duration per user
db.followups.aggregate([
  { $group: { _id: "$assignedTo", avgDuration: { $avg: "$duration" } } }
])
```

#### `outcome` (String, Enum)
**Purpose**: Result of the follow-up
```
Enum: ["positive", "neutral", "negative", "pending"]
```
**Default**: "pending"
**Usage**: Track conversation outcomes
```javascript
// Success rate calculation
db.followups.aggregate([
  { $match: { status: "Completed" } },
  { $group: { _id: "$outcome", count: { $sum: 1 } } }
])
```

#### `leadScore` (Number)
**Purpose**: Qualification score for the related lead (0-100)
**Range**: 0-100
**Usage**: Prioritize sales efforts
```javascript
// Get high-scoring leads
db.followups.find({ leadScore: { $gte: 80 } })
```

#### `conversionProbability` (Number)
**Purpose**: Estimated chance of conversion (0-100%)
**Range**: 0-100
**Usage**: Pipeline forecasting
```javascript
// Weighted pipeline value
db.followups.aggregate([
  { $match: { status: "Pending" } },
  { $group: {
      _id: null,
      totalValue: { 
        $sum: { $multiply: ["$customFields.dealValue", { $divide: ["$conversionProbability", 100] }] }
      }
    }
  }
])
```

#### `nextActionRequired` (String, Enum)
**Purpose**: Whether more action is needed
```
Enum: ["yes", "no", "pending"]
```
**Default**: "pending"
**Usage**: Identify follow-ups needing escalation

#### `notes` (Object)
**Purpose**: Separate internal and external notes
**Structure**:
```javascript
{
  internal: String,  // Not visible to customer
  external: String   // Visible to customer
}
```
**Usage**: Keep private notes separate from customer-facing info
```javascript
// Get all follow-ups with internal notes
db.followups.find({ "notes.internal": { $exists: true, $ne: null } })
```

#### `customFields` (Mixed/Object)
**Purpose**: Flexible storage for CRM-specific data
**Type**: MongoDB Mixed type
**Flexibility**: Store any JSON structure
**Usage**: Extend schema without migration
```javascript
customFields: {
  productInterest: "CRM Suite",
  budgetApproved: true,
  decisionMaker: "CEO",
  contractValue: 50000,
  renewalDate: "2027-06-01"
}
```
**Why**: Allows customization per organization

### Timestamps

#### `createdAt` (Date, Auto-managed)
**Purpose**: When the follow-up was created
**Default**: Current time
**Auto-managed**: By Mongoose with timestamps option
**Indexes**: Yes (reverse for recent follow-ups)
**Usage**: Chronological ordering

#### `updatedAt` (Date, Auto-managed)
**Purpose**: When the follow-up was last updated
**Default**: Current time
**Auto-updated**: Automatically on any change
**Usage**: Track freshness of data

---

## Data Types & Validation

### String Validations

#### Email Validation
```javascript
// In related User reference
email: {
  type: String,
  validate: {
    validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: "Invalid email format"
  }
}
```

#### Time Format Validation
```javascript
followUpTime: {
  type: String,
  validate: {
    validator: function(value) {
      return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
    },
    message: "Follow-up time must be in HH:MM format"
  }
}
```

#### Date Validation
```javascript
followUpDate: {
  type: Date,
  required: [true, "Follow-up date is required"],
  validate: {
    validator: function(value) {
      return value > new Date();
    },
    message: "Follow-up date must be in the future"
  }
}
```

### Numeric Ranges
```javascript
// Lead score (0-100)
leadScore: {
  type: Number,
  min: 0,
  max: 100
}

// Conversion probability (0-100)
conversionProbability: {
  type: Number,
  min: 0,
  max: 100
}
```

---

## Indexes for Performance

### Why Indexes Matter
Indexes dramatically improve query performance:
- Without index: MongoDB scans every document (COLLSCAN)
- With index: MongoDB uses B-tree for fast lookup (IXSCAN)
- Can reduce query time from 100ms to 1ms

### Index Strategy

#### 1. **Single Field Indexes** (Fast filtering)
```javascript
// Status filtering
followUpSchema.index({ status: 1 });

// Priority-based sorting
followUpSchema.index({ priority: 1 });

// Assignment queries
followUpSchema.index({ assignedTo: 1 });

// User audit trail
followUpSchema.index({ createdBy: 1 });

// Tag filtering
followUpSchema.index({ tags: 1 });

// Recent records
followUpSchema.index({ createdAt: -1 });

// Overdue tracking
followUpSchema.index({ overdue: 1 });
```

#### 2. **Composite Indexes** (Multi-field queries)
```javascript
// Most common query: User's pending follow-ups
followUpSchema.index({ assignedTo: 1, status: 1 });
// Indexes: (assignedTo, status) or just status won't work here

// Find overdue follow-ups for dashboard
followUpSchema.index({ followUpDate: 1, status: 1 });

// Priority overdue query
followUpSchema.index({ priority: 1, overdue: 1 });

// Entity follow-ups (polymorph)
followUpSchema.index({ relatedId: 1, relatedType: 1 });

// Complex filtering with three fields
followUpSchema.index({ followUpDate: 1, overdue: 1, status: 1 });

// Reminder processing
followUpSchema.index({ "reminderSettings.enabled": 1, followUpDate: 1 });

// User activity tracking
followUpSchema.index({ createdBy: 1, createdAt: -1 });

// Audit log filtering
followUpSchema.index({ "activityLogs.performedBy": 1 });
```

#### 3. **Text Indexes** (Full-text search)
```javascript
followUpSchema.index({
  remark: "text",
  conversationDetails: "text",
  "notes.internal": "text",
  "notes.external": "text"
});

// Usage:
db.followups.find({ $text: { $search: "implementation" } })
```

### Query Examples & Which Index is Used

```javascript
// Query 1: Simple status filter
db.followups.find({ status: "Pending" })
// Index used: { status: 1 }

// Query 2: User's pending work
db.followups.find({ assignedTo: userId, status: "Pending" })
// Index used: { assignedTo: 1, status: 1 }

// Query 3: Overdue follow-ups for dashboard
db.followups.find({ followUpDate: { $lt: new Date() }, status: { $ne: "Completed" } })
// Index used: { followUpDate: 1, status: 1 }

// Query 4: Entity follow-ups
db.followups.find({ relatedId: leadId, relatedType: "Lead" })
// Index used: { relatedId: 1, relatedType: 1 }

// Query 5: Full-text search
db.followups.find({ $text: { $search: "budget" } })
// Index used: text index on remark and conversationDetails

// Query 6: Reminder processing
db.followups.find({ 
  "reminderSettings.enabled": true, 
  followUpDate: { $gte: new Date(), $lte: new Date(Date.now() + 24*60*60*1000) } 
})
// Index used: { "reminderSettings.enabled": 1, followUpDate: 1 }
```

### Analyzing Index Usage
```javascript
// Explain query execution
db.followups.find({ assignedTo: userId }).explain("executionStats")

// Check all indexes on collection
db.followups.getIndexes()

// Get index statistics
db.followups.aggregate([{ $indexStats: {} }])
```

---

## Virtual Fields

Virtual fields compute values on-the-fly without storing them.

### 1. **`daysUntil`** - Countdown to follow-up
```javascript
followUpSchema.virtual("daysUntil").get(function () {
  const now = new Date();
  const diff = this.followUpDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Usage:
const followUp = await FollowUp.findById(id);
console.log(followUp.daysUntil); // Output: 3 (3 days until follow-up)
```

### 2. **`isDueToday`** - Check if due today
```javascript
followUpSchema.virtual("isDueToday").get(function () {
  const today = new Date();
  return (
    this.followUpDate.getFullYear() === today.getFullYear() &&
    this.followUpDate.getMonth() === today.getMonth() &&
    this.followUpDate.getDate() === today.getDate()
  );
});

// Usage:
if (followUp.isDueToday) {
  sendDailyDigest();
}
```

### 3. **`isOverdue`** - Check overdue status
```javascript
followUpSchema.virtual("isOverdue").get(function () {
  return this.followUpDate < new Date() && this.status !== "Completed";
});
```

### 4. **`ageInDays`** - How old is this follow-up
```javascript
followUpSchema.virtual("ageInDays").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Usage: Identify stale follow-ups
const staleFollowUps = allFollowUps.filter(fu => fu.ageInDays > 30);
```

### Enabling Virtual Fields in JSON Output
```javascript
// Include virtuals when converting to JSON
followUpSchema.set("toJSON", { virtuals: true });
followUpSchema.set("toObject", { virtuals: true });

// Now virtuals are included in API responses
app.get("/api/followups/:id", async (req, res) => {
  const followUp = await FollowUp.findById(req.params.id);
  res.json(followUp); // Includes virtuals like daysUntil, isDueToday
});
```

---

## Methods & Statics

### Instance Methods (Used on saved documents)

#### `reschedule(newDate, newTime, reason, rescheduledBy)`
Reschedule a follow-up with full history tracking
```javascript
// Usage:
const followUp = await FollowUp.findById(followUpId);
await followUp.reschedule(
  new Date(Date.now() + 7*24*60*60*1000),
  "14:30",
  "Customer requested postponement",
  userId
);

// What it does:
// 1. Saves current state to followUpHistory
// 2. Updates followUpDate and followUpTime
// 3. Sets status to "Rescheduled"
// 4. Clears overdue flag
// 5. Adds activity log entry
// 6. Saves changes to database
```

#### `complete(completedBy, outcome)`
Mark follow-up as completed with outcome tracking
```javascript
// Usage:
const followUp = await FollowUp.findById(followUpId);
await followUp.complete(userId, "positive");

// What it does:
// 1. Sets status to "Completed"
// 2. Records completedAt timestamp
// 3. Stores outcome (positive/neutral/negative)
// 4. Logs activity entry
// 5. Saves changes

// Possible outcomes:
// - "positive": Successful conversation, prospect interested
// - "neutral": Information exchanged, uncertain prospect
// - "negative": Negative feedback, prospect disqualified
// - "pending": Not yet completed
```

#### `addComment(text, commentedBy)`
Add a comment/internal note
```javascript
// Usage:
const followUp = await FollowUp.findById(followUpId);
await followUp.addComment(
  "Customer mentioned interest in premium tier",
  userId
);

// What it does:
// 1. Creates activity log entry with action: "commented"
// 2. Stores comment text
// 3. Records who made the comment and when
// 4. Saves to database
```

#### `addAttachment(fileName, fileUrl, fileType, uploadedBy, description)`
Attach a file to the follow-up
```javascript
// Usage:
const followUp = await FollowUp.findById(followUpId);
await followUp.addAttachment(
  "proposal_signed.pdf",
  "https://storage.example.com/files/proposal_123.pdf",
  "pdf",
  userId,
  "Signed proposal from customer"
);

// What it does:
// 1. Creates attachment object
// 2. Adds to attachments array
// 3. Logs activity entry
// 4. Saves changes
```

### Static Methods (Called on Model)

#### `getOverdueFollowUps(filters)`
Get all overdue follow-ups
```javascript
// Usage - Get all overdue follow-ups:
const overdue = await FollowUp.getOverdueFollowUps();

// With filters - Get overdue critical follow-ups:
const criticalOverdue = await FollowUp.getOverdueFollowUps({ 
  priority: "critical" 
});

// For specific user:
const userOverdue = await FollowUp.getOverdueFollowUps({
  assignedTo: userId
});
```

#### `getDueTodayFollowUps()`
Get follow-ups due today
```javascript
// Usage:
const todayFollowUps = await FollowUp.getDueTodayFollowUps();

// Perfect for daily digest emails
sendDailyDigest(todayFollowUps);
```

#### `getByAssignee(userId, status)`
Get follow-ups assigned to a user
```javascript
// Usage - All follow-ups for a user:
const userFollowUps = await FollowUp.getByAssignee(userId);

// Pending follow-ups only:
const pending = await FollowUp.getByAssignee(userId, "Pending");

// In Progress follow-ups:
const inProgress = await FollowUp.getByAssignee(userId, "In Progress");

// Returns: Sorted by followUpDate
```

#### `getAnalytics(startDate, endDate, groupBy)`
Get analytics/metrics data
```javascript
// Usage - Success rate over time:
const analytics = await FollowUp.getAnalytics(
  "2026-01-01",
  "2026-05-31",
  "outcome"
);
// Returns: [
//   { _id: "positive", count: 45, avgDaysOverdue: 2 },
//   { _id: "negative", count: 12, avgDaysOverdue: 8 }
// ]

// By status:
const byStatus = await FollowUp.getAnalytics(
  "2026-01-01",
  "2026-05-31",
  "status"
);

// By communication type:
const byChannel = await FollowUp.getAnalytics(
  "2026-01-01",
  "2026-05-31",
  "communicationType"
);
// Returns: [
//   { _id: "call", count: 156, avgDaysOverdue: 1 },
//   { _id: "email", count: 89, avgDaysOverdue: 5 }
// ]
```

### Middleware (Automatic behavior)

#### Pre-Save Middleware
```javascript
// Automatically called before every save:
// 1. Calculates overdue status
// 2. Calculates daysOverdue
// 3. Adds activity log for updates
// 4. Validates timestamps
```

#### Pre-Find Middleware
```javascript
// Automatically called on any find query:
// 1. Populates User references (assignedTo, createdBy)
// 2. Populates relatedId (Lead, Quotation, Customer, Order)
// 3. Populates activity log users
// 4. Populates attachment upload users

// This means when you fetch a follow-up, you automatically get:
const followUp = await FollowUp.findById(id);
followUp.assignedTo.name // User name (populated)
followUp.createdBy.email // Creator email (populated)
followUp.activityLogs[0].performedBy.name // Activity performer name
```

---

## Usage Examples

### Creating a Follow-Up

#### Basic Creation
```javascript
const followUp = new FollowUp({
  relatedType: "Lead",
  relatedId: new mongoose.Types.ObjectId("65a1234567890abcdef12345"),
  followUpDate: new Date(Date.now() + 3*24*60*60*1000), // 3 days from now
  followUpTime: "14:30",
  communicationType: "call",
  remark: "Check on proposal interest",
  createdBy: userId,
  priority: "high"
});

await followUp.save();
```

#### With Full Options
```javascript
const followUp = await FollowUp.create({
  relatedType: "Lead",
  relatedId: leadId,
  followUpDate: new Date(Date.now() + 3*24*60*60*1000),
  followUpTime: "14:30",
  communicationType: "call",
  priority: "high",
  assignedTo: salesRepId,
  createdBy: adminId,
  remark: "Follow up on budget approval",
  tags: ["sales", "hot-lead"],
  reminderSettings: {
    enabled: true,
    remindBefore: 1,
    reminderType: "email"
  },
  notes: {
    internal: "Customer very interested, CEO attending",
    external: "We're excited to discuss your needs"
  },
  customFields: {
    dealSize: "Enterprise",
    expectedCloseDate: "2026-07-31",
    budgetApproved: true
  }
});
```

### Querying Follow-Ups

#### Find Pending Follow-Ups
```javascript
const pending = await FollowUp.find({ 
  status: "Pending" 
}).sort({ followUpDate: 1 });
```

#### Get User's Workload
```javascript
const userWorkload = await FollowUp.find({
  assignedTo: userId,
  status: { $ne: "Completed" }
}).sort({ priority: -1, followUpDate: 1 });
```

#### Find Overdue Follow-Ups
```javascript
const overdue = await FollowUp.getOverdueFollowUps({
  assignedTo: userId,
  priority: { $in: ["high", "critical"] }
});
```

#### Get Daily Digest
```javascript
const todayFollowUps = await FollowUp.getDueTodayFollowUps();
const digest = `
  Good morning!
  You have ${todayFollowUps.length} follow-ups today:
  ${todayFollowUps.map(fu => `- ${fu.remark} at ${fu.followUpTime}`).join('\n')}
`;
```

#### Full-Text Search
```javascript
const results = await FollowUp.find({
  $text: { $search: "implementation budget" }
}).limit(10);
```

### Updating Follow-Ups

#### Update and Track
```javascript
const followUp = await FollowUp.findById(followUpId);

followUp._performedBy = userId; // For activity logging
followUp.status = "In Progress";
followUp.conversationDetails = "Customer discussed requirements";
followUp.priority = "critical";

await followUp.save(); // Auto-logs activity
```

#### Reschedule with Reason
```javascript
const followUp = await FollowUp.findById(followUpId);
await followUp.reschedule(
  new Date(Date.now() + 7*24*60*60*1000), // 7 days from now
  "15:00",
  "Customer requested postponement",
  userId
);
```

#### Mark as Completed
```javascript
const followUp = await FollowUp.findById(followUpId);
await followUp.complete(userId, "positive");
// Status: Completed
// Outcome: positive
// completedAt: current timestamp
```

#### Add Notes/Comments
```javascript
const followUp = await FollowUp.findById(followUpId);
await followUp.addComment(
  "Customer very interested, expecting PO next week",
  userId
);
```

---

## Analytics Capabilities

The schema supports advanced CRM analytics through multiple fields and aggregation pipelines.

### 1. **Conversion Funnel Analysis**
```javascript
// Track conversion from follow-up to outcome
const conversionAnalytics = await FollowUp.aggregate([
  { $match: { status: "Completed", createdAt: { $gte: startDate } } },
  { $group: {
      _id: "$outcome",
      count: { $sum: 1 },
      percentage: { $sum: 1 }
    }
  }
]);
// Returns: How many positive, neutral, negative outcomes

// Calculate conversion rate
const total = conversionAnalytics.reduce((sum, item) => sum + item.count, 0);
const positiveRate = (positiveCount / total * 100).toFixed(2) + "%";
```

### 2. **Sales Rep Performance**
```javascript
// Metrics per sales rep
const repPerformance = await FollowUp.aggregate([
  { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
  { $group: {
      _id: "$assignedTo",
      total: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
      avgDuration: { $avg: "$duration" },
      positiveRate: { 
        $avg: { $cond: [{ $eq: ["$outcome", "positive"] }, 100, 0] }
      }
    }
  },
  { $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" },
  { $project: {
      rep: "$user.name",
      total: 1,
      completed: 1,
      completionRate: { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
      avgDuration: { $round: ["$avgDuration", 0] },
      positiveRate: { $round: ["$positiveRate", 1] }
    }
  }
]);
```

### 3. **Channel Effectiveness**
```javascript
// Which communication channel works best
const channelAnalytics = await FollowUp.aggregate([
  { $match: { status: "Completed" } },
  { $group: {
      _id: "$communicationType",
      count: { $sum: 1 },
      positiveOutcome: { $sum: { $cond: [{ $eq: ["$outcome", "positive"] }, 1, 0] } },
      avgDuration: { $avg: "$duration" },
      avgConversionProb: { $avg: "$conversionProbability" }
    }
  },
  { $project: {
      channel: "$_id",
      count: 1,
      successRate: { 
        $multiply: [{ $divide: ["$positiveOutcome", "$count"] }, 100] 
      },
      avgDuration: { $round: ["$avgDuration", 0] },
      avgConversionProb: { $round: ["$avgConversionProb", 1] }
    }
  }
]);
// Shows: Call > Email > SMS in effectiveness
```

### 4. **Overdue Tracking Dashboard**
```javascript
// How overdue is the pipeline
const overdueMetrics = await FollowUp.aggregate([
  { $match: { overdue: true, status: { $ne: "Completed" } } },
  { $group: {
      _id: "$priority",
      count: { $sum: 1 },
      avgDaysOverdue: { $avg: "$daysOverdue" },
      maxDaysOverdue: { $max: "$daysOverdue" },
      assignedUsers: { $addToSet: "$assignedTo" }
    }
  }
]);
// Example result:
// { _id: "critical", count: 12, avgDaysOverdue: 4.5, maxDaysOverdue: 21 }
// { _id: "high", count: 34, avgDaysOverdue: 3.2, maxDaysOverdue: 15 }
```

### 5. **Lead Scoring Trends**
```javascript
// How lead scores change over follow-ups
const leadScoreAnalytics = await FollowUp.aggregate([
  { $match: { relatedType: "Lead" } },
  { $group: {
      _id: "$relatedId",
      avgScore: { $avg: "$leadScore" },
      count: { $sum: 1 },
      trend: { $push: { date: "$createdAt", score: "$leadScore" } }
    }
  },
  { $match: { avgScore: { $gte: 75 } } }, // High-potential leads
  { $sort: { avgScore: -1 } }
]);
```

### 6. **Next Follow-Up Forecast**
```javascript
// What's coming up
const upcomingFollowUps = await FollowUp.aggregate([
  { $match: {
      followUpDate: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 30*24*60*60*1000) // Next 30 days
      },
      status: { $ne: "Completed" }
    }
  },
  { $group: {
      _id: {
        year: { $year: "$followUpDate" },
        month: { $month: "$followUpDate" },
        week: { $week: "$followUpDate" }
      },
      count: { $sum: 1 },
      byPriority: {
        $push: {
          priority: "$priority",
          count: { $sum: 1 }
        }
      }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } }
]);
```

### 7. **Activity Audit Report**
```javascript
// Who did what and when
const auditTrail = await FollowUp.aggregate([
  { $unwind: "$activityLogs" },
  { $match: { "activityLogs.timestamp": { $gte: startDate } } },
  { $group: {
      _id: "$activityLogs.action",
      count: { $sum: 1 },
      users: { $addToSet: "$activityLogs.performedBy" }
    }
  }
]);
// Shows: Created: 145, Updated: 328, Completed: 89
```

---

## Best Practices

### 1. **Always Include Activity Tracking**
```javascript
// GOOD: Track who made the change
const followUp = await FollowUp.findById(id);
followUp._performedBy = req.user.id; // Set before save
followUp.status = "In Progress";
await followUp.save();

// BAD: No activity tracking
followUp.status = "In Progress";
await followUp.updateOne({ status: "In Progress" });
```

### 2. **Use Static Methods for Common Queries**
```javascript
// GOOD: Reusable, optimized
const userPending = await FollowUp.getByAssignee(userId, "Pending");

// BAD: Repeated code
const userPending = await FollowUp.find({ 
  assignedTo: userId, 
  status: "Pending" 
}).sort({ followUpDate: 1 });
```

### 3. **Leverage Virtuals in APIs**
```javascript
// Enable virtuals in JSON
followUpSchema.set("toJSON", { virtuals: true });

// API response automatically includes daysUntil, isDueToday, ageInDays
app.get("/api/followups/:id", async (req, res) => {
  const followUp = await FollowUp.findById(req.params.id);
  res.json(followUp); // Includes calculated fields
});
```

### 4. **Use Composition for Nested Data**
```javascript
// Instead of separate collections, use nested documents for:
// - attachments (small files, related data)
// - activityLogs (audit trails)
// - reminderSettings (configuration)
// - followUpHistory (linked data)

// This keeps related data together and improves query performance
```

### 5. **Validate External Data**
```javascript
// When creating from user input
const followUp = new FollowUp({
  ...req.body,
  createdBy: req.user.id,  // Always from authenticated user
  _performedBy: req.user.id // For activity logging
});

// Validation happens automatically via schema
try {
  await followUp.save();
} catch (error) {
  if (error.name === "ValidationError") {
    res.status(400).json({ error: error.message });
  }
}
```

### 6. **Batch Operations for Performance**
```javascript
// Mark multiple as completed
await FollowUp.updateMany(
  { _id: { $in: ids } },
  { status: "Completed", completedAt: new Date() }
);

// Add reminder to group
await FollowUp.updateMany(
  { priority: "critical", status: "Pending" },
  { "reminderSettings.remindBefore": 7 }
);
```

### 7. **Use TTL Index for Auto-Cleanup**
```javascript
// Auto-delete completed follow-ups after 1 year
followUpSchema.index(
  { completedAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);
```

### 8. **Implement Soft Deletes**
```javascript
// Instead of delete, mark as inactive
const followUpSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: mongoose.Schema.Types.ObjectId,
  deletionReason: String
});

// Always filter in queries
followUpSchema.pre(/^find/, function() {
  this.where({ isDeleted: false });
});
```

### 9. **Cache Expensive Queries**
```javascript
// Cache overdue counts for dashboards
const redis = require("redis");
const client = redis.createClient();

async function getOverdueCount(userId) {
  const cacheKey = `overdue:${userId}`;
  
  // Check cache first
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Query database
  const count = await FollowUp.countDocuments({
    assignedTo: userId,
    overdue: true,
    status: { $ne: "Completed" }
  });
  
  // Cache for 5 minutes
  await client.setex(cacheKey, 300, JSON.stringify(count));
  return count;
}
```

### 10. **Pagination for Large Result Sets**
```javascript
// Always paginate when returning lists
const page = req.query.page || 1;
const limit = req.query.limit || 20;
const skip = (page - 1) * limit;

const followUps = await FollowUp.find({ status: "Pending" })
  .skip(skip)
  .limit(limit)
  .sort({ followUpDate: 1 });

const total = await FollowUp.countDocuments({ status: "Pending" });

res.json({
  data: followUps,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
});
```

---

## Migration Guide

### Migrating from Basic Schema to Enhanced Schema

#### Step 1: Update Model File
```javascript
// Replace old FollowUp.js with FollowUpEnhanced.js
// Or gradually add fields to existing schema
```

#### Step 2: Add Missing Fields via Migration Script
```javascript
// migration.js
import mongoose from "mongoose";
import FollowUp from "./models/FollowUpEnhanced.js";

async function migrateFollowUpData() {
  // Initialize missing fields
  await FollowUp.updateMany(
    {},
    {
      $set: {
        priority: "medium",
        reminderSettings: {
          enabled: true,
          remindBefore: 1,
          reminderType: "notification"
        },
        communicationType: "call",
        tags: [],
        attachments: [],
        activityLogs: [],
        customFields: {}
      }
    },
    { multi: true }
  );

  // Backfill createdBy if missing
  await FollowUp.updateMany(
    { createdBy: { $exists: false } },
    { createdBy: defaultAdminId }
  );

  console.log("✅ Migration completed");
}
```

#### Step 3: Test Queries
```javascript
// Verify old queries still work
const allFollowUps = await FollowUp.find({});
const byStatus = await FollowUp.find({ status: "Pending" });

// Test new queries
const byPriority = await FollowUp.find({ priority: "high" });
const todayFollowUps = await FollowUp.getDueTodayFollowUps();
```

#### Step 4: Create Indexes
```javascript
// Mongoose creates indexes automatically on schema definition
// But to ensure they're created:
await FollowUp.collection.createIndexes();

// Check index creation
const indexes = await FollowUp.collection.getIndexes();
console.log(indexes);
```

---

## Summary

This enhanced Follow-Up schema provides:

✅ **Advanced CRM Features**
- Priority management
- User assignment
- Activity tracking
- Reminders
- Follow-up chains

✅ **Performance Optimized**
- 11 strategic indexes
- Text search
- Virtual fields
- Efficient queries

✅ **Analytics Ready**
- Multiple aggregation pipelines
- Conversion tracking
- Performance metrics
- Audit trails

✅ **Enterprise Grade**
- Validation rules
- Error handling
- Middleware automation
- Soft deletes support
- TTL index support

✅ **Developer Friendly**
- Static methods
- Instance methods
- Clear documentation
- Real-world examples
- Migration path

The schema is production-ready and scales from small teams to enterprise deployments.
