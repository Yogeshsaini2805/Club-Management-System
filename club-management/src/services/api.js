/**
 * API Service Layer — JECRC Club Management Portal
 * =================================================
 * Centralized API client. All backend communication
 * goes through this module for consistent error
 * handling and auth headers.
 */

import { API_BASE_URL } from '../config';

/* ---- Generic Fetch Wrapper ---- */

async function fetchJson(endpoint, options = {}) {
  const { method = 'GET', body, user, headers: extraHeaders = {} } = options;

  const headers = {
    ...extraHeaders,
  };

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (user) {
    headers['X-User-Id'] = String(user.id || '');
    headers['X-User-Role'] = user.role || '';
  }

  const fetchOptions = {
    method,
    headers,
  };

  if (body) {
    fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.detail = errorData.detail;
    throw error;
  }

  // For DELETE endpoints that may return a message
  return response.json();
}

/* ---- Auth Endpoints ---- */

export const authApi = {
  login: (email, password) =>
    fetchJson('/login', { method: 'POST', body: { email, password } }),

  register: (userData) =>
    fetchJson('/register', { method: 'POST', body: userData }),

  changePassword: (email, oldPassword, newPassword) =>
    fetchJson('/change-password', {
      method: 'POST',
      body: { email, old_password: oldPassword, new_password: newPassword },
    }),
};

/* ---- User Endpoints ---- */

export const usersApi = {
  updateProfile: (userId, userData, user) =>
    fetchJson(`/users/${userId}`, { method: 'PUT', body: userData, user }),
};

/* ---- Club Endpoints ---- */

export const clubsApi = {
  getAll: () => fetchJson('/clubs'),

  create: (clubData, user) =>
    fetchJson('/clubs', { method: 'POST', body: clubData, user }),

  update: (clubId, clubData, user) =>
    fetchJson(`/clubs/${clubId}`, { method: 'PUT', body: clubData, user }),

  delete: (clubId, user) =>
    fetchJson(`/clubs/${clubId}`, { method: 'DELETE', user }),

  getApplications: (clubId) =>
    fetchJson(`/clubs/${clubId}/applications`),
};

/* ---- Event Endpoints ---- */

export const eventsApi = {
  getAll: () => fetchJson('/events'),

  create: (eventData, user) =>
    fetchJson('/events', { method: 'POST', body: eventData, user }),

  update: (eventId, eventData, user) =>
    fetchJson(`/events/${eventId}`, { method: 'PUT', body: eventData, user }),

  delete: (eventId, user) =>
    fetchJson(`/events/${eventId}`, { method: 'DELETE', user }),

  getRegistrations: (eventId) =>
    fetchJson(`/events/${eventId}/registrations`),
};

/* ---- Application & Registration Endpoints ---- */

export const applicationsApi = {
  create: (applicationData) =>
    fetchJson('/applications', { method: 'POST', body: applicationData }),
};

export const eventRegistrationsApi = {
  create: (registrationData) =>
    fetchJson('/event-registrations', { method: 'POST', body: registrationData }),
};

/* ---- File Upload ---- */

export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson('/upload-logo', { method: 'POST', body: formData });
  },
};
