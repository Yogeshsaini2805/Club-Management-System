import React from 'react';
import { CalendarPlus, Calendar, Edit2, Trash2 } from 'lucide-react';

const ManageEvents = ({
  user,
  visibleClubs,
  visibleEvents,
  clubs,
  eventFormData,
  handleEventChange,
  handleEventSubmit,
  editingEventId,
  setEditingEventId,
  setEventFormData,
  handleEditEvent,
  handleDeleteEvent,
  isEventSubmitting,
  eventMessage,
  deletingId,
  loading
}) => {
  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr', marginTop: '2rem' }}>
      {/* EVENT FORM */}
      <div>
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
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-control" name="date" value={eventFormData.date} onChange={handleEventChange} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-control" name="time" value={eventFormData.time} onChange={handleEventChange} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">End Date <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>(Optional)</span></label>
                  <input type="date" className="form-control" name="end_date" value={eventFormData.end_date} onChange={handleEventChange} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">End Time <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>(Optional)</span></label>
                  <input type="time" className="form-control" name="end_time" value={eventFormData.end_time} onChange={handleEventChange} />
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
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-secondary" style={{flex: 1, opacity: isEventSubmitting ? 0.7 : 1, cursor: isEventSubmitting ? 'not-allowed' : 'pointer'}} disabled={isEventSubmitting}>
                  {isEventSubmitting ? 'Saving...' : (editingEventId ? 'Update Event' : 'Create Event')}
                </button>
                {editingEventId && (
                  <button type="button" className="btn btn-primary" style={{flex: 1}} onClick={() => {
                    setEditingEventId(null);
                    setEventFormData({
                      title: '', date: '', time: '', end_date: '', end_time: '', venue: '', description: '', club_id: ''
                    });
                  }}>Cancel Edit</button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* EVENT LIST */}
      <div className="card glass-panel" style={{ maxHeight: '800px', overflowY: 'auto' }}>
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
  );
};

export default ManageEvents;
