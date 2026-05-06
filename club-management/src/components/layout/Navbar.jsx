import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, UserCircle, ChevronDown, Settings } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, notificationRef]);

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container">
        <Link to="/home" className="navbar-logo">
          <span className="logo-blue">JECRC</span> <span className="logo-pink">Club Portal</span>
        </Link>

        <div className="navbar-links desktop-only">
          <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>Home</Link>
          <Link to="/clubs" className={`nav-link ${isActive('/clubs') ? 'active' : ''}`}>Clubs</Link>
          <Link to="/initiations" className={`nav-link ${isActive('/initiations') ? 'active' : ''}`}>Initiations</Link>
          <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>Events</Link>

          {(user?.role === 'admin' || user?.role === 'club_admin') && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>
          )}
        </div>

        <div className="navbar-actions desktop-only">
          {user ? (
            <div className="user-menu-container" ref={dropdownRef}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div className="notification-container" ref={notificationRef} style={{ position: 'relative' }}>
                  <button 
                    className="icon-btn notification-btn" 
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    <span className="notification-dot"></span>
                  </button>
                  
                  {isNotificationOpen && (
                    <div className="user-dropdown glass-panel" style={{ right: '-80px', width: '320px' }}>
                      <div className="dropdown-header" style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                        <strong style={{ fontSize: '1.1rem' }}>Notifications</strong>
                        <span>You have 2 new notifications</span>
                      </div>
                      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        <div className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', whiteSpace: 'normal', padding: '1rem' }}>
                          <strong style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Welcome to the Club Portal!</strong>
                          <span style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4' }}>Explore clubs and events to make the most of your university life.</span>
                          <span style={{ color: '#ff3366', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>Just now</span>
                        </div>
                        <div className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', whiteSpace: 'normal', padding: '1rem' }}>
                          <strong style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Complete your profile</strong>
                          <span style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4' }}>Add your skills and interests to get personalized club recommendations.</span>
                          <span style={{ color: '#5c38e6', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>2 hours ago</span>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" style={{ justifyContent: 'center', color: '#5c38e6', fontWeight: 600 }} onClick={() => setIsNotificationOpen(false)}>
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="user-dropdown-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <UserCircle size={28} color="#1e293b" />
                  <ChevronDown size={16} color="#1e293b" />
                </button>
              </div>

              {isDropdownOpen && (
                <div className="user-dropdown glass-panel">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.role}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <Settings size={16} /> Profile
                  </Link>
                  <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="dropdown-item text-danger">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">Login</Link>
          )}
        </div>

        <button className="mobile-toggle mobile-only" onClick={toggleMenu}>
          {isMobileMenuOpen ? <X size={24} color="#1e293b" /> : <Menu size={24} color="#1e293b" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu glass-panel">
          <Link to="/home" onClick={toggleMenu} className={`nav-link ${isActive('/home') ? 'active' : ''}`}>Home</Link>
          <Link to="/clubs" onClick={toggleMenu} className={`nav-link ${isActive('/clubs') ? 'active' : ''}`}>Clubs</Link>
          <Link to="/initiations" onClick={toggleMenu} className={`nav-link ${isActive('/initiations') ? 'active' : ''}`}>Initiations</Link>
          <Link to="/events" onClick={toggleMenu} className={`nav-link ${isActive('/events') ? 'active' : ''}`}>Events</Link>
          {(user?.role === 'admin' || user?.role === 'club_admin') && (
            <Link to="/admin" onClick={toggleMenu} className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>
          )}

          <div className="mobile-actions">
            {user ? (
              <>
                <Link to="/profile" onClick={toggleMenu} className="btn btn-secondary w-100 mb-2" style={{ marginBottom: '10px' }}>
                  <Settings size={16} /> Profile
                </Link>
                <button onClick={() => { logout(); toggleMenu(); }} className="btn btn-primary w-100">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={toggleMenu} className="btn btn-primary w-100">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

