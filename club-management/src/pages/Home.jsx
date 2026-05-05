import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Zap, Calendar, MapPin, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

const Home = () => {
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubsRes = await fetch(`${API_BASE_URL}/clubs`);
        const eventsRes = await fetch(`${API_BASE_URL}/events`);
        if (clubsRes.ok) setClubs(await clubsRes.json());
        if (eventsRes.ok) setEvents(await eventsRes.json());
      } catch (err) {
        console.error("Failed to fetch home data", err);
        setError('Unable to load data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredClubs = clubs.slice(0, 3);

  // Filter for upcoming events based on dynamic ISO timestamp comparison
  const upcomingEvents = events.filter(e => {
    try {
      if (e.date.includes('T')) {
        return new Date(e.date) > new Date();
      }
      return true; // fallback for legacy
    } catch { return true; }
  }).slice(0, 5); // get up to 5 events

  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % upcomingEvents.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
  };

  const cardColors = ['#5c38e6', '#007bff', '#ff3366']; // Purple, Blue, Pink

  return (
    <div className="home-page" style={{ position: 'relative' }}>

      {error && (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', textAlign: 'center', color: '#dc2626' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem' }}>Retry</button>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '8rem', paddingBottom: '8rem', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          
          {/* Left Text Column */}
          <div style={{ flex: '1 1 500px', zIndex: 2 }}>
            <div className="badge" style={{ marginBottom: '1.5rem', background: '#fff9e6', color: '#d97706', padding: '0.5rem 1rem', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
              Welcome to the Future <span role="img" aria-label="wave">👋</span>
            </div>
            
            <h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: '1.1', color: '#0f172a' }}>
              Discover Your <br />
              Passions at <br />
              <span className="text-gradient">JECRC University</span>
            </h1>
            
            <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '500px', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              Join clubs, collaborate in student-driven initiatives, and participate in events that shape your university experience. Elevate your journey today!
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/clubs" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Explore Clubs <ArrowRight size={20} />
              </Link>
              <Link to="/initiations" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '50px', color: '#334155', fontWeight: '600' }}>
                View Initiations
              </Link>
            </div>
          </div>
          
          {/* Right Image Column */}
          <div style={{ flex: '1 1 500px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
             {/* Abstract blobs behind image */}
             <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#e0e7ff', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', zIndex: -1, transform: 'scale(1.1) translate(5%, 5%)' }}></div>
             <div style={{ position: 'absolute', width: '90%', height: '90%', background: '#fce7f3', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', zIndex: -1, transform: 'scale(1.1) translate(-10%, -10%)' }}></div>
             
             <img src="/assets/hero_students_v2_nobg.png" alt="Students celebrating" style={{ width: '100%', maxWidth: '650px', objectFit: 'contain', zIndex: 1 }} />
          </div>
        </div>
      </section>

      {/* Stats Banner Overlapping */}
      <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
        <div className="glass-panel" style={{ background: 'white', borderRadius: '24px', padding: '2rem 1rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5c38e6' }}>
              <Users size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>20+</h3>
              <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>Active Clubs</p>
            </div>
          </div>
          
          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 1rem' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <Zap size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>5+</h3>
              <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>Student Initiations</p>
            </div>
          </div>

          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 1rem' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
              <Calendar size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>50+</h3>
              <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>Yearly Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Clubs */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                Featured Clubs <Sparkles color="#eab308" size={32} />
              </h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Discover some of our most active student organizations.</p>
            </div>
            <Link to="/clubs" style={{ color: '#5c38e6', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ChevronRight size={20} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {featuredClubs.map((club, index) => {
              const btnColor = cardColors[index % cardColors.length];
              return (
                <div key={club.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s' }} className="club-card-hover">
                  
                  {/* Card Header (Logo and Cover) */}
                  <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={club.logo} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{club.name}</h3>
                  </div>
                  
                  {/* Cover Image */}
                  <div style={{ height: '130px', backgroundColor: `${btnColor}15`, position: 'relative', overflow: 'hidden', borderBottom: '1px solid #f1f5f9' }}>
                     <img src="/assets/club_cover_bg.png" alt="Club Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.9, filter: 'saturate(1.2)' }} />
                  </div>

                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {club.description}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: btnColor, fontWeight: '600', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      <Users size={18} />
                      <span>{club.member_count || 0} Members</span>
                    </div>
                    
                    <Link to={`/clubs/${club.id}`} style={{ display: 'block', textAlign: 'center', padding: '0.8rem', background: btnColor, color: 'white', borderRadius: '50px', fontWeight: '600', transition: 'opacity 0.2s' }}>
                      Learn More &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events Split Section */}
      <section style={{ padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
        {/* Pink background expanded to cover the whole right half */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', background: '#fdf2f8', zIndex: -1 }}></div>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                Upcoming Events
              </h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Don't miss out on what's happening around campus.</p>
            </div>
            {upcomingEvents.length > 1 && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button onClick={prevEvent} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-scale"><ChevronLeft size={20} color="#64748b" /></button>
                 <button onClick={nextEvent} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-scale"><ChevronRight size={20} color="#0f172a" /></button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem' }}>
            {/* Event Details Card */}
            <div style={{ flex: '1 1 400px' }}>
              {upcomingEvents.length > 0 ? (
                <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #fce7f3', position: 'relative', overflow: 'hidden' }}>
                  {(() => {
                    const event = upcomingEvents[currentEventIndex];
                    const host = clubs.find(c => c.id === event.club_id);
                    let displayDate = event.date;
                    try {
                      if (event.date.includes('T')) {
                        const d = new Date(event.date);
                        displayDate = d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).toUpperCase();
                      }
                    } catch (e) {}

                    return (
                      <div key={event.id} style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                        <div style={{ display: 'inline-block', background: '#fdf2f8', color: '#db2777', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                          {displayDate}
                        </div>
                        <h3 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.5rem' }}>{event.title}</h3>
                        <p style={{ color: '#5c38e6', fontWeight: '600', marginBottom: '1rem' }}>Organized by: {host ? host.name : 'University'}</p>
                        
                        {event.venue && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '2rem' }}>
                            <MapPin size={18} color="#db2777" />
                            <span>{event.venue}</span>
                          </div>
                        )}
                        
                        <Link to="/events" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '1rem', background: '#ff3366', color: 'white', borderRadius: '50px', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(255, 51, 102, 0.3)' }}>
                          Event Details &rarr;
                        </Link>
                        
                        {/* Event indicator dots */}
                        {upcomingEvents.length > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                            {upcomingEvents.map((_, idx) => (
                              <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === currentEventIndex ? '#ff3366' : '#fce7f3', transition: 'background 0.3s' }}></div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ color: '#64748b' }}>No upcoming events currently scheduled.</h3>
                </div>
              )}
            </div>

            {/* Illustration */}
            <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <img src="/assets/events_illustration_v2_nobg.png" alt="Students High-Fiving" style={{ width: '100%', maxWidth: '600px', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
        
        {/* Global Keyframes for fade-in animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hover-scale:hover {
            transform: scale(1.1);
          }
        `}} />
      </section>

    </div>
  );
};

export default Home;
