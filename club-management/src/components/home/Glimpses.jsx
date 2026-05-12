import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import { Image as ImageIcon } from 'lucide-react';
import './Glimpses.css';

const Glimpses = () => {
  const [memories, setMemories] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/memories/recent?limit=20`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // If less than 5 memories, duplicate them so the infinite scroll effect looks smooth
          let displayMemories = [...data];
          if (data.length > 0 && data.length < 5) {
            displayMemories = [...data, ...data, ...data, ...data].slice(0, 8);
          }
          setMemories(displayMemories);
        }
      })
      .catch(err => console.error('Failed to load recent memories', err));
  }, []);

  // Simple auto-scroll
  useEffect(() => {
    if (!scrollContainerRef.current || memories.length === 0) return;
    
    const container = scrollContainerRef.current;
    let animationFrameId;
    let scrollAmount = 0.5;

    const scroll = () => {
      container.scrollLeft += scrollAmount;
      if (container.scrollLeft >= (container.scrollWidth - container.clientWidth)) {
        container.scrollLeft = 0; // reset
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    const pauseScroll = () => cancelAnimationFrame(animationFrameId);
    const resumeScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(scroll);
    };

    container.addEventListener('mouseenter', pauseScroll);
    container.addEventListener('mouseleave', resumeScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mouseenter', pauseScroll);
      container.removeEventListener('mouseleave', resumeScroll);
    };
  }, [memories]);

  if (memories.length === 0) return null;

  return (
    <section className="glimpses-section">
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <ImageIcon className="section-icon" color="#ff3366" />
          Past Memories & Glimpses
        </h2>
        <p className="section-subtitle">Catch a glimpse of the vibrant life inside our clubs.</p>
      </div>

      <div className="glimpses-carousel-container" ref={scrollContainerRef}>
        <div className="glimpses-track">
          {memories.map((memory, index) => (
            <div key={`${memory.id}-${index}`} className="glimpse-card card glass-panel">
              <div className="glimpse-media">
                {memory.media_type === 'video' ? (
                  <video src={memory.media_url} muted loop autoPlay playsInline />
                ) : (
                  <img 
                    src={memory.media_url} 
                    alt="Club Memory" 
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
              </div>
              <div className="glimpse-overlay">
                <span className="glimpse-club-name">{memory.club_name}</span>
              </div>
            </div>
          ))}
          {/* Duplicate set for seamless scrolling loop */}
          {memories.map((memory, index) => (
            <div key={`dup-${memory.id}-${index}`} className="glimpse-card card glass-panel">
              <div className="glimpse-media">
                {memory.media_type === 'video' ? (
                  <video src={memory.media_url} muted loop autoPlay playsInline />
                ) : (
                  <img 
                    src={memory.media_url} 
                    alt="Club Memory" 
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
              </div>
              <div className="glimpse-overlay">
                <span className="glimpse-club-name">{memory.club_name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Glimpses;
