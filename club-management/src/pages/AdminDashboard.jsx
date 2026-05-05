import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ShieldAlert, Trash2, Calendar, Users, CalendarPlus, Edit2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // eslint-disable-line no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingClubId, setEditingClubId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Club',
    description: '',
    student_head: '',
    faculty_head: '',
    core_team: '',
    student_email: '',
    faculty_email: '',
    logo: 'https://via.placeholder.com/150/1e293b/ffffff?text=C',
    banner_image: '',
    member_count: 0
  });

  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [eventFormData, setEventFormData] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    club_id: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegType, setSelectedRegType] = useState('club');
  const [selectedRegId, setSelectedRegId] = useState('');
  
  useEffect(() => {
    if (!selectedRegId) {
      setRegistrations([]);
      return;
    }
    const fetchRegs = async () => {
      try {
        const url = selectedRegType === 'club' 
          ? `${API_BASE_URL}/clubs/${selectedRegId}/applications`
          : `${API_BASE_URL}/events/${selectedRegId}/registrations`;
        const res = await fetch(url);
        if (res.ok) {
          setRegistrations(await res.json());
        } else {
          setRegistrations([]);
        }
      } catch (err) {
        console.error("Failed to fetch registrations", err);
      }
    };
    fetchRegs();
  }, [selectedRegId, selectedRegType]);
  const [eventMessage, setEventMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const clubsRes = await fetch(`${API_BASE_URL}/clubs`);
      const eventsRes = await fetch(`${API_BASE_URL}/events`);
      
      let fetchedClubs = [];
      if (clubsRes.ok) {
        fetchedClubs = await clubsRes.json();
        setClubs(fetchedClubs);
      }
      if (eventsRes.ok) {
        setEvents(await eventsRes.json());
      }

      // Auto-populate edit form for club_admin
      if (user?.role === 'club_admin' && fetchedClubs.length > 0) {
        const theirClub = fetchedClubs.find(c => String(c.admin_id) === String(user.id) || c.student_email === user.email);
        if (theirClub && !editingClubId) {
          handleEditClub(theirClub);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError('Unable to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'member_count' ? parseInt(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleEventChange = (e) => {
    setEventFormData({ ...eventFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalLogoUrl = formData.logo;
      if (logoFile) {
        const fileData = new FormData();
        fileData.append('file', logoFile);
        const uploadRes = await fetch(`${API_BASE_URL}/upload-logo`, {
          method: 'POST',
          body: fileData
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          finalLogoUrl = uploadJson.logo_url;
        } else {
          setMessage({ text: 'Failed to upload logo image.', type: 'error' });
          setIsSubmitting(false);
          return;
        }
      }

      let finalBannerUrl = formData.banner_image;
      if (bannerFile) {
        const fileData = new FormData();
        fileData.append('file', bannerFile);
        const uploadRes = await fetch(`${API_BASE_URL}/upload-logo`, {
          method: 'POST',
          body: fileData
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          finalBannerUrl = uploadJson.logo_url;
        } else {
          setMessage({ text: 'Failed to upload banner image.', type: 'error' });
          setIsSubmitting(false);
          return;
        }
      }

      const payload = { ...formData, logo: finalLogoUrl, banner_image: finalBannerUrl };
      const url = editingClubId ? `${API_BASE_URL}/clubs/${editingClubId}` : `${API_BASE_URL}/clubs`;
      const method = editingClubId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': String(user?.id || ''),
          'X-User-Role': user?.role || ''
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setMessage({ text: `Successfully ${editingClubId ? 'updated' : 'added'} ${formData.name}!`, type: 'success' });
        setFormData({
          name: '', category: 'Club', description: '', student_head: '', faculty_head: '', core_team: '', student_email: '', faculty_email: '', logo: 'https://via.placeholder.com/150/1e293b/ffffff?text=C', banner_image: '', member_count: 0
        });
        setLogoFile(null);
        setBannerFile(null);
        setEditingClubId(null);
        fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage({ text: errorData.detail || 'Failed to add organization.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Unable to connect to the server. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
    setTimeout(() => setMessage({text: '', type: ''}), 4000);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventFormData.club_id) {
      setEventMessage({ text: 'Please select an organization.', type: 'error' });
      setTimeout(() => setEventMessage({text: '', type: ''}), 4000);
      return;
    }

    setIsEventSubmitting(true);
    try {
      const combinedDate = `${eventFormData.date}T${eventFormData.time}:00`;
      
      const payload = {
        title: eventFormData.title,
        description: eventFormData.description,
        date: combinedDate,
        venue: eventFormData.venue,
        type: 'upcoming',
        club_id: parseInt(eventFormData.club_id)
      };

      const url = editingEventId ? `${API_BASE_URL}/events/${editingEventId}` : `${API_BASE_URL}/events`;
      const method = editingEventId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': String(user?.id || ''),
          'X-User-Role': user?.role || ''
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setEventMessage({ text: `Successfully ${editingEventId ? 'updated' : 'added'} ${eventFormData.title}!`, type: 'success' });
        setEventFormData({
          title: '', date: '', time: '', venue: '', description: '', club_id: ''
        });
        setEditingEventId(null);
        fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setEventMessage({ text: errorData.detail || 'Failed to add event.', type: 'error' });
      }
    } catch (err) {
      setEventMessage({ text: 'Unable to connect to the server. Please try again.', type: 'error' });
    } finally {
      setIsEventSubmitting(false);
    }
    setTimeout(() => setEventMessage({text: '', type: ''}), 4000);
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm("Are you sure you want to delete this club? All its events will also be deleted.")) return;
    setDeletingId(`club-${id}`);
    try {
      const res = await fetch(`${API_BASE_URL}/clubs/${id}`, { 
        method: 'DELETE',
        headers: {
          'X-User-Id': String(user?.id || ''),
          'X-User-Role': user?.role || ''
        }
      });
      if (res.ok) fetchData();
      else setMessage({ text: 'Failed to delete club.', type: 'error' });
    } catch (err) {
      setMessage({ text: 'Unable to connect to the server.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(`event-${id}`);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${id}`, { 
        method: 'DELETE',
        headers: {
          'X-User-Id': String(user?.id || ''),
          'X-User-Role': user?.role || ''
        }
      });
      if (res.ok) fetchData();
      else setEventMessage({ text: 'Failed to delete event.', type: 'error' });
    } catch (err) {
      setEventMessage({ text: 'Unable to connect to the server.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };


  const handleEditClub = (club) => {
    setEditingClubId(club.id);
    setFormData({
      name: club.name || '',
      category: club.category || 'Club',
      description: club.description || '',
      student_head: club.student_head || '',
      faculty_head: club.faculty_head || '',
      core_team: club.core_team || '',
      student_email: club.student_email || '',
      faculty_email: club.faculty_email || '',
      logo: club.logo || 'https://via.placeholder.com/150/1e293b/ffffff?text=C',
      banner_image: club.banner_image || '',
      member_count: club.member_count || 0
    });
    setLogoFile(null);
    setBannerFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditEvent = (event) => {
    setEditingEventId(event.id);
    let d = '', t = '';
    if (event.date) {
      const parts = event.date.split('T');
      if (parts.length === 2) {
        d = parts[0];
        t = parts[1].substring(0, 5);
      } else {
        d = event.date;
      }
    }
    setEventFormData({
      title: event.title || '',
      date: d,
      time: t,
      venue: event.venue || '',
      description: event.description || '',
      club_id: event.club_id || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user || (user.role !== 'admin' && user.role !== 'club_admin')) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center', minHeight: '60vh' }}>
        <ShieldAlert size={64} color="var(--danger)" style={{ margin: '0 auto 2rem' }} />
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You do not have permission to view this page.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  const visibleClubs = user?.role === 'admin' ? clubs : clubs.filter(c => String(c.admin_id) === String(user?.id) || c.student_email === user?.email);
  const visibleEvents = user?.role === 'admin' ? events : events.filter(e => {
     const club = clubs.find(c => c.id === e.club_id);
     return club && (String(club.admin_id) === String(user?.id) || club.student_email === user?.email);
  });

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
        
        {/* ADD FORMS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* ADD ORGANIZATION FORM */}
          {(user?.role === 'admin' || editingClubId) && (
          <div className="card glass-panel">
            <div className="card-body">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={24} color="var(--accent-primary)" />
                {editingClubId ? 'Update Organization' : 'Add Organization'}
              </h2>

              {message.text && (
                <div style={{ background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid var(--${message.type === 'success' ? 'success' : 'danger'})`, color: `var(--${message.type === 'success' ? 'success' : 'danger'})`, padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Organization Name</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Type</label>
                  <select className="form-control" name="category" value={formData.category} onChange={handleChange}>
                    <option value="Club">Club</option>
                    <option value="Initiation">Initiation</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="2" required></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Core Team</label>
                    <input type="text" className="form-control" name="core_team" placeholder="e.g. Alice (VP), Bob (Sec)" value={formData.core_team} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Total Students / Members</label>
                    <input type="number" className="form-control" name="member_count" value={formData.member_count} onChange={handleChange} min="0" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Upload Logo (Optional)</label>
                    <input type="file" className="form-control" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Upload Banner (Optional)</label>
                    <input type="file" className="form-control" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Student Head</label>
                    <input type="text" className="form-control" name="student_head" value={formData.student_head} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Student Email</label>
                    <input type="email" className="form-control" name="student_email" placeholder="e.g. head@jecrcu.edu.in" value={formData.student_email} onChange={handleChange} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Faculty Advisor</label>
                    <input type="text" className="form-control" name="faculty_head" value={formData.faculty_head} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Faculty Email</label>
                    <input type="email" className="form-control" name="faculty_email" placeholder="e.g. advisor@jecrcu.edu.in" value={formData.faculty_email} onChange={handleChange} />
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{flex: 1, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer'}} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingClubId ? 'Update Organization' : 'Add Organization')}
                  </button>
                  {editingClubId && user?.role === 'admin' && (
                    <button type="button" className="btn btn-secondary" style={{flex: 1}} onClick={() => {
                      setEditingClubId(null);
                      setFormData({name: '', category: 'Club', description: '', student_head: '', faculty_head: '', core_team: '', student_email: '', faculty_email: '', logo: 'https://via.placeholder.com/150/1e293b/ffffff?text=C', banner_image: '', member_count: 0});
                      setLogoFile(null);
                      setBannerFile(null);
                    }}>Cancel Edit</button>
                  )}
                </div>
              </form>
            </div>
          </div>

          )}

          {/* ADD EVENT FORM */}
          <div className="card glass-panel">
            <div className="card-body">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarPlus size={24} color="var(--accent-secondary)" />
                {editingEventId ? 'Update Event' : 'Add Event'}
              </h2>

              {eventMessage.text && (
                <div style={{ background: eventMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid var(--${eventMessage.type === 'success' ? 'success' : 'danger'})`, color: `var(--${eventMessage.type === 'success' ? 'success' : 'danger'})`, padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  {eventMessage.text}
                </div>
              )}

              <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Event Title</label>
                  <input type="text" className="form-control" name="title" value={eventFormData.title} onChange={handleEventChange} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hosting Organization</label>
                  <select className="form-control" name="club_id" value={eventFormData.club_id} onChange={handleEventChange} required>
                    <option value="" disabled>Select an Organization</option>
                    {visibleClubs.map(c => <option key={c.id} value={c.id}>{c.name} ({c.category})</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" name="date" value={eventFormData.date} onChange={handleEventChange} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Time</label>
                    <input type="time" className="form-control" name="time" value={eventFormData.time} onChange={handleEventChange} required />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Venue Location</label>
                  <input type="text" className="form-control" name="venue" placeholder="e.g. Main Auditorium" value={eventFormData.venue} onChange={handleEventChange} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" value={eventFormData.description} onChange={handleEventChange} rows="2" required></textarea>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-secondary" style={{width: '100%', opacity: isEventSubmitting ? 0.7 : 1, cursor: isEventSubmitting ? 'not-allowed' : 'pointer'}} disabled={isEventSubmitting}>{isEventSubmitting ? 'Saving...' : (editingEventId ? 'Update Event' : 'Create Event')}</button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* MANAGEMENT LISTS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card glass-panel" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="card-body">
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="var(--accent-primary)" />
                Manage Organizations
              </h2>
              {loading ? <p>Loading...</p> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {visibleClubs.map(club => (
                    <li key={club.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-light)' }}>
                      <div>
                        <strong style={{ display: 'block' }}>{club.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{club.category}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEditClub(club)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                          <Edit2 size={16} />
                        </button>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDeleteClub(club.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.4rem', opacity: deletingId === `club-${club.id}` ? 0.5 : 1 }} disabled={deletingId === `club-${club.id}`}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                  {visibleClubs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No clubs found.</p>}
                </ul>
              )}
            </div>
          </div>

          <div className="card glass-panel" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="card-body">
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="var(--accent-primary)" />
                Manage Events
              </h2>
              {loading ? <p>Loading...</p> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {visibleEvents.map(event => {
                    const host = clubs.find(c => c.id === event.club_id);
                    let displayDate = event.date;
                    try {
                      if (event.date.includes('T')) {
                        const d = new Date(event.date);
                        if (!isNaN(d)) {
                          displayDate = d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
                        }
                      }
                    } catch(e) {}

                    return (
                      <li key={event.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div>
                          <strong style={{ display: 'block' }}>{event.title}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {displayDate} • {host ? host.name : 'Unknown Host'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditEvent(event)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteEvent(event.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.4rem', opacity: deletingId === `event-${event.id}` ? 0.5 : 1 }} disabled={deletingId === `event-${event.id}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                  {visibleEvents.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No events found.</p>}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* REGISTRATIONS VIEWER */}
      <div style={{ marginTop: '3rem' }}>
        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Student Registrations</h2>
        <div className="card glass-panel" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
              <label className="form-label">Registration Type</label>
              <select 
                className="form-control" 
                value={selectedRegType} 
                onChange={(e) => { setSelectedRegType(e.target.value); setSelectedRegId(''); }}
              >
                <option value="club">Club / Initiation Applications</option>
                <option value="event">Event Registrations</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, flex: 2, minWidth: '300px' }}>
              <label className="form-label">Select {selectedRegType === 'club' ? 'Organization' : 'Event'}</label>
              <select 
                className="form-control" 
                value={selectedRegId} 
                onChange={(e) => setSelectedRegId(e.target.value)}
              >
                <option value="">-- Select --</option>
                {selectedRegType === 'club' 
                  ? visibleClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  : visibleEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>)
                }
              </select>
            </div>
          </div>

          {!selectedRegId ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Please select an organization or event to view registered students.</p>
          ) : registrations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No students have registered yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Name</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Roll No</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Branch</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Email</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{reg.user?.name || 'Unknown'}</td>
                      <td style={{ padding: '1rem' }}>{reg.user?.roll_no || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>{reg.user?.branch || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        {reg.user?.email ? <a href={`mailto:${reg.user.email}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{reg.user.email}</a> : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={reg.message}>
                        {reg.message || <span style={{ color: 'var(--text-muted)' }}>None</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;

