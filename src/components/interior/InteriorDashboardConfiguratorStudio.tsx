/**
 * ============================================================================
 * INTERIOR DASHBOARD CONFIGURATOR STUDIO — MASTER PAGE COMPONENT
 * ============================================================================
 * 3-column layout replicating the reference screenshots:
 * - Left (310px): InteriorMetricsPanel — progress bars, rating, weight/cost
 * - Center (flex): InteriorConfigViewport — dynamic 3D WebGL / SVG cabin + presets
 * - Right (340px): InteriorConfigControls — 10 steppers + color swatches
 * ============================================================================
 */

import React from "react";
import { InteriorMetricsPanel } from "./InteriorMetricsPanel";
import { InteriorConfigViewport } from "./InteriorConfigViewport";
import { InteriorConfigControls } from "./InteriorConfigControls";

export const InteriorDashboardConfiguratorStudio: React.FC = () => {
  return (
    <div className="idash-root flex flex-col h-[calc(100vh-72px)] min-h-[640px] text-amber-900 font-sans select-none overflow-hidden rounded-2xl border border-amber-800/30 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
      {/* Main 3-Column Workspace */}
      <div className="idash-workspace grid grid-cols-[310px_1fr_340px] flex-1 overflow-hidden min-h-0">
        <InteriorMetricsPanel />
        <InteriorConfigViewport />
        <InteriorConfigControls />
      </div>
    </div>
  );
};
