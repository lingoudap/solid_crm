import React, { useState, useEffect, useRef } from 'react';
import { IoNotificationsOutline, IoClose, IoCheckmark, IoTrash } from 'react-icons/io5';
import './NotificationCenter.css';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const NotificationCenter = ({ userId, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(0);
  const panelRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/api/notifications/${userId}?limit=10&skip=${page * 10}`;

      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) return;
      
      const data = await response.json();
      console.log("✅ Notifications fetched:", data.notifications?.length || 0);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count periodically
  const fetchUnreadCount = async () => {
    if (!userId) return;
    try {
      const url = `${API_BASE}/api/notifications/${userId}/unread-count`;

      const response = await fetch(url);

      if (!response.ok) return;

      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      // Also fetch unread count every 5 seconds for real-time badge
      const badgeInterval = setInterval(fetchUnreadCount, 5000);
      return () => {
        clearInterval(interval);
        clearInterval(badgeInterval);
      };
    }
  }, [isOpen, userId, page]);

  // Filter notifications
  const filteredNotifications = filterType === 'all' 
    ? notifications 
    : notifications.filter(notif => notif.type === filterType);

  // Mark as read
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `${API_BASE}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `${API_BASE}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        if (!notifications.find(n => n._id === notificationId)?.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${API_BASE}/api/notifications/${userId}/read-all`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Format notification type to display
  const getTypeLabel = (type) => {
    const labels = {
      followup_reminder: '📢 Reminder',
      followup_overdue: '⚠️ Overdue',
      followup_completed: '✅ Completed'
    };
    return labels[type] || type;
  };

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="notification-panel" ref={panelRef}>
      {/* Header */}
      <div className="notification-header">
        <div className="notification-title-section">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <button
          className="close-btn"
          onClick={onClose}
          title="Close"
        >
          <IoClose size={24} />
        </button>
      </div>

      {/* Filter and Actions */}
      <div className="notification-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => { setFilterType('all'); setPage(0); }}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterType === 'followup_reminder' ? 'active' : ''}`}
            onClick={() => { setFilterType('followup_reminder'); setPage(0); }}
          >
            Reminders
          </button>
          <button
            className={`filter-btn ${filterType === 'followup_overdue' ? 'active' : ''}`}
            onClick={() => { setFilterType('followup_overdue'); setPage(0); }}
          >
            Overdue
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
            title="Mark all as read"
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="notification-list">
        {loading ? (
          <div className="loading-state">
            <p>⏳ Loading...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <p>😌 No notifications</p>
            <small>You're all caught up!</small>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <div className="notification-type">
                  {getTypeLabel(notification.type)}
                </div>
                <h4 className="notification-title">{notification.title}</h4>
                <p className="notification-message">
                  {notification.message.split('\n')[0]}
                </p>
                <small className="notification-time">
                  {formatTime(notification.createdAt)}
                </small>
              </div>

              {/* Actions */}
              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="action-btn mark-read-btn"
                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                    title="Mark as read"
                  >
                    <IoCheckmark size={18} />
                  </button>
                )}
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => handleDelete(notification._id, e)}
                  title="Delete"
                >
                  <IoTrash size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {notifications.length > 0 && (
        <div className="notification-footer">
          <button
            className="pagination-btn"
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span className="page-info">Page {page + 1}</span>
          <button
            className="pagination-btn"
            onClick={() => setPage(prev => prev + 1)}
            disabled={filteredNotifications.length < 10}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
