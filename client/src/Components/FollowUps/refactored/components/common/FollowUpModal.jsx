/**
 * FollowUpModal Component
 * Modal for adding and editing follow-ups
 */

import React, { useState, useEffect } from 'react';
import '../../../styles/followup-modal.css';

const FollowUpModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedEntry,
  formData,
  onFormDataChange,
  isSubmitting,
  error,
  mode = 'create'
}) => {
  const [validationErrors, setValidationErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (mode === 'create') {
      if (!formData.followUpDate) {
        errors.followUpDate = 'Date is required';
      }
      if (!formData.followUpTime) {
        errors.followUpTime = 'Time is required';
      }
      if (!formData.followUpNote || formData.followUpNote.trim().length < 3) {
        errors.followUpNote = 'Note must be at least 3 characters';
      }
    } else {
      if (!formData.conversationDetails || formData.conversationDetails.trim().length < 3) {
        errors.conversationDetails = 'Details must be at least 3 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  // Handle form field change
  const handleChange = (field, value) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create'
              ? `Add Follow-Up for ${selectedEntry?.name || selectedEntry?.title}`
              : 'Update Follow-Up'}
          </h2>
          <button
            onClick={onClose}
            className="modal-close"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {mode === 'create' ? (
            <>
              {/* Date and Time Row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="followUpDate">
                    Date <span className="required">*</span>
                  </label>
                  <input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => handleChange('followUpDate', e.target.value)}
                    className={`form-input ${validationErrors.followUpDate ? 'error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {validationErrors.followUpDate && (
                    <span className="error-message">{validationErrors.followUpDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="followUpTime">
                    Time <span className="required">*</span>
                  </label>
                  <input
                    id="followUpTime"
                    type="time"
                    value={formData.followUpTime}
                    onChange={(e) => handleChange('followUpTime', e.target.value)}
                    className={`form-input ${validationErrors.followUpTime ? 'error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {validationErrors.followUpTime && (
                    <span className="error-message">{validationErrors.followUpTime}</span>
                  )}
                </div>
              </div>

              {/* Remark Field */}
              <div className="form-group full-width">
                <label htmlFor="followUpNote">
                  Remark <span className="required">*</span>
                </label>
                <textarea
                  id="followUpNote"
                  value={formData.followUpNote}
                  onChange={(e) => handleChange('followUpNote', e.target.value)}
                  placeholder="Enter follow-up remark (min 3 characters)"
                  className={`form-textarea ${validationErrors.followUpNote ? 'error' : ''}`}
                  disabled={isSubmitting}
                  rows="4"
                  maxLength="500"
                />
                <div className="char-counter">
                  {formData.followUpNote.length}/500
                </div>
                {validationErrors.followUpNote && (
                  <span className="error-message">{validationErrors.followUpNote}</span>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Conversation Details */}
              <div className="form-group full-width">
                <label htmlFor="conversationDetails">
                  Conversation Details <span className="required">*</span>
                </label>
                <textarea
                  id="conversationDetails"
                  value={formData.conversationDetails}
                  onChange={(e) => handleChange('conversationDetails', e.target.value)}
                  placeholder="Enter conversation details"
                  className={`form-textarea ${validationErrors.conversationDetails ? 'error' : ''}`}
                  disabled={isSubmitting}
                  rows="4"
                  maxLength="500"
                />
                <div className="char-counter">
                  {formData.conversationDetails.length}/500
                </div>
                {validationErrors.conversationDetails && (
                  <span className="error-message">{validationErrors.conversationDetails}</span>
                )}
              </div>

              {/* Next Follow-Up Date (optional) */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nextFollowUpDate">
                    Schedule Next Follow-Up (Optional)
                  </label>
                  <input
                    id="nextFollowUpDate"
                    type="date"
                    value={formData.nextFollowUpDate}
                    onChange={(e) => handleChange('nextFollowUpDate', e.target.value)}
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nextFollowUpTime">Time</label>
                  <input
                    id="nextFollowUpTime"
                    type="time"
                    value={formData.nextFollowUpTime}
                    onChange={(e) => handleChange('nextFollowUpTime', e.target.value)}
                    className="form-input"
                    disabled={isSubmitting}
                    defaultValue="09:00"
                  />
                </div>
              </div>
            </>
          )}

          {/* Modal Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="button button-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Submitting...
                </>
              ) : mode === 'create' ? (
                'Add Follow-Up'
              ) : (
                'Update Follow-Up'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowUpModal;
