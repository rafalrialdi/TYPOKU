import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persister, FIVE_MINUTES } from './lib/queryClient';
import './index.css';
import App from './App.jsx';
import './pages/ui-interactions.css';

const GOOGLE_CLIENT_ID = (import.meta.env?.VITE_GOOGLE_CLIENT_ID || '').trim();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Batas umur cache di localStorage. Hanya 'packages' & 'payment-config'
        // yang disimpan (lihat dehydrateOptions), jadi 5 menit cukup agar harga
        // paket tidak basi ketika aplikasi dibuka kembali.
        maxAge: FIVE_MINUTES,
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const rootKey = query.queryKey?.[0];
            return rootKey === 'packages' || rootKey === 'payment-config';
          },
        },
      }}
      onSuccess={() => {
        // Cache selesai dipulihkan setelah refresh -> tanya server ada data baru atau tidak
        queryClient.invalidateQueries();
      }}
    >
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      ) : (
        <App />
      )}
    </PersistQueryClientProvider>
  </StrictMode>
);
