/**
 * Home Page — JECRC Club Management Portal
 * ==========================================
 * Composed from focused sub-components:
 * HeroSection, StatsBar, FeaturedClubs, UpcomingEvents
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import HeroSection from '../components/home/HeroSection';
import StatsBar from '../components/home/StatsBar';
import FeaturedClubs from '../components/home/FeaturedClubs';
import UpcomingEvents from '../components/home/UpcomingEvents';
import ErrorBanner from '../components/common/ErrorBanner';

const Home = () => {
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
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
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-page" style={{ position: 'relative' }}>
      {error && (
        <ErrorBanner message={error} onRetry={() => window.location.reload()} />
      )}

      <HeroSection />
      <StatsBar />
      <FeaturedClubs clubs={clubs} />
      <UpcomingEvents events={events} clubs={clubs} />
    </div>
  );
};

export default Home;
