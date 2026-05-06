/**
 * StatsBar — Overlapping stats banner on home page
 */

import React from 'react';
import { Users, Zap, Calendar } from 'lucide-react';
import './StatsBar.css';

const StatsBar = () => {
  return (
    <div className="container stats-container">
      <div className="glass-panel stats-bar">
        <div className="stat-item">
          <div className="stat-icon stat-icon-purple">
            <Users size={32} />
          </div>
          <div>
            <h3 className="stat-number">20+</h3>
            <p className="stat-label">Active Clubs</p>
          </div>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <div className="stat-icon stat-icon-green">
            <Zap size={32} />
          </div>
          <div>
            <h3 className="stat-number">5+</h3>
            <p className="stat-label">Student Initiations</p>
          </div>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <div className="stat-icon stat-icon-pink">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="stat-number">50+</h3>
            <p className="stat-label">Yearly Events</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
