import io from "socket.io-client";

class NotificationSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Initialize Socket.IO connection
   */
  initialize(userId, token) {
    if (this.socket) {
      console.warn("Socket already initialized");
      return;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

    this.socket = io(socketUrl, {
      auth: {
        userId,
        token,
      },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelayMax: 10000,
    });

    this.setupConnectionHandlers();
    this.setupNotificationHandlers();

    console.log(`🔌 Socket.IO client initialized for user ${userId}`);
  }

  /**
   * Setup connection event handlers
   */
  setupConnectionHandlers() {
    // Connected
    this.socket.on("connect", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("✅ Socket.IO connected:", this.socket.id);

      // Emit custom connected event
      this.emit("socket_connected");

      // Request initial data
      this.requestUnreadCount();
      this.requestNotificationSummary();
    });

    // Disconnected
    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("❌ Socket.IO disconnected");
      this.emit("socket_disconnected");
    });

    // Reconnection attempt
    this.socket.on("reconnect_attempt", () => {
      this.reconnectAttempts++;
      console.log(`⚠️  Reconnection attempt ${this.reconnectAttempts}`);
    });

    // Reconnection failed
    this.socket.on("reconnect_failed", () => {
      console.error("❌ Socket.IO reconnection failed after max attempts");
      this.emit("socket_reconnection_failed");
    });

    // Connection error
    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      this.emit("socket_error", error);
    });

    // Server errors
    this.socket.on("error", (error) => {
      console.error("Socket.IO error:", error);
      this.emit("socket_error", error);
    });
  }

  /**
   * Setup notification event handlers
   */
  setupNotificationHandlers() {
    // New notification
    this.socket.on("new_notification", (notification) => {
      console.log("📬 New notification received:", notification);
      this.emit("new_notification", notification);
    });

    // Reminder alert
    this.socket.on("reminder_alert", (reminder) => {
      console.log("⏰ Reminder alert received:", reminder);
      this.emit("reminder_alert", reminder);

      // Play sound if enabled
      if (reminder.soundAlert) {
        this.playNotificationSound();
      }
    });

    // Unread count update
    this.socket.on("unread_count", (data) => {
      console.log("📊 Unread count updated:", data.count);
      this.emit("unread_count_updated", data);
    });

    // Notification marked as read
    this.socket.on("notification_read", (data) => {
      console.log("✅ Notification marked as read:", data.notificationId);
      this.emit("notification_read", data);
    });

    // Notification dismissed
    this.socket.on("notification_dismissed", (data) => {
      console.log("🗑️  Notification dismissed:", data.notificationId);
      this.emit("notification_dismissed", data);
    });

    // All marked as read
    this.socket.on("all_marked_read", (data) => {
      console.log("✅ All notifications marked as read");
      this.emit("all_marked_read", data);
    });

    // Notification feed updated
    this.socket.on("notification_feed_updated", (data) => {
      console.log("🔄 Notification feed updated");
      this.emit("notification_feed_updated", data);
    });

    // Notification feed data
    this.socket.on("notification_feed", (data) => {
      console.log("📋 Notification feed received:", data);
      this.emit("notification_feed", data);
    });

    // Notification summary
    this.socket.on("notification_summary", (data) => {
      console.log("📊 Notification summary received:", data);
      this.emit("notification_summary", data);
    });

    // Critical reminders
    this.socket.on("critical_reminders", (data) => {
      console.log("🚨 Critical reminders received:", data);
      this.emit("critical_reminders", data);
    });

    // Play sound notification
    this.socket.on("play_notification_sound", (data) => {
      console.log("🔊 Playing notification sound");
      this.playNotificationSound(data.soundFile);
    });

    // Browser notifications enabled
    this.socket.on("browser_notifications_enabled", (data) => {
      console.log("🔔 Browser notifications enabled");
      this.emit("browser_notifications_enabled", data);
    });

    // Browser notifications disabled
    this.socket.on("browser_notifications_disabled", (data) => {
      console.log("🔔 Browser notifications disabled");
      this.emit("browser_notifications_disabled", data);
    });

    // Action clicked
    this.socket.on("action_clicked", (data) => {
      console.log("🖱️  Notification action clicked:", data);
      this.emit("action_clicked", data);
    });
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    return () => {
      // Return unsubscribe function
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    };
  }

  /**
   * Emit event to local listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("mark_as_read", notificationId);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("mark_all_as_read");
  }

  /**
   * Dismiss notification
   */
  dismissNotification(notificationId) {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("dismiss_notification", notificationId);
  }

  /**
   * Request notifications feed
   */
  requestNotificationFeed(options = {}) {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("get_notifications", options);
  }

  /**
   * Request notification summary
   */
  requestNotificationSummary() {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("get_notification_summary");
  }

  /**
   * Request unread count
   */
  requestUnreadCount() {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("get_unread_count");
  }

  /**
   * Request critical reminders
   */
  requestCriticalReminders() {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("get_critical_reminders");
  }

  /**
   * Enable browser notifications
   */
  enableBrowserNotifications() {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("enable_browser_notifications");
  }

  /**
   * Disable browser notifications
   */
  disableBrowserNotifications() {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("disable_browser_notifications");
  }

  /**
   * Notify that notification was displayed
   */
  notifyDisplayed(notificationId) {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("notification_displayed", notificationId);
  }

  /**
   * Notify that notification action was clicked
   */
  notifyActionClicked(notificationId) {
    if (!this.isConnected) {
      console.warn("Socket not connected");
      return;
    }
    this.socket.emit("notification_action_clicked", notificationId);
  }

  /**
   * Play notification sound
   */
  playNotificationSound(soundFile = "default_notification.mp3") {
    try {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.error("Failed to play notification sound:", error);
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  /**
   * Request browser notification permission
   */
  async requestBrowserNotificationPermission() {
    if (!("Notification" in window)) {
      console.warn("Browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(title, options = {}) {
    if (Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          icon: "/logo.png",
          ...options,
        });

        // Close after 5 seconds if not clicked
        if (!options.noAutoClose) {
          setTimeout(() => notification.close(), 5000);
        }

        return notification;
      } catch (error) {
        console.error("Error showing browser notification:", error);
      }
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log("🔌 Socket.IO disconnected");
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Create singleton instance
const notificationSocketClient = new NotificationSocketClient();

export default notificationSocketClient;
