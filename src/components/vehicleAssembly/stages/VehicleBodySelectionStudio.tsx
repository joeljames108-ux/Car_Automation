/**
 * ============================================================================
 * VEHICLE BODY SELECTION STUDIO (PHASE 6 & 7)
 * ============================================================================
 * Type-dependent body shell selection & visual mode controls:
 * - Selects compatible body shells (e.g. 3-door vs 5-door, fastback, widebody)
 * - "BODY ON / BODY OFF" toggle
 * - "TRANSPARENT BODY MODE" (X-Ray inspection: BODY → CHASSIS → SUSPENSION → POWERTRAIN)
 * - Drag/Downforce aerodynamic delta badges
 */

import React, { useState } from "react";
import {
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Wind,
  Maximize2,
  Palette,
} from "lucide-react";
import {
  VehicleCategoryId,
  getVehicleCategory,
  CategoryBodyOption,
} from "../../../sim/modularVehicle/vehicleTypeRegistry";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface VehicleBodySelectionStudioProps {
  categoryId: VehicleCategoryId;
  activeBodyId: string;
  isBodyOn: boolean;
  isTransparentBody: boolean;
  onSelectBody: (body: CategoryBodyOption) => void;
  onToggleBodyOn: () => void;
  onToggleTransparentBody: () => void;
}

export const VehicleBodySelectionStudio: React.FC<VehicleBodySelectionStudioProps> = ({
  categoryId,
  activeBodyId,
  isBodyOn,
  isTransparentBody,
  onSelectBody,
  onToggleBodyOn,
  onToggleTransparentBody,
}) => {
  const cat = getVehicleCategory(categoryId);
  const currentBody =
    cat.compatibleBodies.find((b) => b.id === activeBodyId) || cat.compatibleBodies[0];

  return (
    <div className="panel p-5 sm:p-7 rounded-3xl space-y-6 shadow-2xl border border-amber-500/25 bg-slate-950/90 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Car size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-mono tracking-tight text-white uppercase">
                SELECT YOUR BODY ARCHITECTURE
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                {cat.name} COMPATIBLE
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Choose an aerodynamically optimized body shell tailored to your vehicle platform.
            </p>
          </div>
        </div>

        {/* Phase 6 Controls: BODY ON / BODY OFF & TRANSPARENT BODY MODE */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* BODY ON / BODY OFF Toggle */}
          <button
            onClick={() => {
              playHMIClickSound();
              onToggleBodyOn();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              isBodyOn
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            {isBodyOn ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{isBodyOn ? "BODY ON" : "BODY OFF"}</span>
          </button>

          {/* TRANSPARENT MODE Toggle */}
          <button
            onClick={() => {
              playHMIClickSound();
              onToggleTransparentBody();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              isTransparentBody
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Layers size={14} />
            <span>TRANSPARENT</span>
          </button>
        </div>
      </div>

      {/* Body Shell Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cat.compatibleBodies.map((body) => {
          const isSelected = body.id === currentBody?.id;

          return (
            <div
              key={body.id}
              onClick={() => {
                playHMIClickSound();
                onSelectBody(body);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50"
                  : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                    {isSelected && <CheckCircle2 size={14} className="text-amber-400" />}
                    {body.name}
                  </span>
                  {body.doorsCount > 0 && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {body.doorsCount} DOORS
                    </span>
                  )}
                </div>

                <p className="text-xs font-mono text-amber-400/80 mb-2 font-semibold">
                  {body.style}
                </p>

                <p className="text-xs font-mono text-slate-400 leading-relaxed mb-4">
                  {body.description}
                </p>
              </div>

              {/* Aerodynamic & Weight Delta Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500 block uppercase">Drag Delta</span>
                  <span className={`font-bold ${body.dragDeltaCd <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {body.dragDeltaCd > 0 ? `+${body.dragDeltaCd}` : body.dragDeltaCd} Cd
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Downforce</span>
                  <span className="font-bold text-cyan-400">
                    +{body.downforceDeltaKg} kg @ 150mph
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Mass Delta</span>
                  <span className={`font-bold ${body.massDeltaKg <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {body.massDeltaKg > 0 ? `+${body.massDeltaKg}` : body.massDeltaKg} kg
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assembly Hierarchy Visualizer Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-500 uppercase">ASSEMBLY HIERARCHY:</span>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            1. BODY SHELL
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            2. CHASSIS PLATFORM
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            3. SUSPENSION & AXLES
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            4. POWERTRAIN
          </span>
        </div>
      </div>
    </div>
  );
};
