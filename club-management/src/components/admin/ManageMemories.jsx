import React from 'react';
import { Image, Trash2 } from 'lucide-react';

const ManageMemories = ({
  visibleClubs,
  memoryFormData,
  setMemoryFormData,
  setMemoryFile,
  memoryFile,
  handleMemorySubmit,
  isMemorySubmitting,
  memories,
  handleMemoryDelete,
  deletingMemoryId
}) => {
  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="card glass-panel" style={{ maxHeight: '800px', overflowY: 'auto' }}>
        <div className="card-body">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Image size={20} color="var(--accent-primary)" />
            Manage Glimpses & Memories
          </h2>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
            <div className="form-group">
              <label className="form-label">Select Organization</label>
              <select className="form-control" value={memoryFormData.club_id} onChange={(e) => setMemoryFormData({ ...memoryFormData, club_id: e.target.value })}>
                <option value="">Select an Organization</option>
                {visibleClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {memoryFormData.club_id && (
              <form onSubmit={handleMemorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Upload File (Image/Video)</label>
                  <input type="file" className="form-control" accept="image/*,video/mp4,video/webm" onChange={(e) => { setMemoryFile(e.target.files[0]); setMemoryFormData({ ...memoryFormData, media_url: '' }); }} />
                </div>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>OR</div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Direct Internet URL</label>
                  <input type="url" className="form-control" placeholder="https://example.com/image.jpg" value={memoryFormData.media_url} onChange={(e) => { setMemoryFormData({ ...memoryFormData, media_url: e.target.value }); if (e.target.value) setMemoryFile(null); }} />
                </div>
                <button type="submit" className="btn btn-secondary" disabled={isMemorySubmitting || (!memoryFile && !memoryFormData.media_url)} style={{ opacity: isMemorySubmitting ? 0.7 : 1 }}>
                  {isMemorySubmitting ? 'Uploading...' : 'Add Memory'}
                </button>
              </form>
            )}
          </div>
          {memoryFormData.club_id && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
              {memories.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No memories added yet.</p>
              ) : (
                memories.map(memory => (
                  <div key={memory.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '1', background: '#000' }}>
                    {memory.media_type === 'video' ? (
                      <video src={memory.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop autoPlay playsInline />
                    ) : (
                      <img src={memory.media_url} alt="Memory" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <button onClick={() => handleMemoryDelete(memory.id)} className="btn btn-sm" disabled={deletingMemoryId === memory.id} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '0.3rem', border: 'none' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMemories;
