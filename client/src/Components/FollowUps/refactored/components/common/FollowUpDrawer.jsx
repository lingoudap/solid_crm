/**
 * FollowUpDrawer Component
 * Side drawer for detailed follow-up information
 */

import React from 'react';
import { formatDateTime, getRelativeTime, capitalize } from '../../utils/helpers';
import '../../../styles/followup-drawer.css';

const FollowUpDrawer = ({
  isOpen,
  onClose,
  followUp,
  onEdit,
  onDelete,
  isLoading
}) => {
  if (!isOpen || !followUp) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this follow-up?')) {
      onDelete(followUp._id);
      onClose();
    }
  };

  return (
    <div className={`drawer-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`drawer-container ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Follow-Up Details</h2>
          <button
            onClick={onClose}
            className="drawer-close"
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="drawer-loading">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="drawer-content">
            {/* Entity Information */}
            <section className="drawer-section">
              <h3>Related To</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Type:</label>
                  <span className="badge">{followUp.relatedType}</span>
                </div>
                <div className="info-item">
                  <label>Name:</label>
                  <span>{followUp.entityName || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{followUp.entityEmail || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{followUp.entityPhone || '-'}</span>
                </div>
              </div>
            </section>

            {/* Follow-Up Information */}
            <section className="drawer-section">
              <h3>Follow-Up Information</h3>
              <div className="info-grid">
                <div className="info-item full-width">
                  <label>Scheduled Date & Time:</label>
                  <div className="date-info">
                    <span className="date">{formatDateTime(followUp.followUpDate)}</span>
                    <span className="relative">{getRelativeTime(followUp.followUpDate)}</span>
                  </div>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`status-badge status-${followUp.status?.toLowerCase()}`}>
                    {followUp.status}
                  </span>
                </div>
                <div className="info-item full-width">
                  <label>Notes:</label>
                  <p className="text-content">{followUp.notes || '-'}</p>
                </div>
              </div>
            </section>

            {/* Conversation Details */}
            {followUp.conversationDetails && (
              <section className="drawer-section">
                <h3>Conversation Details</h3>
                <p className="text-content">{followUp.conversationDetails}</p>
              </section>
            )}

            {/* Next Follow-Up */}
            {followUp.nextFollowUpDate && (
              <section className="drawer-section">
                <h3>Next Follow-Up Scheduled</h3>
                <div className="info-grid">
                  <div className="info-item full-width">
                    <label>Scheduled for:</label>
                    <span>{formatDateTime(followUp.nextFollowUpDate)}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Metadata */}
            <section className="drawer-section">
              <h3>Metadata</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Created:</label>
                  <span>{formatDateTime(followUp.createdAt)}</span>
                </div>
                <div className="info-item">
                  <label>Last Updated:</label>
                  <span>{formatDateTime(followUp.updatedAt)}</span>
                </div>
                <div className="info-item">
                  <label>ID:</label>
                  <code className="id-code">{followUp._id}</code>
                </div>
              </div>
            </section>

            {/* Actions */}
            <section className="drawer-actions">
              <button
                onClick={() => {
                  onEdit(followUp);
                  onClose();
                }}
                className="button button-primary full-width"
                disabled={isLoading}
              >
                Edit Follow-Up
              </button>
              <button
                onClick={handleDelete}
                className="button button-danger full-width"
                disabled={isLoading}
              >
                Delete Follow-Up
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpDrawer;
