import React, { useState, useEffect } from "react";
import "../css/ToastNotification.css";

/**
 * ToastNotification Component
 * Transient notification toast that appears and disappears automatically
 */
const ToastNotification = ({
  id,
  title,
  message,
  type = "info",
  duration = 5000,
  onClose,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration === 0) return; // Don't auto-close if duration is 0

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose(id);
      }
    }, 300); // Match animation duration
  };

  if (!isVisible) return null;

  const getToastIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      case "reminder":
        return "⏰";
      default:
        return "📌";
    }
  };

  return (
    <div
      className={`toast-notification toast-${type} ${
        isExiting ? "toast-exit" : "toast-enter"
      }`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={`toast-icon toast-icon-${type}`}>
        {getToastIcon()}
      </div>

      {/* Content */}
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        {message && <div className="toast-message">{message}</div>}
      </div>

      {/* Action Button */}
      {action && (
        <button className="toast-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}

      {/* Close Button */}
      <button
        className="toast-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ✕
      </button>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="toast-progress" style={{ animationDuration: `${duration}ms` }} />
      )}
    </div>
  );
};

/**
 * Toast Container Component
 * Container for managing multiple toast notifications
 */
export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          {...toast}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

/**
 * Hook for managing toasts
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    const newToast = {
      id,
      duration: 5000,
      ...toast,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const removeAll = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (title, message, options = {}) => {
    return addToast({ title, message, type: "success", ...options });
  };

  const error = (title, message, options = {}) => {
    return addToast({
      title,
      message,
      type: "error",
      duration: 0, // Don't auto-close errors
      ...options,
    });
  };

  const warning = (title, message, options = {}) => {
    return addToast({ title, message, type: "warning", ...options });
  };

  const info = (title, message, options = {}) => {
    return addToast({ title, message, type: "info", ...options });
  };

  const reminder = (title, message, options = {}) => {
    return addToast({ title, message, type: "reminder", ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    removeAll,
    success,
    error,
    warning,
    info,
    reminder,
  };
};

export default ToastNotification;
