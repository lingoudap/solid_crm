import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./FollowUpTimeline.css";

/**
 * Follow-Up Timeline Component
 * Displays a vertical timeline of all activities related to a follow-up
 * Features: Date grouping, activity icons, user avatars, expand/collapse, filtering
 */

// Activity Type Icon & Color Configuration
const ACTIVITY_CONFIG = {
  follow_up_created: {
    icon: "📋",
    color: "#3b82f6",
    label: "Follow-up Created",
    category: "system",
  },
  status_changed: {
    icon: "🔄",
    color: "#f59e0b",
    label: "Status Changed",
    category: "status",
  },
  note_added: {
    icon: "📝",
    color: "#8b5cf6",
    label: "Note Added",
    category: "note",
  },
  call_made: {
    icon: "☎️",
    color: "#ef4444",
    label: "Call Made",
    category: "communication",
  },
  meeting_scheduled: {
    icon: "📅",
    color: "#10b981",
    label: "Meeting",
    category: "communication",
  },
  whatsapp_sent: {
    icon: "💬",
    color: "#14b8a6",
    label: "WhatsApp",
    category: "communication",
  },
  email_sent: {
    icon: "📧",
    color: "#06b6d4",
    label: "Email",
    category: "communication",
  },
  attachment_added: {
    icon: "📎",
    color: "#10b981",
    label: "Attachment Added",
    category: "file",
  },
  user_assigned: {
    icon: "👤",
    color: "#ec4899",
    label: "User Assigned",
    category: "assignment",
  },
  priority_changed: {
    icon: "⭐",
    color: "#f59e0b",
    label: "Priority Changed",
    category: "status",
  },
  reminder_set: {
    icon: "🔔",
    color: "#f97316",
    label: "Reminder Set",
    category: "reminder",
  },
  reminder_triggered: {
    icon: "🔔",
    color: "#f97316",
    label: "Reminder Triggered",
    category: "reminder",
  },
  follow_up_rescheduled: {
    icon: "📅",
    color: "#f59e0b",
    label: "Rescheduled",
    category: "status",
  },
  follow_up_completed: {
    icon: "✅",
    color: "#10b981",
    label: "Completed",
    category: "status",
  },
};

// ============================================
// ActivityCard Component
// ============================================

const ActivityCard = ({
  activity,
  isExpanded,
  onToggle,
  showAllDetails = false,
}) => {
  const config = ACTIVITY_CONFIG[activity.activityType] || {
    icon: "📌",
    color: "#6b7280",
    label: "Activity",
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";
  };

  const renderActivityDetails = () => {
    if (!activity.callActivity && !activity.emailActivity && !activity.whatsappActivity && 
        !activity.noteActivity && !activity.statusChangeActivity && !activity.meetingActivity) {
      return null;
    }

    return (
      <div className="activity-details">
        {activity.callActivity && (
          <div className="detail-section">
            <h5>📞 Call Details</h5>
            <div className="detail-item">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{Math.round(activity.callActivity.duration / 60)} min</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Outcome:</span>
              <span className="detail-value">{activity.callActivity.outcome}</span>
            </div>
            {activity.callActivity.notes && (
              <div className="detail-item">
                <span className="detail-label">Notes:</span>
                <span className="detail-value">{activity.callActivity.notes}</span>
              </div>
            )}
            {activity.callActivity.participants && activity.callActivity.participants.length > 0 && (
              <div className="detail-item">
                <span className="detail-label">Participants:</span>
                <span className="detail-value">{activity.callActivity.participants.map((p) => p.name).join(", ")}</span>
              </div>
            )}
          </div>
        )}

        {activity.emailActivity && (
          <div className="detail-section">
            <h5>📧 Email Details</h5>
            <div className="detail-item">
              <span className="detail-label">Subject:</span>
              <span className="detail-value">{activity.emailActivity.subject}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Direction:</span>
              <span className="detail-value">{activity.emailActivity.direction}</span>
            </div>
            {activity.emailActivity.recipients && (
              <div className="detail-item">
                <span className="detail-label">Recipients:</span>
                <span className="detail-value">
                  {activity.emailActivity.recipients.map((r) => r.email).join(", ")}
                </span>
              </div>
            )}
            {activity.emailActivity.opened !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{activity.emailActivity.opened ? "Opened" : "Unopened"}</span>
              </div>
            )}
          </div>
        )}

        {activity.whatsappActivity && (
          <div className="detail-section">
            <h5>💬 WhatsApp Details</h5>
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{activity.whatsappActivity.messageType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value">{activity.whatsappActivity.messageStatus}</span>
            </div>
            {activity.whatsappActivity.messageBody && (
              <div className="detail-item">
                <span className="detail-label">Message:</span>
                <span className="detail-value">{activity.whatsappActivity.messageBody}</span>
              </div>
            )}
          </div>
        )}

        {activity.noteActivity && (
          <div className="detail-section">
            <h5>📝 Note</h5>
            <div className="note-content">{activity.noteActivity.content}</div>
            {activity.noteActivity.tags && activity.noteActivity.tags.length > 0 && (
              <div className="detail-item">
                <span className="detail-label">Tags:</span>
                <div className="tags-list">
                  {activity.noteActivity.tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activity.statusChangeActivity && (
          <div className="detail-section">
            <h5>🔄 Status Change</h5>
            <div className="detail-item">
              <span className="detail-label">From:</span>
              <span className="detail-value">{activity.statusChangeActivity.previousStatus}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">To:</span>
              <span className="detail-value">{activity.statusChangeActivity.newStatus}</span>
            </div>
            {activity.statusChangeActivity.reason && (
              <div className="detail-item">
                <span className="detail-label">Reason:</span>
                <span className="detail-value">{activity.statusChangeActivity.reason}</span>
              </div>
            )}
          </div>
        )}

        {activity.meetingActivity && (
          <div className="detail-section">
            <h5>📅 Meeting Details</h5>
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{activity.meetingActivity.meetingType}</span>
            </div>
            {activity.meetingActivity.duration && (
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{activity.meetingActivity.duration} minutes</span>
              </div>
            )}
            {activity.meetingActivity.summary && (
              <div className="detail-item">
                <span className="detail-label">Summary:</span>
                <span className="detail-value">{activity.meetingActivity.summary}</span>
              </div>
            )}
            {activity.meetingActivity.outcomes && activity.meetingActivity.outcomes.length > 0 && (
              <div className="detail-item">
                <span className="detail-label">Outcomes:</span>
                <ul className="outcomes-list">
                  {activity.meetingActivity.outcomes.map((outcome, idx) => (
                    <li key={idx}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`activity-card ${activity.sentiment ? `sentiment-${activity.sentiment}` : ""}`}>
      <div className="activity-header">
        <div className="activity-main">
          <div className="activity-icon-section">
            <div className="activity-icon" style={{ backgroundColor: config.color }}>
              {config.icon}
            </div>
            <div className="activity-dot" style={{ backgroundColor: config.color }}></div>
          </div>

          <div className="activity-content">
            <h3 className="activity-title">{activity.title}</h3>
            {activity.description && (
              <p className="activity-description">{activity.description}</p>
            )}
            <div className="activity-meta">
              <span className="meta-item">
                <span className="meta-icon">⏰</span>
                {activity.formattedTime}
              </span>
              {activity.performedBy && (
                <span className="meta-item">
                  <div className="user-avatar" title={activity.performedBy.name}>
                    {activity.performedBy.avatar ? (
                      <img src={activity.performedBy.avatar} alt={activity.performedBy.name} />
                    ) : (
                      <span>{getInitials(activity.performedBy.name)}</span>
                    )}
                  </div>
                  <span>{activity.performedBy.name}</span>
                </span>
              )}
              {activity.category && (
                <span className="category-badge">{activity.category}</span>
              )}
            </div>
          </div>
        </div>

        {(activity.callActivity || activity.emailActivity || activity.whatsappActivity || 
          activity.noteActivity || activity.statusChangeActivity || activity.meetingActivity) && (
          <button className="expand-btn" onClick={onToggle} title={isExpanded ? "Collapse" : "Expand"}>
            {isExpanded ? "▼" : "▶"}
          </button>
        )}
      </div>

      {isExpanded && renderActivityDetails()}

      {activity.sentiment && (
        <div className={`sentiment-badge sentiment-${activity.sentiment}`}>
          {activity.sentiment === "positive" && "😊 Positive"}
          {activity.sentiment === "neutral" && "😐 Neutral"}
          {activity.sentiment === "negative" && "😞 Negative"}
        </div>
      )}
    </div>
  );
};

// ============================================
// DateGroup Component
// ============================================

const DateGroup = ({ date, activities, onToggleActivity, expandedActivities }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`date-group ${isCollapsed ? "collapsed" : ""}`}>
      <div className="date-header">
        <button className="collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? "→" : "↓"}
        </button>
        <h3 className="date-label">{date}</h3>
        <span className="activity-count">{activities.length} activity</span>
      </div>

      {!isCollapsed && (
        <div className="activities-list">
          {activities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              isExpanded={expandedActivities.has(activity._id)}
              onToggle={() => onToggleActivity(activity._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// Filter & Control Components
// ============================================

const TimelineControls = ({
  filters,
  onFilterChange,
  activityTypes,
  categories,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="timeline-controls">
      <div className="controls-section">
        <div className="control-group">
          <label>Activity Type</label>
          <select
            value={filters.activityType || ""}
            onChange={(e) => onFilterChange("activityType", e.target.value || null)}
          >
            <option value="">All Types</option>
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {ACTIVITY_CONFIG[type]?.label || type}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Category</label>
          <select
            value={filters.category || ""}
            onChange={(e) => onFilterChange("category", e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Sentiment</label>
          <select
            value={filters.sentiment || ""}
            onChange={(e) => onFilterChange("sentiment", e.target.value || null)}
          >
            <option value="">All</option>
            <option value="positive">😊 Positive</option>
            <option value="neutral">😐 Neutral</option>
            <option value="negative">😞 Negative</option>
          </select>
        </div>

        <button className="refresh-btn" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "⏳ Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {(filters.activityType || filters.category || filters.sentiment) && (
        <button
          className="reset-filters-btn"
          onClick={() => {
            onFilterChange("activityType", null);
            onFilterChange("category", null);
            onFilterChange("sentiment", null);
          }}
        >
          ✕ Clear Filters
        </button>
      )}
    </div>
  );
};

// ============================================
// Main Timeline Component
// ============================================

const FollowUpTimeline = ({
  followUpId,
  loading = false,
  activities = [],
  onActivityUpdate = null,
  enableRealtime = false,
  apiBaseUrl = "http://localhost:5000",
}) => {
  const [allActivities, setAllActivities] = useState(activities);
  const [expandedActivities, setExpandedActivities] = useState(new Set());
  const [filters, setFilters] = useState({
    activityType: null,
    category: null,
    sentiment: null,
  });
  const [isLoading, setIsLoading] = useState(loading);

  // Fetch timeline data
  const fetchTimeline = useCallback(async () => {
    if (!followUpId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/api/followup-activities/${followUpId}/timeline`
      );
      const result = await response.json();

      if (result.success) {
        setAllActivities(result.data);
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setIsLoading(false);
    }
  }, [followUpId, apiBaseUrl]);

  // Load timeline on mount and setup polling for realtime updates
  useEffect(() => {
    fetchTimeline();

    if (enableRealtime) {
      const interval = setInterval(fetchTimeline, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [followUpId, enableRealtime, fetchTimeline]);

  // Get unique activity types and categories
  const activityTypes = useMemo(() => {
    const types = new Set(allActivities.map((a) => a.activityType));
    return Array.from(types).sort();
  }, [allActivities]);

  const categories = useMemo(() => {
    const cats = new Set(allActivities.map((a) => a.category));
    return Array.from(cats).sort();
  }, [allActivities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return allActivities.filter((activity) => {
      if (filters.activityType && activity.activityType !== filters.activityType) return false;
      if (filters.category && activity.category !== filters.category) return false;
      if (filters.sentiment && activity.sentiment !== filters.sentiment) return false;
      return true;
    });
  }, [allActivities, filters]);

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups = {};

    filteredActivities.forEach((activity) => {
      const dateKey = activity.formattedDate;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    // Sort dates in descending order
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateB - dateA;
    });
  }, [filteredActivities]);

  const toggleActivityExpand = useCallback((activityId) => {
    setExpandedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  }, []);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  }, []);

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Activity Timeline</h2>
        <span className="activity-total">{filteredActivities.length} activities</span>
      </div>

      <TimelineControls
        filters={filters}
        onFilterChange={handleFilterChange}
        activityTypes={activityTypes}
        categories={categories}
        onRefresh={fetchTimeline}
        isLoading={isLoading}
      />

      {isLoading && !allActivities.length && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading timeline...</p>
        </div>
      )}

      {!isLoading && filteredActivities.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No activities found</h3>
          <p>
            {allActivities.length === 0
              ? "No activities have been logged for this follow-up yet."
              : "No activities match your current filters."}
          </p>
        </div>
      )}

      {!isLoading && filteredActivities.length > 0 && (
        <div className="timeline-main">
          <div className="timeline-line"></div>

          <div className="date-groups">
            {groupedActivities.map(([date, dateActivities]) => (
              <DateGroup
                key={date}
                date={date}
                activities={dateActivities}
                onToggleActivity={toggleActivityExpand}
                expandedActivities={expandedActivities}
              />
            ))}
          </div>
        </div>
      )}

      {enableRealtime && (
        <div className="realtime-indicator">
          <span className="pulse"></span>
          Live Updates Enabled
        </div>
      )}
    </div>
  );
};

export default FollowUpTimeline;
