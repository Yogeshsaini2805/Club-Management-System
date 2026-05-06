/**
 * Events Page — JECRC Club Management Portal
 * =============================================
 * Lists all events with registration via shared Modal + RegistrationForm.
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import RegistrationForm from '../components/common/RegistrationForm';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatEventDate, getMonthDay, isEventPast } from '../utils/dateUtils';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState({});
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const [editProfileData, setEditProfileData] = useState({ name: '', email: '', roll_no: '', branch: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (user && showModal) {
      setEditProfileData({
        name: user.name || '',
        email: user.email || '',
        roll_no: user.roll_no || '',
        branch: user.branch || ''
      });
    }
  }, [user, showModal]);
  
  const handleProfileChange = (e) => {
    setEditProfileData({ ...editProfileData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (response.ok) {
          setEvents(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch events", error);
        setError('Failed to load events. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const openModal = (eventId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setModalError('');
    setSelectedEventId(eventId);
    setShowModal(true);
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!user.id) {
      setModalError('Registration requires a real account. Please log out and register a new account instead of using Demo Login.');
      return;
    }
    setIsSubmitting(true);
    // Update profile first if changed
    if (
      editProfileData.name !== user.name ||
      editProfileData.roll_no !== user.roll_no ||
      editProfileData.branch !== user.branch
    ) {
      await updateUserProfile({
        name: editProfileData.name,
        roll_no: editProfileData.roll_no,
        branch: editProfileData.branch
      });
    }
    try {
      const res = await fetch(`${API_BASE_URL}/event-registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, event_id: selectedEventId, message: applicationMessage })
      });
      if (res.ok) {
        setMessages({ ...messages, [selectedEventId]: 'Successfully Registered!' });
        setShowModal(false);
        setApplicationMessage('');
      } else {
        const errData = await res.json().catch(() => ({}));
        setModalError(errData.detail || 'Registration failed. Please make sure all fields are valid.');
      }
    } catch (err) {
      setModalError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container events-page">
      <div className="events-header">
        <h1 className="section-title">All Events</h1>
        <p className="section-subtitle">
          Discover and register for exciting events hosted by our clubs and initiations.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading events..." />
      ) : error ? (
        <ErrorBanner message={error} onRetry={() => window.location.reload()} />
      ) : events.length === 0 ? (
        <div className="events-empty">No events currently scheduled.</div>
      ) : (
        <div className="events-list">
          {events.map(event => {
            const { month: displayMonth, day: displayDay } = getMonthDay(event.date);
            const fullDateStr = formatEventDate(event.date);
            const isPast = isEventPast(event.date);

            return (
            <div key={event.id} className={`card glass-panel event-card ${isPast ? 'event-past' : ''}`}>
              <div className="event-date-strip" style={{ background: isPast ? 'var(--bg-card-hover)' : 'var(--accent-gradient)' }}>
                <span className="event-date-day">{displayDay}</span>
                <span className="event-date-month">{displayMonth}</span>
              </div>
              
              <div className="card-body event-body">
                <div className="event-top">
                  <div>
                    <h3 className={`event-title ${isPast ? 'event-title-past' : ''}`}>{event.title}</h3>
                    <div className="event-meta">
                      <span className="event-meta-item"><Calendar size={16} /> {fullDateStr}</span>
                      {event.venue && (
                        <span className="event-meta-item event-venue">
                          <MapPin size={16} /> {event.venue}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${isPast ? 'badge-secondary' : 'badge-primary'}`}>
                    {isPast ? 'Past Event' : 'Upcoming'}
                  </span>
                </div>
                
                <p className="event-description">{event.description}</p>
                
                <div className="event-actions">
                  {messages[event.id] ? (
                    <span className="event-success">{messages[event.id]}</span>
                  ) : isPast ? (
                    <button className="btn btn-secondary" disabled style={{ opacity: 0.5 }}>
                      Registrations Closed
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => openModal(event.id)}>
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Event Registration Form"
      >
        <RegistrationForm
          editProfileData={editProfileData}
          onProfileChange={handleProfileChange}
          applicationMessage={applicationMessage}
          onMessageChange={setApplicationMessage}
          onSubmit={submitRegistration}
          onCancel={() => setShowModal(false)}
          isSubmitting={isSubmitting}
          modalError={modalError}
          submitLabel="Confirm Registration"
          submittingLabel="Registering..."
          messageLabel="Message / Queries (Optional)"
          messagePlaceholder="Any questions or special requirements for the event..."
        />
      </Modal>
    </div>
  );
};

export default Events;
