import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Generic data-fetching hook.
 * @param {string} url - API endpoint
 * @param {Object} [options] - Axios config options
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(url, {
          withCredentials: true,
          ...options,
        });
        if (!cancelled) setData(response.data);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
