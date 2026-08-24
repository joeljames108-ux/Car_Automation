/**
 * ============================================================================
 * STAGE 1: CHASSIS DESIGN & ARCHITECTURE STAGE
 * ============================================================================
 */

import React from "react";
import { Wrench, CheckCircle2, Sliders, Shield, Activity } from "lucide-react";
import { ChassisConfig3D } from "../scene/ModularAssemblySceneGraph";

interface ChassisAssemblyStageProps {
  chassis: ChassisConfig3D;
  onUpdateChassis: (patch: Partial<ChassisConfig3D>) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const ChassisAssemblyStage: React.FC<ChassisAssemblyStageProps> = ({
  chassis,
  onUpdateChassis,
  isInstalled,
  onInstall,
}) => {
  const chassisTypes: {
    id: ChassisConfig3D["type"];
    label: string;
    arch: ChassisConfig3D["architecture"];
    desc: string;
    rigidity: string;
  }[] = [
    { id: "gt3", label: "GT3 Competition", arch: "spaceframe", desc: "Tubular chromoly spaceframe with integrated FIA safety cell.", rigidity: "68 kNm/°" },
    { id: "hypercar", label: "Hypercar Carbon Monocell", arch: "carbon_tub", desc: "Autoclave prepreg carbon fiber passenger tub with aluminum subframes.", rigidity: "78 kNm/°" },
    { id: "supercar", label: "Supercar Hybrid Tub", arch: "carbon_tub", desc: "Carbon monocell with central battery tunnel & multi-link towers.", rigidity: "72 kNm/°" },
    { id: "sports", label: "Sports Car Monocoque", arch: "monocoque", desc: "Bonded aluminum extrusion monocoque with high torsional stiffness.", rigidity: "54 kNm/°" },
    { id: "coupe", label: "Coupe Spaceframe", arch: "spaceframe", desc: "Lightweight spaceframe chassis engineered for balanced front/rear weight.", rigidity: "48 kNm/°" },
    { id: "sedan", label: "Sedan Unibody", arch: "monocoque", desc: "High-strength steel & aluminum unibody shell for 4-passenger packaging.", rigidity: "42 kNm/°" },
    { id: "track", label: "Track Car Skateboard", arch: "ev_skateboard", desc: "Flat battery structural pack with integrated 4-corner suspension cradles.", rigidity: "65 kNm/°" },
  ];

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Wrench size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 1: CHASSIS SELECTION & MOUNTING RIG
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Define the vehicle backbone, structural mounting anchors, and wheelbase envelope.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> CHASSIS INSTALLED
          </span>
        )}
      </div>

      {/* Chassis Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {chassisTypes.map((c) => {
          const isSelected = chassis.type === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onUpdateChassis({ type: c.id, architecture: c.arch })}
              className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-cyan-500/20 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{c.label}</span>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300 font-bold">{c.rigidity}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{c.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Parametric Dimension Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-base-900/60 border border-base-800">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-700 dark:text-slate-300 font-bold">Wheelbase</span>
            <span className="text-cyan-600 dark:text-cyan-300 font-bold">{chassis.wheelbaseMm} mm</span>
          </div>
          <input
            type="range"
            min="2400"
            max="3100"
            step="20"
            value={chassis.wheelbaseMm}
            onChange={(e) => onUpdateChassis({ wheelbaseMm: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-700 dark:text-slate-300 font-bold">Track Width</span>
            <span className="text-purple-600 dark:text-purple-300 font-bold">{chassis.frontTrackMm} mm</span>
          </div>
          <input
            type="range"
            min="1450"
            max="1800"
            step="10"
            value={chassis.frontTrackMm}
            onChange={(e) =>
              onUpdateChassis({
                frontTrackMm: parseInt(e.target.value),
                rearTrackMm: parseInt(e.target.value) + 20,
              })
            }
            className="w-full accent-purple-400 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-700 dark:text-slate-300 font-bold">Ride Height</span>
            <span className="text-emerald-600 dark:text-emerald-300 font-bold">{chassis.rideHeightMm} mm</span>
          </div>
          <input
            type="range"
            min="60"
            max="180"
            step="5"
            value={chassis.rideHeightMm}
            onChange={(e) => onUpdateChassis({ rideHeightMm: parseInt(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL CHASSIS" : "INSTALL CHASSIS & PROCEED TO ENGINE"}
        </button>
      </div>
    </div>
  );
};
