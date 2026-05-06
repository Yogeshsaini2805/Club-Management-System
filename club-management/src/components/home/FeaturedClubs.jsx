/**
 * FeaturedClubs — Featured clubs grid on home page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, ChevronRight } from 'lucide-react';
import './FeaturedClubs.css';

const CARD_COLORS = ['#5c38e6', '#007bff', '#ff3366'];

const FeaturedClubs = ({ clubs }) => {
  const featuredClubs = clubs.slice(0, 3);

  return (
    <section className="featured-clubs-section">
      <div className="container">
        <div className="featured-clubs-header">
          <div>
            <h2 className="featured-clubs-title">
              Featured Clubs <Sparkles color="#eab308" size={32} />
            </h2>
            <p className="featured-clubs-subtitle">
              Discover some of our most active student organizations.
            </p>
          </div>
          <Link to="/clubs" className="featured-clubs-link">
            View All <ChevronRight size={20} />
          </Link>
        </div>

        <div className="featured-clubs-grid">
          {featuredClubs.map((club, index) => {
            const btnColor = CARD_COLORS[index % CARD_COLORS.length];
            return (
              <div key={club.id} className="featured-club-card">
                {/* Card Header */}
                <div className="featured-club-header">
                  <div className="featured-club-logo">
                    <img src={club.logo} alt={club.name} />
                  </div>
                  <h3 className="featured-club-name">{club.name}</h3>
                </div>

                {/* Cover Image */}
                <div
                  className="featured-club-cover"
                  style={{ backgroundColor: `${btnColor}15` }}
                >
                  <img
                    src="/assets/club_cover_bg.png"
                    alt="Club Cover"
                    className="featured-club-cover-img"
                  />
                </div>

                <div className="featured-club-body">
                  <p className="featured-club-desc">{club.description}</p>

                  <div className="featured-club-members" style={{ color: btnColor }}>
                    <Users size={18} />
                    <span>{club.member_count || 0} Members</span>
                  </div>

                  <Link
                    to={`/clubs/${club.id}`}
                    className="featured-club-btn"
                    style={{ background: btnColor }}
                  >
                    Learn More &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedClubs;
