import { Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';

export default function QueryBoundary({ children, fallback = null, errorFallback = null, onReset }) {
  const queryClient = useQueryClient();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      queryClient.resetQueries();
    }
  };

  return (
    <ErrorBoundary fallback={errorFallback} onReset={handleReset}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
