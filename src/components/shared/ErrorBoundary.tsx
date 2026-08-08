import { Component, type ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, ArrowLeft01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import { scrubPII } from '@/lib/shared';
import type { ErrorBoundaryProps } from '@/types/shared';

const captureException = (error: Error, errorInfo: ErrorInfo) => {
  const scrubbedMessage = scrubPII(error.message);
  const scrubbedStack = scrubPII(error.stack || '');
  
  const scrubbedError = new Error(scrubbedMessage);
  scrubbedError.name = error.name;
  scrubbedError.stack = scrubbedStack;

  // Safeguard global Sentry reporting
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(scrubbedError, {
      extra: {
        componentStack: scrubPII(errorInfo.componentStack || '')
      }
    });
  } else {
    console.error('[Sentry Error Boundary] captured scrubbed error:', scrubbedError, {
      componentStack: scrubPII(errorInfo.componentStack || '')
    });
  }
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    try {
      captureException(error, errorInfo);
    } catch (e) {
      console.error('[ErrorBoundary] Failed to report to Sentry:', e);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-white dark:bg-black text-zinc-950 dark:text-white font-sans select-none">
          <Card className="max-w-md w-full border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/90 p-6 sm:p-8 space-y-5 text-center shadow-lg rounded-lg">
            <div className="mx-auto p-3.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shrink-0 w-fit">
              <HugeiconsIcon icon={Alert02Icon} className="size-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-zinc-900 dark:text-white">
                Unexpected System Error
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                An unexpected condition was encountered. A telemetry log has been scrubbed of sensitive data and sent to the engineering team.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="flex-1 h-9 text-xs font-bold gap-1.5 cursor-pointer border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-secondary rounded-lg"
              >
                <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
                <span>Retry</span>
              </Button>

              <Button
                onClick={this.handleGoHome}
                className="flex-1 h-9 text-xs font-black gap-1.5 cursor-pointer bg-brand hover:opacity-90 text-white border-none rounded-lg"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
                <span>Go Home</span>
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
