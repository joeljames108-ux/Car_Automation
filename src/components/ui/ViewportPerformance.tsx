import React, { Suspense, lazy, useState, useEffect, useRef, useCallback, useMemo } from "react";

// ====================================================================
// LAZY VIEWPORT WRAPPER — Delays mounting heavy 3D canvases
// ====================================================================
export function lazyViewport<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(factory);
}

// ====================================================================
// VIEWPORT LOADING SKELETON — Shimmer placeholder while 3D loads
// ====================================================================
export const ViewportSkeleton: React.FC<{
  height?: string;
  label?: string;
}> = ({ height = "h-[500px]", label = "Loading 3D Viewport..." }) => (
  <div className={"relative overflow-hidden rounded-2xl bg-slate-900/80 border border-amber-500/20 " + height}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-[shimmer_2s_infinite]" />
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="text-xs font-mono text-amber-400/70 tracking-wider uppercase">{label}</span>
    </div>
  </div>
);

// ====================================================================
// VIEWPORT ERROR BOUNDARY — Catches 3D canvas crashes gracefully
// ====================================================================
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

export class ViewportErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackLabel?: string },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Viewport Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-red-500/30 h-[400px] flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xl">!
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-300 mb-1">{this.props.fallbackLabel || "3D Viewport"} Error</h3>
            <p className="text-xs text-slate-400 max-w-md">{this.state.error?.message}</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ====================================================================
// USE VIEWPORT VISIBILITY — Pauses rendering when off-screen
// ====================================================================
export function useViewportVisibility(ref: React.RefObject<HTMLDivElement>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}
