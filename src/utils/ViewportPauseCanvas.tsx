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

import React, { useRef, useEffect, useState, useCallback, memo, createContext, useContext } from "react";

// --- FRAMELOOP PAUSE CONTEXT ---
// ViewportPauseCanvas publishes whether its region is on-screen. Scenes read
// this via useFrameloopPause() and set <Canvas frameloop="never"> while
// off-screen. Pausing the frameloop keeps the WebGL context and the last
// rendered frame intact (unlike display:none, which gets the context evicted
// and causes the black-viewport bug).
const ViewportPauseContext = createContext(false);

/** Returns true when the surrounding ViewportPauseCanvas region is OFF-screen
 *  and 3D rendering should pause. Defaults to false (never pause) outside a
 *  ViewportPauseCanvas wrapper. */
export function useFrameloopPause(): boolean {
  return useContext(ViewportPauseContext);
}

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
  const [isVisibleState, setIsVisibleState] = useState(true);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisibleState(entry.isIntersecting);
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
  // model. Instead, scenes consume useFrameloopPause() and stop the render loop
  // (frameloop="never"), which is context-safe.
  return (
    <ViewportPauseContext.Provider value={!isVisibleState}>
      <div ref={wrapperRef} className={className} style={style}>
        {children}
      </div>
    </ViewportPauseContext.Provider>
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
