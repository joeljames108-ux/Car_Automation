// ============================================================================
// USE WEBGL RECOVERY — Auto-remount a 3D canvas when its WebGL context is lost
// ============================================================================
// Browsers can drop a WebGL context (GPU pressure, context exhaustion after
// visiting many 3D viewports, or a GPU process reset). When that happens an
// R3F <Canvas> keeps rendering black until a fresh context is created. This
// hook watches the canvas's context events and, if the context is lost and
// does not restore itself within a grace period, bumps a remount key so the
// parent forces a brand-new <Canvas> (and a new context) into the tree.
//
// Usage:
//   const remountKey = useWebGLRecovery();
//   <Canvas key={remountKey} onCreated={({ gl }) => attachWebGLRecovery(gl.domElement)} />
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";

const RESTORE_GRACE_MS = 2500;

/**
 * Attaches context-loss listeners to a WebGL canvas element. If the context is
 * lost and the browser does not restore it within RESTORE_GRACE_MS, the
 * returned remount key is incremented so React recreates the <Canvas>.
 */
export function useWebGLRecovery(): { remountKey: number; attachWebGLRecovery: (canvas: HTMLCanvasElement | null) => void } {
  const [remountKey, setRemountKey] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Clear any pending remount timer if the canvas unmounts first.
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const attachWebGLRecovery = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const onContextLost = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      // Give the browser a moment to try restoring the same context. If it
      // succeeds we'll get a 'webglcontextrestored' event and cancel.
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setRemountKey((k) => k + 1);
      }, RESTORE_GRACE_MS);
    };

    const onContextRestored = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, []);

  return { remountKey, attachWebGLRecovery };
}

export default useWebGLRecovery;