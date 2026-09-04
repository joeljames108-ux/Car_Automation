/**
 * ============================================================================
 * VEHICLE TYPE DASHBOARD HEADER (PHASE 12 PERSISTENT CAD BANNER)
 * ============================================================================
 * Persistent CAD-styled header showing:
 * - VEHICLE TYPE & SUBTYPE
 * - CHASSIS ARCHITECTURE
 * - BODY SHELL
 * - DRIVETRAIN LAYOUT
 * - WHEELBASE (mm)
 * - WEIGHT TARGET (kg)
 * - AERO CLASS
 * Clicking any item enables instant navigation to that specific section.
 */

import React from "react";
import {
  Car,
  Layers,
  Wrench,
  Activity,
  Ruler,
  Wind,
  Repeat,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  VehicleCategoryId,
  getVehicleCategory,
} from "../../../sim/modularVehicle/vehicleTypeRegistry";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface VehicleTypeDashboardHeaderProps {
  categoryId: VehicleCategoryId;
  subcategory?: string;
  chassisName: string;
  bodyName: string;
  layoutName: string;
  wheelbaseMm: number;
  weightTargetKg: number;
  aeroClass: string;
  hasCompatibilityIssues?: boolean;
  onNavigateSection: (section: "type" | "chassis" | "body" | "dimensions" | "drivetrain" | "aero" | "warnings") => void;
  onChangeType: () => void;
}

export const VehicleTypeDashboardHeader: React.FC<VehicleTypeDashboardHeaderProps> = ({
  categoryId,
  subcategory,
  chassisName,
  bodyName,
  layoutName,
  wheelbaseMm,
  weightTargetKg,
  aeroClass,
  hasCompatibilityIssues = false,
  onNavigateSection,
  onChangeType,
}) => {
  const cat = getVehicleCategory(categoryId);

  const handleClick = (section: "type" | "chassis" | "body" | "dimensions" | "drivetrain" | "aero" | "warnings") => {
    playHMIClickSound();
    onNavigateSection(section);
  };

  return (
    <div className="panel p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-xl backdrop-blur-md transition-all select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Active Vehicle Type Badge & Quick Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleClick("type")}
            className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center justify-center cursor-pointer"
            title="Click to view Vehicle Type Details"
          >
            <Car size={20} className="text-amber-400" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                VEHICLE PLATFORM
              </span>
              {subcategory && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {subcategory}
                </span>
              )}
            </div>
            <button
              onClick={() => handleClick("type")}
              className="text-base sm:text-lg font-black font-mono text-white hover:text-amber-400 transition-colors uppercase tracking-tight flex items-center gap-1 cursor-pointer text-left"
            >
              <span>{cat.name.toUpperCase()}</span>
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Center: Live Architecture Diagnostics Rail */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {/* Chassis */}
          <button
            onClick={() => handleClick("chassis")}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left cursor-pointer shrink-0"
          >
            <span className="text-[9px] font-mono text-slate-500 block uppercase">CHASSIS</span>
            <span className="text-[11px] font-mono font-bold text-slate-200 truncate max-w-[140px] block">
              {chassisName}
            </span>
          </button>

          {/* Body Shell */}
          <button
            onClick={() => handleClick("body")}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left cursor-pointer shrink-0"
          >
            <span className="text-[9px] font-mono text-slate-500 block uppercase">BODY</span>
            <span className="text-[11px] font-mono font-bold text-slate-200 truncate max-w-[140px] block">
              {bodyName}
            </span>
          </button>

          {/* Drivetrain Layout */}
          <button
            onClick={() => handleClick("drivetrain")}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left cursor-pointer shrink-0"
          >
            <span className="text-[9px] font-mono text-slate-500 block uppercase">LAYOUT</span>
            <span className="text-[11px] font-mono font-bold text-slate-200 truncate max-w-[130px] block">
              {layoutName}
            </span>
          </button>

          {/* Wheelbase */}
          <button
            onClick={() => handleClick("dimensions")}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left cursor-pointer shrink-0"
          >
            <span className="text-[9px] font-mono text-slate-500 block uppercase">WHEELBASE</span>
            <span className="text-[11px] font-mono font-bold text-amber-300 block">
              {wheelbaseMm.toLocaleString()} mm
            </span>
          </button>

          {/* Weight Target */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0">
            <span className="text-[9px] font-mono text-slate-500 block uppercase">WEIGHT TARGET</span>
            <span className="text-[11px] font-mono font-bold text-emerald-400 block">
              {weightTargetKg.toLocaleString()} kg
            </span>
          </div>

          {/* Aero Class */}
          <button
            onClick={() => handleClick("aero")}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left cursor-pointer shrink-0"
          >
            <span className="text-[9px] font-mono text-slate-500 block uppercase">AERO CLASS</span>
            <span className="text-[11px] font-mono font-bold text-slate-200 truncate max-w-[120px] block">
              {aeroClass}
            </span>
          </button>

          {/* Compatibility Alert if any */}
          {hasCompatibilityIssues && (
            <button
              onClick={() => handleClick("warnings")}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/60 text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer animate-pulse"
            >
              <AlertTriangle size={13} className="text-amber-400" />
              <span className="text-[10px] font-mono font-bold">WARNINGS</span>
            </button>
          )}
        </div>

        {/* Right: Change Type CTA */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          <button
            onClick={() => {
              playHMIClickSound();
              onChangeType();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Repeat size={13} />
            <span>CHANGE TYPE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
