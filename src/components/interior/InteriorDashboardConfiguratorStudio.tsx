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
      {/* Top Navigation Bar */}
      <header className="idash-header">
        <div className="idash-header-left">
          <button className="idash-back-btn" aria-label="Go back">
            ‹
          </button>
          <div className="idash-header-title-block">
            <div className="idash-header-subtitle">COMPONENT</div>
            <div className="idash-header-title">INTERIOR</div>
          </div>
        </div>

        <div className="idash-header-stats">
          <div className="idash-header-stat">
            <span className="idash-stat-emoji">🏆</span>
            <span className="idash-stat-num">100%</span>
            <span className="idash-stat-desc">Brand Rating</span>
          </div>
          <div className="idash-header-stat">
            <span className="idash-stat-emoji">👥</span>
            <span className="idash-stat-num">11.7 M</span>
            <span className="idash-stat-desc">Employees</span>
          </div>
          <div className="idash-header-stat">
            <span className="idash-stat-emoji">📅</span>
            <span className="idash-stat-num">1980</span>
            <span className="idash-stat-desc">Year</span>
          </div>
          <div className="idash-header-stat idash-tier-badge">
            TIER 3
          </div>
          <div className="idash-header-stat">
            <span className="idash-stat-emoji">💰</span>
            <span className="idash-stat-num">611.8 B</span>
            <span className="idash-stat-desc">Cash Balance</span>
          </div>
          <div className="idash-header-stat">
            <span className="idash-stat-emoji">🔬</span>
            <span className="idash-stat-num">44</span>
            <span className="idash-stat-desc">Research Points</span>
          </div>
        </div>

        <div className="idash-header-actions">
          <button className="idash-icon-btn" aria-label="Cart">🛒</button>
          <button className="idash-icon-btn" aria-label="Home">🏠</button>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <div className="idash-workspace">
        <InteriorMetricsPanel />
        <InteriorConfigViewport />
        <InteriorConfigControls />
      </div>
    </div>
  );
};
