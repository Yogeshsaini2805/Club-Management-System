/**
 * UpcomingEvents — Event carousel section on home page
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatEventDateCompact } from '../../utils/dateUtils';
import './UpcomingEvents.css';

const UpcomingEvents = ({ events, clubs }) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const upcomingEvents = events.filter(e => {
    try {
      if (e.date.includes('T')) {
        return new Date(e.date) > new Date();
      }
      return true;
    } catch { return true; }
  }).slice(0, 5);

  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % upcomingEvents.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
  };

  return (
    <section className="upcoming-events-section">
      <div className="upcoming-events-bg"></div>
      <div className="container">
        <div className="upcoming-events-header">
          <div>
            <h2 className="upcoming-events-title">Upcoming Events</h2>
            <p className="upcoming-events-subtitle">
              Don't miss out on what's happening around campus.
            </p>
          </div>
          {upcomingEvents.length > 1 && (
            <div className="upcoming-events-nav">
              <button onClick={prevEvent} className="event-nav-btn">
                <ChevronLeft size={20} color="#64748b" />
              </button>
              <button onClick={nextEvent} className="event-nav-btn">
                <ChevronRight size={20} color="#0f172a" />
              </button>
            </div>
          )}
        </div>

        <div className="upcoming-events-content">
          {/* Event Details Card */}
          <div className="upcoming-event-card-wrapper">
            {upcomingEvents.length > 0 ? (
              <div className="upcoming-event-card">
                {(() => {
                  const event = upcomingEvents[currentEventIndex];
                  const host = clubs.find(c => c.id === event.club_id);
                  const displayDate = formatEventDateCompact(event.date);

                  return (
                    <div key={event.id} className="upcoming-event-detail">
                      <div className="upcoming-event-date-badge">{displayDate}</div>
                      <h3 className="upcoming-event-name">{event.title}</h3>
                      <p className="upcoming-event-host">
                        Organized by: {host ? host.name : 'University'}
                      </p>

                      {event.venue && (
                        <div className="upcoming-event-venue">
                          <MapPin size={18} color="#db2777" />
                          <span>{event.venue}</span>
                        </div>
                      )}

                      <Link to="/events" className="upcoming-event-cta">
                        Event Details &rarr;
                      </Link>

                      {upcomingEvents.length > 1 && (
                        <div className="upcoming-event-dots">
                          {upcomingEvents.map((_, idx) => (
                            <div
                              key={idx}
                              className={`event-dot ${idx === currentEventIndex ? 'active' : ''}`}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="upcoming-event-card">
                <h3 style={{ color: '#64748b' }}>No upcoming events currently scheduled.</h3>
              </div>
            )}
          </div>

          {/* Illustration */}
          <div className="upcoming-events-illustration">
            <img
              src="/assets/events_illustration_v2_nobg.png"
              alt="Students High-Fiving"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
