"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                this.props.onReset?.();
                this.setState({ hasError: false, error: null });
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}