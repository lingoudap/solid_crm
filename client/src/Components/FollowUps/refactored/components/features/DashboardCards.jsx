/**
 * DashboardCards Component
 * Statistics and summary cards
 */

import React from 'react';
import { FOLLOW_UP_STATUS } from '../../constants/config';
import '../../../styles/dashboard-cards.css';

const DashboardCards = ({ followUps, isLoading }) => {
  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!Array.isArray(followUps)) {
      return {
        total: 0,
        pending: 0,
        completed: 0,
        overdue: 0,
        rescheduled: 0
      };
    }

    return {
      total: followUps.length,
      pending: followUps.filter(fu => fu.status === FOLLOW_UP_STATUS.PENDING).length,
      completed: followUps.filter(fu => fu.status === FOLLOW_UP_STATUS.COMPLETED).length,
      overdue: followUps.filter(fu => fu.status === FOLLOW_UP_STATUS.OVERDUE).length,
      rescheduled: followUps.filter(fu => fu.status === FOLLOW_UP_STATUS.RESCHEDULED).length
    };
  }, [followUps]);

  // Calculate percentages
  const getPercentage = (value) => {
    return stats.total === 0 ? 0 : Math.round((value / stats.total) * 100);
  };

  const cards = [
    {
      id: 'total',
      title: 'Total Follow-Ups',
      value: stats.total,
      color: '#6366f1',
      icon: '📋'
    },
    {
      id: 'pending',
      title: 'Pending',
      value: stats.pending,
      percentage: getPercentage(stats.pending),
      color: '#fbbf24',
      icon: '⏳'
    },
    {
      id: 'completed',
      title: 'Completed',
      value: stats.completed,
      percentage: getPercentage(stats.completed),
      color: '#34d399',
      icon: '✓'
    },
    {
      id: 'overdue',
      title: 'Overdue',
      value: stats.overdue,
      percentage: getPercentage(stats.overdue),
      color: '#f87171',
      icon: '⚠️'
    },
    {
      id: 'rescheduled',
      title: 'Rescheduled',
      value: stats.rescheduled,
      percentage: getPercentage(stats.rescheduled),
      color: '#60a5fa',
      icon: '🔄'
    }
  ];

  return (
    <div className="dashboard-cards">
      {cards.map((card) => (
        <div
          key={card.id}
          className="dashboard-card"
          style={{ borderLeftColor: card.color }}
        >
          {isLoading ? (
            <div className="card-loading">
              <div className="skeleton"></div>
            </div>
          ) : (
            <>
              <div className="card-header">
                <span className="card-icon">{card.icon}</span>
                <h3 className="card-title">{card.title}</h3>
              </div>
              <div className="card-value" style={{ color: card.color }}>
                {card.value}
              </div>
              {card.percentage !== undefined && (
                <div className="card-percentage" style={{ color: card.color }}>
                  {card.percentage}%
                </div>
              )}
              <div
                className="card-indicator"
                style={{
                  backgroundColor: card.color,
                  height: '3px',
                  marginTop: '8px',
                  opacity: 0.5
                }}
              ></div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
