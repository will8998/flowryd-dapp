"use client";
import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
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
    console.error(`[ErrorBoundary${this.props.label ? ` - ${this.props.label}` : ''}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-white/[0.02] border border-white/5 rounded-lg p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-white/20 mb-3" />
          <p className="text-xs font-bold text-white/40 mb-1">
            {this.props.label || 'Component'} failed to load
          </p>
          <p className="text-[10px] text-white/20 mb-4 max-w-xs font-mono">
            {this.state.error?.message?.slice(0, 100) || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded text-[10px] font-bold text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
