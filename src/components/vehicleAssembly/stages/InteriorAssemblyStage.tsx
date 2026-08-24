/**
 * ============================================================================
 * STAGE 9: INTERIOR COCKPIT — CARBON BUCKETS, 6-POINT HARNESSES, MoTeC DISPLAY
 * ============================================================================
 * Install FIA carbon bucket seats, 6-point harnesses with billet harness bar,
 * and the digital MoTeC motorsport display cluster.
 */

import React from "react";
import { Sofa, CheckCircle2, ShieldCheck, Monitor } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface InteriorAssemblyStageProps {
  interiorType: InstalledSubsystemsState["interiorType"];
  onUpdateInterior: (type: InstalledSubsystemsState["interiorType"]) => void;
  sixPointHarness: boolean;
  onUpdateSixPointHarness: (enabled: boolean) => void;
  motecDisplay: boolean;
  onUpdateMotecDisplay: (enabled: boolean) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const InteriorAssemblyStage: React.FC<InteriorAssemblyStageProps> = ({
  interiorType,
  onUpdateInterior,
  sixPointHarness,
  onUpdateSixPointHarness,
  motecDisplay,
  onUpdateMotecDisplay,
  isInstalled,
  onInstall,
}) => {
  const interiors: {
    id: InstalledSubsystemsState["interiorType"];
    label: string;
    seats: string;
    steering: string;
    desc: string;
  }[] = [
    {
      id: "carbon_bucket_gt3",
      label: "GT3 Carbon Bucket & FIA Cage",
      seats: "Fixed Carbon Shells",
      steering: "Alcantara GT3 Yoke",
      desc: "FIA 8862-2009 homologated carbon fiber bucket seats with roll cage integration.",
    },
    {
      id: "formula_yoke_cockpit",
      label: "Formula 1 Monoposto Digital Cockpit",
      seats: "Custom Molded Bead Seat",
      steering: "Formula Yoke with OLED",
      desc: "Ultra-low reclined seating position with integrated paddle shifters and direct CAN telemetry display.",
    },
    {
      id: "alcantara_comfort",
      label: "Grand Touring Alcantara & Nappa",
      seats: "18-Way Power Sports Seats",
      steering: "Heated Leather Wheel",
      desc: "Hand-stitched Italian leather and Alcantara interior with ambient LED illumination.",
    },
  ];

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Sofa size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 9: INTERIOR COCKPIT & CONTROLS
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Bolt in the carbon buckets, 6-point harnesses and digital display cluster.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> INTERIOR INSTALLED
          </span>
        )}
      </div>

      {/* Interior Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {interiors.map((i) => {
          const isSelected = interiorType === i.id;
          return (
            <button
              key={i.id}
              onClick={() => onUpdateInterior(i.id)}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-indigo-500/20 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
              }`}
            >
              <div className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 mb-1">{i.label}</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">{i.desc}</p>
              <div className="space-y-0.5 text-[10px] font-mono text-slate-400 border-t border-base-800/60 pt-2">
                <div>Seats: <strong className="text-slate-200">{i.seats}</strong></div>
                <div>Steering: <strong className="text-cyan-400">{i.steering}</strong></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Harness Toggle */}
      <button
        onClick={() => onUpdateSixPointHarness(!sixPointHarness)}
        className={`w-full p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
          sixPointHarness
            ? "bg-red-500/10 border-red-500/50 ring-1 ring-red-500/40"
            : "bg-base-900/60 border-base-800 hover:border-base-700"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-red-400" /> FIA 6-POINT RACING HARNESSES
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
            sixPointHarness ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
          }`}>
            {sixPointHarness ? "✓ FITTED (FIA 8853)" : "STOCK BELTS"}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          2" polyester webbing (shoulder + double sub-strap) with titanium adjusters, mounting to a 7075 billet harness bar
          behind both seats. Pull-down crotch straps prevent submarining.
        </p>
      </button>

      {/* MoTeC Display Toggle */}
      <button
        onClick={() => onUpdateMotecDisplay(!motecDisplay)}
        className={`w-full p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
          motecDisplay
            ? "bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/40"
            : "bg-base-900/60 border-base-800 hover:border-base-700"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Monitor size={13} className="text-cyan-400" /> DIGITAL MoTeC C1259 DISPLAY CLUSTER
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
            motecDisplay ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
          }`}>
            {motecDisplay ? "✓ INSTALLED (10.2\")" : "OFF"}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Fully configurable race dash: lap deltas, g-force traces, lambda, tire temp arrays and RGB shift-light strip —
          logged at 500 Hz over CAN to the data engineer's laptop.
        </p>
      </button>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL INTERIOR" : "INSTALL INTERIOR & PROCEED TO ELECTRONICS"}
        </button>
      </div>
    </div>
  );
};
