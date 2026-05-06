/**
 * Date Utilities — JECRC Club Management Portal
 * ================================================
 * Shared date formatting and comparison helpers.
 * Eliminates repeated date-parsing logic across pages.
 */

/**
 * Format an ISO date string for full display.
 * e.g. "2026-06-15T10:00:00" → "June 15, 2026, 10:00 AM"
 * Falls back to the raw string if parsing fails.
 */
export function formatEventDate(isoDate) {
  if (!isoDate) return '';
  try {
    if (isoDate.includes('T')) {
      const d = new Date(isoDate);
      if (!isNaN(d)) {
        return d.toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
    }
  } catch (e) { /* fall through */ }
  return isoDate;
}

/**
 * Format an ISO date string for compact display.
 * e.g. "2026-06-15T10:00:00" → "JUN 15, 10:00 AM"
 */
export function formatEventDateCompact(isoDate) {
  if (!isoDate) return '';
  try {
    if (isoDate.includes('T')) {
      const d = new Date(isoDate);
      if (!isNaN(d)) {
        return d
          .toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
          .toUpperCase();
      }
    }
  } catch (e) { /* fall through */ }
  return isoDate;
}

/**
 * Get month abbreviation and day number from an ISO date.
 * Returns { month: "JUN", day: "15" } or fallback values.
 */
export function getMonthDay(isoDate) {
  if (!isoDate) return { month: '', day: '' };
  try {
    if (isoDate.includes('T')) {
      const d = new Date(isoDate);
      if (!isNaN(d)) {
        return {
          month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
          day: d.toLocaleString('en-US', { day: '2-digit' }),
        };
      }
    }
    // Fallback for legacy format like "15 Nov, 2:00 PM"
    const parts = isoDate.split(' ');
    return {
      month: parts[1] || 'UNK',
      day: parts[0] || '00',
    };
  } catch (e) {
    return { month: '', day: '' };
  }
}

/**
 * Check if an event date is in the past.
 */
export function isEventPast(isoDate) {
  if (!isoDate) return false;
  try {
    if (isoDate.includes('T')) {
      return new Date(isoDate) < new Date();
    }
  } catch (e) { /* fall through */ }
  return false;
}

/**
 * Format an ISO date for simple date-only display.
 * e.g. "2026-06-15T10:00:00" → "6/15/2026"
 */
export function formatDateOnly(isoDate) {
  if (!isoDate) return '';
  try {
    if (isoDate.includes('T')) {
      const d = new Date(isoDate);
      if (!isNaN(d)) return d.toLocaleDateString();
    }
  } catch (e) { /* fall through */ }
  return isoDate;
}
