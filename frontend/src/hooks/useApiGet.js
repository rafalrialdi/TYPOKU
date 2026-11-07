import { useCallback, useEffect, useRef, useState } from 'react';

export function useApiGet(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const fetcherRef = useRef(fetcher);

  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        setShowSkeleton(true);
      }
    }, 200);

    setLoading(true);
    setError(null);

    fetcherRef
      .current({ signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setData(result?.data ?? result);
      })
      .catch((requestError) => {
        if (!active || requestError?.name === 'AbortError') return;
        setError(requestError);
      })
      .finally(() => {
        if (!active) return;
        clearTimeout(timer);
        setLoading(false);
        setShowSkeleton(false);
      });

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  return { data, error, loading, showSkeleton, reload };
}
