/**
 * ============================================================================
 * STAGE 2: ENGINE INTEGRATION & MOUNTING STAGE
 * ============================================================================
 * Connects directly with the user's previously designed engine in the Engine Tab.
 * Supports Front, Mid, and Rear engine position configuration with live 3D anchor snapping.
 */

import React from "react";
import { Cog, CheckCircle2, Zap, Flame, Shield, ArrowRight } from "lucide-react";
import { EngineConfig, EnginePosition } from "../../../sim/types";

interface EngineAssemblyStageProps {
  engine: EngineConfig;
  enginePosition: EnginePosition;
  onUpdatePosition: (pos: EnginePosition) => void;
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
  isInstalled,
  onInstall,
}) => {
  const cylCount = getCylinderCount(engine.layout || "v8");
  const displacementCc = Math.round(
    Math.PI * Math.pow((engine.bore || 88) / 20, 2) * ((engine.stroke || 82) / 10) * cylCount
  );
  // Estimate engine power output based on displacement, aspiration, and config
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

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Cog size={18} className="animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 2: ENGINE MOUNTING & POSITIONING
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Synchronized with your saved Engine Studio design. Select the chassis mounting anchor.
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
      <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
            {cylCount}CYL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm font-mono text-slate-900 dark:text-slate-100">
                {engine.layout?.toUpperCase() || "V8"} · {(displacementCc / 1000).toFixed(1)}L
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold uppercase">
                {engine.intake?.replace("_", " ") || "NA"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Source: Live Engine Tab Configuration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="text-right">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] block">PEAK OUTPUT</span>
            <span className="font-bold text-amber-600 dark:text-amber-300 text-sm">~{estHp} HP</span>
          </div>
          <div className="text-right pl-3 border-l border-base-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] block">PEAK TORQUE</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">~{estTorque} Nm</span>
          </div>
        </div>
      </div>

      {/* Engine Mounting Position Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 block">
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
                    : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{p.label}</span>
                  <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-300 font-bold">{p.anchor}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">{p.desc}</p>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Est. Bias: {p.weightDist}
                </div>
              </button>
            );
          })}
        </div>
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
