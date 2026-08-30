/**
 * ============================================================================
 * INTERIOR CONFIG CONTROLS — RIGHT SIDEBAR
 * ============================================================================
 * 10 stepper selectors with < ▸ Value ▸ > navigation + info buttons,
 * color palette swatches, and RESET functionality.
 * ============================================================================
 */

import React from "react";
import {
  useInteriorDashboardConfigStore,
  CONFIG_OPTIONS,
  INTERIOR_COLOR_SWATCHES,
  getSelectedOptionLabel,
  type FeatureKey,
} from "../../state/interiorDashboardConfigStore";

const FEATURE_ORDER: FeatureKey[] = [
  "dashboardLayout",
  "instrumentCluster",
  "centerDisplay",
  "steeringWheel",
  "seatType",
  "seatMaterial",
  "interiorTrim",
  "ambientLighting",
  "infotainmentSystem",
  "climateControl",
];

export const InteriorConfigControls: React.FC = () => {
  const selections = useInteriorDashboardConfigStore((s) => s.selections);
  const interiorColor = useInteriorDashboardConfigStore((s) => s.interiorColor);
  const cycleOption = useInteriorDashboardConfigStore((s) => s.cycleOption);
  const setColor = useInteriorDashboardConfigStore((s) => s.setColor);
  const reset = useInteriorDashboardConfigStore((s) => s.reset);

  return (
    <div className="idash-panel-right">
      {/* Header */}
      <div className="idash-config-header">
        <span className="idash-section-title">INTERIOR CONFIGURATION</span>
        <button className="idash-reset-btn" onClick={reset}>
          ⟲ RESET
        </button>
      </div>

      {/* 10 Stepper Rows */}
      <div className="idash-controls-list">
        {FEATURE_ORDER.map((key) => {
          const config = CONFIG_OPTIONS[key];
          const currentLabel = getSelectedOptionLabel(key, selections);
          return (
            <div key={key} className="idash-control-row">
              <span className="idash-control-label">{config.label}</span>
              <div className="idash-stepper">
                <button
                  className="idash-step-btn"
                  onClick={() => cycleOption(key, -1)}
                  aria-label={`Previous ${config.label}`}
                >
                  ‹
                </button>
                <span className="idash-step-value">{currentLabel}</span>
                <button
                  className="idash-step-btn"
                  onClick={() => cycleOption(key, 1)}
                  aria-label={`Next ${config.label}`}
                >
                  ›
                </button>
                <button className="idash-info-btn" aria-label={`Info about ${config.label}`}>
                  ⓘ
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Palette */}
      <div className="idash-color-section">
        <div className="idash-section-title">INTERIOR COLOR</div>
        <div className="idash-color-swatches">
          {INTERIOR_COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.hex}
              className={`idash-swatch ${interiorColor === swatch.hex ? "active" : ""}`}
              style={{ backgroundColor: swatch.hex }}
              onClick={() => setColor(swatch.hex)}
              title={swatch.name}
              aria-label={`Select ${swatch.name} color`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
