# Follow-Up Timeline - API Reference

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api/followup-activities`  
**Last Updated:** May 16, 2026

---

## 📚 Table of Contents

1. [Activity Logging Endpoints](#activity-logging-endpoints)
2. [Timeline Retrieval Endpoints](#timeline-retrieval-endpoints)
3. [Activity Management Endpoints](#activity-management-endpoints)
4. [Response Formats](#response-formats)
5. [Error Handling](#error-handling)
6. [Example Workflows](#example-workflows)

---

## 🔐 Authentication

All endpoints require the user to be authenticated. Include user information in request body:

```javascript
performedBy: {
  _id: "userId",           // MongoDB ObjectId
  name: "User Name",
  email: "user@company.com",
  avatar: "url/to/avatar"  // optional
}
```

---

## Activity Logging Endpoints

### 1. POST /log - Log Generic Activity

**Description:** Log any type of activity with complete control over structure

**Request:**
```http
POST /api/followup-activities/log
Content-Type: application/json

{
  "followUpId": "65a1234567890abcdef12345",
  "activityType": "note_added",                    // Required
  "category": "note",                              // Optional, auto-set if omitted
  "performedBy": {                                 // Required
    "_id": "user_001",
    "name": "Ahmed Hassan",
    "email": "ahmed@company.com",
    "avatar": "url/to/avatar"
  },
  "title": "Note added",                           // Optional, auto-generated if omitted
  "description": "Customer feedback recorded",
  "noteActivity": {                                // Activity-specific data
    "noteType": "internal",
    "content": "Very interested in premium plan",
    "mentions": ["user_002"],
    "tags": ["premium", "interested"]
  },
  "sentiment": "positive",                         // positive, neutral, negative
  "impact": "high",                                // high, medium, low
  "visibility": "internal",                        // internal, customer_visible
  "tags": ["important", "follow-up"],
  "metadata": {                                    // Custom data
    "customField": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activity logged successfully",
  "data": {
    "_id": "65a1234567890abcdef12360",
    "followUpId": "65a1234567890abcdef12345",
    "activityType": "note_added",
    "category": "note",
    "title": "Note added",
    "timestamp": "2026-05-16T10:30:00Z",
    "performedBy": {
      "_id": "user_001",
      "name": "Ahmed Hassan",
      "email": "ahmed@company.com"
    },
    "icon": "📝",
    "color": "#8b5cf6",
    "formattedDate": "May 16, 2026",
    "formattedTime": "10:30 AM"
  }
}
```

**Status Codes:**
- `201` - Activity created successfully
- `400` - Missing required fields
- `404` - Follow-up not found
- `500` - Server error

---

### 2. POST /:followUpId/call - Log Call Activity

**Description:** Log a phone call with detailed information

**Request:**
```http
POST /api/followup-activities/65a1234567890abcdef12345/call
Content-Type: application/json

{
  "duration": 480,                               // seconds (required)
  "outcome": "answered",                         // answered, missed, no_answer, declined, voicemail
  "callType": "outbound",                        // inbound, outbound, conference (default: outbound)
  "performedBy": {                               // required
    "_id": "user_001",
    "name": "Ahmed Hassan",
    "email": "ahmed@company.com"
  },
  "participants": [                              // optional
    {
      "name": "Customer Name",
      "phone": "+966501234567",
      "email": "customer@example.com"
    }
  ],
  "recordingUrl": "url/to/recording",           // optional
  "notes": "Great conversation, customer interested",
  "sentiment": "positive"                        // positive, neutral, negative
}
```

**Response:**
```json
{
  "success": true,
  "message": "Call activity logged",
  "data": {
    "_id": "65a1234567890abcdef12361",
    "activityType": "call_made",
    "category": "communication",
    "title": "Call - Answered",
    "description": "Call made with duration 8 minutes",
    "icon": "☎️",
    "color": "#ef4444",
    "callActivity": {
      "duration": 480,
      "outcome": "answered",
      "callType": "outbound",
      "participants": [...],
      "notes": "Great conversation, customer interested",
      "sentiment": "positive"
    }
  }
}
```

---

### 3. POST /:followUpId/email - Log Email Activity

**Description:** Log sent or received emails

**Request:**
```http
POST /api/followup-activities/65a1234567890abcdef12345/email
Content-Type: application/json

{
  "subject": "Premium Package Details",         // required
  "recipients": [                                // required
    {
      "email": "customer@example.com",
      "name": "Customer Name",
      "type": "to"                              // to, cc, bcc
    }
  ],
  "direction": "sent",                          // sent, received (required)
  "performedBy": {                              // required
    "_id": "user_001",
    "name": "Ahmed Hassan",
    "email": "ahmed@company.com"
  },
  "emailBody": "Dear Customer, ...",            // optional but recommended
  "attachments": [                              // optional
    {
      "fileName": "Proposal.pdf",
      "fileSize": 2500000,
      "fileType": "pdf"
    }
  ],
  "status": "sent"                              // sent, failed, bounced, spam (default: sent)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email activity logged",
  "data": {
    "_id": "65a1234567890abcdef12362",
    "activityType": "email_sent",
    "category": "communication",
    "title": "Email - Premium Package Details",
    "description": "Email sent - 1 recipient(s)",
    "icon": "📧",
    "emailActivity": {
      "subject": "Premium Package Details",
      "recipients": [...],
      "direction": "sent",
      "attachments": [...]
    }
  }
}
```

---

### 4. POST /:followUpId/whatsapp - Log WhatsApp Activity

**Description:** Log WhatsApp messages

**Request:**
```http
POST /api/followup-activities/65a1234567890abcdef12345/whatsapp
Content-Type: application/json

{
  "messageType": "text",                        // text, image, document, audio, video, voice_note
  "messageBody": "Great! Looking forward to partnership",
  "direction": "sent",                          // sent, received
  "performedBy": {                              // required
    "_id": "user_001",
    "name": "Ahmed Hassan",
    "email": "ahmed@company.com"
  },
  "recipientPhone": "+966501234567",           // required
  "recipientName": "Customer Name",            // optional
  "messageStatus": "read",                     // sent, delivered, read, failed
  "mediaUrl": "url/to/media",                 // for non-text messages
  "mediaCaption": "caption text"               // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp activity logged",
  "data": {
    "_id": "65a1234567890abcdef12363",
    "activityType": "whatsapp_sent",
    "category": "communication",
    "title": "WhatsApp - Text",
    "icon": "💬",
    "whatsappActivity": {
      "messageType": "text",
      "messageBody": "...",
      "direction": "sent",
      "messageStatus": "read"
    }
  }
}
```

---

### 5. POST /:followUpId/meeting - Log Meeting Activity

**Description:** Log meetings (in-person, video, etc.)

**Request:**
```http
POST /api/followup-activities/65a1234567890abcdef12345/meeting
Content-Type: application/json

{
  "meetingType": "video_call",                 // in_person, video_call, phone, virtual_meeting
  "duration": 45,                              // minutes
  "performedBy": {                             // required
    "_id": "user_001",
    "name": "Ahmed Hassan",
    "email": "ahmed@company.com"
  },
  "attendees": [                               // optional
    {
      "userId": "user_001",
      "name": "Ahmed Hassan",
      "email": "ahmed@company.com",
      "role": "organizer"
    },
    {
      "name": "Customer Name",
      "email": "customer@example.com",
      "role": "participant"
    }
  ],
  "location": "Office Room 5",                // optional
  "meetingLink": "https://meet.example.com/session123",
  "agenda": "Product demo and Q&A",
  "summary": "Successful demo, customer very interested",
  "outcomes": [                               // optional
    "Reviewed all features",
    "Answered technical questions",
    "Customer committed to decision by May 28"
  ],
  "nextSteps": [                              // optional
    "Send meeting minutes",
    "Prepare contract draft"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meeting activity logged",
  "data": {
    "_id": "65a1234567890abcdef12364",
    "activityType": "meeting_scheduled",
    "category": "communication",
    "title": "Meeting - Video Call",
    "icon": "📅",
    "meetingActivity": {
      "meetingType": "video_call",
      "duration": 45,
      "attendees": [...],
      "summary": "...",
      "outcomes": [...]
    }
  }
}
```

---

### 6. POST /:followUpId/note - Log Note Activity

**Description:** Log internal or customer-visible notes

**Request:**
```http
POST /api/followup-activities/65a1234567890abcdef12345/note
Content-Type: application/json

{
  "content": "Customer confirmed interest in enterprise plan",  // required
  "noteType": "internal",                      // internal, external, client_visible
  "performedBy": {                             // required
    "_id": "user_001",
    "name": "Ahmed Hassan",
    "email": "ahmed@company.com"
  },
  "mentions": [                                // optional - user IDs
    "user_002",
    "user_003"
  ],
  "tags": [                                    // optional
    "enterprise",
    "confirmed",
    "pricing_discussion"
  ],
  "visibility": "internal",                   // internal, customer_visible
  "attachments": [                            // optional
    {
      "fileName": "Notes.txt",
      "fileUrl": "url/to/file"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note activity logged",
  "data": {
    "_id": "65a1234567890abcdef12365",
    "activityType": "note_added",
    "category": "note",
    "title": "Note added",
    "icon": "📝",
    "noteActivity": {
      "noteType": "internal",
      "content": "...",
      "mentions": ["user_002", "user_003"],
      "tags": ["enterprise", "confirmed", "pricing_discussion"]
    }
  }
}
```

---

### 7. POST /:followUpId/status-change - Log Status Change

**Description:** Log follow-up status changes

**Request:**
```http
POST /api/followup-activities/65a1234567890abcdef12345/status-change
Content-Type: application/json

{
  "previousStatus": "Pending",                 // required
  "newStatus": "In Progress",                  // required - Pending, In Progress, Completed, Rescheduled, Cancelled
  "performedBy": {                             // required
    "_id": "user_001",
    "name": "Ahmed Hassan",
    "email": "ahmed@company.com"
  },
  "reason": "Customer callback scheduled",
  "changeReason": "user_request"              // schedule_change, user_request, auto_reschedule, completion, cancellation
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status change activity logged",
  "data": {
    "_id": "65a1234567890abcdef12366",
    "activityType": "status_changed",
    "category": "status",
    "title": "Status changed from Pending to In Progress",
    "icon": "🔄",
    "statusChangeActivity": {
      "previousStatus": "Pending",
      "newStatus": "In Progress",
      "reason": "..."
    }
  }
}
```

---

## Timeline Retrieval Endpoints

### 8. GET /:followUpId/timeline - Get Complete Timeline

**Description:** Retrieve all activities for a follow-up with pagination

**Request:**
```http
GET /api/followup-activities/65a1234567890abcdef12345/timeline?limit=100&skip=0&startDate=2026-05-01&endDate=2026-05-31
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 100 | Items per page (max 500) |
| skip | number | 0 | Number of items to skip |
| startDate | date | - | Filter from date (ISO 8601) |
| endDate | date | - | Filter to date (ISO 8601) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1234567890abcdef12360",
      "followUpId": "65a1234567890abcdef12345",
      "activityType": "call_made",
      "title": "Call - Answered",
      "timestamp": "2026-05-16T14:15:00Z",
      "formattedDate": "May 16, 2026",
      "formattedTime": "14:15 PM",
      "performedBy": {...},
      "callActivity": {...}
    },
    {...}
  ],
  "pagination": {
    "total": 25,
    "limit": 100,
    "skip": 0,
    "pages": 1
  }
}
```

---

### 9. GET /:followUpId/grouped - Get Timeline Grouped by Date

**Description:** Retrieve timeline with activities grouped by date

**Request:**
```http
GET /api/followup-activities/65a1234567890abcdef12345/grouped
```

**Response:**
```json
{
  "success": true,
  "data": {
    "May 16, 2026": [
      {
        "_id": "65a1234567890abcdef12360",
        "title": "Call - Answered",
        "timestamp": "2026-05-16T14:15:00Z"
      },
      {...}
    ],
    "May 15, 2026": [
      {...}
    ]
  },
  "total": 15
}
```

---

### 10. GET /:followUpId/category/:category - Get Activities by Category

**Description:** Filter activities by specific category

**Request:**
```http
GET /api/followup-activities/65a1234567890abcdef12345/category/communication?limit=50
```

**Categories:**
- `communication` - Calls, emails, WhatsApp, meetings
- `status` - Status changes, priority changes
- `note` - Notes and comments
- `file` - Attachments
- `assignment` - User assignments
- `reminder` - Reminders
- `system` - System actions

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "activityType": "call_made",
      "category": "communication",
      ...
    },
    {
      "_id": "...",
      "activityType": "email_sent",
      "category": "communication",
      ...
    }
  ],
  "category": "communication",
  "total": 5
}
```

---

### 11. GET /:followUpId/summary - Get Activity Summary

**Description:** Get count of activities by type

**Request:**
```http
GET /api/followup-activities/65a1234567890abcdef12345/summary
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "call_made",
      "count": 3,
      "lastActivity": "2026-05-16T14:15:00Z"
    },
    {
      "_id": "email_sent",
      "count": 2,
      "lastActivity": "2026-05-15T11:30:00Z"
    },
    {
      "_id": "note_added",
      "count": 5,
      "lastActivity": "2026-05-16T10:00:00Z"
    }
  ],
  "total": 10
}
```

---

### 12. GET /:followUpId/stats - Get Activity Statistics

**Description:** Get detailed activity statistics for a date range

**Request:**
```http
GET /api/followup-activities/65a1234567890abcdef12345/stats?startDate=2026-05-01&endDate=2026-05-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "_id": {
          "date": "2026-05-16",
          "category": "communication"
        },
        "count": 3
      },
      {
        "_id": {
          "date": "2026-05-16",
          "category": "note"
        },
        "count": 2
      }
    ],
    "summary": {
      "total": 15,
      "byCategory": {
        "communication": 5,
        "note": 4,
        "status": 3,
        "file": 2,
        "reminder": 1
      }
    }
  }
}
```

---

### 13. GET /entity/:relatedType/:relatedId - Get Entity Timeline

**Description:** Get all activities for a Lead, Customer, Quotation, or Order

**Request:**
```http
GET /api/followup-activities/entity/Lead/lead_001?limit=100&skip=0
```

**Related Types:**
- `Lead`
- `Customer`
- `Quotation`
- `Order`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "followUpId": "...",
      "relatedType": "Lead",
      "activityType": "call_made",
      ...
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 100,
    "skip": 0
  }
}
```

---

### 14. GET / - Get Recent Activities

**Description:** Get recent activities across all follow-ups

**Request:**
```http
GET /api/followup-activities?limit=50&hours=24
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Number of activities |
| hours | number | 24 | Time period in hours |

**Response:**
```json
{
  "success": true,
  "data": [
    {...},
    {...}
  ],
  "total": 12
}
```

---

## Activity Management Endpoints

### 15. GET /:activityId - Get Single Activity

**Description:** Retrieve a specific activity by ID

**Request:**
```http
GET /api/followup-activities/65a1234567890abcdef12360
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1234567890abcdef12360",
    "followUpId": "...",
    "activityType": "call_made",
    "title": "Call - Answered",
    "timestamp": "2026-05-16T14:15:00Z",
    "performedBy": {...},
    "callActivity": {...}
  }
}
```

---

### 16. PATCH /:activityId - Update Activity

**Description:** Update an activity's visibility, tags, or metadata

**Request:**
```http
PATCH /api/followup-activities/65a1234567890abcdef12360
Content-Type: application/json

{
  "visibility": "customer_visible",
  "tags": ["important", "follow-up"],
  "metadata": {
    "customField": "newValue"
  },
  "editedBy": "user_001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activity updated",
  "data": {
    "_id": "65a1234567890abcdef12360",
    "visibility": "customer_visible",
    "tags": ["important", "follow-up"],
    "metadata": {...}
  }
}
```

---

### 17. DELETE /:activityId - Delete Activity

**Description:** Delete an activity

**Request:**
```http
DELETE /api/followup-activities/65a1234567890abcdef12360
```

**Response:**
```json
{
  "success": true,
  "message": "Activity deleted successfully",
  "data": {
    "_id": "65a1234567890abcdef12360",
    "activityType": "call_made",
    ...
  }
}
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "skip": 0,
    "pages": 2
  }
}
```

---

## Error Handling

### Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 201 | Created | Activity saved successfully |
| 200 | OK | Request succeeded |
| 400 | Bad Request | Missing or invalid parameters |
| 404 | Not Found | Follow-up or activity not found |
| 500 | Server Error | Internal server error |

### Common Errors

```javascript
// Missing required field
{
  "success": false,
  "message": "followUpId, activityType, and performedBy are required"
}

// Follow-up not found
{
  "success": false,
  "message": "Follow-up not found"
}

// Invalid activity type
{
  "success": false,
  "message": "Invalid activity type"
}
```

---

## Example Workflows

### Complete Follow-Up Workflow

```javascript
// 1. Create follow-up (done elsewhere)
// followUpId: "65a1234567890abcdef12345"

// 2. Log initial note
POST /api/followup-activities/65a1234567890abcdef12345/note
{ content: "New lead from referral", noteType: "internal" }

// 3. Log call activity
POST /api/followup-activities/65a1234567890abcdef12345/call
{ duration: 600, outcome: "answered", notes: "Interested in demo" }

// 4. Log meeting
POST /api/followup-activities/65a1234567890abcdef12345/meeting
{ meetingType: "video_call", summary: "Product demo completed" }

// 5. Send email
POST /api/followup-activities/65a1234567890abcdef12345/email
{ subject: "Follow-up: Demo Recording", direction: "sent" }

// 6. Change status
POST /api/followup-activities/65a1234567890abcdef12345/status-change
{ previousStatus: "Pending", newStatus: "In Progress" }

// 7. Get complete timeline
GET /api/followup-activities/65a1234567890abcdef12345/timeline
```

---

**API Version:** 1.0.0  
**Last Updated:** May 16, 2026  
**Status:** Production Ready ✅
