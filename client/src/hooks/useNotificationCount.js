import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Custom hook for polling unread notification count
 * @param {string} basePath - 'warga' or 'admin' for API endpoint path
 * @returns {{ count: number, loading: boolean, error: string|null, refetch: function }}
 */
function useNotificationCount(basePath) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/${basePath}/notifications/unread-count`);
      setCount(response.data.count);
    } catch (err) {
      console.error(`Failed to fetch unread count for ${basePath}:`, err);
      setError(err.message || 'Gagal memuat jumlah notifikasi');
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  useEffect(() => {
    // Initial fetch
    fetchCount();

    // Set up polling interval (30 seconds)
    const intervalId = setInterval(fetchCount, 30000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchCount]);

  return { count, loading, error, refetch: fetchCount };
}

export default useNotificationCount;
