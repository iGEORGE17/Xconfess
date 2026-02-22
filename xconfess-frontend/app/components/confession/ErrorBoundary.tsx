"use client";

import { ReactNode, Component, ReactElement } from "react";
import { logError } from "@/app/lib/utils/errorHandler";

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, "Confession Feed ErrorBoundary", {
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
              <h2 className="text-red-300 text-xl font-semibold mb-2">
                Something went wrong
              </h2>
              <p className="text-red-200 text-sm mb-4">
                {this.state.error?.message || "Failed to load confessions"}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-sm"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
