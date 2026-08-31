import React, { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  stageName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class StageErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[StageErrorBoundary]", this.props.stageName || "Stage", "crashed:", error);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl border" style={{background:"rgba(26,16,8,0.85)",borderColor:"rgba(180,140,60,0.3)"}}>
          <div className="text-4xl mb-3">⚠️</div>
          <div className="text-sm font-bold" style={{color:"#fde68a"}}>Stage Rendering Error</div>
          <div className="text-xs mt-1" style={{color:"rgba(253,230,138,0.6)"}}>{this.state.error?.message || "An error occurred"}</div>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="mt-4 px-4 py-2 rounded-xl text-xs font-bold" style={{background:"rgba(180,140,60,0.2)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.3)"}}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}