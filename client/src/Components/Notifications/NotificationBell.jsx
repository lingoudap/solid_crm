import React, { useState, useRef, useEffect } from "react";
import { useNotifications, useUnreadCount } from "../../hooks/useNotifications";
import "../css/NotificationBell.css";

/**
 * NotificationBell Component
 * Displays notification bell with dropdown list of notifications
 */
const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, unread, reminders
  const bellRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead && !n.isDismissed);
      case "reminders":
        return notifications.filter(
          (n) =>
            n.type?.includes("reminder") &&
            !n.isDismissed
        );
      default:
        return notifications.filter((n) => !n.isDismissed);
    }
  };

  const filteredNotifications = getFilteredNotifications();

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleDismiss = (e, notificationId) => {
    e.stopPropagation();
    dismissNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "reminder_15_min":
      case "reminder_1_hour":
      case "reminder_exact_time":
        return "⏰";
      case "overdue_alert":
        return "🚨";
      case "follow_up_complete":
        return "✅";
      case "follow_up_assigned":
        return "👤";
      default:
        return "📬";
    }
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority || "medium"}`;
  };

  return (
    <div className="notification-bell" ref={bellRef}>
      {/* Bell Icon */}
      <button
        className={`bell-button ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <svg
          className="bell-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="notification-tabs">
            <button
              className={`tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All ({notifications.filter((n) => !n.isDismissed).length})
            </button>
            <button
              className={`tab ${activeTab === "unread" ? "active" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`tab ${activeTab === "reminders" ? "active" : ""}`}
              onClick={() => setActiveTab("reminders")}
            >
              Reminders (
              {notifications.filter(
                (n) => n.type?.includes("reminder") && !n.isDismissed
              ).length}
              )
            </button>
          </div>

          {/* Notification List */}
          <div className="notification-list">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.isRead ? "unread" : ""
                  } ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {notification.timeAgo || "Just now"}
                    </div>
                  </div>

                  {/* Priority Badge */}
                  {notification.priority && notification.priority !== "medium" && (
                    <span className={`priority-badge ${getPriorityClass(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  )}

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="unread-indicator" />
                  )}

                  {/* Dismiss Button */}
                  <button
                    className="dismiss-btn"
                    onClick={(e) => handleDismiss(e, notification.id)}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No notifications</p>
                <small>You're all caught up!</small>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.filter((n) => !n.isDismissed).length > 5 && (
            <div className="dropdown-footer">
              <a href="/notifications" className="view-all-link">
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
