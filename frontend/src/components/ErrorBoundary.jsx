import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Bisa digunakan untuk logging jika dibutuhkan
  }

  handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="paket-state" role="alert" style={{ margin: '2rem auto', maxWidth: '32rem' }}>
          <p className="paket-state-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <FiAlertCircle aria-hidden="true" />
            Terjadi Kesalahan
          </p>
          <p className="paket-state-text">
            {this.state.error?.message || 'Gagal memuat data dari server. Silakan coba beberapa saat lagi.'}
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

    return this.props.children;
  }
}
