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
import { formatEventDate, formatEventDateCompact, getMonthDay, getEventStatus } from '../utils/dateUtils';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState({});
  const { user } = useAuth();
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
    // Note: We no longer update the user's main profile here.
    // The custom name, roll_no, and branch are sent directly with the event registration
    // so a user can register other students without overwriting their own personal details.
    try {
      const res = await fetch(`${API_BASE_URL}/event-registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          event_id: selectedEventId,
          name: editProfileData.name,
          roll_no: editProfileData.roll_no,
          branch: editProfileData.branch,
          message: applicationMessage
        })
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

  // Categorize events
  const upcomingAndLiveEvents = [];
  const pastEvents = [];

  events.forEach(event => {
    const status = getEventStatus(event.date, event.end_date);
    event._status = status; // attach status for rendering logic
    if (status === 'past') {
      pastEvents.push(event);
    } else {
      // both running and upcoming go here
      upcomingAndLiveEvents.push(event);
    }
  });

  // Sort: Live first, then upcoming (earliest first)
  upcomingAndLiveEvents.sort((a, b) => {
    if (a._status === 'running' && b._status !== 'running') return -1;
    if (a._status !== 'running' && b._status === 'running') return 1;
    return new Date(a.date) - new Date(b.date);
  });

  // Sort past events (most recent past first)
  pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderEventCard = (event, isPastSection) => {
    const { month: displayMonth, day: displayDay } = getMonthDay(event.date);
    const fullDateStr = formatEventDate(event.date);
    const isMultiDay = event.end_date && event.date.split('T')[0] !== event.end_date.split('T')[0];
    
    let dateDisplay = fullDateStr;
    if (isMultiDay) {
      dateDisplay = `${formatEventDateCompact(event.date)} - ${formatEventDateCompact(event.end_date)}`;
    }

    return (
      <div key={event.id} className={`card glass-panel event-card ${isPastSection ? 'event-past' : ''}`}>
        <div className="event-date-strip" style={{ background: isPastSection ? 'var(--bg-card-hover)' : 'var(--accent-gradient)' }}>
          <span className="event-date-day">{displayDay}</span>
          <span className="event-date-month">{displayMonth}</span>
        </div>
        
        <div className="card-body event-body" style={{ position: 'relative' }}>
          <div className="event-top">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h3 className={`event-title ${isPastSection ? 'event-title-past' : ''}`} style={{ margin: 0 }}>
                  {event.title}
                </h3>
                {event._status === 'running' && (
                  <span className="badge-live">
                    <span className="live-dot"></span> LIVE NOW
                  </span>
                )}
                {isMultiDay && (
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Multi-Day
                  </span>
                )}
              </div>
              <div className="event-meta">
                <span className="event-meta-item"><Calendar size={16} /> {dateDisplay}</span>
                {event.venue && (
                  <span className="event-meta-item event-venue">
                    <MapPin size={16} /> {event.venue}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <p className="event-description">{event.description}</p>
          
          <div className="event-bottom">
            <div className="event-club-tag">
              Organized by ID #{event.club_id}
            </div>
            
            {messages[event.id] ? (
              <span className="status-badge success">{messages[event.id]}</span>
            ) : isPastSection ? (
              <span className="status-badge past">Event Ended</span>
            ) : (
              <button className="btn btn-primary" onClick={() => openModal(event.id)}>
                {event._status === 'running' ? 'Join Now' : 'Register'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
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
        <>
          {/* Active & Upcoming Events */}
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }}></span>
              Live & Upcoming
            </h2>
            {upcomingAndLiveEvents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No upcoming events at the moment.</p>
            ) : (
              <div className="events-list">
                {upcomingAndLiveEvents.map(e => renderEventCard(e, false))}
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }}></span>
                Past Events
              </h2>
              <div className="events-list">
                {pastEvents.map(e => renderEventCard(e, true))}
              </div>
            </div>
          )}
        </>
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
