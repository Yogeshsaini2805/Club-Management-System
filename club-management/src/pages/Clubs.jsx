import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clubs`);
        if (response.ok) {
          const data = await response.json();
          // Filter to show only "Club" category
          setClubs(data.filter(c => c.category === 'Club'));
        }
      } catch (error) {
        console.error("Failed to fetch clubs", error);
        setError('Failed to load clubs. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="section-title">University Clubs</h1>
        <p className="section-subtitle">
          Explore a diverse range of student clubs. Connect with like-minded peers and develop your skills.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading clubs...</div>
      ) : error ? (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', textAlign: 'center', color: '#dc2626' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem' }}>Retry</button>
        </div>
      ) : clubs.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No clubs available at the moment.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {clubs.map(club => (
            <div key={club.id} className="card glass-panel">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <img src={club.logo || "https://via.placeholder.com/150"} alt={club.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div>
                    <h3 className="card-title" style={{ margin: 0 }}>{club.name}</h3>
                    <span className="badge badge-primary">{club.category}</span>
                  </div>
                </div>
                
                <p className="card-text">{club.description}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserCheck size={16} color="var(--accent-primary)" />
                    <span><strong>Head:</strong> {club.student_head}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color="var(--accent-secondary)" />
                      <span><strong>Faculty:</strong> {club.faculty_head}</span>
                    </div>
                    <div className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users size={14} /> {club.member_count || 0} Members
                    </div>
                  </div>
                </div>
                
                <Link to={`/clubs/${club.id}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  View Details & Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clubs;
