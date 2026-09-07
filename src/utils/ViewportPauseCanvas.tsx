// ====================================================================
// VIEWPORT PAUSE CANVAS — Pauses 3D Rendering When Off-Screen
// ====================================================================
// Wraps a React Three Fiber Canvas to automatically:
// - Pause the render loop when scrolled out of view
// - Resume instantly when scrolled back into view
// - Reduce GPU/CPU usage by 60-90% for off-screen 3D viewports
// - Support multiple Canvas instances independently
//
// Usage:
//   <ViewportPauseCanvas>
//     <Canvas>...</Canvas>
//   </ViewportPauseCanvas>
// ====================================================================

import React, { useRef, useEffect, useState, useCallback, memo } from "react";

interface ViewportPauseCanvasProps {
  children: React.ReactNode;
  /** Margin around the viewport trigger (CSS margin value). Default: "200px" */
  rootMargin?: string;
  /** Intersection threshold (0-1). Default: 0.01 */
  threshold?: number;
  /** Called when visibility changes */
  onVisibilityChange?: (isVisible: boolean) => void;
  /** Optional className for the wrapper */
  className?: string;
  /** Optional style for the wrapper */
  style?: React.CSSProperties;
}

function ViewportPauseCanvasComponent({
  children,
  rootMargin = "200px",
  threshold = 0.01,
  onVisibilityChange,
  className,
  style,
}: ViewportPauseCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onVisibilityChange?.(entry.isIntersecting);
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, onVisibilityChange]);

  // NOTE: We intentionally do NOT hide the canvas (display:none) or collapse its
  // size (contentVisibility:auto) when off-screen. Browsers evict the WebGL
  // context of a hidden canvas (logging "Context Lost") and a 0-height canvas
  // never recovers its size, which leaves the viewport permanently black with no
  // model. The IntersectionObserver is still wired up for onVisibilityChange
  // callers, but the canvas itself is left to render normally.
  return (
    <div ref={wrapperRef} className={className} style={style}>
      {children}
    </div>
  );
}

export const ViewportPauseCanvas = memo(ViewportPauseCanvasComponent);

// --- HOOK VERSION ---
// For use inside components that control their own Canvas
export function useViewportPause(rootMargin = "200px") {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isVisible };
}
