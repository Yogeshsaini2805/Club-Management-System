import React from 'react';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

const ManageRegistrations = ({
  selectedRegType,
  setSelectedRegType,
  selectedRegId,
  setSelectedRegId,
  visibleEvents,
  visibleClubs,
  registrations,
  handleStatusUpdate,
  handleDeleteRegistration,
  updatingStatusId
}) => {
  return (
    <div style={{ marginTop: '3rem' }}>
      <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Student Registrations</h2>
      <div className="card glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
            <label className="form-label">Registration Type</label>
            <select className="form-control" value={selectedRegType} onChange={(e) => { setSelectedRegType(e.target.value); setSelectedRegId(''); }}>
              <option value="club">Club / Initiation Applications</option>
              <option value="event">Event Registrations</option>
              <option value="members">Approved Members</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: 2, minWidth: '300px' }}>
            <label className="form-label">Select Organization{selectedRegType === 'event' ? ' / Event' : ''}</label>
            <select className="form-control" value={selectedRegId} onChange={(e) => setSelectedRegId(e.target.value)}>
              <option value="">-- Select --</option>
              {selectedRegType === 'event' ? visibleEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>) : visibleClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                  {selectedRegType !== 'members' && <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => {
                  const statusColors = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };
                  const status = reg.status || 'pending';
                  return (
                    <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{reg.name || reg.user?.name || 'Unknown'}</td>
                      <td style={{ padding: '1rem' }}>{reg.roll_no || reg.user?.roll_no || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>{reg.branch || reg.user?.branch || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        {reg.user?.email ? <a href={`mailto:${reg.user.email}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{reg.user.email}</a> : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={reg.message}>
                        {reg.message || <span style={{ color: 'var(--text-muted)' }}>None</span>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: `${statusColors[status]}22`, color: statusColors[status], border: `1px solid ${statusColors[status]}44`, textTransform: 'capitalize' }}>
                          {status}
                        </span>
                      </td>
                      {selectedRegType !== 'members' && (
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {status === 'pending' && (
                              <>
                                <button onClick={() => handleStatusUpdate(reg.id, 'approved')} disabled={updatingStatusId === reg.id} title="Accept" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                  <CheckCircle size={18} color="#10b981" />
                                </button>
                                <button onClick={() => handleStatusUpdate(reg.id, 'rejected')} disabled={updatingStatusId === reg.id} title="Reject" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                  <XCircle size={18} color="#ef4444" />
                                </button>
                              </>
                            )}
                            <button onClick={() => handleDeleteRegistration(reg.id)} disabled={updatingStatusId === reg.id} title="Delete Record" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Trash2 size={18} color="var(--text-muted)" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRegistrations;
