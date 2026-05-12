import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Calendar, Image, ShieldAlert, TrendingUp, UserCheck, Users, CheckCircle } from 'lucide-react';
import ManageOrganizations from '../components/admin/ManageOrganizations';
import ManageEvents from '../components/admin/ManageEvents';
import ManageMemories from '../components/admin/ManageMemories';
import ManageRegistrations from '../components/admin/ManageRegistrations';
import { API_BASE_URL } from '../config';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './AdminDashboard.css';

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
  const [activeSection, setActiveSection] = useState(null); // 'organizations', 'events', 'memories'

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
    end_date: '',
    end_time: '',
    venue: '',
    description: '',
    club_id: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegType, setSelectedRegType] = useState('club');
  const [selectedRegId, setSelectedRegId] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  
  // Memories State
  const [memories, setMemories] = useState([]);
  const [memoryFile, setMemoryFile] = useState(null);
  const [memoryFormData, setMemoryFormData] = useState({ club_id: '', media_url: '' });
  const [isMemorySubmitting, setIsMemorySubmitting] = useState(false);
  const [deletingMemoryId, setDeletingMemoryId] = useState(null);
  
  // Fetch memories when club_id changes
  useEffect(() => {
    if (memoryFormData.club_id) {
      fetch(`${API_BASE_URL}/clubs/${memoryFormData.club_id}/memories`)
        .then(res => res.json())
        .then(data => setMemories(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    } else {
      setMemories([]);
    }
  }, [memoryFormData.club_id]);
  
  useEffect(() => {
    if (!selectedRegId) {
      setRegistrations([]);
      return;
    }
    const fetchRegs = async () => {
      try {
        let url;
        const headers = {
          'X-User-Id': String(user?.id || ''),
          'X-User-Role': user?.role || ''
        };
        if (selectedRegType === 'club') {
          url = `${API_BASE_URL}/clubs/${selectedRegId}/applications`;
        } else if (selectedRegType === 'event') {
          url = `${API_BASE_URL}/events/${selectedRegId}/registrations`;
        } else if (selectedRegType === 'members') {
          url = `${API_BASE_URL}/clubs/${selectedRegId}/members`;
        }
        const res = await fetch(url, { headers });
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
  }, [selectedRegId, selectedRegType, user]);
  const [eventMessage, setEventMessage] = useState({ text: '', type: '' });

  const handleStatusUpdate = async (id, newStatus) => {
    if (newStatus === 'rejected' && !window.confirm('Are you sure you want to reject this registration?')) return;
    setUpdatingStatusId(id);
    try {
      const endpoint = selectedRegType === 'club'
        ? `${API_BASE_URL}/applications/${id}/status`
        : `${API_BASE_URL}/event-registrations/${id}/status`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user?.id || ''),
          'X-User-Role': user?.role || ''
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({ detail: 'Update failed' }));
        alert(errData.detail || 'Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Network error while updating status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteRegistration = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) return;
    setUpdatingStatusId(id);
    try {
      const endpoint = selectedRegType === 'club'
        ? `${API_BASE_URL}/applications/${id}`
        : `${API_BASE_URL}/event-registrations/${id}`;
      
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'X-User-Id': String(user?.id || ''),
          'X-User-Role': user?.role || ''
        }
      });

      if (res.ok) {
        setRegistrations(prev => prev.filter(r => r.id !== id));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({ detail: 'Delete failed' }));
        alert(errData.detail || 'Failed to delete record');
      }
    } catch (err) {
      console.error('Failed to delete registration', err);
      alert('Network error while deleting registration');
    } finally {
      setUpdatingStatusId(null);
    }
  };

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

  const handleMemorySubmit = async (e) => {
    e.preventDefault();
    if (!memoryFormData.club_id) {
      setMessage({ text: 'Please select an organization first', type: 'error' });
      return;
    }
    if (!memoryFile && !memoryFormData.media_url) {
      setMessage({ text: 'Please provide a file or a URL', type: 'error' });
      return;
    }

    setIsMemorySubmitting(true);
    try {
      let finalMediaUrl = memoryFormData.media_url;
      let finalMediaType = 'image'; // Default for external URLs unless it ends in mp4
      
      if (finalMediaUrl && finalMediaUrl.match(/\.(mp4|webm|ogg)$/i)) {
        finalMediaType = 'video';
      }

      if (memoryFile) {
        const fileData = new FormData();
        fileData.append('file', memoryFile);
        const uploadRes = await fetch(`${API_BASE_URL}/upload-media`, {
          method: 'POST',
          body: fileData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalMediaUrl = uploadData.media_url;
          finalMediaType = uploadData.media_type;
        } else {
          throw new Error('Media upload failed');
        }
      }

      const club = clubs.find(c => String(c.id) === String(memoryFormData.club_id));
      
      const res = await fetch(`${API_BASE_URL}/clubs/${memoryFormData.club_id}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user?.id || ''),
          'X-User-Role': String(user?.role || '')
        },
        body: JSON.stringify({
          club_id: parseInt(memoryFormData.club_id),
          club_name: club ? club.name : 'Unknown Club',
          media_url: finalMediaUrl,
          media_type: finalMediaType
        })
      });

      if (res.ok) {
        setMessage({ text: 'Memory added successfully!', type: 'success' });
        setMemoryFile(null);
        setMemoryFormData({ ...memoryFormData, media_url: '' });
        // Refresh memories
        const memRes = await fetch(`${API_BASE_URL}/clubs/${memoryFormData.club_id}/memories`);
        setMemories(await memRes.json());
      } else {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to add memory');
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsMemorySubmitting(false);
    }
  };

  const handleMemoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    setDeletingMemoryId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/memories/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': String(user?.id || ''),
          'X-User-Role': String(user?.role || '')
        }
      });
      if (res.ok) {
        setMemories(memories.filter(m => m.id !== id));
      } else {
        throw new Error('Failed to delete memory');
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setDeletingMemoryId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'member_count' ? parseInt(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...eventFormData, [name]: value };
    
    // Auto-fill end_date when start date is picked if end_date is currently empty
    if (name === 'date' && !eventFormData.end_date) {
      newData.end_date = value;
    }
    setEventFormData(newData);
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
        setMessage({ text: `Successfully \${editingClubId ? 'updated' : 'added'} \${formData.name}!`, type: 'success' });
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
      const combinedDate = `\${eventFormData.date}T\${eventFormData.time}:00`;
      
      let combinedEndDate = null;
      if (eventFormData.end_date && eventFormData.end_time) {
        combinedEndDate = `\${eventFormData.end_date}T\${eventFormData.end_time}:00`;
      } else if (eventFormData.date && eventFormData.time) {
        // Fallback: If no end time given, assume 3 hours later on the same day or selected end date
        const startDateObj = new Date(combinedDate);
        startDateObj.setHours(startDateObj.getHours() + 3);
        const autoEndDate = eventFormData.end_date || eventFormData.date;
        const autoEndTime = startDateObj.toISOString().split('T')[1].substring(0, 5);
        combinedEndDate = `${autoEndDate}T${autoEndTime}:00`;
      }
      
      const payload = {
        title: eventFormData.title,
        description: eventFormData.description,
        date: combinedDate,
        end_date: combinedEndDate,
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
        setEventMessage({ text: `Successfully \${editingEventId ? 'updated' : 'added'} \${eventFormData.title}!`, type: 'success' });
        setEventFormData({
          title: '', date: '', time: '', end_date: '', end_time: '', venue: '', description: '', club_id: ''
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
    setDeletingId(`club-\${id}`);
    try {
      const res = await fetch(`${API_BASE_URL}/clubs/\${id}`, { 
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
    setDeletingId(`event-\${id}`);
    try {
      const res = await fetch(`${API_BASE_URL}/events/\${id}`, { 
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
    let d = '', t = '', ed = '', et = '';
    if (event.date && event.date.includes('T')) {
      [d, t] = event.date.split('T');
      if (t) t = t.substring(0, 5); // ensure HH:mm
    }
    if (event.end_date && event.end_date.includes('T')) {
      [ed, et] = event.end_date.split('T');
      if (et) et = et.substring(0, 5);
    }
    setEventFormData({
      title: event.title,
      date: d,
      time: t,
      end_date: ed,
      end_time: et,
      venue: event.venue || '',
      description: event.description,
      club_id: event.club_id
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

  // Calculate Aggregates
  const totalOrganizations = visibleClubs.length;
  const totalEvents = visibleEvents.length;
  const totalStudents = visibleClubs.reduce((acc, club) => acc + (club.member_count || 0), 0);
  const totalMemories = memories.length; // Approximate, as we only fetch memories per club right now. Ideally fetched globally.

  // Donut Chart Data (Group by Category)
  const categoryCounts = visibleClubs.reduce((acc, club) => {
    const cat = club.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const donutData = Object.keys(categoryCounts).map(key => ({ name: key, value: categoryCounts[key] }));
  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  const recentEvents = [...visibleEvents]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const toggleSection = (section) => {
    setActiveSection(prev => prev === section ? null : section);
  };

  return (
    <div className="container admin-dashboard" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      
      {/* 1. WELCOME BANNER */}
      <div className="admin-welcome-banner">
        <div>
          <h1 className="admin-greeting">Welcome back, {user?.name || 'Admin'}!</h1>
          <p className="admin-subtitle">Here's what's happening with your club portal today.</p>
        </div>
        <div className="admin-date-picker">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          <Calendar size={18} />
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><Users size={24} /></div>
          <p className="stat-label">Total Organizations</p>
          <h3 className="stat-value">{totalOrganizations}</h3>
          <p className="stat-trend"><TrendingUp size={14} /> <span>12%</span> from last month</p>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Calendar size={24} /></div>
          <p className="stat-label">Total Events</p>
          <h3 className="stat-value">{totalEvents}</h3>
          <p className="stat-trend"><TrendingUp size={14} /> <span>18%</span> from last month</p>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><UserCheck size={24} /></div>
          <p className="stat-label">Total Students</p>
          <h3 className="stat-value">{totalStudents}</h3>
          <p className="stat-trend"><TrendingUp size={14} /> <span>15%</span> from last month</p>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><Image size={24} /></div>
          <p className="stat-label">Total Memories</p>
          <h3 className="stat-value">{totalMemories}</h3>
          <p className="stat-trend"><TrendingUp size={14} /> <span>10%</span> from last month</p>
        </div>
      </div>

      {/* 3. OVERVIEW ROW */}
      <div className="admin-overview-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Events</h3>
            <button className="btn-text">View All</button>
          </div>
          <div className="recent-events-list">
            {recentEvents.length === 0 ? <p className="text-muted">No recent events.</p> : recentEvents.map((ev, idx) => {
              const evDate = new Date(ev.date);
              const isPast = evDate < new Date();
              return (
                <div key={idx} className="recent-event-item">
                  <div className="recent-event-icon" style={{ background: isPast ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)', color: isPast ? '#3b82f6' : '#ec4899' }}>
                    {isPast ? <CheckCircle size={18} /> : <Calendar size={18} />}
                  </div>
                  <div className="recent-event-details">
                    <h4>{ev.title}</h4>
                    <p>{evDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {ev.venue || 'TBA'}</p>
                  </div>
                  <span className={`status-badge \${isPast ? 'completed' : 'upcoming'}`}>{isPast ? 'Completed' : 'Upcoming'}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Organizations Overview</h3>
            <button className="btn-text">View All</button>
          </div>
          <div className="donut-chart-container">
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={donutData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {donutData.map((entry, index) => <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>No data available.</p>
            )}
            <div className="donut-center-text">
              <h2>{totalOrganizations}</h2>
              <p>Total</p>
            </div>
            <div className="donut-legend">
              {donutData.map((entry, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-color" style={{ background: COLORS[idx % COLORS.length] }}></span>
                  <span className="legend-label">{entry.name}</span>
                  <span className="legend-value">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS ROW */}
      <div className="admin-quick-actions">
        <div className={`quick-action-card orgs \${activeSection === 'organizations' ? 'active' : ''}`}>
          <div className="qa-icon"><BarChart2 size={24} /></div>
          <h3>Manage Organizations</h3>
          <p>Add, update and manage all club and initiative organizations.</p>
          <button className="btn-qa" onClick={() => toggleSection('organizations')}>
            {activeSection === 'organizations' ? 'Close Section' : 'Manage Now'}
          </button>
        </div>
        
        <div className={`quick-action-card events \${activeSection === 'events' ? 'active' : ''}`}>
          <div className="qa-icon"><Calendar size={24} /></div>
          <h3>Manage Events</h3>
          <p>Create, edit and manage all upcoming and past events.</p>
          <button className="btn-qa" onClick={() => toggleSection('events')}>
            {activeSection === 'events' ? 'Close Section' : 'Manage Now'}
          </button>
        </div>

        <div className={`quick-action-card memories \${activeSection === 'memories' ? 'active' : ''}`}>
          <div className="qa-icon"><Image size={24} /></div>
          <h3>Glimpses & Memories</h3>
          <p>Upload and manage event photos and memorable moments.</p>
          <button className="btn-qa" onClick={() => toggleSection('memories')}>
            {activeSection === 'memories' ? 'Close Section' : 'Manage Now'}
          </button>
        </div>
      </div>

      
      {/* 5. TOGGLED FORMS SECTION */}
{/* --- ORGANIZATIONS TAB --- */}
{activeSection === 'organizations' && (
  <ManageOrganizations
    user={user}
    visibleClubs={visibleClubs}
    formData={formData}
    handleChange={handleChange}
    handleSubmit={handleSubmit}
    setLogoFile={setLogoFile}
    setBannerFile={setBannerFile}
    editingClubId={editingClubId}
    setEditingClubId={setEditingClubId}
    setFormData={setFormData}
    handleEditClub={handleEditClub}
    handleDeleteClub={handleDeleteClub}
    isSubmitting={isSubmitting}
    message={message}
    deletingId={deletingId}
    loading={loading}
  />
)}

{/* --- EVENTS TAB --- */}
{activeSection === 'events' && (
  <ManageEvents
    user={user}
    visibleClubs={visibleClubs}
    visibleEvents={visibleEvents}
    clubs={clubs}
    eventFormData={eventFormData}
    handleEventChange={handleEventChange}
    handleEventSubmit={handleEventSubmit}
    editingEventId={editingEventId}
    setEditingEventId={setEditingEventId}
    setEventFormData={setEventFormData}
    handleEditEvent={handleEditEvent}
    handleDeleteEvent={handleDeleteEvent}
    isEventSubmitting={isEventSubmitting}
    eventMessage={eventMessage}
    deletingId={deletingId}
    loading={loading}
  />
)}

{/* --- MEMORIES TAB --- */}
{activeSection === 'memories' && (
  <ManageMemories
    visibleClubs={visibleClubs}
    memoryFormData={memoryFormData}
    setMemoryFormData={setMemoryFormData}
    setMemoryFile={setMemoryFile}
    memoryFile={memoryFile}
    handleMemorySubmit={handleMemorySubmit}
    isMemorySubmitting={isMemorySubmitting}
    memories={memories}
    handleMemoryDelete={handleMemoryDelete}
    deletingMemoryId={deletingMemoryId}
  />
)}

{/* REGISTRATIONS VIEWER (Always visible at bottom) */}
<ManageRegistrations
  selectedRegType={selectedRegType}
  setSelectedRegType={setSelectedRegType}
  selectedRegId={selectedRegId}
  setSelectedRegId={setSelectedRegId}
  visibleEvents={visibleEvents}
  visibleClubs={visibleClubs}
  registrations={registrations}
  handleStatusUpdate={handleStatusUpdate}
  handleDeleteRegistration={handleDeleteRegistration}
  updatingStatusId={updatingStatusId}
/>
</div>
);
};

export default AdminDashboard;
