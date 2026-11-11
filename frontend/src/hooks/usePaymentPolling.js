import { useCallback, useEffect, useRef } from 'react';

export function usePaymentPolling({
  fetchStatus,
  intervalMs = 5000,
  onPaid,
  onExpired,
  onFailed,
}) {
  const timerRef = useRef(null);
  const stoppedRef = useRef(true);
  const callbacksRef = useRef({ fetchStatus, onPaid, onExpired, onFailed });

  callbacksRef.current = { fetchStatus, onPaid, onExpired, onFailed };

  const stop = useCallback(() => {
    stoppedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (orderCode) => {
      stop();

      if (!orderCode) {
        return;
      }

      stoppedRef.current = false;

      const check = async () => {
        if (stoppedRef.current) {
          return;
        }

        try {
          const response = await callbacksRef.current.fetchStatus(orderCode);
          const status = response?.data?.status;

          if (status === 'paid') {
            stop();
            callbacksRef.current.onPaid?.(response.data);
          } else if (status === 'expired') {
            stop();
            callbacksRef.current.onExpired?.(response.data);
          } else if (status === 'failed' || status === 'cancelled') {
            stop();
            callbacksRef.current.onFailed?.(response.data);
          }
        } catch {
          // Abaikan error sementara; polling akan mencoba lagi.
        }
      };

      timerRef.current = setInterval(check, intervalMs);
    },
    [intervalMs, stop]
  );

  useEffect(() => {
    const handleExit = () => stop();
    window.addEventListener('pagehide', handleExit);
    window.addEventListener('beforeunload', handleExit);

    return () => {
      window.removeEventListener('pagehide', handleExit);
      window.removeEventListener('beforeunload', handleExit);
      stop();
    };
  }, [stop]);

  return { start, stop };
}
