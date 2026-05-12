/**
 * ClubDetails Page — JECRC Club Management Portal
 * ==================================================
 * Individual club/initiation details with registration
 * via shared Modal + RegistrationForm.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, ArrowLeft, CheckCircle, MapPin, Edit2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Modal from '../components/common/Modal';
import RegistrationForm from '../components/common/RegistrationForm';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDateOnly } from '../utils/dateUtils';
import './ClubDetails.css';

const ClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
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

  const [pastEvents, setPastEvents] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const clubsRes = await fetch(`${API_BASE_URL}/clubs`);
        const eventsRes = await fetch(`${API_BASE_URL}/events`);

        if (clubsRes.ok) {
          const data = await clubsRes.json();
          const found = data.find(c => c.id === parseInt(id));
          setOrg(found);

          if (eventsRes.ok && found) {
            const allEvents = await eventsRes.json();
            const past = allEvents.filter(e => {
              if (e.club_id !== found.id) return false;
              try {
                if (e.date.includes('T')) return new Date(e.date) < new Date();
                return false;
              } catch { return false; }
            });
            setPastEvents(past);
          }

          if (found) {
            setMemberCount(found.member_count || 0);

            // Fetch memories
            fetch(`${API_BASE_URL}/clubs/${found.id}/memories`)
              .then(res => res.json())
              .then(data => setMemories(Array.isArray(data) ? data : []))
              .catch(err => console.error("Failed to load memories", err));

            // Only fetch app status if logged in
            if (user?.id) {
              const appsRes = await fetch(`${API_BASE_URL}/clubs/${found.id}/applications`);
              if (appsRes.ok) {
                const clubApps = await appsRes.json();
                if (user?.id) {
                  const hasApplied = clubApps.some(a => a.user_id === user.id);
                  setApplied(hasApplied);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch details", err);
        setError('Failed to load organization details. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [id, user?.id]);

  const openModal = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setModalError('');
    setShowModal(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!user.id) {
      setModalError('Registration requires a real account. Please log out and register a new account instead of using Demo Login.');
      return;
    }

    setIsSubmitting(true);
    // Note: We no longer update the user's main profile here.
    // Club applications are tied to the logged-in user's account.
    // If we update the profile here, it could overwrite the user's details if they
    // accidentally enter someone else's name while testing.
    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, club_id: org.id, message: applicationMessage })
      });
      if (res.ok) {
        setApplied(true);
        setShowModal(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        setModalError(errData.detail || 'Application failed. Please make sure all fields are valid.');
      }
    } catch (err) {
      setModalError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: '5rem' }}><LoadingSpinner message="Loading details..." /></div>;
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '5rem' }}>
        <ErrorBanner message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="container club-details-not-found">
        <h2>Organization not found</h2>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const isInitiation = org.category === 'Initiation';

  return (
    <div className="container club-details-page">
      <button onClick={() => navigate(-1)} className="btn club-details-back">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="card glass-panel club-details-card">
        <div
          className="club-details-banner"
          style={{
            background: org.banner_image
              ? `url(${org.banner_image}) center/cover no-repeat`
              : 'var(--accent-gradient)',
          }}
        >
          <img
            src={org.logo || "https://via.placeholder.com/150"}
            alt={org.name}
            className="club-details-logo"
          />
        </div>

        <div className="card-body club-details-body">
          <div className="club-details-top">
            <div>
              <h1 className="club-details-name">{org.name}</h1>
              <div className="club-details-badges">
                <span className={`badge ${isInitiation ? 'badge-success' : 'badge-primary'}`}>
                  {org.category}
                </span>
              </div>
            </div>

            <div>
              {user && (user.role === 'admin' || (user.role === 'club_admin' && (String(org.admin_id) === String(user.id) || org.student_email === user.email))) && (
                <button className="btn btn-secondary" onClick={() => navigate('/admin')} style={{ marginRight: '1rem' }}>
                  <Edit2 size={18} /> Manage Organization
                </button>
              )}
              {applied ? (
                <button className="btn btn-secondary" disabled style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
                  <CheckCircle size={18} /> Application Submitted
                </button>
              ) : (
                <button className="btn btn-primary" onClick={openModal}>
                  Apply to Join
                </button>
              )}
              {message && <div className="club-details-msg">{message}</div>}
            </div>
          </div>

          <div className="club-details-divider"></div>

          <div className="club-details-grid">
            <div>
              <h3 className="club-details-section-title">About {org.name}</h3>
              <p className="club-details-description">{org.description}</p>

              <h3 className="club-details-section-title">Past Events</h3>
              {pastEvents.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No past events recorded yet.</p>
              ) : (
                <div className="club-details-events-list">
                  {pastEvents.map(ev => {
                    const d = formatDateOnly(ev.date);
                    return (
                      <div key={ev.id} className="card glass-panel club-details-event-item">
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{ev.title}</h4>
                        <div className="club-details-event-meta">
                          <span className="club-details-event-meta-text">{d}</span>
                          {ev.venue && (
                            <span className="club-details-event-meta-text">
                              <MapPin size={12} /> {ev.venue}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="glass-panel club-details-info-panel">
                <h4 className="club-details-info-title">Key Information</h4>

                <div className="club-details-info-list">
                  <div>
                    <div className="club-details-info-label">Total Members</div>
                    <div className="club-details-info-value-lg">
                      <Users size={18} color="var(--accent-primary)" />
                      <span>{memberCount}</span>
                    </div>
                  </div>

                  <div className="club-details-info-divider"></div>

                  {org.core_team && (
                    <>
                      <div>
                        <div className="club-details-info-label">Core Team</div>
                        <div className="club-details-core-team">
                          {org.core_team.split(',').map((name, i) => (
                            <span key={i}>• {name.trim()}</span>
                          ))}
                        </div>
                      </div>
                      <div className="club-details-info-divider"></div>
                    </>
                  )}

                  <div>
                    <div className="club-details-info-label">Student Head</div>
                    <div className="club-details-info-value">
                      <UserCheck size={18} color="var(--accent-primary)" />
                      <span>{org.student_head}</span>
                    </div>
                    {org.student_email && (
                      <a href={`mailto:${org.student_email}`} className="club-details-email">
                        {org.student_email}
                      </a>
                    )}
                  </div>

                  <div>
                    <div className="club-details-info-label">Faculty Advisor</div>
                    <div className="club-details-info-value">
                      <UserCheck size={18} color="var(--accent-secondary)" />
                      <span>{org.faculty_head}</span>
                    </div>
                    {org.faculty_email && (
                      <a href={`mailto:${org.faculty_email}`} className="club-details-email">
                        {org.faculty_email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Memories Gallery */}
          {memories.length > 0 && (
            <div style={{ marginTop: '4rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                Past Memories & Glimpses
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {memories.map(memory => (
                  <div key={memory.id} className="card glass-panel" style={{ overflow: 'hidden', aspectRatio: '1', padding: 0, background: '#000', borderRadius: 'var(--radius-lg)' }}>
                    {memory.media_type === 'video' ? (
                      <video 
                        src={memory.media_url} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        muted loop autoPlay playsInline 
                      />
                    ) : (
                      <img 
                        src={memory.media_url} 
                        alt="Club Memory" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registration Form"
      >
        <RegistrationForm
          editProfileData={editProfileData}
          onProfileChange={handleProfileChange}
          applicationMessage={applicationMessage}
          onMessageChange={setApplicationMessage}
          onSubmit={submitApplication}
          onCancel={() => setShowModal(false)}
          isSubmitting={isSubmitting}
          modalError={modalError}
        />
      </Modal>
    </div>
  );
};

export default ClubDetails;
