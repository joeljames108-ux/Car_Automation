/**
 * ============================================================================
 * CHASSIS ARCHITECTURE INSPECTOR (PHASE 4 & 5)
 * ============================================================================
 * Independent 3D Chassis Architecture Inspection Studio:
 * - Selects from type-dependent chassis platforms
 * - Interactive 3D Chassis Inspection (360°, Exploded, Anatomy, Cutaway)
 * - Structural Subsystem Callouts:
 *   Frame rails, crash structures, suspension mounting points,
 *   engine bay, transmission tunnel, battery floor, subframes, firewall.
 */

import React, { useState } from "react";
import {
  Wrench,
  CheckCircle2,
  Shield,
  Layers,
  Crosshair,
  Sliders,
  Sparkles,
  Scissors,
  Activity,
  Cpu,
} from "lucide-react";
import {
  VehicleCategoryId,
  getVehicleCategory,
  CategoryChassisOption,
} from "../../../sim/modularVehicle/vehicleTypeRegistry";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface ChassisArchitectureInspectorProps {
  categoryId: VehicleCategoryId;
  activeChassisId: string;
  onSelectChassis: (chassis: CategoryChassisOption) => void;
  onInspectSubsystem?: (subsystem: string) => void;
}

const STRUCTURAL_HOTSPOTS = [
  { id: "frame_rails", label: "Longitudinal Box Frame Rails", desc: "Primary load-bearing chassis extrusions carrying bending & torsional moments." },
  { id: "crash_structure", label: "Front Crash Box (Aluminum Honeycomb)", desc: "Deformable frontal energy attenuator absorbing impact kinetic energy." },
  { id: "hardpoints", label: "Suspension Mounting Hardpoints", desc: "CNC billet titanium pickup clevises for front/rear control arms." },
  { id: "engine_bay", label: "Powertrain Cradle & Engine Bay", desc: "Structural bulkhead framing accommodating engine block and auxiliary coolers." },
  { id: "trans_tunnel", label: "Transmission & Driveline Tunnel", desc: "High-stiffness central spine housing driveshaft, transaxle, or HV wiring." },
  { id: "battery_floor", label: "Underfloor Structural Battery / Undertray", desc: "Torsionally rigid undertray shielding battery cells and smoothing underbody aero." },
  { id: "subframes", label: "Front & Rear Isolation Subframes", desc: "Die-cast or tubular subframes isolating powertrain vibration from passenger tub." },
  { id: "firewall", label: "Structural Transverse Firewall", desc: "Reinforced front bulkhead separating passenger cockpit from engine bay intrusion." },
  { id: "roof_structure", label: "Roof Ring & Roll Protection Cage", desc: "Boron steel or chromoly halo structure meeting FIA rollover safety criteria." },
];

export const ChassisArchitectureInspector: React.FC<ChassisArchitectureInspectorProps> = ({
  categoryId,
  activeChassisId,
  onSelectChassis,
  onInspectSubsystem,
}) => {
  const cat = getVehicleCategory(categoryId);
  const [activeHotspot, setActiveHotspot] = useState<string>("frame_rails");
  const [viewMode, setViewMode] = useState<"360" | "exploded" | "anatomy" | "cutaway">("360");

  const currentChassis =
    cat.compatibleChassis.find((c) => c.id === activeChassisId) || cat.compatibleChassis[0];

  return (
    <div className="panel p-5 sm:p-7 rounded-3xl space-y-6 shadow-2xl border border-amber-500/25 bg-slate-950/90 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Wrench size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-mono tracking-tight text-white uppercase">
                SELECT YOUR CHASSIS ARCHITECTURE
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                {cat.name} COMPATIBLE
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Type-restricted structural architectures tailored for the {cat.name} platform.
            </p>
          </div>
        </div>

        {/* View Mode Controls: 360°, EXPLODED, ANATOMY, CUTAWAY */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {[
            { id: "360", label: "360°" },
            { id: "exploded", label: "EXPLODED" },
            { id: "anatomy", label: "ANATOMY" },
            { id: "cutaway", label: "CUTAWAY" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => {
                playHMIClickSound();
                setViewMode(v.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all ${
                viewMode === v.id
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Chassis Options on Left, Detailed Blueprint / Hardpoint Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Compatible Chassis Options */}
        <div className="lg:col-span-5 space-y-3.5">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
            AVAILABLE ARCHITECTURES ({cat.compatibleChassis.length})
          </span>

          {cat.compatibleChassis.map((chassis) => {
            const isSelected = chassis.id === currentChassis?.id;
            return (
              <div
                key={chassis.id}
                onClick={() => {
                  playHMIClickSound();
                  onSelectChassis(chassis);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50"
                    : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                    {isSelected && <CheckCircle2 size={14} className="text-amber-400" />}
                    {chassis.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {chassis.rigidity}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 leading-relaxed mb-3">
                  {chassis.description}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-800/70 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block uppercase">Frame Mass</span>
                    <span className="font-bold text-slate-200">{chassis.massKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase">Metallurgy</span>
                    <span className="font-bold text-slate-200 truncate block">{chassis.material}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase">Engine Bay</span>
                    <span className="font-bold text-amber-300">{chassis.engineBayVolumeL} L</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Structural Hotspot Inspector */}
        <div className="lg:col-span-7 flex flex-col justify-between p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Shield size={14} className="text-amber-400" />
                STRUCTURAL HARDPOINT INSPECTOR ({STRUCTURAL_HOTSPOTS.length} NODES)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                CLICK TO INSPECT COMPONENT
              </span>
            </div>

            {/* Hotspots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STRUCTURAL_HOTSPOTS.map((spot) => {
                const isActive = activeHotspot === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => {
                      playHMIClickSound();
                      setActiveHotspot(spot.id);
                      onInspectSubsystem?.(spot.id);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-500/15 border-amber-500/60 text-white shadow-sm"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold font-mono text-slate-200 flex items-center gap-1.5">
                        <Crosshair size={12} className={isActive ? "text-amber-400 animate-pulse" : "text-slate-500"} />
                        {spot.label}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 line-clamp-2">
                      {spot.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Hotspot Detailed Callout Banner */}
          {activeHotspot && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono font-bold text-amber-300 uppercase block">
                  {STRUCTURAL_HOTSPOTS.find((s) => s.id === activeHotspot)?.label}
                </span>
                <p className="text-xs font-mono text-slate-300 mt-0.5 leading-relaxed">
                  {STRUCTURAL_HOTSPOTS.find((s) => s.id === activeHotspot)?.desc}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
