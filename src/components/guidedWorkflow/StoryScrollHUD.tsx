/**
 * ============================================================================
 * STORY SCROLL HUD — FLOATING 3D CINEMATIC REVEAL CONTROLLER
 * ============================================================================
 * Minimalist automotive engineering telemetry HUD displaying:
 * - Current Chapter title, subtitle, and sequence index
 * - Micro segmented progress line with clickable keyframe snap nodes
 * - Live Exploded View indicator tag (0% to 100%)
 * - Step Previous / Next buttons for frictionless accessibility
 * - Bi-directional synchronization feedback with the right engineering panel
 * ============================================================================
 */

import React, { useMemo, useEffect, useRef } from "react";
import {
  useStorytelling3DStore,
  STAGE_STORY_KEYFRAMES,
  interpolateStoryState,
} from "../../state/storytelling3DStore";
import { WorkflowStage } from "../../state/guidedEngineeringStore";

interface StoryScrollHUDProps {
  activeStage: WorkflowStage;
  className?: string;
}

const SMOOTH_LERP_FACTOR = 0.08;

export const StoryScrollHUD: React.FC<StoryScrollHUDProps> = ({
  activeStage,
  className = "",
}) => {
  const scrollProgress = useStorytelling3DStore((s) => s.scrollProgress);
  const targetScrollProgress = useStorytelling3DStore((s) => s.targetScrollProgress);
  const snapToKeyframe = useStorytelling3DStore((s) => s.snapToKeyframe);
  const nextKeyframe = useStorytelling3DStore((s) => s.nextKeyframe);
  const prevKeyframe = useStorytelling3DStore((s) => s.prevKeyframe);
  const setTargetScrollProgress = useStorytelling3DStore((s) => s.setTargetScrollProgress);
  const animFrameRef = useRef<number | null>(null);

  // Sync activeStage
  useEffect(() => {
    useStorytelling3DStore.getState().setActiveStage(activeStage);
  }, [activeStage]);

  // Smooth animation loop — lerps scrollProgress toward targetScrollProgress
  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      const store = useStorytelling3DStore.getState();
      const diff = store.targetScrollProgress - store.scrollProgress;
      if (Math.abs(diff) > 0.001) {
        const nextProgress = store.scrollProgress + diff * SMOOTH_LERP_FACTOR;
        const clamped = Math.max(0.0, Math.min(1.0, nextProgress));
        const state = interpolateStoryState(store.activeStage, clamped);
        useStorytelling3DStore.setState({
          scrollProgress: clamped,
          activePanelGroupId: state.activeKeyframe.panelGroupId,
        });
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const keyframes = useMemo(
    () => STAGE_STORY_KEYFRAMES[activeStage] || STAGE_STORY_KEYFRAMES.engine,
    [activeStage]
  );

  const interpolated = useMemo(
    () => interpolateStoryState(activeStage, scrollProgress),
    [activeStage, scrollProgress]
  );

  const activeKf = interpolated.activeKeyframe;
  const pctDisplay = Math.round(scrollProgress * 100);
  const explodedPct = Math.round(interpolated.explodedFactor * 100);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0.0, Math.min(1.0, clickX / rect.width));
    setTargetScrollProgress(progress);
  };

  // Keyboard handler for step navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        useStorytelling3DStore.getState().nextKeyframe();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        useStorytelling3DStore.getState().prevKeyframe();
      } else if (e.key === "Home") {
        e.preventDefault();
        useStorytelling3DStore.getState().setTargetScrollProgress(0.0);
      } else if (e.key === "End") {
        e.preventDefault();
        useStorytelling3DStore.getState().setTargetScrollProgress(1.0);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={className}
      style={{
        pointerEvents: "auto",
        userSelect: "none",
        background: "rgba(15, 15, 25, 0.88)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(100, 116, 139, 0.25)",
        borderRadius: 16,
        boxShadow: "0 8px 32px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        padding: "10px 16px",
        maxWidth: 540,
        width: "92vw",
        transition: "all 0.2s ease",
      }}
    >
      {/* 1. Header: Chapter Tag, Title & Percent */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 6px", borderRadius: 4,
            fontSize: 10, fontFamily: "monospace", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            background: "rgba(6, 182, 212, 0.15)", color: "rgb(103, 232, 249)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            flexShrink: 0,
          }}>
            🧭 {activeKf.chapterNumber}
          </span>
          <h3 style={{
            fontSize: 12, fontFamily: "monospace", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em",
            color: "#f1f5f9",
            margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {activeKf.title}
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {explodedPct > 0 && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontFamily: "monospace",
              padding: "2px 6px", borderRadius: 4,
              background: "rgba(217, 119, 6, 0.15)", color: "rgb(253, 224, 71)",
              border: "1px solid rgba(217, 119, 6, 0.3)",
            }}>
              📦 EXPLODED {explodedPct}%
            </span>
          )}
          <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "rgb(103, 232, 249)" }}>
            {pctDisplay}%
          </span>
        </div>
      </div>

      {/* 2. Subtitle */}
      <p style={{
        fontSize: 11, color: "#94a3b8", lineHeight: 1.3,
        margin: "0 0 8px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {activeKf.subtitle}
      </p>

      {/* 3. Interactive Keyframe Scrubber Track */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Step Backward */}
        <button
          onClick={prevKeyframe}
          disabled={scrollProgress <= 0.01}
          title="Previous Story Chapter (↑)"
          style={{
            padding: 4, borderRadius: 8,
            background: "rgba(30, 41, 59, 0.9)", border: "1px solid rgba(71, 85, 105, 0.4)",
            color: scrollProgress <= 0.01 ? "rgba(148, 163, 184, 0.3)" : "#cbd5e1",
            cursor: scrollProgress <= 0.01 ? "not-allowed" : "pointer",
            fontSize: 14, lineHeight: 1, display: "flex",
          }}
        >
          ◀
        </button>

        {/* Timeline Bar with Keyframe Nodes */}
        <div
          onClick={handleTrackClick}
          style={{ position: "relative", flex: 1, height: 12, display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          {/* Base Rail */}
          <div style={{
            width: "100%", height: 4, background: "#1e293b", borderRadius: 9999,
            overflow: "hidden", position: "relative",
          }}>
            {/* Active Fill */}
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #06b6d4, #3b82f6, #6366f1)",
                width: `${scrollProgress * 100}%`,
                transition: "width 75ms ease",
              }}
            />
          </div>

          {/* Keyframe Snap Nodes */}
          {keyframes.map((kf, i) => {
            const isReached = scrollProgress >= kf.progress - 0.01;
            const isCurrent = Math.abs(scrollProgress - kf.progress) < 0.09;

            return (
              <button
                key={kf.id}
                onClick={(e) => {
                  e.stopPropagation();
                  snapToKeyframe(i);
                }}
                title={`${kf.chapterNumber}: ${kf.title}`}
                style={{
                  position: "absolute",
                  left: `${kf.progress * 100}%`,
                  transform: "translateX(-50%)",
                  padding: 4, borderRadius: "50%",
                  background: "transparent", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.15s ease",
                }}
              >
                <span
                  style={{
                    width: isCurrent ? 10 : 8,
                    height: isCurrent ? 10 : 8,
                    borderRadius: "50%",
                    transition: "all 0.2s ease",
                    background: isCurrent
                      ? "#22d3ee"
                      : isReached
                      ? "#60a5fa"
                      : "#475569",
                    boxShadow: isCurrent
                      ? "0 0 8px rgba(34, 211, 238, 0.5), 0 0 0 4px rgba(34, 211, 238, 0.15)"
                      : "none",
                    display: "block",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Step Forward */}
        <button
          onClick={nextKeyframe}
          disabled={scrollProgress >= 0.99}
          title="Next Story Chapter (↓)"
          style={{
            padding: 4, borderRadius: 8,
            background: "rgba(30, 41, 59, 0.9)", border: "1px solid rgba(71, 85, 105, 0.4)",
            color: scrollProgress >= 0.99 ? "rgba(148, 163, 184, 0.3)" : "#cbd5e1",
            cursor: scrollProgress >= 0.99 ? "not-allowed" : "pointer",
            fontSize: 14, lineHeight: 1, display: "flex",
          }}
        >
          ▶
        </button>
      </div>

      {/* 4. Footer Micro-hint */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 9, fontFamily: "monospace", color: "#64748b",
        marginTop: 6, paddingTop: 4, borderTop: "1px solid rgba(51, 65, 85, 0.3)",
      }}>
        <span>↑↓ STEP CHAPTERS</span>
        {activeKf.technicalSpec && (
          <span style={{ color: "#94a3b8", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeKf.technicalSpec}
          </span>
        )}
        <span>SCROLL TO EXPLORE</span>
      </div>
    </div>
  );
};
