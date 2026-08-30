/**
 * ============================================================================
 * STAGE 2: ENGINE POWERTRAIN — DROP-IN PREVIOUSLY DESIGNED ENGINE
 * ============================================================================
 * Pulls the engine designed in the Engine Studio (live sync) and drops it into
 * the chassis on the selected mounting anchor. Supports Front / Mid / Rear
 * position plus lateral drop-in offset for weight-jacking and packaging.
 */

import React from "react";
import { Cog, CheckCircle2, MoveHorizontal, Plug } from "lucide-react";
import { EngineConfig, EnginePosition } from "../../../sim/types";

interface EngineAssemblyStageProps {
  engine: EngineConfig;
  enginePosition: EnginePosition;
  onUpdatePosition: (pos: EnginePosition) => void;
  engineOffsetMm: number;
  onUpdateOffset: (offsetMm: number) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

const getCylinderCount = (layout: string): number => {
  if (layout === "i3") return 3;
  if (layout === "i4" || layout === "boxer4") return 4;
  if (layout === "i6" || layout === "v6" || layout === "boxer6") return 6;
  if (layout === "v8") return 8;
  if (layout === "v10") return 10;
  if (layout === "v12") return 12;
  if (layout === "w16") return 16;
  if (layout === "w18") return 18;
  return 8;
};

export const EngineAssemblyStage: React.FC<EngineAssemblyStageProps> = ({
  engine,
  enginePosition,
  onUpdatePosition,
  engineOffsetMm,
  onUpdateOffset,
  isInstalled,
  onInstall,
}) => {
  const cylCount = getCylinderCount(engine.layout || "v8");
  const displacementCc = Math.round(
    Math.PI * Math.pow((engine.bore || 88) / 20, 2) * ((engine.stroke || 82) / 10) * cylCount
  );
  const estHp = Math.round(
    (displacementCc || 4000) *
      0.14 *
      (engine.intake === "twin_turbo" ? 1.65 : engine.intake === "turbo_single" || engine.intake === "bi_turbo" ? 1.4 : 1.0)
  );
  const estTorque = Math.round(estHp * 1.15);

  const positions: {
    id: EnginePosition;
    label: string;
    desc: string;
    weightDist: string;
    anchor: string;
  }[] = [
    {
      id: "front",
      label: "Front Engine (Front-Mid Bay)",
      desc: "Engine positioned ahead of cockpit bulkhead on the front subframe cradle.",
      weightDist: "52% Front / 48% Rear",
      anchor: "engine_mount_front",
    },
    {
      id: "mid",
      label: "Mid Engine (Behind Cabin)",
      desc: "Engine positioned between passenger cabin and rear axle for optimal polar inertia.",
      weightDist: "42% Front / 58% Rear",
      anchor: "engine_mount_mid",
    },
    {
      id: "rear",
      label: "Rear Engine (Behind Axle)",
      desc: "Engine positioned behind the rear axle line for maximum launch traction.",
      weightDist: "38% Front / 62% Rear",
      anchor: "engine_mount_rear",
    },
  ];

  // Offset side-effect readouts
  const offsetMm = engineOffsetMm || 0;
  const crossWeightNote =
    Math.abs(offsetMm) < 20
      ? "Neutral — driver-side fuel cell compensates symmetric loading."
      : offsetMm > 0
      ? "Shifts mass to left-hand corners — beneficial for clockwise circuits."
      : "Shifts mass to right-hand corners — beneficial for anti-clockwise circuits.";

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Cog size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-amber-50 uppercase tracking-wider">
              STAGE 2: ENGINE POWERTRAIN DROP-IN & MOUNTING
            </h3>
            <p className="text-[11px] font-mono text-amber-300/50 dark:text-amber-200/60">
              Drop-in your previously designed engine. Select the chassis anchor and fine-trim lateral offset.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> ENGINE INSTALLED
          </span>
        )}
      </div>

      {/* Live Engine Tab Source Badge */}
      <div className="p-3.5 rounded-2xl bg-base-900/80 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
            {cylCount}CYL
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm font-mono text-slate-900 dark:text-amber-50">
                {engine.layout?.toUpperCase() || "V8"} · {(displacementCc / 1000).toFixed(1)}L
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold uppercase">
                {engine.intake?.replace("_", " ") || "NA"}
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/30 flex items-center gap-1">
                <Plug size={9} /> LIVE DROP-IN SYNC
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-300/50 dark:text-amber-200/60">
              Source: Engine Studio design · Bore {(engine.bore || 88)}mm × Stroke {(engine.stroke || 82)}mm
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="text-right">
            <span className="text-amber-300/50 dark:text-amber-200/60 text-[10px] block">PEAK OUTPUT</span>
            <span className="font-bold text-amber-600 dark:text-amber-300 text-sm">~{estHp} HP</span>
          </div>
          <div className="text-right pl-3 border-l border-base-800">
            <span className="text-amber-300/50 dark:text-amber-200/60 text-[10px] block">PEAK TORQUE</span>
            <span className="font-bold text-slate-800 dark:text-amber-50 text-sm">~{estTorque} Nm</span>
          </div>
        </div>
      </div>

      {/* Engine Mounting Position Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold font-mono text-amber-500 dark:text-amber-100/80 block">
          ENGINE MOUNTING LOCATION & ANCHOR POINT
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {positions.map((p) => {
            const isSelected = enginePosition === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onUpdatePosition(p.id)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/40"
                    : "bg-base-900/60 border-base-800 hover:border-base-700 text-amber-200/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs font-mono text-slate-900 dark:text-amber-50">{p.label}</span>
                  <span className="text-[9px] font-mono text-amber-600 dark:text-amber-300 font-bold">{p.anchor}</span>
                </div>
                <p className="text-[10px] text-amber-300/50 dark:text-amber-200/60 mb-2">{p.desc}</p>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Est. Bias: {p.weightDist}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lateral Drop-In Offset Trim */}
      <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold font-mono text-amber-500 dark:text-amber-100/80 flex items-center gap-1.5">
            <MoveHorizontal size={13} className="text-amber-400" /> LATERAL DROP-IN OFFSET TRIM
          </label>
          <span className={`text-xs font-mono font-bold ${offsetMm === 0 ? "text-amber-200/60" : offsetMm > 0 ? "text-emerald-500" : "text-amber-400"}`}>
            {offsetMm > 0 ? "+" : ""}{offsetMm} mm {offsetMm > 0 ? "(LEFT)" : offsetMm < 0 ? "(RIGHT)" : "(CENTERED)"}
          </span>
        </div>
        <input
          type="range"
          min="-150"
          max="150"
          step="5"
          value={offsetMm}
          onChange={(e) => onUpdateOffset(parseInt(e.target.value))}
          className="w-full accent-amber-400 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] font-mono text-amber-300/50">
          <span>-150 mm (Right Bay)</span>
          <span>Centered</span>
          <span>+150 mm (Left Bay)</span>
        </div>
        <p className="text-[10px] font-mono text-amber-300/50 dark:text-amber-200/60 pt-1 border-t border-base-800/60">
          {crossWeightNote}
        </p>
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-MOUNT ENGINE" : "INSTALL ENGINE & PROCEED TO TRANSMISSION"}
        </button>
      </div>
    </div>
  );
};
