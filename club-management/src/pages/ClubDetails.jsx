import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, ArrowLeft, CheckCircle, MapPin, Edit2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

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

            // Use the correct per-club applications endpoint
            try {
              const appsRes = await fetch(`${API_BASE_URL}/clubs/${found.id}/applications`);
              if (appsRes.ok) {
                const clubApps = await appsRes.json();
                if (user?.id) {
                  const hasApplied = clubApps.some(a => a.user_id === user.id);
                  setApplied(hasApplied);
                }
              }
            } catch (appErr) {
              // Non-critical: just means we can't check applied status
              console.error("Failed to fetch applications", appErr);
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
    return <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>Loading details...</div>;
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '5rem' }}>
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', textAlign: 'center', color: '#dc2626' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem' }}>Retry</button>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <h2>Organization not found</h2>
        <button className="btn btn-primary" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>Go Back</button>
      </div>
    );
  }

  const isInitiation = org.category === 'Initiation';

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn"
        style={{ color: 'var(--text-secondary)', padding: '0', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="card glass-panel" style={{ overflow: 'visible', padding: '1rem' }}>
        <div style={{ height: '150px', background: org.banner_image ? `url(${org.banner_image}) center/cover no-repeat` : 'var(--accent-gradient)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', position: 'relative' }}>
          <img
            src={org.logo || "https://via.placeholder.com/150"}
            alt={org.name}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              position: 'absolute',
              bottom: '-60px',
              left: '2rem',
              border: '4px solid var(--bg-card)',
              background: '#fff',
              objectFit: 'cover'
            }}
          />
        </div>

        <div className="card-body" style={{ paddingTop: '4.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{org.name}</h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
              {message && <div style={{ color: 'var(--danger)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{message}</div>}
            </div>
          </div>

          <div style={{ margin: '3rem 0', height: '1px', background: 'var(--border-light)' }}></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem' }}>
            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>About {org.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '3rem' }}>
                {org.description}
              </p>

              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Past Events</h3>
              {pastEvents.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No past events recorded yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {pastEvents.map(ev => {
                    let d = ev.date;
                    try { if (d.includes('T')) d = new Date(d).toLocaleDateString(); } catch (e) { }
                    return (
                      <div key={ev.id} className="card glass-panel" style={{ padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{ev.title}</h4>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d}</span>
                          {ev.venue && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Key Information</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total Members</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      <Users size={18} color="var(--accent-primary)" />
                      <span>{memberCount}</span>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border-light)' }}></div>

                  {org.core_team && (
                    <>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Core Team</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                          {org.core_team.split(',').map((name, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• {name.trim()}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ height: '1px', background: 'var(--border-light)' }}></div>
                    </>
                  )}

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Student Head</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <UserCheck size={18} color="var(--accent-primary)" />
                      <span>{org.student_head}</span>
                    </div>
                    {org.student_email && (
                      <a href={`mailto:${org.student_email}`} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                        {org.student_email}
                      </a>
                    )}
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Faculty Advisor</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <UserCheck size={18} color="var(--accent-secondary)" />
                      <span>{org.faculty_head}</span>
                    </div>
                    {org.faculty_email && (
                      <a href={`mailto:${org.faculty_email}`} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                        {org.faculty_email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Registration Form</h2>
            {modalError && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)' }}>{modalError}</div>}
            <form onSubmit={submitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <label className="form-label">Why do you want to join? (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Share your motivation or any relevant experience..."
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Confirm Registration'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetails;

