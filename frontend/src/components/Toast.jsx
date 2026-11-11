import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook toast lokal untuk menampilkan notifikasi aksi (misal klik tombol non-navigasi).
 * Otomatis menghilang setelah 2 detik.
 */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const idRef = useRef(0);

  const showToast = useCallback((message) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    idRef.current += 1;
    setToast({ id: idRef.current, message });

    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 2000);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  return { toast, showToast };
}

/**
 * Komponen Toast visual yang fixed di bagian bawah layar.
 * Memakai aria-live="polite" dan role="status" agar ramah pembaca layar.
 */
export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="ui-toast-viewport" aria-live="polite" aria-atomic="true">
      <div className="ui-toast" role="status" key={toast.id}>
        {toast.message}
      </div>
    </div>
  );
}
