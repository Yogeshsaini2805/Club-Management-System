import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="section-title">All Events</h1>
        <p className="section-subtitle">
          Discover and register for exciting events hosted by our clubs and initiations.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading events...</div>
      ) : error ? (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', textAlign: 'center', color: '#dc2626' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem' }}>Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events currently scheduled.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          {events.map(event => {
            let displayMonth = "";
            let displayDay = "";
            let fullDateStr = event.date;
            let isPast = false;

            try {
              if (event.date.includes('T')) {
                const d = new Date(event.date);
                if (!isNaN(d)) {
                  displayMonth = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                  displayDay = d.toLocaleString('en-US', { day: '2-digit' });
                  fullDateStr = d.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
                  isPast = d < new Date();
                }
              } else {
                // Fallback for legacy format like "15 Nov, 2:00 PM"
                displayMonth = event.date.split(' ')[1] || "UNK";
                displayDay = event.date.split(' ')[0] || "00";
              }
            } catch (e) {}

            return (
            <div key={event.id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', opacity: isPast ? 0.7 : 1 }}>
              <div style={{ background: isPast ? 'var(--bg-card-hover)' : 'var(--accent-gradient)', padding: '2rem', color: isPast ? 'var(--text-muted)' : 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: '150px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{displayDay}</span>
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{displayMonth}</span>
              </div>
              
              <div className="card-body" style={{ flex: 1, padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: isPast ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{event.title}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={16} /> {fullDateStr}</span>
                      {event.venue && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-secondary)' }}>
                          <MapPin size={16} /> {event.venue}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${isPast ? 'badge-secondary' : 'badge-primary'}`}>
                    {isPast ? 'Past Event' : 'Upcoming'}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {event.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {messages[event.id] ? (
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{messages[event.id]}</span>
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

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Event Registration Form</h2>
            {modalError && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)' }}>{modalError}</div>}
            <form onSubmit={submitRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Name</label>
                <input type="text" className="form-control" name="name" value={editProfileData.name} onChange={handleProfileChange} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={editProfileData.email} disabled title="Email cannot be changed" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Roll Number</label>
                  <input type="text" className="form-control" name="roll_no" value={editProfileData.roll_no} onChange={handleProfileChange} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Branch</label>
                  <input type="text" className="form-control" name="branch" value={editProfileData.branch} onChange={handleProfileChange} required />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message / Queries (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  value={applicationMessage} 
                  onChange={(e) => setApplicationMessage(e.target.value)} 
                  placeholder="Any questions or special requirements for the event..."
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }} disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Confirm Registration'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;

