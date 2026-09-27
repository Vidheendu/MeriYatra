import { useState, useEffect } from 'react';
import { dummyBuses, dummyRoutes } from '../services/mockData';

export function useBuses() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate a network request
    const timer = setTimeout(() => {
      try {
        setBuses(dummyBuses);
        setRoutes(dummyRoutes);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { buses, routes, loading, error };
}
