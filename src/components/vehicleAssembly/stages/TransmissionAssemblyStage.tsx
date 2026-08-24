/**
 * ============================================================================
 * STAGE 3: GEARBOX / TRANSMISSION — TRANSAXLE HOUSING, DIFF FINS, CV BOOTS
 * ============================================================================
 * Mate the gearbox bellhousing to the engine crankshaft. Configures transaxle
 * housing architecture, differential cooling fin block, and CV joint boots.
 */

import React from "react";
import { Gauge, CheckCircle2, Snowflake, ShieldCheck } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface TransmissionAssemblyStageProps {
  transmissionType: InstalledSubsystemsState["transmissionType"];
  onUpdateTransmission: (type: InstalledSubsystemsState["transmissionType"]) => void;
  diffCoolingFins?: boolean;
  onUpdateDiffCoolingFins?: (enabled: boolean) => void;
  cvBoots?: boolean;
  onUpdateCvBoots?: (enabled: boolean) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const TransmissionAssemblyStage: React.FC<TransmissionAssemblyStageProps> = ({
  transmissionType,
  onUpdateTransmission,
  diffCoolingFins = true,
  onUpdateDiffCoolingFins = () => {},
  cvBoots = true,
  onUpdateCvBoots = () => {},
  isInstalled,
  onInstall,
}) => {
  const transmissions: {
    id: InstalledSubsystemsState["transmissionType"];
    label: string;
    gears: string;
    shiftSpeed: string;
    efficiency: string;
    housing: string;
    desc: string;
  }[] = [
    {
      id: "dct_7",
      label: "7-Speed Dual-Clutch (DCT)",
      gears: "7 Gears",
      shiftSpeed: "50 ms",
      efficiency: "97.5%",
      housing: "Cast Aluminum Transaxle",
      desc: "Electro-hydraulic dual clutch with instantaneous pre-selected gear shifts and integrated final drive.",
    },
    {
      id: "seq_8",
      label: "8-Speed Sequential Dog-Box",
      gears: "8 Gears",
      shiftSpeed: "30 ms",
      efficiency: "98.2%",
      housing: "Billet Machined Transaxle",
      desc: "Straight-cut motorsport dog rings for clutchless full-throttle upshifts with barrel-shift actuation.",
    },
    {
      id: "manual_6",
      label: "6-Speed Manual (H-Pattern)",
      gears: "6 Gears",
      shiftSpeed: "220 ms",
      efficiency: "96.0%",
      housing: "Extruded Transaxle Case",
      desc: "Mechanical linkage with auto rev-match downshifts and driver engagement.",
    },
    {
      id: "ev_direct",
      label: "Single-Speed EV Reduction Drive",
      gears: "1 Gear",
      shiftSpeed: "0 ms",
      efficiency: "99.0%",
      housing: "Compact e-Axle Housing",
      desc: "Helical single-ratio planetary gearbox with direct motor-to-axle drive.",
    },
  ];

  const selected = transmissions.find((t) => t.id === transmissionType) || transmissions[0];

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Gauge size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 3: GEARBOX / TRANSAXLE ASSEMBLY
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Mate bellhousing to crankshaft flange. Configure transaxle housing, differential cooling fins & CV boots.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> TRANSMISSION INSTALLED
          </span>
        )}
      </div>

      {/* Transmission Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {transmissions.map((t) => {
          const isSelected = transmissionType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onUpdateTransmission(t.id)}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-purple-500/20 border-purple-500/60 shadow-md ring-1 ring-purple-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{t.label}</span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-300 font-bold">{t.gears}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">{t.desc}</p>
              <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-base-800/60 text-slate-400 flex-wrap gap-1">
                <span>Shift: <strong className="text-cyan-600 dark:text-cyan-300">{t.shiftSpeed}</strong></span>
                <span>Eff: <strong className="text-emerald-600 dark:text-emerald-300">{t.efficiency}</strong></span>
                <span className="w-full sm:w-auto">{t.housing}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hardware Detail Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Differential Cooling Fins */}
        <button
          onClick={() => onUpdateDiffCoolingFins(!diffCoolingFins)}
          className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
            diffCoolingFins
              ? "bg-cyan-500/15 border-cyan-500/50 ring-1 ring-cyan-500/40"
              : "bg-base-900/60 border-base-800 hover:border-base-700"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Snowflake size={13} className="text-cyan-400" /> DIFFERENTIAL COOLING FINS
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
              diffCoolingFins ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
            }`}>
              {diffCoolingFins ? "✓ FINNED" : "OFF"}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Longitudinal aluminum cooling fins on the LSD carrier. Drops diff oil temp ~18°C in sustained cornering loads.
          </p>
        </button>

        {/* CV Boots */}
        <button
          onClick={() => onUpdateCvBoots(!cvBoots)}
          className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
            cvBoots
              ? "bg-purple-500/15 border-purple-500/50 ring-1 ring-purple-500/40"
              : "bg-base-900/60 border-base-800 hover:border-base-700"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-purple-400" /> CV JOINT BOOTS
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
              cvBoots ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
            }`}>
              {cvBoots ? "✓ FITTED" : "OFF"}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Accordion rubber bellows on both half-shaft CV joints — retains moly grease and excludes grit, tripling joint life.
          </p>
        </button>
      </div>

      {/* Selected summary strip */}
      <div className="px-3 py-2 rounded-xl bg-base-900/80 border border-base-800 text-[10px] font-mono text-slate-500 flex items-center gap-2 flex-wrap">
        <span className="font-bold text-purple-400">MATING SUMMARY:</span>
        <span>{selected.label}</span>
        <span>·</span>
        <span>{selected.housing}</span>
        <span>·</span>
        <span>{diffCoolingFins ? "Finned diff block" : "Smooth diff carrier"}</span>
        <span>·</span>
        <span>{cvBoots ? "Booted half-shafts" : "Exposed CV joints"}</span>
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-MATE TRANSMISSION" : "INSTALL TRANSMISSION & PROCEED TO SUSPENSION"}
        </button>
      </div>
    </div>
  );
};
