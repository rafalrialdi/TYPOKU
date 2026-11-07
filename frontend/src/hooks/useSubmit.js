import { useCallback, useRef, useState } from 'react';

export function useSubmit(action) {
  const [loading, setLoading] = useState(false);
  const busyRef = useRef(false);
  const actionRef = useRef(action);

  actionRef.current = action;

  const run = useCallback(async (...args) => {
    if (busyRef.current) return undefined;

    busyRef.current = true;
    setLoading(true);

    try {
      return await actionRef.current(...args);
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, []);

  return { run, loading };
}
