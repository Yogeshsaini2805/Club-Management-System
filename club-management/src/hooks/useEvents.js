/**
 * useEvents Hook — Fetch & cache event data
 */

import { useState, useEffect } from 'react';
import { eventsApi } from '../services/api';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events', err);
      setError('Failed to load events. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
}
