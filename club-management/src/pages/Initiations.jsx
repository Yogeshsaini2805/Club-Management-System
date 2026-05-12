import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Initiations.css';

const Initiations = () => {
  const [initiations, setInitiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitiations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clubs`);
        if (response.ok) {
          const data = await response.json();
          // Filter to show only "Initiation" category
          setInitiations(data.filter(c => c.category === 'Initiation'));
        }
      } catch (error) {
        console.error("Failed to fetch initiations", error);
        setError('Failed to load initiations. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitiations();
  }, []);

  return (
    <div className="container initiations-page">
      <div className="initiations-header">
        <h1 className="section-title">University Initiations</h1>
        <p className="section-subtitle">
          Join newly forming groups and help build the foundation of tomorrow's top clubs.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading initiations..." />
      ) : error ? (
        <ErrorBanner message={error} onRetry={() => window.location.reload()} />
      ) : initiations.length === 0 ? (
        <div className="initiations-empty">No initiations available at the moment.</div>
      ) : (
        <div className="initiations-grid">
          {initiations.map(initiation => (
            <div key={initiation.id} className="card glass-panel">
              <div className="card-body">
                <div className="initiation-card-header">
                  <img src={initiation.logo || "https://via.placeholder.com/150"} alt={initiation.name} className="initiation-card-logo" />
                  <div>
                    <h3 className="card-title initiation-card-title">{initiation.name}</h3>
                    <span className="badge badge-success">{initiation.category}</span>
                  </div>
                </div>
                
                <p className="card-text">{initiation.description}</p>
                
                <div className="initiation-card-meta">
                  <div className="initiation-card-meta-item">
                    <UserCheck size={16} color="var(--accent-primary)" />
                    <span><strong>Head:</strong> {initiation.student_head}</span>
                  </div>
                  <div className="initiation-card-meta-item">
                    <Users size={16} color="var(--accent-secondary)" />
                    <span><strong>Faculty:</strong> {initiation.faculty_head}</span>
                  </div>
                </div>
                
                <Link to={`/initiations/${initiation.id}`} className="btn btn-outline initiation-card-btn">
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

export default Initiations;
