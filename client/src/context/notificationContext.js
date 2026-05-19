import React, { createContext, useReducer, useCallback, useEffect } from "react";
import notificationSocketClient from "../services/notificationSocketClient";

export const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  summary: {
    unreadCount: 0,
    reminderCount: 0,
    alertCount: 0,
    totalCount: 0,
  },
  criticalReminders: [],
  isLoading: false,
  error: null,
  socketConnected: false,
  preferences: {
    emailNotifications: true,
    browserNotifications: true,
    soundAlerts: true,
  },
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload,
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };

    case "UPDATE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
      };

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };

    case "SET_UNREAD_COUNT":
      return {
        ...state,
        unreadCount: action.payload,
      };

    case "SET_SUMMARY":
      return {
        ...state,
        summary: action.payload,
      };

    case "SET_CRITICAL_REMINDERS":
      return {
        ...state,
        criticalReminders: action.payload,
      };

    case "SET_SOCKET_CONNECTED":
      return {
        ...state,
        socketConnected: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "SET_PREFERENCES":
      return {
        ...state,
        preferences: action.payload,
      };

    case "RESET_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    notificationReducer,
    initialState
  );

  // ==========================================
  // Socket.IO Event Handlers
  // ==========================================

  useEffect(() => {
    // Subscribe to socket events
    const unsubscribeConnected = notificationSocketClient.on(
      "socket_connected",
      () => {
        dispatch({ type: "SET_SOCKET_CONNECTED", payload: true });
        console.log("✅ Socket connected");
      }
    );

    const unsubscribeDisconnected = notificationSocketClient.on(
      "socket_disconnected",
      () => {
        dispatch({ type: "SET_SOCKET_CONNECTED", payload: false });
        console.log("❌ Socket disconnected");
      }
    );

    const unsubscribeNewNotification = notificationSocketClient.on(
      "new_notification",
      (notification) => {
        dispatch({ type: "ADD_NOTIFICATION", payload: notification });
        console.log("📬 New notification received:", notification);
      }
    );

    const unsubscribeReminderAlert = notificationSocketClient.on(
      "reminder_alert",
      (reminder) => {
        dispatch({ type: "ADD_NOTIFICATION", payload: reminder });
        console.log("⏰ Reminder alert:", reminder);
      }
    );

    const unsubscribeUnreadCount = notificationSocketClient.on(
      "unread_count_updated",
      (data) => {
        dispatch({ type: "SET_UNREAD_COUNT", payload: data.count });
      }
    );

    const unsubscribeSummary = notificationSocketClient.on(
      "notification_summary",
      (data) => {
        dispatch({ type: "SET_SUMMARY", payload: data.summary });
      }
    );

    const unsubscribeCritical = notificationSocketClient.on(
      "critical_reminders",
      (data) => {
        dispatch({ type: "SET_CRITICAL_REMINDERS", payload: data.data });
      }
    );

    const unsubscribeNotificationRead = notificationSocketClient.on(
      "notification_read",
      (data) => {
        dispatch({
          type: "UPDATE_NOTIFICATION",
          payload: { id: data.notificationId, isRead: true },
        });
      }
    );

    const unsubscribeNotificationDismissed = notificationSocketClient.on(
      "notification_dismissed",
      (data) => {
        dispatch({
          type: "REMOVE_NOTIFICATION",
          payload: data.notificationId,
        });
      }
    );

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeNewNotification();
      unsubscribeReminderAlert();
      unsubscribeUnreadCount();
      unsubscribeSummary();
      unsubscribeCritical();
      unsubscribeNotificationRead();
      unsubscribeNotificationDismissed();
    };
  }, []);

  // ==========================================
  // Action Methods
  // ==========================================

  const markAsRead = useCallback((notificationId) => {
    notificationSocketClient.markAsRead(notificationId);
    dispatch({
      type: "UPDATE_NOTIFICATION",
      payload: { id: notificationId, isRead: true },
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationSocketClient.markAllAsRead();
  }, []);

  const dismissNotification = useCallback((notificationId) => {
    notificationSocketClient.dismissNotification(notificationId);
    dispatch({ type: "REMOVE_NOTIFICATION", payload: notificationId });
  }, []);

  const requestNotificationFeed = useCallback((options = {}) => {
    dispatch({ type: "SET_LOADING", payload: true });
    notificationSocketClient.requestNotificationFeed(options);
  }, []);

  const requestUnreadCount = useCallback(() => {
    notificationSocketClient.requestUnreadCount();
  }, []);

  const requestSummary = useCallback(() => {
    notificationSocketClient.requestNotificationSummary();
  }, []);

  const requestCriticalReminders = useCallback(() => {
    notificationSocketClient.requestCriticalReminders();
  }, []);

  const enableBrowserNotifications = useCallback(() => {
    notificationSocketClient.enableBrowserNotifications();
  }, []);

  const disableBrowserNotifications = useCallback(() => {
    notificationSocketClient.disableBrowserNotifications();
  }, []);

  const showBrowserNotification = useCallback((title, options) => {
    return notificationSocketClient.showBrowserNotification(title, options);
  }, []);

  const playNotificationSound = useCallback((soundFile) => {
    notificationSocketClient.playNotificationSound(soundFile);
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    return await notificationSocketClient.requestBrowserNotificationPermission();
  }, []);

  const getSocketStatus = useCallback(() => {
    return notificationSocketClient.getStatus();
  }, []);

  const value = {
    // State
    state,
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    summary: state.summary,
    criticalReminders: state.criticalReminders,
    isLoading: state.isLoading,
    error: state.error,
    socketConnected: state.socketConnected,
    preferences: state.preferences,

    // Actions
    markAsRead,
    markAllAsRead,
    dismissNotification,
    requestNotificationFeed,
    requestUnreadCount,
    requestSummary,
    requestCriticalReminders,
    enableBrowserNotifications,
    disableBrowserNotifications,
    showBrowserNotification,
    playNotificationSound,
    requestBrowserPermission,
    getSocketStatus,

    // Dispatch for advanced usage
    dispatch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
