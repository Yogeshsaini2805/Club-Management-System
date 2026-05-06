/**
 * RegistrationForm — Shared registration form for clubs and events
 * Used by both ClubDetails.jsx and Events.jsx to collect student info.
 */

import React from 'react';

const RegistrationForm = ({
  editProfileData,
  onProfileChange,
  applicationMessage,
  onMessageChange,
  onSubmit,
  onCancel,
  isSubmitting,
  modalError,
  submitLabel = 'Confirm Registration',
  submittingLabel = 'Submitting...',
  messagePlaceholder = 'Share your motivation or any relevant experience...',
  messageLabel = 'Why do you want to join? (Optional)',
}) => {
  return (
    <>
      {modalError && (
        <div style={{
          color: 'var(--danger)',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          padding: '0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {modalError}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={editProfileData.name}
            onChange={onProfileChange}
            required
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={editProfileData.email}
            disabled
            title="Email cannot be changed"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Roll Number</label>
            <input
              type="text"
              className="form-control"
              name="roll_no"
              value={editProfileData.roll_no}
              onChange={onProfileChange}
              required
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Branch</label>
            <input
              type="text"
              className="form-control"
              name="branch"
              value={editProfileData.branch}
              onChange={onProfileChange}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{messageLabel}</label>
          <textarea
            className="form-control"
            rows="3"
            value={applicationMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={messagePlaceholder}
          ></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              flex: 1,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </form>
    </>
  );
};

export default RegistrationForm;
