/**
 * ============================================================================
 * USE VIEWPORT SCROLL STORY — 3D CANVAS GESTURE & SCROLL DRIVER
 * ============================================================================
 * Enables smooth scroll-driven storytelling across 3D WebGL viewports:
 * - Listens to wheel events over canvas with customizable sensitivity & dampening
 * - Translates wheel delta into incremental steps in storytelling3DStore
 * - Prevents default page jump when scrolling directly over the 3D viewport
 * - Supports keyboard step shortcuts (ArrowUp / ArrowDown / PageUp / PageDown)
 * ============================================================================
 */

import { useEffect, RefObject } from "react";
import { useStorytelling3DStore } from "../../state/storytelling3DStore";
import { WorkflowStage } from "../../state/guidedEngineeringStore";

interface UseViewportScrollStoryOptions {
  activeStage: WorkflowStage;
  enabled?: boolean;
  sensitivity?: number; // default: 0.0012
}

export function useViewportScrollStory(
  containerRef: RefObject<HTMLElement | null>,
  options: UseViewportScrollStoryOptions
) {
  const { activeStage, enabled = true, sensitivity = 0.0012 } = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if active stage in storytelling store matches current viewport stage
      const store = useStorytelling3DStore.getState();
      if (store.activeStage !== activeStage) {
        useStorytelling3DStore.getState().setActiveStage(activeStage);
      }

      // Step scroll progress proportionally to wheel deltaY
      const delta = e.deltaY * sensitivity;
      if (Math.abs(delta) > 0.0001) {
        // Prevent jarring window scroll while exploring 3D story over canvas
        e.preventDefault();
        useStorytelling3DStore.getState().stepScroll(delta);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, activeStage, enabled, sensitivity]);
}
