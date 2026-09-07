/**
 * ============================================================================
 * INTERIOR DASHBOARD CONFIGURATOR STUDIO — MASTER PAGE COMPONENT
 * ============================================================================
 * 3-column layout replicating the reference screenshots:
 * - Left (collapsible): InteriorMetricsPanel — progress bars, rating, weight/cost
 * - Center (flex): InteriorConfigViewport — dynamic 3D WebGL / SVG cabin + presets
 * - Right (collapsible): InteriorConfigControls — 10 steppers + color swatches
 *
 * Both side panels collapse to slim labelled rails so the center 3D/GLB window
 * can take the full workspace width. No feature is removed — every metric,
 * rating, stepper, palette, preset and apply action stays reachable.
 * ============================================================================
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InteriorMetricsPanel } from "./InteriorMetricsPanel";
import { InteriorConfigViewport } from "./InteriorConfigViewport";
import { InteriorConfigControls } from "./InteriorConfigControls";

const LEFT_OPEN_W = 258;
const RIGHT_OPEN_W = 298;
const RAIL_W = 26;

export const InteriorDashboardConfiguratorStudio: React.FC = () => {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  const leftCol = showLeft ? LEFT_OPEN_W : RAIL_W;
  const rightCol = showRight ? RIGHT_OPEN_W : RAIL_W;

  return (
    <div className="idash-root flex flex-col h-[calc(100vh-72px)] min-h-[640px] text-amber-900 font-sans select-none overflow-hidden rounded-2xl border border-amber-800/30 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
      {/* Main 3-Column Workspace */}
      <div
        className="idash-workspace grid flex-1 overflow-hidden min-h-0"
        style={{ gridTemplateColumns: `${leftCol}px minmax(0, 1fr) ${rightCol}px` }}
      >
        {/* ── LEFT: Interior Overview (collapsible) ── */}
        {showLeft ? (
          <div className="relative h-full min-w-0 overflow-hidden">
            <InteriorMetricsPanel />
            <button
              type="button"
              onClick={() => setShowLeft(false)}
              className="absolute top-1/2 right-1.5 -translate-y-1/2 z-20 w-6 h-10 rounded-l-xl flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'rgba(255,248,235,0.95)', border: '1px solid rgba(217,166,78,0.45)', color: '#92400E' }}
              title="Collapse Interior Overview"
              aria-label="Collapse Interior Overview"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLeft(true)}
            className="w-full h-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,248,235,0.85)', borderRight: '1px solid rgba(217,166,78,0.35)', color: '#92400E' }}
            title="Show Interior Overview"
            aria-label="Show Interior Overview"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Interior Overview
            </span>
          </button>
        )}

        {/* ── CENTER: 3D / 2D cabin viewport + presets ── */}
        <div className="relative min-w-0 h-full">
          <InteriorConfigViewport />
        </div>

        {/* ── RIGHT: Interior Configuration (collapsible) ── */}
        {showRight ? (
          <div className="relative h-full min-w-0 overflow-hidden">
            <InteriorConfigControls />
            <button
              type="button"
              onClick={() => setShowRight(false)}
              className="absolute top-1/2 left-1.5 -translate-y-1/2 z-20 w-6 h-10 rounded-r-xl flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'rgba(255,248,235,0.95)', border: '1px solid rgba(217,166,78,0.45)', color: '#92400E' }}
              title="Collapse Interior Configuration"
              aria-label="Collapse Interior Configuration"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowRight(true)}
            className="w-full h-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,248,235,0.85)', borderLeft: '1px solid rgba(217,166,78,0.35)', color: '#92400E' }}
            title="Show Interior Configuration"
            aria-label="Show Interior Configuration"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ writingMode: 'vertical-rl' }}>
              Interior Configuration
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
