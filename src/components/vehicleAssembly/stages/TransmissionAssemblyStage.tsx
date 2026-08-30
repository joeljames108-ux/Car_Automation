/**
 * ============================================================================
 * STAGE 3: DRIVETRAIN & GEARBOX — DRIVE LAYOUT, TRANSAXLE & DIFFERENTIALS
 * ============================================================================
 * Complete drivetrain powertrain integration:
 * - Drive Layout (AWD Active Center Diff / RWD Mechanical LSD / FWD Torsen)
 * - Longitudinal Engine Placement (Front / Front-Mid / Rear-Mid / Rear)
 * - Differential Locking Mechanism (Salisbury 1.5-Way / E-Diff / Helical / Spool)
 * - Gearbox Transaxle Architecture (7-Speed DCT / 8-Speed Dog-Box / 6-Speed Manual / EV Reduction)
 */

import React, { useState } from "react";
import { Gauge, CheckCircle2, Snowflake, ShieldCheck, Cpu, Zap, Activity, Settings } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";
import { useDesign } from "../../../state/DesignContext";
import { DriveType, EnginePosition } from "../../../sim/types";

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
  const { design, updateVehicle } = useDesign();
  const v = design.vehicle;
  const [activeSubTab, setActiveSubTab] = useState<"gearbox" | "layout" | "diffs">("gearbox");

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
      desc: "Mechanical linkage with auto rev-match downshifts and pure driver engagement.",
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

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl select-none">
      {/* Header with Subtab Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-base-800/60 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Gauge size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                STAGE 3: DRIVETRAIN & TRANSAXLE GEARBOX
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                AWD/RWD/FWD • LSD
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Configure drive wheels layout, engine longitudinal positioning, differential locking & gearbox ratios.
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 bg-base-950 p-1 rounded-xl border border-base-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab("gearbox")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              activeSubTab === "gearbox" ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            GEARBOX
          </button>
          <button
            onClick={() => setActiveSubTab("layout")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              activeSubTab === "layout" ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            DRIVE LAYOUT
          </button>
          <button
            onClick={() => setActiveSubTab("diffs")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              activeSubTab === "diffs" ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            DIFFERENTIALS
          </button>
        </div>
      </div>

      {/* ── VIEW 1: GEARBOX TRANSAXLE ── */}
      {activeSubTab === "gearbox" && (
        <div className="space-y-3 animate-stage-transition-enter">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transmissions.map((t) => {
              const isSelected = transmissionType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdateTransmission(t.id)}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-500/60 shadow-md ring-1 ring-purple-500/40"
                      : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{t.label}</span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-300 font-bold">{t.gears}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">{t.desc}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-base-800/60 text-slate-400 flex-wrap gap-1">
                    <span>Shift: <strong className="text-amber-600 dark:text-amber-300">{t.shiftSpeed}</strong></span>
                    <span>Eff: <strong className="text-emerald-600 dark:text-emerald-300">{t.efficiency}</strong></span>
                    <span className="w-full sm:w-auto">{t.housing}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hardware Detail Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateDiffCoolingFins(!diffCoolingFins)}
              className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                diffCoolingFins
                  ? "bg-amber-500/15 border-amber-500/50 ring-1 ring-amber-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Snowflake size={13} className="text-amber-400" /> DIFF COOLING FINS
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                  diffCoolingFins ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-base-850 text-slate-500 border-base-750"
                }`}>
                  {diffCoolingFins ? "FITTED" : "OMITTED"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                CNC-machined aluminum heatsink for high-g endurance thermal stability.
              </p>
            </button>

            <button
              onClick={() => onUpdateCvBoots(!cvBoots)}
              className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                cvBoots
                  ? "bg-amber-500/15 border-amber-500/50 ring-1 ring-purple-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-amber-400" /> REINFORCED CV BOOTS
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                  cvBoots ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-base-850 text-slate-500 border-base-750"
                }`}>
                  {cvBoots ? "HIGH TEMP" : "OEM"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Silicone bellows protecting constant-velocity plunging ball joints.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ── VIEW 2: DRIVE LAYOUT & ENGINE POSITION ── */}
      {activeSubTab === "layout" && (
        <div className="space-y-3 animate-stage-transition-enter">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Drive Type */}
            <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-2">
              <label className="text-xs font-bold font-mono text-amber-400 block">
                DRIVE WHEELS CONFIGURATION
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["rwd", "awd", "fwd"] as const).map((dt) => (
                  <button
                    key={dt}
                    onClick={() => updateVehicle({ driveType: dt as DriveType })}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      (v.driveType || "rwd") === dt
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-base-950 border-base-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {dt.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-mono text-slate-400 leading-relaxed pt-1">
                {v.driveType === "awd" && "All-Wheel Drive: Active center viscous/electronic coupler with 40:60 torque bias."}
                {v.driveType === "rwd" && "Rear-Wheel Drive: Pure throttle steering with 100% mechanical torque through rear axle."}
                {v.driveType === "fwd" && "Front-Wheel Drive: Transverse transaxle pulling the front steering wheels."}
              </p>
            </div>

            {/* Engine Position */}
            <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-2">
              <label className="text-xs font-bold font-mono text-amber-400 block">
                ENGINE POSITION IN CHASSIS
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "front", label: "Front Longitudinal" },
                  { id: "front_mid", label: "Front-Midship" },
                  { id: "mid", label: "Rear-Midship" },
                  { id: "rear", label: "Rear Transaxle" },
                ].map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => updateVehicle({ enginePosition: ep.id as EnginePosition })}
                    className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer truncate ${
                      (v.enginePosition || "front") === ep.id
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-base-950 border-base-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {ep.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-mono text-slate-400 leading-relaxed pt-1">
                Affects polar moment of inertia (Yaw $I_z$) and front/rear static weight distribution bias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 3: DIFFERENTIALS & TORQUE SPLIT ── */}
      {activeSubTab === "diffs" && (
        <div className="space-y-3 animate-stage-transition-enter">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              { id: "lsd_salisbury", name: "Salisbury 1.5-Way Mechanical LSD", lock: "45% Accel / 25% Decel", desc: "Multi-plate clutch packs for predictable turn-in and throttle lock." },
              { id: "e_diff", name: "Electronic Active E-Diff", lock: "0 - 100% Vectoring", desc: "Electro-hydraulic multi-disc vectoring millisecond torque distribution." },
              { id: "torsen", name: "Helical Torsen Type-B", lock: "3.5:1 Bias Ratio", desc: "Torque-sensing planetary gears with smooth progressive engagement." },
            ].map((d, i) => (
              <div key={d.id} className="p-3 rounded-2xl bg-base-900/60 border border-base-800 space-y-1">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-200">
                  <span>{d.name}</span>
                </div>
                <span className="text-[9px] font-mono text-amber-400 bg-slate-900/80 px-1.5 py-0.5 rounded font-bold">
                  {d.lock}
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed pt-1">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Install Button */}
      <div className="flex justify-between items-center pt-2">
        <div className="text-[11px] font-mono text-slate-500">
          Drivetrain Loss: <strong className="text-emerald-400">2.5% - 3.8% (Race Spec)</strong>
        </div>
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL GEARBOX" : "INSTALL GEARBOX & PROCEED TO SUSPENSION"}
        </button>
      </div>
    </div>
  );
};
