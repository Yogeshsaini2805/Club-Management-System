/**
 * ErrorBanner — Reusable error display with retry button
 * Replaces identical error markup duplicated in 5+ pages.
 */

import React from 'react';
import './ErrorBanner.css';

const ErrorBanner = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="error-banner">
      <p className="error-banner-message">{message}</p>
      {onRetry && (
        <button className="error-banner-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
