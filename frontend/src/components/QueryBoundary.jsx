import { Suspense } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';

export default function QueryBoundary({ children, fallback = null, errorFallback = null, onReset, resetKeys }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallback={errorFallback}
          resetKeys={resetKeys}
          onReset={() => {
            reset();
            onReset?.();
          }}
        >
          <Suspense fallback={fallback}>
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
