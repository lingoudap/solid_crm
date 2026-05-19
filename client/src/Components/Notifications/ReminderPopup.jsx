import React, { useState, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import "../css/ReminderPopup.css";

/**
 * ReminderPopup Component
 * Modal popup for active reminders with snooze, complete, and dismiss actions
 */
const ReminderPopup = ({ reminder, onClose, onComplete, onSnooze }) => {
  const { markAsRead, dismissNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(true);
  const [snoozeTime, setSnoozeTime] = useState(5); // minutes

  useEffect(() => {
    // Mark as read when popup appears
    if (reminder && !reminder.isRead) {
      markAsRead(reminder.id);
    }
  }, [reminder, markAsRead]);

  if (!isVisible) return null;

  const handleSnooze = () => {
    if (onSnooze) {
      onSnooze(reminder.id, snoozeTime);
    }
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(reminder.id);
    }
    markAsRead(reminder.id);
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleDismiss = () => {
    dismissNotification(reminder.id);
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "#e74c3c";
      case "high":
        return "#e67e22";
      case "medium":
        return "#f39c12";
      case "low":
        return "#95a5a6";
      default:
        return "#3498db";
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case "reminder_15_min":
        return "⏰ 15 Minutes";
      case "reminder_1_hour":
        return "⏰ 1 Hour";
      case "reminder_exact_time":
        return "⏰ Now";
      case "overdue_alert":
        return "🚨 Overdue";
      default:
        return "🔔 Reminder";
    }
  };

  return (
    <div className="reminder-popup-overlay" onClick={handleDismiss}>
      <div
        className="reminder-popup"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderLeftColor: getPriorityColor(reminder.priority),
        }}
      >
        {/* Close Button */}
        <button className="close-btn" onClick={handleDismiss} title="Close">
          ✕
        </button>

        {/* Header */}
        <div className="popup-header">
          <div className="header-content">
            <h2 className="popup-title">{reminder.title}</h2>
            <span
              className="priority-tag"
              style={{
                backgroundColor: getPriorityColor(reminder.priority),
              }}
            >
              {reminder.priority?.toUpperCase()}
            </span>
          </div>
          <div className="reminder-type">
            {getReminderIcon(reminder.type)}
          </div>
        </div>

        {/* Message */}
        <div className="popup-message">
          {reminder.message}
        </div>

        {/* Details */}
        {reminder.followUpData && (
          <div className="reminder-details">
            <div className="detail-item">
              <span className="detail-label">Follow-Up:</span>
              <span className="detail-value">{reminder.followUpData.title}</span>
            </div>
            {reminder.followUpData.dueDate && (
              <div className="detail-item">
                <span className="detail-label">Due Date:</span>
                <span className="detail-value">
                  {new Date(reminder.followUpData.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {reminder.followUpData.status && (
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge status-${reminder.followUpData.status.toLowerCase()}`}>
                  {reminder.followUpData.status}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="popup-actions">
          <div className="primary-actions">
            <button
              className="btn btn-complete"
              onClick={handleComplete}
              title="Mark as complete"
            >
              <span className="btn-icon">✓</span>
              Mark Complete
            </button>
            <button
              className="btn btn-snooze"
              onClick={handleSnooze}
              title={`Snooze for ${snoozeTime} minutes`}
            >
              <span className="btn-icon">⏸</span>
              Snooze ({snoozeTime}m)
            </button>
          </div>

          <div className="snooze-options">
            <small>Snooze for:</small>
            <div className="snooze-buttons">
              {[5, 15, 30, 60].map((time) => (
                <button
                  key={time}
                  className={`snooze-option ${
                    snoozeTime === time ? "active" : ""
                  }`}
                  onClick={() => setSnoozeTime(time)}
                  title={`Snooze for ${time} minutes`}
                >
                  {time < 60 ? `${time}m` : `${time / 60}h`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="popup-footer">
          <button
            className="btn-text dismiss-text-btn"
            onClick={handleDismiss}
            title="Dismiss this reminder"
          >
            Dismiss
          </button>
        </div>

        {/* Sound Indicator */}
        {reminder.soundAlert && (
          <div className="sound-indicator">
            <span>🔊 Sound enabled</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderPopup;
