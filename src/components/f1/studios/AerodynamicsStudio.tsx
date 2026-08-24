// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — AERODYNAMICS & GROUND EFFECT STUDIO (UPGRADED)
// ============================================================================

import React, { useState, useMemo } from "react";
import { Wind, Sliders, Layers, CheckCircle2, AlertTriangle, Compass, HelpCircle, Save, GitCompare } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import type { AeroPackageLevel, FrontWingConcept, SidepodPhilosophy, DiffuserStrakeLayout } from "../../../sim/f1/types/f1Enums";

export const AerodynamicsStudio: React.FC = () => {
  const { car, updateAero } = useF1ConstructorStore();
  const aero = car.aero;

  // Baseline comparison state
  const [showCompareBaseline, setShowCompareBaseline] = useState(false);
  const [baselineAero] = useState(() => ({ ...aero }));
  const [isSaving, setIsSaving] = useState(false);

  // Compute delta badges
  const deltas = useMemo(() => ({
    downforce: aero.totalDownforceAt250KmhKg - baselineAero.totalDownforceAt250KmhKg,
    drag: aero.totalDragAt250KmhKg - baselineAero.totalDragAt250KmhKg,
    balance: aero.frontAeroBalancePercent - baselineAero.frontAeroBalancePercent,
  }), [aero, baselineAero]);

  // FIA Regulation checks
  const isCompliant = useMemo(() => {
    return aero.rearWingDrsFlapGapOpenMm <= 85 && aero.floorVenturiThroatHeightMm >= 10;
  }, [aero]);

  const handleUpdateAero = (changes: Partial<typeof aero>) => {
    setIsSaving(true);
    updateAero(changes);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Wind className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              Aerodynamics, Ground Effect & DRS Studio
            </h2>
            {/* Auto-save indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-mono text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? "bg-cyan-400 animate-ping" : "bg-emerald-400"}`} />
              <span>{isSaving ? "Saving..." : "Saved"}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Design the aerodynamic package: 4-element front wing outwash cascades, venturi floor suction tunnels, downwash sidepod ramps, and rear wing DRS flap assemblies.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* FIA Regulation Compliance Badge */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
            isCompliant
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-300 border-rose-500/30 animate-pulse"
          }`}>
            {isCompliant ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>FIA Legal</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} className="text-rose-400" />
                <span>FIA Illegal</span>
              </>
            )}
          </div>

          {/* Compare Baseline Toggle */}
          <button
            onClick={() => setShowCompareBaseline(!showCompareBaseline)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              showCompareBaseline
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
          >
            <GitCompare size={14} />
            <span>{showCompareBaseline ? "Comparing" : "Compare"}</span>
          </button>

          {/* Key Aero Metrics with Delta Badges */}
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-cyan-400 flex items-center gap-2 justify-end">
              <span>{aero.totalDownforceAt250KmhKg}</span>
              <span className="text-xs text-slate-400 font-normal">kg DF</span>
              {deltas.downforce !== 0 && (
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  deltas.downforce > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                }`}>
                  {deltas.downforce > 0 ? `+${deltas.downforce}` : deltas.downforce}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-2 justify-end">
              <span>{aero.frontAeroBalancePercent}% Front Balance | {aero.totalDragAt250KmhKg} kg Drag</span>
              {deltas.drag !== 0 && (
                <span className={`text-[9px] font-mono px-1 rounded ${
                  deltas.drag < 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                }`}>
                  {deltas.drag > 0 ? `+${deltas.drag}` : deltas.drag} drag
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Aero Package Preset */}
        <div className={`bg-slate-900/60 p-4 rounded-xl border transition-all space-y-3 ${
          showCompareBaseline && aero.packagePreset !== baselineAero.packagePreset ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800"
        }`}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Aero Package Specification</span>
              <span title="Pre-indexed wing angle packages for specific circuit drag requirements"><HelpCircle size={12} className="text-slate-500 cursor-help" /></span>
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Circuit Trim</span>
          </label>
          <select
            value={aero.packagePreset}
            onChange={(e) => handleUpdateAero({ packagePreset: e.target.value as AeroPackageLevel })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ULTRA_LOW_DRAG_MONZA">Monza / Baku (Ultra-Low Drag 8°)</option>
            <option value="LOW_DRAG_SPA_SILVERSTONE">Spa / Silverstone (Low Drag 15°)</option>
            <option value="MEDIUM_DOWNFORCE_GLOBAL">Global Baseline (Medium 22°)</option>
            <option value="HIGH_DOWNFORCE_HUNGARY">Hungary / Zandvoort (High Downforce 30°)</option>
            <option value="MAXIMUM_DOWNFORCE_MONACO">Monaco / Singapore (Max Downforce 36°)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Presets quickly re-index front and rear wing angles for specific circuit drag profiles.
          </p>
        </div>

        {/* 2. Front Wing Flap Angle */}
        <div className={`bg-slate-900/60 p-4 rounded-xl border transition-all space-y-2 ${
          showCompareBaseline && aero.frontWingFlapAngleDeg !== baselineAero.frontWingFlapAngleDeg ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800"
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <span>Front Wing Flap Angle</span>
              <span title="Controls front-end turn-in grip and front aero balance percentage"><HelpCircle size={12} className="text-slate-500 cursor-help" /></span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{aero.frontWingFlapAngleDeg}°</span>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            step="1"
            value={aero.frontWingFlapAngleDeg}
            onChange={(e) => handleUpdateAero({ frontWingFlapAngleDeg: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>8° (Low Drag)</span>
            <span>19° (Balanced)</span>
            <span>32° (High Bite)</span>
          </div>
        </div>

        {/* 3. Rear Wing Mainplane Angle */}
        <div className={`bg-slate-900/60 p-4 rounded-xl border transition-all space-y-2 ${
          showCompareBaseline && aero.rearWingMainPlaneAngleDeg !== baselineAero.rearWingMainPlaneAngleDeg ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800"
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <span>Rear Wing Angle of Attack</span>
              <span title="Main rear downforce generator; higher angles increase high-speed stability but add straightline drag"><HelpCircle size={12} className="text-slate-500 cursor-help" /></span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{aero.rearWingMainPlaneAngleDeg}°</span>
          </div>
          <input
            type="range"
            min="14"
            max="36"
            step="1"
            value={aero.rearWingMainPlaneAngleDeg}
            onChange={(e) => handleUpdateAero({ rearWingMainPlaneAngleDeg: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>14°</span>
            <span>24°</span>
            <span>36° (Max Downforce)</span>
          </div>
        </div>

        {/* 4. Floor Venturi Throat Height */}
        <div className={`bg-slate-900/60 p-4 rounded-xl border transition-all space-y-2 ${
          showCompareBaseline && aero.floorVenturiThroatHeightMm !== baselineAero.floorVenturiThroatHeightMm ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800"
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <span>Venturi Tunnel Throat Gap</span>
              <span title="Floor ground-effect suction throat height; lower gaps yield massive downforce but risk aerodynamic stall & porpoising"><HelpCircle size={12} className="text-slate-500 cursor-help" /></span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{aero.floorVenturiThroatHeightMm} mm</span>
          </div>
          <input
            type="range"
            min="10"
            max="28"
            step="1"
            value={aero.floorVenturiThroatHeightMm}
            onChange={(e) => handleUpdateAero({ floorVenturiThroatHeightMm: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>10mm (Porpoising Hazard)</span>
            <span>16mm (Optimal)</span>
            <span>28mm (Safe Ride)</span>
          </div>
        </div>

        {/* 5. Sidepod Architecture */}
        <div className={`bg-slate-900/60 p-4 rounded-xl border transition-all space-y-3 ${
          showCompareBaseline && aero.sidepodPhilosophy !== baselineAero.sidepodPhilosophy ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800"
        }`}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Sidepod Bodywork Concept</span>
              <span title="Bodywork philosophy directing airflow toward rear diffuser and beam wing"><HelpCircle size={12} className="text-slate-500 cursor-help" /></span>
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Downwash</span>
          </label>
          <select
            value={aero.sidepodPhilosophy}
            onChange={(e) => handleUpdateAero({ sidepodPhilosophy: e.target.value as SidepodPhilosophy })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="AGGRESSIVE_DOWNWASH_RAMP">Downwash Ramp (Guides Air to Diffuser)</option>
            <option value="ZEROPOD_ULTRA_NARROW">Zeropod Ultra-Narrow Packaging</option>
            <option value="INWASH_BATHTUB_SCALLOP">Inwash Scalloped Tub Channel</option>
            <option value="HIGH_UNDERCUT_AERO_BRIDGE">Extreme High Undercut Aero Bridge</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Downwash ramps channel high-energy freestream air down over the floor edge into the beam wing.
          </p>
        </div>

        {/* 6. DRS Flap Opening Clearance */}
        <div className={`bg-slate-900/60 p-4 rounded-xl border transition-all space-y-2 ${
          showCompareBaseline && aero.rearWingDrsFlapGapOpenMm !== baselineAero.rearWingDrsFlapGapOpenMm ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800"
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <span>DRS Flap Opening Gap</span>
              <span title="Maximum gap when DRS actuator deploys. FIA Article 3.10 caps opening at 85mm max gap."><HelpCircle size={12} className="text-slate-500 cursor-help" /></span>
            </span>
            <span className={`font-mono font-bold ${aero.rearWingDrsFlapGapOpenMm <= 85 ? "text-emerald-400" : "text-rose-400"}`}>
              {aero.rearWingDrsFlapGapOpenMm} mm (Max 85mm)
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="95"
            step="1"
            value={aero.rearWingDrsFlapGapOpenMm}
            onChange={(e) => handleUpdateAero({ rearWingDrsFlapGapOpenMm: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>60mm</span>
            <span>85mm (FIA Regulation)</span>
            <span>95mm (Illegal)</span>
          </div>
        </div>
      </div>
    </div>
  );
};