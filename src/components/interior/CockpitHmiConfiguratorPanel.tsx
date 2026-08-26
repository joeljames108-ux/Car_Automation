/**
 * ============================================================================
 * COCKPIT HMI & GAUGE WIDGET CONFIGURATOR PANEL
 * ============================================================================
 * Controls for Dashboard Layouts, Digital Gauge Widgets, Displays & Pedal Box:
 * - Gauge Styles: Circular Analog, Horizontal Bar, Motorsport Telemetry, Minimalist
 * - Selectable Widgets: RPM, Speedometer, Gear, Lap Timer, G-Force Vector, Tire Temp, Battery/Fuel
 * - Infotainment Touchscreen Sizes (8", 10", 12.3", 14.5", 17" OLED) & Forms
 * - Pedal Box Variants (Standard, Billet Aluminum, Carbon Race)
 * ============================================================================
 */

import React from "react";
import { Gauge, Tv, Activity, Compass, Cpu, Check, Layers } from "lucide-react";
import { MasterModularInteriorState, InstrumentClusterStyle, DashboardTypology } from "../../sim/interior/masterInteriorTypes";
import { MasterInteriorStateEngine } from "../../sim/interior/masterInteriorStateEngine";

interface CockpitHmiConfiguratorPanelProps {
  state: MasterModularInteriorState;
}

export const GAUGE_CLUSTER_STYLES = [
  { id: "quad_ring_analog_chronometer", name: "Analog Chrono Quad-Ring", icon: "⏱" },
  { id: "digital_twin_dial_oled", name: "Digital Twin Dial OLED", icon: "🎛" },
  { id: "full_map_telemetry_hud", name: "Full Map Telemetry HUD", icon: "🗺" },
  { id: "gt3_race_bar_rev_indicator", name: "GT3 Race Bar Shift Light", icon: "🏁" },
];

export const INFOTAINMENT_SIZES = [
  { size: 8, label: "8\" Compact" },
  { size: 10, label: "10\" Standard" },
  { size: 12.3, label: "12.3\" Widescreen" },
  { size: 14.5, label: "14.5\" OLED Blade" },
  { size: 17, label: "17\" Hyperscreen" },
];

export const TELEMETRY_WIDGETS = [
  { id: "rpm", label: "RPM Tachometer", icon: "⚡" },
  { id: "speed", label: "Digital Speedometer", icon: "🏁" },
  { id: "gear", label: "Gear Position Indicator", icon: "⚙" },
  { id: "laptimer", label: "Motorsport Lap Timer", icon: "⏱" },
  { id: "gforce", label: "G-Force Vector Meter", icon: "🎯" },
  { id: "tire_temp", label: "Tire Temp & Pressure", icon: "🛞" },
  { id: "engine_data", label: "Boost & Oil Pressure", icon: "🌡" },
  { id: "battery_fuel", label: "Battery / Fuel Telemetry", icon: "🔋" },
];

export const CockpitHmiConfiguratorPanel: React.FC<CockpitHmiConfiguratorPanelProps> = ({ state }) => {
  const engine = MasterInteriorStateEngine.getInstance();
  const dash = state.dashboard;

  return (
    <div className="space-y-4 font-mono text-xs text-amber-950">
      {/* ── 1. CLUSTER GAUGE STYLE ── */}
      <div>
        <label className="font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
          <Gauge size={14} className="text-amber-600" />
          <span>INSTRUMENT CLUSTER GAUGE STYLE</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GAUGE_CLUSTER_STYLES.map((style) => {
            const isSelected = dash.instrumentClusterStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => engine.updateDashboard({ instrumentClusterStyle: style.id as InstrumentClusterStyle })}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-white border-amber-600 shadow-md font-bold"
                    : "bg-white/60 border-amber-200/80 text-amber-900 hover:bg-amber-100/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{style.icon}</span>
                  <span>{style.name}</span>
                </div>
                {isSelected && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. SELECTABLE CLUSTER WIDGETS ── */}
      <div>
        <label className="font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
          <Cpu size={14} className="text-amber-600" />
          <span>SELECTABLE COCKPIT TELEMETRY WIDGETS</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          {TELEMETRY_WIDGETS.map((widget) => (
            <button
              key={widget.id}
              onClick={() => {
                // Toggle widget presence
              }}
              className="p-2 rounded-xl text-center border font-bold bg-amber-200/80 border-amber-400 text-amber-900 shadow-sm cursor-pointer"
            >
              <span>{widget.icon}</span> <span>{widget.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. INFOTAINMENT TOUCHSCREEN SIZES ── */}
      <div>
        <label className="font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
          <Tv size={14} className="text-amber-600" />
          <span>CENTRAL INFOTAINMENT TOUCHSCREEN DIAGONAL</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {INFOTAINMENT_SIZES.map((item) => (
            <button
              key={item.size}
              onClick={() => {
                // Update screen size
              }}
              className="p-2 rounded-xl text-center border font-bold text-[11px] bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. DRIVER SPORT PEDAL BOX ── */}
      <div>
        <label className="font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
          <Activity size={14} className="text-amber-600" />
          <span>BILLET SPORT PEDAL BOX</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          {[
            { id: "standard", label: "Standard Rubber Pedals", icon: "🦶" },
            { id: "aluminum", label: "Drilled Billet Aluminum", icon: "✨" },
            { id: "race_carbon", label: "Dry Carbon Competition", icon: "🏁" },
          ].map((pedal) => (
            <button
              key={pedal.id}
              onClick={() => {
                // Update pedal set
              }}
              className="p-2.5 rounded-xl border text-center font-bold bg-white/60 border-amber-200 text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              <span>{pedal.icon}</span> <span>{pedal.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
