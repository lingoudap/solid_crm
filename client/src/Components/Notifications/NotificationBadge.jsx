import React, { useState, useEffect, useCallback } from 'react';
import { IoNotificationsOutline } from 'react-icons/io5';
import NotificationCenter from './NotificationCenter';
import './NotificationCenter.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NotificationBadge = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const url = `${API_BASE.replace(/\/$/, '')}/api/notifications/${userId}/unread-count`;
      const response = await fetch(url);

      if (!response.ok) return;

      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [userId]);

  // Initial fetch and polling
  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      // Poll every 5 seconds for real-time badge updates
      const interval = setInterval(fetchUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [userId, fetchUnreadCount]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Refresh count after panel closes
    setTimeout(fetchUnreadCount, 500);
  };

  // Always render the bell, but disable if no userId
  return (
    <div className="notification-badge-container">
      <button
        className="notification-bell-icon"
        onClick={handleToggle}
        title={userId ? `${unreadCount} unread notifications` : "Please log in to see notifications"}
        aria-label="Notifications"
        disabled={!userId}
        style={{ opacity: userId ? 1 : 0.5, cursor: userId ? 'pointer' : 'not-allowed' }}
      >
        <IoNotificationsOutline size={24} />
        {userId && unreadCount > 0 && (
          <span className="notification-count-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <NotificationCenter
          userId={userId}
          isOpen={isOpen}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default NotificationBadge;
