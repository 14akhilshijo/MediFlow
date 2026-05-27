import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const useFetch = (url, options = {}) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Strip the /api/v1 prefix since the api instance already has it as baseURL
        const path = url.replace(/^\/api\/v1/, "");
        const response = await api.get(path, options);
        if (!cancelled) setData(response.data);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || err.message || "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, tick]);

  return { data, loading, error, refetch };
};

export default useFetch;
