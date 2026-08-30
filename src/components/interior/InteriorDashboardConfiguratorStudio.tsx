/**
 * ============================================================================
 * INTERIOR DASHBOARD CONFIGURATOR STUDIO — MASTER PAGE COMPONENT
 * ============================================================================
 * 3-column layout replicating the reference screenshots:
 * - Top: Navigation bar with component title + stats + tabs
 * - Left (310px): InteriorMetricsPanel — progress bars, rating, weight/cost
 * - Center (flex): InteriorConfigViewport — dynamic SVG cabin + presets
 * - Right (340px): InteriorConfigControls — 10 steppers + color swatches
 * ============================================================================
 */

import React from "react";
import { InteriorMetricsPanel } from "./InteriorMetricsPanel";
import { InteriorConfigViewport } from "./InteriorConfigViewport";
import { InteriorConfigControls } from "./InteriorConfigControls";

export const InteriorDashboardConfiguratorStudio: React.FC = () => {
  return (
    <div className="idash-root">
      

      {/* Main 3-Column Workspace */}
      <div className="idash-workspace">
        <InteriorMetricsPanel />
        <InteriorConfigViewport />
        <InteriorConfigControls />
      </div>
    </div>
  );
};
