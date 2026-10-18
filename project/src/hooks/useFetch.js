import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to fetch data using an async service function with loading and error states.
 * @param {Function} asyncFunc - Service function returning a Promise
 * @param {Array} dependencies - Dependencies to re-trigger the fetch
 */
export const useFetch = (asyncFunc, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunc();
      setData(result);
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

export default useFetch;
