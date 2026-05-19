/**
 * FollowUpTable Component
 * Table display for follow-ups with actions
 */

import React from 'react';
import { formatDateTime, formatDate, getRelativeTime, truncateText } from '../../utils/helpers';
import '../../../styles/followup-table.css';

const FollowUpTable = ({
  entries,
  isLoading,
  type = 'entries',
  onAddFollowUp,
  onEdit,
  onDelete,
  onView,
  emptyMessage
}) => {
  const renderEntriesTable = () => (
    <table className="followup-table">
      <thead>
        <tr>
          <th className="col-index">#</th>
          <th className="col-name">
            {type === 'leads' ? 'Lead Name' : 'Quotation Title'}
          </th>
          <th className="col-email">Email</th>
          <th className="col-phone">Phone</th>
          <th className="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 ? (
          <tr>
            <td colSpan="5" className="empty-message">
              {emptyMessage || 'No entries found'}
            </td>
          </tr>
        ) : (
          entries.map((entry, idx) => (
            <tr key={entry._id} className="table-row">
              <td className="col-index">{idx + 1}</td>
              <td className="col-name">{entry.name || entry.title}</td>
              <td className="col-email">{entry.email || '-'}</td>
              <td className="col-phone">{entry.phone || '-'}</td>
              <td className="col-actions">
                <button
                  onClick={() => onAddFollowUp(entry)}
                  className="action-button add-button"
                  title="Add Follow-Up"
                >
                  Add Follow-Up
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderFollowUpsTable = () => (
    <table className="followup-table followup-list-table">
      <thead>
        <tr>
          <th className="col-index">#</th>
          <th className="col-name">Related To</th>
          <th className="col-email">Contact</th>
          <th className="col-date">Follow-Up Date</th>
          <th className="col-status">Status</th>
          <th className="col-notes">Notes</th>
          <th className="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 ? (
          <tr>
            <td colSpan="7" className="empty-message">
              {emptyMessage || 'No follow-ups found'}
            </td>
          </tr>
        ) : (
          entries.map((entry, idx) => (
            <tr key={entry._id} className="table-row">
              <td className="col-index">{idx + 1}</td>
              <td className="col-name">
                <div>
                  <strong>{entry.entityName}</strong>
                  <small className="type-badge">{entry.relatedType}</small>
                </div>
              </td>
              <td className="col-email">{entry.entityEmail || '-'}</td>
              <td className="col-date">
                <div className="date-cell">
                  <span>{formatDate(entry.followUpDate, 'short')}</span>
                  <small>{getRelativeTime(entry.followUpDate)}</small>
                </div>
              </td>
              <td className="col-status">
                <span className={`status-badge status-${entry.status?.toLowerCase()}`}>
                  {entry.status}
                </span>
              </td>
              <td className="col-notes">
                <span title={entry.notes}>
                  {truncateText(entry.notes, 30)}
                </span>
              </td>
              <td className="col-actions">
                <div className="action-buttons">
                  <button
                    onClick={() => onView(entry)}
                    className="action-button view-button"
                    title="View Details"
                    aria-label="View"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(entry)}
                    className="action-button edit-button"
                    title="Edit Follow-Up"
                    aria-label="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(entry._id)}
                    className="action-button delete-button"
                    title="Delete Follow-Up"
                    aria-label="Delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className="followup-table-wrapper">
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      )}

      {!isLoading && (
        <div className="table-container">
          {type === 'entries' ? renderEntriesTable() : renderFollowUpsTable()}
        </div>
      )}
    </div>
  );
};

export default FollowUpTable;
