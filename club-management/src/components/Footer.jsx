import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ChevronRight } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer relative overflow-hidden">
      {/* Subtle background pattern could go here */}
      
      <div className="container footer-container relative z-10">
        <div className="footer-brand">
          <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
            <span className="logo-blue" style={{ fontSize: '1.8rem' }}>JECRC</span> <span className="logo-pink" style={{ fontSize: '1.7rem' }}>Club Portal</span>
          </Link>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            The official, centralized platform to discover, manage, and engage with Clubs, Initiations, and Events at JECRC University.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="/" onClick={(e) => e.preventDefault()} className="social-icon" style={{ color: '#E1306C' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="/" onClick={(e) => e.preventDefault()} className="social-icon" style={{ color: '#0077B5' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="/" onClick={(e) => e.preventDefault()} className="social-icon" style={{ color: '#FF0000' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
            <a href="/" onClick={(e) => e.preventDefault()} className="social-icon" style={{ color: '#1877F2' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/home" className="footer-link-item"><ChevronRight size={14} color="#ff3366" /> Home</Link></li>
            <li><Link to="/clubs" className="footer-link-item"><ChevronRight size={14} color="#ff3366" /> University Clubs</Link></li>
            <li><Link to="/initiations" className="footer-link-item"><ChevronRight size={14} color="#ff3366" /> Student Initiations</Link></li>
            <li><Link to="/events" className="footer-link-item"><ChevronRight size={14} color="#ff3366" /> Campus Events</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <div className="contact-item">
            <MapPin size={18} className="contact-icon" color="#5c38e6" />
            <p>JECRC University Campus<br/>Jaipur, Rajasthan</p>
          </div>
          <div className="contact-item">
            <Mail size={18} className="contact-icon" color="#5c38e6" />
            <p>info@jecrc.ac.in</p>
          </div>
          <div className="contact-item">
            <Phone size={18} className="contact-icon" color="#5c38e6" />
            <p>+91 (0) 141 2770500</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom relative z-10">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>&copy; {new Date().getFullYear()} JECRC University. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
