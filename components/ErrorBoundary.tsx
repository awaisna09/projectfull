import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8" />
                <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-gray-700 text-lg">
                  We encountered an unexpected error. Don't worry, your data is safe!
                </p>
                <p className="text-gray-600">
                  Our team has been notified and we're working on fixing this issue.
                </p>
              </div>

              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 mb-2">Error Details:</p>
                  <p className="text-sm text-red-700 font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-40 mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500">
                If this problem persists, please contact support at{' '}
                <a href="mailto:support@imtehaan.com" className="text-blue-600 hover:underline">
                  support@imtehaan.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

