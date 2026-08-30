/**
 * ============================================================================
 * INTERIOR METRICS PANEL — LEFT SIDEBAR
 * ============================================================================
 * Displays 8 animated progress bars, overall rating badge, weight & cost.
 * Subscribes to the Zustand interiorDashboardConfigStore for real-time updates.
 * ============================================================================
 */

import React from "react";
import {
  useInteriorDashboardConfigStore,
} from "../../state/interiorDashboardConfigStore";

// Stat bar icon SVGs (inline for zero-dep rendering)
const STAT_ICONS: Record<string, string> = {
  comfort: "☆",
  ergonomics: "◎",
  quality: "◆",
  perceivedValue: "◈",
  reliability: "⛨",
  noiseIsolation: "◉",
  infotainment: "▣",
  marketAppeal: "♛",
};

const STAT_LABELS: Record<string, string> = {
  comfort: "Comfort",
  ergonomics: "Ergonomics",
  quality: "Quality",
  perceivedValue: "Perceived Value",
  reliability: "Reliability",
  noiseIsolation: "Noise Isolation",
  infotainment: "Infotainment",
  marketAppeal: "Market Appeal",
};

const STAT_KEYS = [
  "comfort",
  "ergonomics",
  "quality",
  "perceivedValue",
  "reliability",
  "noiseIsolation",
  "infotainment",
  "marketAppeal",
] as const;

export const InteriorMetricsPanel: React.FC = () => {
  const metrics = useInteriorDashboardConfigStore((s) => s.metrics);

  const ratingColor =
    metrics.overallRating === "S"
      ? "#00e5ff"
      : metrics.overallRating === "A"
        ? "#4ade80"
        : metrics.overallRating === "B"
          ? "#facc15"
          : metrics.overallRating === "C"
            ? "#fb923c"
            : "#ef4444";

  return (
    <div className="idash-panel-left">
      {/* Section Header */}
      <div className="idash-section-title">INTERIOR OVERVIEW</div>

      {/* Stat Bars */}
      <div className="idash-stats-list">
        {STAT_KEYS.map((key) => {
          const val = metrics[key];
          return (
            <div key={key} className="idash-stat-row">
              <div className="idash-stat-header">
                <span className="idash-stat-icon">{STAT_ICONS[key]}</span>
                <span className="idash-stat-label">{STAT_LABELS[key]}</span>
                <span className="idash-stat-value">{val}%</span>
              </div>
              <div className="idash-progress-track">
                <div
                  className="idash-progress-fill"
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Rating Badge */}
      <div className="idash-rating-box">
        <div className="idash-rating-info">
          <span className="idash-rating-label-small">Interior Rating</span>
          <span className="idash-rating-desc">{metrics.ratingLabel}</span>
        </div>
        <div
          className="idash-rating-badge"
          style={{ color: ratingColor, borderColor: ratingColor }}
        >
          {metrics.overallRating}
        </div>
      </div>

      {/* Market Appeal */}
      <div className="idash-stat-readout">
        <span className="idash-readout-icon">♛</span>
        <span className="idash-readout-label">Market Appeal</span>
        <span
          className="idash-readout-value"
          style={{ color: metrics.marketAppeal >= 60 ? "#4ade80" : "#facc15" }}
        >
          {metrics.marketAppeal}%
        </span>
      </div>

      {/* Divider */}
      <div className="idash-divider" />

      {/* Weight */}
      <div className="idash-stat-readout">
        <span className="idash-readout-icon">⚖</span>
        <span className="idash-readout-label">Weight</span>
        <span className="idash-readout-value" style={{ color: "#e2e8f0" }}>
          {metrics.weight} kg
        </span>
      </div>

      {/* Cost */}
      <div className="idash-stat-readout">
        <span className="idash-readout-icon">💲</span>
        <span className="idash-readout-label">Production Cost</span>
        <span
          className="idash-readout-value"
          style={{ color: "#4ade80", fontWeight: 700 }}
        >
          $ {metrics.cost.toLocaleString()}
        </span>
      </div>

      {/* Compare Button */}
      <button className="idash-compare-btn">
        <span style={{ marginRight: 6 }}>⇌</span>
        COMPARE INTERIORS
      </button>
    </div>
  );
};
