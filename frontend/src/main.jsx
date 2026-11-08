import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persister, FIVE_MINUTES } from './lib/queryClient';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
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
      <App />
    </PersistQueryClientProvider>
  </StrictMode>
);
