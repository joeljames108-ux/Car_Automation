// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — SUSPENSION & KINEMATICS STUDIO (UPGRADED)
// ============================================================================

import React, { useState, useMemo, memo } from "react";
import { Activity, Sliders, Layers, CheckCircle2, AlertTriangle, HelpCircle, Save, GitCompare } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import type { F1SuspensionLayout, AntiRollBarType } from "../../../sim/f1/types/f1Enums";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export const SuspensionStudio: React.FC = memo(function SuspensionStudio() {
  const { car, updateSuspension } = useF1ConstructorStore();
  const s = car.suspension;

  const [showCompareBaseline, setShowCompareBaseline] = useState(false);
  const [baselineSuspension] = useState(() => ({ ...s }));
  const [isSaving, setIsSaving] = useState(false);

  const deltas = useMemo(() => ({
    frontRideHeight: s.frontRideHeightStaticMm - baselineSuspension.frontRideHeightStaticMm,
    rearRideHeight: s.rearRideHeightStaticMm - baselineSuspension.rearRideHeightStaticMm,
    frontCamber: s.frontCamberDeg - baselineSuspension.frontCamberDeg,
  }), [s, baselineSuspension]);

  const isCompliant = useMemo(() => {
    return s.frontRideHeightStaticMm >= 25 && s.rearRideHeightStaticMm >= 35;
  }, [s]);

  const handleUpdate = (changes: Partial<typeof s>) => {
    setIsSaving(true);
    updateSuspension(changes);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-amber-500/20 bg-gradient-to-r from-amber-900/60 via-slate-900/90 to-amber-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-amber-400" size={24} />
            <h2 className="text-xl font-bold text-amber-50 tracking-wide">
              Pushrod / Pullrod Kinematics & Platform Stability
            </h2>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-800/35/80 border border-amber-700/30 text-[10px] font-mono text-amber-200/60">
              <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
              <span>{isSaving ? "Saving..." : "Saved"}</span>
            </div>
          </div>
          <p className="text-xs text-amber-200/60 max-w-2xl">
            Tune suspension geometry and aerodynamic platform stability: front/rear ride heights, torsion bar wheel rates, heave third springs for porpoising damping, and camber/toe alignment.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* FIA Regulation Compliance */}
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
                <span>Plank Wear Hazard</span>
              </>
            )}
          </div>

          <button
            onClick={() => {
              playHMIClickSound();
              setShowCompareBaseline(!showCompareBaseline);
            }}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              showCompareBaseline
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-amber-800/35 text-amber-200/60 border-amber-700/30 hover:text-amber-50"
            }`}
          >
            <GitCompare size={14} />
            <span>{showCompareBaseline ? "Comparing" : "Compare"}</span>
          </button>

          <div className="text-right">
            <div className="text-2xl font-black font-mono text-amber-400 flex items-center gap-2 justify-end">
              <span>{s.frontRideHeightStaticMm}F / {s.rearRideHeightStaticMm}R</span>
              <span className="text-xs text-amber-200/60 font-normal">mm</span>
              {deltas.frontRideHeight !== 0 && (
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  deltas.frontRideHeight > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                }`}>
                  {deltas.frontRideHeight > 0 ? `+${deltas.frontRideHeight}` : deltas.frontRideHeight}
                </span>
              )}
            </div>
            <div className="text-[10px] text-amber-200/60 uppercase tracking-wider">Static Ride Heights</div>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Suspension Layout */}
        <div className={`bg-amber-900/40 p-4 rounded-xl border transition-all space-y-3 ${
          showCompareBaseline && s.frontLayout !== baselineSuspension.frontLayout ? "border-amber-500/50 bg-amber-500/5" : "border-amber-800/30"
        }`}>
          <label className="text-xs font-bold uppercase tracking-wider text-amber-100/80 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Suspension Actuation Scheme</span>
              <span title="Pushrod vs Pullrod geometry affects aerodynamic blockage and center of gravity"><HelpCircle size={12} className="text-amber-300/50 cursor-help" /></span>
            </span>
            <span className="text-[10px] text-amber-400 font-mono">Packaging</span>
          </label>
          <select
            value={s.frontLayout}
            onChange={(e) => handleUpdate({ frontLayout: e.target.value as F1SuspensionLayout, rearLayout: e.target.value as F1SuspensionLayout })}
            className="w-full bg-amber-800/35 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-50 focus:outline-none focus:border-amber-500"
          >
            <option value="FRONT_PULLROD_REAR_PUSHROD">Front Pullrod + Rear Pushrod (Modern F1)</option>
            <option value="FRONT_PUSHROD_REAR_PULLROD">Front Pushrod + Rear Pullrod</option>
            <option value="FULL_PUSHROD_FOUR_CORNER">Four-Corner Full Pushrod</option>
            <option value="FULL_PULLROD_LOW_COG">Four-Corner Full Pullrod (Lowest CoG)</option>
          </select>
          <p className="text-[11px] text-amber-300/50">
            Front pullrods clean up airflow over the floor leading edge; rear pushrods clear space for diffuser tunnels.
          </p>
        </div>

        {/* 2. Front Ride Height */}
        <div className={`bg-amber-900/40 p-4 rounded-xl border transition-all space-y-2 ${
          showCompareBaseline && s.frontRideHeightStaticMm !== baselineSuspension.frontRideHeightStaticMm ? "border-amber-500/50 bg-amber-500/5" : "border-amber-800/30"
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-100/80 uppercase tracking-wider flex items-center gap-1">
              <span>Front Static Ride Height</span>
              <span title="Lower ride height increases ground effect suction, but raises risk of skid block wear violation"><HelpCircle size={12} className="text-amber-300/50 cursor-help" /></span>
            </span>
            <span className="font-mono text-amber-400 font-bold">{s.frontRideHeightStaticMm} mm</span>
          </div>
          <input
            type="range"
            min="20"
            max="45"
            step="1"
            value={s.frontRideHeightStaticMm}
            onChange={(e) => handleUpdate({ frontRideHeightStaticMm: parseInt(e.target.value) })}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-amber-300/50">
            <span>20mm (Extreme Low)</span>
            <span>30mm (F1 Standard)</span>
            <span>45mm (High Rake)</span>
          </div>
        </div>

        {/* 3. Rear Ride Height */}
        <div className={`bg-amber-900/40 p-4 rounded-xl border transition-all space-y-2 ${
          showCompareBaseline && s.rearRideHeightStaticMm !== baselineSuspension.rearRideHeightStaticMm ? "border-amber-500/50 bg-amber-500/5" : "border-amber-800/30"
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-100/80 uppercase tracking-wider flex items-center gap-1">
              <span>Rear Static Ride Height</span>
              <span title="Controls overall car rake angle and diffuser expansion ratio"><HelpCircle size={12} className="text-amber-300/50 cursor-help" /></span>
            </span>
            <span className="font-mono text-amber-400 font-bold">{s.rearRideHeightStaticMm} mm</span>
          </div>
          <input
            type="range"
            min="30"
            max="65"
            step="1"
            value={s.rearRideHeightStaticMm}
            onChange={(e) => handleUpdate({ rearRideHeightStaticMm: parseInt(e.target.value) })}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-amber-300/50">
            <span>30mm</span>
            <span>45mm</span>
            <span>65mm</span>
          </div>
        </div>
      </div>
    </div>
  );
});