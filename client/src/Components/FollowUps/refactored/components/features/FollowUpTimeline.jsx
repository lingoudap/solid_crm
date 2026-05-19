/**
 * FollowUpTimeline Component
 * Timeline view of follow-ups
 */

import React from 'react';
import { formatDate, formatTime, getRelativeTime, getDaysUntil } from '../../utils/helpers';
import '../../../styles/followup-timeline.css';

const FollowUpTimeline = ({ followUps, isLoading, onSelect }) => {
  if (isLoading) {
    return (
      <div className="timeline-loading">
        <div className="spinner"></div>
        <span>Loading timeline...</span>
      </div>
    );
  }

  if (!followUps || followUps.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No follow-ups to display</p>
      </div>
    );
  }

  // Sort by date
  const sortedFollowUps = [...followUps].sort(
    (a, b) => new Date(a.followUpDate) - new Date(b.followUpDate)
  );

  return (
    <div className="timeline-container">
      <div className="timeline">
        {sortedFollowUps.map((followUp, index) => {
          const daysUntil = getDaysUntil(followUp.followUpDate);
          const isToday = daysUntil === 0;
          const isPast = daysUntil < 0;
          const isUpcoming = daysUntil > 0;

          return (
            <div
              key={followUp._id}
              className={`timeline-item ${isToday ? 'today' : ''} ${isPast ? 'past' : ''} ${
                isUpcoming ? 'upcoming' : ''
              }`}
              onClick={() => onSelect(followUp)}
            >
              {/* Timeline dot */}
              <div className="timeline-dot">
                <div className={`dot-inner ${followUp.status?.toLowerCase()}`}></div>
              </div>

              {/* Timeline content */}
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4 className="timeline-title">{followUp.entityName}</h4>
                  <span className={`timeline-badge badge-${followUp.relatedType.toLowerCase()}`}>
                    {followUp.relatedType}
                  </span>
                </div>

                <div className="timeline-details">
                  <div className="detail-item">
                    <span className="detail-label">Scheduled:</span>
                    <span className="detail-value">
                      {formatDate(followUp.followUpDate, 'short')} at{' '}
                      {formatTime(followUp.followUpDate)}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge status-${followUp.status?.toLowerCase()}`}>
                      {followUp.status}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value detail-time">{getRelativeTime(followUp.followUpDate)}</span>
                  </div>
                </div>

                {followUp.notes && (
                  <div className="timeline-notes">
                    <p>{followUp.notes}</p>
                  </div>
                )}

                {followUp.conversationDetails && (
                  <div className="timeline-conversation">
                    <p>
                      <strong>Conversation:</strong> {followUp.conversationDetails}
                    </p>
                  </div>
                )}

                <div className="timeline-footer">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(followUp);
                    }}
                    className="timeline-button"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Timeline label */}
              {index === 0 && <div className="timeline-label">Start</div>}
            </div>
          );
        })}

        {/* Timeline end */}
        <div className="timeline-end">
          <div className="timeline-dot">
            <div className="dot-inner"></div>
          </div>
          <div className="timeline-label">End</div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpTimeline;
