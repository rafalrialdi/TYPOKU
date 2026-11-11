import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const isDev = import.meta.env.DEV;

const hasArrayChanged = (a = [], b = []) =>
  a.length !== b.length || a.some((item, i) => !Object.is(item, b[i]));

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary menangkap error:', error, errorInfo.componentStack);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (
      this.state.hasError &&
      hasArrayChanged(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.handleReset();
    }
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (!hasError) return children;

    if (typeof fallback === 'function') {
      return fallback(error, this.handleReset);
    }
    if (fallback) return fallback;

    return (
      <div className="paket-state paket-state--error" role="alert">
        <p className="paket-state-title">
          <FiAlertCircle aria-hidden="true" />
          Terjadi Kesalahan
        </p>
        <p className="paket-state-text">
          {isDev && error?.message
            ? error.message
            : 'Terjadi masalah saat memuat halaman. Silakan coba lagi.'}
        </p>
        <button
          className="paket-button paket-button--primary paket-state-button"
          type="button"
          onClick={this.handleReset}
        >
          <FiRefreshCw aria-hidden="true" />
          Coba Lagi
        </button>
      </div>
    );
  }
}
