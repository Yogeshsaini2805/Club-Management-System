/**
 * HeroSection — Home page hero banner
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        {/* Left Text Column */}
        <div className="hero-text">
          <div className="badge hero-badge">
            Welcome to the Future <span role="img" aria-label="wave">👋</span>
          </div>

          <h1 className="hero-title">
            Discover Your <br />
            Passions at <br />
            <span className="text-gradient">JECRC University</span>
          </h1>

          <p className="hero-description">
            Join clubs, collaborate in student-driven initiatives, and participate in events
            that shape your university experience. Elevate your journey today!
          </p>

          <div className="hero-actions">
            <Link to="/clubs" className="btn btn-primary hero-btn">
              Explore Clubs <ArrowRight size={20} />
            </Link>
            <Link to="/initiations" className="btn hero-btn-secondary">
              View Initiations
            </Link>
          </div>
        </div>

        {/* Right Image Column */}
        <div className="hero-image-wrapper">
          <div className="hero-blob hero-blob-1"></div>
          <div className="hero-blob hero-blob-2"></div>
          <img
            src="/assets/hero_students_v2_nobg.png"
            alt="Students celebrating"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
