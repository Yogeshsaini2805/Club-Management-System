import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Clubs.css';

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
    <div className="container clubs-page">
      <div className="clubs-header">
        <h1 className="section-title">University Clubs</h1>
        <p className="section-subtitle">
          Explore a diverse range of student clubs. Connect with like-minded peers and develop your skills.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading clubs..." />
      ) : error ? (
        <ErrorBanner message={error} onRetry={() => window.location.reload()} />
      ) : clubs.length === 0 ? (
        <div className="clubs-empty">No clubs available at the moment.</div>
      ) : (
        <div className="clubs-grid">
          {clubs.map(club => (
            <div key={club.id} className="card glass-panel">
              <div className="card-body">
                <div className="club-card-header">
                  <img src={club.logo || "https://via.placeholder.com/150"} alt={club.name} className="club-card-logo" />
                  <div>
                    <h3 className="card-title club-card-title">{club.name}</h3>
                    <span className="badge badge-primary">{club.category}</span>
                  </div>
                </div>
                
                <p className="card-text">{club.description}</p>
                
                <div className="club-card-meta">
                  <div className="club-card-meta-item">
                    <UserCheck size={16} color="var(--accent-primary)" />
                    <span><strong>Head:</strong> {club.student_head}</span>
                  </div>
                  <div className="club-card-meta-row">
                    <div className="club-card-meta-item">
                      <Users size={16} color="var(--accent-secondary)" />
                      <span><strong>Faculty:</strong> {club.faculty_head}</span>
                    </div>
                    <div className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users size={14} /> {club.member_count || 0} Members
                    </div>
                  </div>
                </div>
                
                <Link to={`/clubs/${club.id}`} className="btn btn-outline club-card-btn">
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
