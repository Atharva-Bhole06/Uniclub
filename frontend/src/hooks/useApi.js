import { useState, useEffect, useCallback } from 'react';

/**
 * Generic reusable data-fetching hook.
 * Usage: const { data, loading, error, refetch } = useApi(fetchFn, [deps])
 */
export function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * Mutation hook for POST/PUT/DELETE operations.
 * Usage: const { mutate, loading, error } = useMutation(apiFn)
 */
export function useMutation(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(payload);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
