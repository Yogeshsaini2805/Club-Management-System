/**
 * useClubs Hook — Fetch & cache club data
 */

import { useState, useEffect } from 'react';
import { clubsApi } from '../services/api';

export function useClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClubs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await clubsApi.getAll();
      setClubs(data);
    } catch (err) {
      console.error('Failed to fetch clubs', err);
      setError('Failed to load clubs. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  return { clubs, loading, error, refetch: fetchClubs };
}
