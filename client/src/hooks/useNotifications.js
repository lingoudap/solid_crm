import { useContext, useCallback, useEffect, useState } from "react";
import NotificationContext from "../context/notificationContext";
import notificationSocketClient from "../services/notificationSocketClient";

/**
 * Custom hook for managing notifications
 * Provides access to notification state and actions
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }

  return context;
};

/**
 * Hook for initializing socket connection
 */
export const useNotificationSocket = (userId, token) => {
  const { socketConnected } = useNotifications();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (userId && token && !isInitialized) {
      notificationSocketClient.initialize(userId, token);
      setIsInitialized(true);
      console.log("🔌 Socket.IO initialized");
    }
  }, [userId, token, isInitialized]);

  return {
    isConnected: socketConnected,
    status: notificationSocketClient.getStatus(),
  };
};

/**
 * Hook for real-time notification count
 */
export const useUnreadCount = () => {
  const { unreadCount, requestUnreadCount } = useNotifications();

  useEffect(() => {
    requestUnreadCount();
    const interval = setInterval(requestUnreadCount, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [requestUnreadCount]);

  return unreadCount;
};

/**
 * Hook for notification summary
 */
export const useNotificationSummary = () => {
  const { summary, requestSummary } = useNotifications();

  useEffect(() => {
    requestSummary();
  }, [requestSummary]);

  return summary;
};

/**
 * Hook for critical reminders
 */
export const useCriticalReminders = () => {
  const { criticalReminders, requestCriticalReminders } = useNotifications();

  useEffect(() => {
    requestCriticalReminders();
    const interval = setInterval(requestCriticalReminders, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [requestCriticalReminders]);

  return criticalReminders;
};

/**
 * Hook for notification feed
 */
export const useNotificationFeed = (options = {}) => {
  const { notifications, isLoading, requestNotificationFeed } = useNotifications();
  const [page, setPage] = useState(1);

  useEffect(() => {
    requestNotificationFeed({
      ...options,
      page,
    });
  }, [page, requestNotificationFeed, options]);

  return {
    notifications,
    isLoading,
    page,
    setPage,
  };
};

/**
 * Hook for browser notifications
 */
export const useBrowserNotifications = () => {
  const { 
    requestBrowserPermission, 
    showBrowserNotification, 
    enableBrowserNotifications,
    disableBrowserNotifications 
  } = useNotifications();
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    // Check initial permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        enableBrowserNotifications();
        return true;
      }

      if (Notification.permission === "denied") {
        return false;
      }

      const result = await requestBrowserPermission();
      if (result) {
        setPermission("granted");
        enableBrowserNotifications();
        return true;
      } else {
        setPermission("denied");
        return false;
      }
    }
    return false;
  }, [requestBrowserPermission, enableBrowserNotifications]);

  const show = useCallback(
    (title, options = {}) => {
      if (Notification.permission === "granted") {
        return showBrowserNotification(title, options);
      } else if (Notification.permission === "default") {
        requestPermission().then((granted) => {
          if (granted) {
            showBrowserNotification(title, options);
          }
        });
      }
    },
    [showBrowserNotification, requestPermission]
  );

  const disable = useCallback(() => {
    disableBrowserNotifications();
  }, [disableBrowserNotifications]);

  return {
    permission,
    show,
    requestPermission,
    disable,
    isSupported: "Notification" in window,
  };
};

/**
 * Hook for notification sound
 */
export const useNotificationSound = () => {
  const { playNotificationSound } = useNotifications();

  const play = useCallback((soundFile = "default_notification.mp3") => {
    playNotificationSound(soundFile);
  }, [playNotificationSound]);

  const isSoundSupported = useCallback(() => {
    return !!(
      new Audio().canPlayType("audio/mpeg") ||
      new Audio().canPlayType("audio/ogg") ||
      new Audio().canPlayType("audio/wav")
    );
  }, []);

  return {
    play,
    isSupported: isSoundSupported(),
  };
};

/**
 * Hook for managing notification actions
 */
export const useNotificationActions = () => {
  const {
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  const handleMarkAsRead = useCallback(
    (notificationId) => {
      markAsRead(notificationId);
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleDismiss = useCallback(
    (notificationId) => {
      dismissNotification(notificationId);
    },
    [dismissNotification]
  );

  return {
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    dismiss: handleDismiss,
  };
};

/**
 * Hook for notification preferences
 */
export const useNotificationPreferences = () => {
  const { preferences } = useNotifications();
  const [userPreferences, setUserPreferences] = useState(preferences);

  useEffect(() => {
    setUserPreferences(preferences);
  }, [preferences]);

  const updatePreferences = useCallback((newPreferences) => {
    setUserPreferences((prev) => ({
      ...prev,
      ...newPreferences,
    }));
  }, []);

  return {
    preferences: userPreferences,
    updatePreferences,
  };
};

/**
 * Hook for filter notifications
 */
export const useFilteredNotifications = (type = null, priority = null) => {
  const { notifications } = useNotifications();

  return notifications.filter((notification) => {
    if (type && notification.type !== type) return false;
    if (priority && notification.priority !== priority) return false;
    return true;
  });
};

/**
 * Hook for notification grouping
 */
export const useGroupedNotifications = () => {
  const { notifications } = useNotifications();

  const grouped = notifications.reduce((acc, notification) => {
    const key = notification.type || "general";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(notification);
    return acc;
  }, {});

  return grouped;
};

/**
 * Hook for notification statistics
 */
export const useNotificationStats = () => {
  const { notifications, unreadCount, summary } = useNotifications();

  return {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.filter((n) => n.isRead).length,
    dismissed: notifications.filter((n) => n.isDismissed).length,
    reminders: summary.reminderCount || 0,
    alerts: summary.alertCount || 0,
    byType: notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {}),
    byPriority: notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {}),
  };
};

export default useNotifications;
