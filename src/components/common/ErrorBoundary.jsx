import { Component } from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-[#fcf9f3] flex items-center justify-center px-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white border border-[#1c1c18]/10 p-8 md:p-12">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h1 className="font-unica text-4xl md:text-5xl uppercase tracking-tighter text-[#1c1c18] mb-4">
                SOMETHING WENT WRONG
              </h1>

              {/* Error Message */}
              <p className="font-plex text-base text-[#5f5e5e] mb-6 leading-relaxed">
                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </p>

              {/* Error Details (Development only) */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mb-6 bg-zinc-50 border border-zinc-200 rounded p-4">
                  <summary className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] cursor-pointer mb-2">
                    Error Details (Dev Only)
                  </summary>
                  <div className="font-mono text-xs text-red-600 overflow-auto">
                    <p className="mb-2">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold text-xs uppercase tracking-widest px-6 py-4 hover:bg-[#4b0e1e] transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-white border border-[#1c1c18] text-[#1c1c18] font-grotesk font-bold text-xs uppercase tracking-widest px-6 py-4 hover:bg-[#f1eee7] transition-colors"
                >
                  Go Home
                </button>
              </div>

              {/* Support Link */}
              <div className="mt-6 pt-6 border-t border-[#1c1c18]/10">
                <p className="font-plex text-sm text-[#5f5e5e] text-center">
                  Need help?{' '}
                  <a
                    href="/contact"
                    className="text-[#1c1c18] underline hover:text-[#4b0e1e] transition-colors"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Higher-order component to wrap components with error boundary
 * @param {Component} Component - Component to wrap
 * @param {Object} errorBoundaryProps - Props for ErrorBoundary
 * @returns {Component} Wrapped component
 */
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
