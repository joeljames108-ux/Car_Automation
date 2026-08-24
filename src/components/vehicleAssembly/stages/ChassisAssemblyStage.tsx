/**
 * ============================================================================
 * STAGE 1: CHASSIS FRAME — MONOCOQUE TUB / SPACEFRAME / TUBULAR CRADLE
 * ============================================================================
 * Master structural foundation of the 13-stage linear vehicle chain.
 * - Structural architecture selection (Carbon Monocoque Tub, Spaceframe,
 *   Tubular Cradle) with rigidity & mass properties
 * - Parametric wheelbase / track / ride-height envelope
 * - Suspension & powertrain hardpoint map (CAD datum readout)
 */

import React from "react";
import { Wrench, CheckCircle2, Crosshair, Ruler } from "lucide-react";
import { ChassisConfig3D } from "../scene/ModularAssemblySceneGraph";

interface ChassisAssemblyStageProps {
  chassis: ChassisConfig3D;
  onUpdateChassis: (patch: Partial<ChassisConfig3D>) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

const ARCHITECTURES: {
  id: ChassisConfig3D["architecture"];
  label: string;
  desc: string;
  rigidity: string;
  massKg: number;
  material: string;
}[] = [
  {
    id: "carbon_tub",
    label: "Monocoque Carbon Tub",
    desc: "Autoclave-cured T1100 prepreg monocoque tub with Zylon anti-intrusion panels and bonded Ti-6Al-4V hardpoint inserts.",
    rigidity: "78 kNm/°",
    massKg: 68,
    material: "T1100 Prepreg + Honeycomb Core",
  },
  {
    id: "spaceframe",
    label: "Aluminum Spaceframe",
    desc: "Bonded & riveted 6061-T6 extrusion spaceframe with cast node joints — GT3-proven torsional architecture.",
    rigidity: "68 kNm/°",
    massKg: 94,
    material: "6061-T6 Extrusions + Cast Nodes",
  },
  {
    id: "tubular_cradle",
    label: "Tubular Cradle Frame",
    desc: "4130 chromoly tubular cradle with removable front/rear subframes for drivetrain drop-out serviceability.",
    rigidity: "48 kNm/°",
    massKg: 112,
    material: "4130 Chromoly Tube (CDS)",
  },
];

const CHASSIS_TYPES: { id: ChassisConfig3D["type"]; label: string; arch: ChassisConfig3D["architecture"]; desc: string; rigidity: string }[] = [
  { id: "gt3", label: "GT3 Competition", arch: "spaceframe", desc: "Tubular chromoly spaceframe with integrated FIA safety cell.", rigidity: "68 kNm/°" },
  { id: "hypercar", label: "Hypercar Carbon Monocell", arch: "carbon_tub", desc: "Autoclave prepreg carbon fiber passenger tub with aluminum subframes.", rigidity: "78 kNm/°" },
  { id: "supercar", label: "Supercar Hybrid Tub", arch: "carbon_tub", desc: "Carbon monocell with central battery tunnel & multi-link towers.", rigidity: "72 kNm/°" },
  { id: "sports", label: "Sports Car Monocoque", arch: "monocoque", desc: "Bonded aluminum extrusion monocoque with high torsional stiffness.", rigidity: "54 kNm/°" },
  { id: "coupe", label: "Coupe Spaceframe", arch: "spaceframe", desc: "Lightweight spaceframe chassis engineered for balanced front/rear weight.", rigidity: "48 kNm/°" },
  { id: "sedan", label: "Sedan Unibody", arch: "monocoque", desc: "High-strength steel & aluminum unibody shell for 4-passenger packaging.", rigidity: "42 kNm/°" },
  { id: "track", label: "Track Car Skateboard", arch: "ev_skateboard", desc: "Flat battery structural pack with integrated 4-corner suspension cradles.", rigidity: "65 kNm/°" },
];

export const ChassisAssemblyStage: React.FC<ChassisAssemblyStageProps> = ({
  chassis,
  onUpdateChassis,
  isInstalled,
  onInstall,
}) => {
  // Hardpoint map computed from the live parametric envelope (mm datum, front axle @ z=0)
  const halfWb = chassis.wheelbaseMm / 2;
  const hardpoints = [
    { id: "HP-FL", name: "Front Lateral Arm", x: -(chassis.frontTrackMm / 2), z: -halfWb },
    { id: "HP-FR", name: "Front Lateral Arm", x: chassis.frontTrackMm / 2, z: -halfWb },
    { id: "HP-RL", name: "Rear Lateral Arm", x: -(chassis.rearTrackMm / 2), z: halfWb },
    { id: "HP-RR", name: "Rear Lateral Arm", x: chassis.rearTrackMm / 2, z: halfWb },
    { id: "HP-EF", name: "Engine Mount Front", x: 0, z: -halfWb + 320 },
    { id: "HP-EM", name: "Engine Mount Mid", x: 0, z: 150 },
    { id: "HP-ER", name: "Engine Mount Rear", x: 0, z: halfWb + 280 },
    { id: "HP-TX", name: "Transaxle Torque Mount", x: 0, z: halfWb - 120 },
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
              STAGE 1: CHASSIS FRAME & STRUCTURAL HARDPOINTS
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Lay the master structure: monocoque tub, spaceframe or tubular cradle. Datum zero = front axle centerline.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> CHASSIS INSTALLED
          </span>
        )}
      </div>

      {/* Structural Architecture Trio */}
      <div className="space-y-2">
        <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 block">
          PRIMARY STRUCTURAL ARCHITECTURE
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {ARCHITECTURES.map((a) => {
            const isSelected = chassis.architecture === a.id;
            return (
              <button
                key={a.id}
                onClick={() => onUpdateChassis({ architecture: a.id })}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/40"
                    : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{a.label}</span>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300 font-bold">{a.rigidity}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">{a.desc}</p>
                <div className="flex items-center justify-between text-[9px] font-mono pt-1.5 border-t border-base-800/60">
                  <span className="text-slate-500">Tare: <strong className="text-emerald-600 dark:text-emerald-400">{a.massKg} kg</strong></span>
                  <span className="text-slate-500 truncate ml-1">{a.material}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle Class Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
        {CHASSIS_TYPES.map((c) => (
          <button
            key={c.id}
            onClick={() => onUpdateChassis({ type: c.id, architecture: c.arch })}
            className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
              chassis.type === c.id
                ? "bg-blue-500/15 border-blue-500/50 ring-1 ring-blue-500/40"
                : "bg-base-900/40 border-base-800 hover:border-base-700"
            }`}
          >
            <div className="font-bold text-[11px] font-mono text-slate-900 dark:text-slate-100">{c.label}</div>
            <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 line-clamp-2">{c.desc}</div>
          </button>
        ))}
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

      {/* Hardpoint Datum Map */}
      <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 space-y-2.5">
        <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Crosshair size={13} className="text-cyan-400" /> STRUCTURAL HARDPOINT DATUM MAP
          <span className="ml-auto flex items-center gap-1 text-[9px] text-slate-500 normal-case">
            <Ruler size={11} /> live CAD coordinates (X lateral / Z longitudinal, mm)
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {hardpoints.map((hp) => (
            <div key={hp.id} className="px-2 py-1.5 rounded-lg bg-base-850 border border-base-750 font-mono text-[9px]">
              <div className="font-bold text-cyan-600 dark:text-cyan-300">{hp.id}</div>
              <div className="text-slate-500 dark:text-slate-400 truncate" title={hp.name}>{hp.name}</div>
              <div className="text-slate-600 dark:text-slate-500 tabular-nums">
                X {hp.x >= 0 ? "+" : ""}{hp.x.toFixed(0)} · Z {hp.z >= 0 ? "+" : ""}{hp.z.toFixed(0)}
              </div>
            </div>
          ))}
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
