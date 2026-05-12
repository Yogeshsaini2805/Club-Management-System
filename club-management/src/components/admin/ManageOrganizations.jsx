import React from 'react';
import { PlusCircle, Users, Edit2, Trash2 } from 'lucide-react';

const ManageOrganizations = ({
  user,
  visibleClubs,
  formData,
  handleChange,
  handleSubmit,
  setLogoFile,
  setBannerFile,
  editingClubId,
  setEditingClubId,
  setFormData,
  handleEditClub,
  handleDeleteClub,
  isSubmitting,
  message,
  deletingId,
  loading
}) => {
  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr', marginTop: '2rem' }}>
      {/* ORG FORM */}
      <div>
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
      </div>
      
      {/* ORG LIST */}
      <div className="card glass-panel" style={{ maxHeight: '800px', overflowY: 'auto' }}>
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
    </div>
  );
};

export default ManageOrganizations;
