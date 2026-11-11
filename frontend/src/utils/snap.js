const SNAP_SCRIPT_ID = 'midtrans-snap-script';

const SNAP_URLS = {
  sandbox: 'https://app.sandbox.midtrans.com/snap/snap.js',
  production: 'https://app.midtrans.com/snap/snap.js',
};

let loadedSignature = null;
let loadPromise = null;

export function getSnapScriptUrl(clientKey, isProduction) {
  if (typeof isProduction === 'boolean') {
    return isProduction ? SNAP_URLS.production : SNAP_URLS.sandbox;
  }

  return (clientKey || '').trim().startsWith('SB-') ? SNAP_URLS.sandbox : SNAP_URLS.production;
}

function getSignature(clientKey, isProduction) {
  const environment =
    typeof isProduction === 'boolean' ? (isProduction ? 'production' : 'sandbox') : 'auto';

  return `${clientKey}:${environment}`;
}

export function loadSnap(clientKey, isProduction) {
  const key = (clientKey || '').trim();

  if (!key) {
    return Promise.reject(new Error('Client key Midtrans tidak tersedia'));
  }

  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Snap hanya dapat dimuat di browser'));
  }

  const signature = getSignature(key, isProduction);

  if (window.snap && loadedSignature === signature) {
    return Promise.resolve(window.snap);
  }

  if (loadPromise && loadedSignature === signature) {
    return loadPromise;
  }

  const existing = document.getElementById(SNAP_SCRIPT_ID);
  if (existing && loadedSignature !== signature) {
    existing.remove();
    window.snap = undefined;
  }

  loadedSignature = signature;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SNAP_SCRIPT_ID;
    script.src = getSnapScriptUrl(key, isProduction);
    script.setAttribute('data-client-key', key);
    script.async = true;

    script.onload = () => {
      if (window.snap) {
        resolve(window.snap);
      } else {
        loadedSignature = null;
        loadPromise = null;
        reject(new Error('Snap Midtrans gagal dimuat'));
      }
    };

    script.onerror = () => {
      loadedSignature = null;
      loadPromise = null;
      reject(new Error('Tidak dapat memuat Snap Midtrans'));
    };

    document.body.appendChild(script);
  });

  return loadPromise;
}

export function openSnap(token, callbacks = {}) {
  if (!window.snap) {
    throw new Error('Snap Midtrans belum siap');
  }

  let isTerminated = false;
  let checkTimer = null;
  let observer = null;

  const cleanup = () => {
    if (checkTimer) {
      clearInterval(checkTimer);
      checkTimer = null;
    }
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const handleClose = () => {
    if (isTerminated) return;
    isTerminated = true;
    cleanup();
    callbacks.onClose?.();
  };

  const handleSuccess = (result) => {
    isTerminated = true;
    cleanup();
    callbacks.onSuccess?.(result);
  };

  const handleError = (result) => {
    isTerminated = true;
    cleanup();
    callbacks.onError?.(result);
  };

  const handlePending = (result) => {
    callbacks.onPending?.(result);
  };

  window.snap.pay(token, {
    ...callbacks,
    onSuccess: handleSuccess,
    onPending: handlePending,
    onError: handleError,
    onClose: handleClose,
  });

  // Watcher fallback: pastikan onClose dipanggil jika Midtrans snap.js tidak memicu event onClose
  // Berikan jeda 800ms agar iframe sempat di-mount dan ditampilkan oleh snap.js
  setTimeout(() => {
    if (isTerminated) return;

    checkTimer = setInterval(() => {
      if (isTerminated) {
        cleanup();
        return;
      }

      const iframe = document.getElementById('snap-midtrans');
      // Jika iframe sudah hilang dari DOM atau display === 'none', berarti popup telah tertutup
      const isVisible =
        iframe &&
        iframe.style.display !== 'none' &&
        document.body.contains(iframe);

      if (!isVisible) {
        handleClose();
      }
    }, 400);

    const iframe = document.getElementById('snap-midtrans');
    if (iframe && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        if (iframe.style.display === 'none' || !document.body.contains(iframe)) {
          handleClose();
        }
      });
      observer.observe(iframe, { attributes: true, attributeFilter: ['style', 'class'] });
    }
  }, 800);
}

export function hideSnap() {
  try {
    window.snap?.hide();
    const iframe = document.getElementById('snap-midtrans');
    if (iframe) {
      iframe.style.display = 'none';
    }
  } catch {
    // Abaikan jika popup sudah tertutup.
  }
}
