import { useState, useEffect } from 'react';

export function usePolling<T>(callback: () => Promise<T>, interval: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await callback();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    const timer = setInterval(fetchData, interval);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [callback, interval]);

  return { data, loading, error };
}